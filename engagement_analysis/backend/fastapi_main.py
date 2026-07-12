"""
FastAPI Service for Engagement Analysis
Wraps existing engagement_analysis code with REST API
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import base64
import cv2
import mediapipe as mp
import numpy as np
import math
import time
from typing import Optional, Dict, List
import sys
import os

# Add directories to path
current_dir = os.path.dirname(__file__)
sys.path.insert(0, os.path.join(current_dir, 'Processing'))
sys.path.insert(0, os.path.join(current_dir, 'models'))

from FaceFeatureExtractor import FaceFeatureExtractor
from EngagementPredictor import EngagementPredictor

# Global instances
feature_extractor = None
engagement_predictor = None
face_mesh = None
active_sessions: Dict[str, dict] = {}

MAX_TRACKED_DELTA_SECONDS = 2.0

# Serialise MediaPipe calls – face_mesh is NOT thread-safe
face_mesh_lock: asyncio.Lock = None  # type: ignore  # initialised in lifespan


def _initialize_pipeline() -> None:
    """Initialize ML models and face mesh."""
    global feature_extractor, engagement_predictor, face_mesh

    print("🚀 Initializing Face Feature Extractor...")
    feature_extractor = FaceFeatureExtractor()

    print("🚀 Initializing MediaPipe Face Mesh...")
    face_mesh = mp.solutions.face_mesh.FaceMesh(
        max_num_faces=2,
        static_image_mode=False,
        refine_landmarks=True,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    )

    print("🚀 Loading Engagement Prediction Model...")
    model_path = os.path.join(
        os.path.dirname(__file__),
        'models',
        'best_model_v3.pth'
    )
    engagement_predictor = EngagementPredictor(model_path)
    print("✅ Engagement Analysis API Ready!")


def _cleanup_pipeline() -> None:
    """Release ML resources."""
    global face_mesh
    if face_mesh is not None:
        face_mesh.close()
        face_mesh = None


def _create_session_state(user_id: Optional[str]) -> dict:
    return {
        "user_id": user_id,
        "start_time": None,
        "last_frame_timestamp": None,
        "received_frame_count": 0,
        "frame_count": 0,
        "no_face_frame_count": 0,
        "engagement_history": [],
        "total_engagement_score": 0,
        "total_eye_contact_duration": 0.0,
        "total_distraction_duration": 0.0,
        "yawn_count": 0,
    }


def _safe_timestamp(value: Optional[float]) -> float:
    if value is None:
        return time.time()
    try:
        parsed = float(value)
    except (TypeError, ValueError):
        return time.time()
    if not math.isfinite(parsed):
        return time.time()
    return parsed


def _accumulate_durations(session: dict, timestamp: float, eye_contact: bool) -> None:
    previous = session.get("last_frame_timestamp")
    session["last_frame_timestamp"] = timestamp

    if previous is None:
        return

    delta = timestamp - float(previous)
    if not math.isfinite(delta) or delta <= 0:
        return

    delta = min(delta, MAX_TRACKED_DELTA_SECONDS)
    if eye_contact:
        session["total_eye_contact_duration"] += delta
    else:
        session["total_distraction_duration"] += delta


@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI app lifecycle hooks."""
    global face_mesh_lock
    face_mesh_lock = asyncio.Lock()
    try:
        _initialize_pipeline()
    except Exception as e:
        print(f"❌ Failed to initialize models: {e}")
        raise
    try:
        yield
    finally:
        _cleanup_pipeline()


app = FastAPI(title="Engagement Analysis API", version="1.0.0", lifespan=lifespan)

# CORS – allow all origins so Node.js backend (port 5000) can call us
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class StartSessionRequest(BaseModel):
    session_id: str
    user_id: Optional[str] = None


class FrameAnalysisRequest(BaseModel):
    session_id: str
    frame: str  # Base64 encoded image
    timestamp: float


class EndSessionRequest(BaseModel):
    session_id: str


class EngagementMetrics(BaseModel):
    timestamp: float
    face_detected: bool
    eye_contact: bool
    eye_contact_duration: float
    head_pose: Dict[str, float]
    engagement_score: float
    engagement_level: str
    distraction_duration: float
    yawn_detected: bool
    gaze_x: float
    gaze_y: float
    gaze_variation_x: float
    gaze_variation_y: float
    mar: float
    blink_ratio: float
    is_blinking: bool
    is_focused: bool
    face_landmarks: List[Dict[str, float]]


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "running",
        "service": "Engagement Analysis API",
        "active_sessions": len(active_sessions)
    }


@app.post("/start-session")
async def start_session(request: StartSessionRequest):
    """Initialize a new engagement tracking session"""
    try:
        if request.session_id in active_sessions:
            print(f"ℹ️ Session already active, reusing: {request.session_id}")
            return {
                "success": True,
                "session_id": request.session_id,
                "message": "Session already initialized"
            }
        
        active_sessions[request.session_id] = _create_session_state(request.user_id)
        
        print(f"📝 Started session: {request.session_id}")
        
        return {
            "success": True,
            "session_id": request.session_id,
            "message": "Session initialized successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze-frame", response_model=EngagementMetrics)
async def analyze_frame(request: FrameAnalysisRequest):
    """Analyze a single frame and return engagement metrics"""
    try:
        if feature_extractor is None or engagement_predictor is None or face_mesh is None:
            raise HTTPException(status_code=503, detail="Model pipeline not initialized")

        # Auto-create session if it doesn't exist (handle race conditions)
        if request.session_id not in active_sessions:
            print(f"⚠️  Session {request.session_id} not found – auto-creating it")
            active_sessions[request.session_id] = _create_session_state(None)

        session = active_sessions[request.session_id]
        session["received_frame_count"] += 1
        frame_timestamp = _safe_timestamp(request.timestamp)

        if session["start_time"] is None:
            session["start_time"] = frame_timestamp

        # Decode base64 image
        try:
            img_data = base64.b64decode(
                request.frame.split(',')[1] if ',' in request.frame else request.frame
            )
            nparr = np.frombuffer(img_data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if frame is None:
                raise ValueError("Failed to decode image")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid image data: {str(e)}")

        # Process frame – serialise to avoid MediaPipe race conditions
        frame = cv2.flip(frame, 1)
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        async with face_mesh_lock:
            detection_results = face_mesh.process(frame_rgb)

        features = None
        if detection_results.multi_face_landmarks:
            features = feature_extractor.extract_features(
                frame,
                detection_results.multi_face_landmarks[0]
            )

        # Default metrics (no face)
        metrics = {
            "timestamp": request.timestamp,
            "face_detected": False,
            "eye_contact": False,
            "eye_contact_duration": 0.0,
            "head_pose": {"pitch": 0.0, "yaw": 0.0, "roll": 0.0},
            "engagement_score": 0.0,
            "engagement_level": "Disengaged",
            "distraction_duration": 0.0,
            "yawn_detected": False,
            "gaze_x": 0.0,
            "gaze_y": 0.0,
            "gaze_variation_x": 0.0,
            "gaze_variation_y": 0.0,
            "mar": 0.0,
            "blink_ratio": 0.0,
            "is_blinking": False,
            "is_focused": False,
            "face_landmarks": []
        }

        if features is not None:
            landmarks = [
                {"x": lm.x, "y": lm.y, "z": lm.z}
                for lm in detection_results.multi_face_landmarks[0].landmark
            ]
            prediction = engagement_predictor.predict(features)
            metrics.update({
                "face_detected": True,
                "eye_contact": features.eye_contact_detected,
                "eye_contact_duration": features.eye_contact_duration,
                "head_pose": {
                    "pitch": features.head_pitch,
                    "yaw": features.head_yaw,
                    "roll": features.head_roll
                },
                "engagement_score": _calculate_engagement_score(prediction),
                "engagement_level": prediction['smoothed_prediction'],
                "distraction_duration": features.distraction_duration,
                "yawn_detected": features.yawn_detected,
                "gaze_x": features.gaze_x,
                "gaze_y": features.gaze_y,
                "gaze_variation_x": features.gaze_variation_x,
                "gaze_variation_y": features.gaze_variation_y,
                "mar": features.mar,
                "blink_ratio": features.blink_ratio,
                "is_blinking": features.is_blinking,
                "is_focused": features.is_focused,
                "face_landmarks": landmarks
            })
            session["frame_count"] += 1
            session["engagement_history"].append(metrics["engagement_score"])
            session["total_engagement_score"] += metrics["engagement_score"]
            if features.yawn_detected:
                session["yawn_count"] += 1
        else:
            session["no_face_frame_count"] += 1

        _accumulate_durations(session, frame_timestamp, bool(metrics["eye_contact"]))

        # Periodic diagnostics
        rc = session["received_frame_count"]
        if rc == 1:
            print(f"🎥 First frame received for session: {request.session_id}")
        elif rc % 30 == 0:
            print(
                f"📊 Session {request.session_id}: received={rc}, "
                f"face_frames={session['frame_count']}, no_face={session['no_face_frame_count']}"
            )

        return metrics

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error analyzing frame: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")



def _calculate_engagement_score(prediction: dict) -> float:
    """Convert engagement prediction to 0-100 score"""
    level_scores = {
        'Fully Engaged': 90,
        'Partially Engaged': 60,
        'Disengaged': 30
    }
    
    base_score = level_scores.get(prediction['smoothed_prediction'], 50)
    confidence_adjustment = (prediction['confidence'] - 0.5) * 20
    
    return max(0, min(100, base_score + confidence_adjustment))


@app.post("/end-session")
async def end_session(request: EndSessionRequest):
    """End session and return summary statistics"""
    try:
        if request.session_id not in active_sessions:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session = active_sessions[request.session_id]
        frame_count = session["frame_count"]
        
        if frame_count == 0:
            summary = {
                "session_id": request.session_id,
                "average_engagement_score": 0,
                "total_frames_analyzed": 0,
                "message": "No frames were analyzed"
            }
        else:
            summary = {
                "session_id": request.session_id,
                "total_frames_analyzed": frame_count,
                "average_engagement_score": session["total_engagement_score"] / frame_count,
                "total_eye_contact_duration": session["total_eye_contact_duration"],
                "total_distraction_duration": session["total_distraction_duration"],
                "yawn_count": session["yawn_count"],
                "engagement_trend": session["engagement_history"][-10:] if len(session["engagement_history"]) > 10 else session["engagement_history"]
            }
        
        # Clean up session
        del active_sessions[request.session_id]
        
        print(f"🏁 Ended session: {request.session_id}")
        print(
            f"📦 Session totals: received={session.get('received_frame_count', 0)}, "
            f"face_frames={session.get('frame_count', 0)}, no_face={session.get('no_face_frame_count', 0)}"
        )
        
        return {
            "success": True,
            "summary": summary
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/sessions")
async def get_active_sessions():
    """Get list of active sessions"""
    return {
        "active_sessions": list(active_sessions.keys()),
        "count": len(active_sessions)
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
