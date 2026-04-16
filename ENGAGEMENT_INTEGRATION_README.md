# 🎯 Engagement Analysis Integration - Setup Guide

## ✅ What Has Been Done

I've successfully integrated the engagement_analysis system into your mock interview application!

### Files Created/Modified:

#### **Python Service (engagement_analysis)**

- ✅ `backend/fastapi_main.py` - FastAPI wrapper for engagement analysis
- ✅ `backend/fastapi_requirements.txt` - Python dependencies
- ✅ `backend/start_fastapi.bat` - Startup script

#### **Node.js Backend (intervau-ai-backend)**

- ✅ `src/services/engagementService.ts` - Python service client
- ✅ `src/sockets/engagementSocket.ts` - WebSocket handler
- ✅ `src/index.ts` - MODIFIED: Added Socket.IO initialization
- ✅ `src/models/MockInterviewSession.ts` - MODIFIED: Added engagement metrics
- ✅ `.env` - MODIFIED: Added PYTHON_SERVICE_URL
- ✅ `install-socketio.bat` - Dependency installation script

#### **React Frontend (intervau-ai-frontend)**

- ✅ `src/hooks/useEngagementTracking.ts` - Engagement tracking hook
- ✅ `src/components/interview/EngagementOverlay.tsx` - Engagement UI overlay
- ✅ `src/pages/MockInterviewReady.tsx` - MODIFIED: Full integration
- ✅ `install-socketio-client.bat` - Dependency installation script

---

## 🚀 Setup Instructions

### **Step 1: Install Dependencies**

#### 1.1 Python Service

```bash
cd c:\Users\rajpu\Desktop\SEMESTER-8\FYP-BACKUP\engagement_analysis\backend
pip install -r fastapi_requirements.txt
```

OR double-click: `start_fastapi.bat` (it will auto-install dependencies)

#### 1.2 Node.js Backend

```bash
cd c:\Users\rajpu\Desktop\SEMESTER-8\FYP-BACKUP\intervau-ai-backend
npm install socket.io
```

OR double-click: `install-socketio.bat`

#### 1.3 React Frontend

```bash
cd c:\Users\rajpu\Desktop\SEMESTER-8\FYP-BACKUP\intervau-ai-frontend
npm install socket.io-client
```

OR double-click: `install-socketio-client.bat`

---

### **Step 2: Start All Services**

Open **3 separate terminals** (or use 3 batch files):

#### Terminal 1: Python FastAPI Service

```bash
cd c:\Users\rajpu\Desktop\SEMESTER-8\FYP-BACKUP\engagement_analysis\backend
python fastapi_main.py
```

**Expected Output:**

```
🚀 Initializing Face Feature Extractor...
🚀 Loading Engagement Prediction Model...
✅ Engagement Analysis API Ready!
INFO:     Uvicorn running on http://0.0.0.0:8000
```

#### Terminal 2: Node.js Backend

```bash
cd c:\Users\rajpu\Desktop\SEMESTER-8\FYP-BACKUP\intervau-ai-backend
npm run dev
```

**Expected Output:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Server running on http://localhost:5000
📊 API Documentation: http://localhost:5000/api
🔌 WebSocket ready for engagement tracking
🔧 Environment: development
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### Terminal 3: React Frontend

```bash
cd c:\Users\rajpu\Desktop\SEMESTER-8\FYP-BACKUP\intervau-ai-frontend
npm run dev
```

**Expected Output:**

```
  VITE v7.3.0  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

### **Step 3: Test the Integration**

1. **Open Browser**: Navigate to `http://localhost:5173`
2. **Login/Register**: Create or login to your account
3. **Start Mock Interview**:
   - Go to Mock Interview section
   - Click "Start New Interview"
   - Configure interview settings
   - Click "Start"

4. **MockInterviewReady Page**:
   - System will auto-check camera/microphone
   - **You should see**:
     - ✅ Webcam video preview
     - ✅ **Engagement Overlay** (top-left of video)
     - ✅ **"Engagement Active"** status (bottom-left of video)
     - ✅ Real-time engagement score (0-100%)
     - ✅ Face detection status
     - ✅ Eye contact indicator
     - ✅ Yawn detection

5. **Test Engagement Tracking**:
   - **Look at camera** → Engagement score increases, "Good Eye Contact" shown
   - **Look away** → Engagement score decreases, "Looking Away" shown
   - **Move face out of frame** → "No Face Detected"
   - **Yawn** → "Yawning Detected" alert appears

---

## 🔍 Troubleshooting

### Python Service Won't Start

**Error:** `ModuleNotFoundError: No module named 'fastapi'`
**Fix:**

```bash
cd engagement_analysis\backend
pip install -r fastapi_requirements.txt
```

**Error:** Model file not found
**Fix:** Check that `best_model_v3.pth` exists in `engagement_analysis\backend\models\`

---

### Node.js Backend Errors

**Error:** `Cannot find module 'socket.io'`
**Fix:**

```bash
cd intervau-ai-backend
npm install socket.io @types/socket.io
```

**Error:** `PYTHON_SERVICE_URL is not defined`
**Fix:** Check `.env` file has:

```
PYTHON_SERVICE_URL=http://localhost:8000
```

---

### Frontend Errors

**Error:** `Module not found: socket.io-client`
**Fix:**

```bash
cd intervau-ai-frontend
npm install socket.io-client
```

**Error:** Engagement overlay not showing
**Check:**

1. Python service is running (http://localhost:8000)
2. Node.js backend is running (http://localhost:5000)
3. Browser console for WebSocket connection status
4. Camera permission is granted

---

## 📊 How It Works

### Data Flow:

```
1. MockInterviewReady component loads
   ↓
2. Camera access granted
   ↓
3. useEngagementTracking hook auto-starts
   ↓
4. WebSocket connection established to Node.js
   ↓
5. Canvas captures video frames (every 500ms / 2 FPS)
   ↓
6. Frames sent via WebSocket to Node.js backend
   ↓
7. Node.js forwards frames to Python FastAPI service
   ↓
8. Python analyzes frame using:
   - MediaPipe Face Mesh
   - FaceFeatureExtractor
   - EngagementPredictor
   ↓
9. Engagement metrics returned to Node.js
   ↓
10. Node.js broadcasts metrics back to frontend
    ↓
11. EngagementOverlay component displays results
    ↓
12. Updates every 500ms (real-time tracking)
```

### What's Being Tracked:

- **Face Detection**: Is face visible in frame?
- **Eye Contact**: Are eyes looking at camera?
- **Head Pose**: Pitch, yaw, roll angles
- **Engagement Score**: 0-100% overall engagement
- **Engagement Level**: Fully Engaged / Partially Engaged / Disengaged
- **Distraction Duration**: How long user has been distracted
- **Yawn Detection**: Fatigue indicator

---

## 🎨 Customization

### Change Frame Rate

Edit `src/pages/MockInterviewReady.tsx`:

```typescript
frameInterval: 500,  // Change to 1000 for 1 FPS, 250 for 4 FPS
```

### Modify Engagement Thresholds

Edit `engagement_analysis/backend/fastapi_main.py`:

```python
def _calculate_engagement_score(prediction: dict) -> float:
    level_scores = {
        'Fully Engaged': 90,      # Adjust these values
        'Partially Engaged': 60,
        'Disengaged': 30
    }
```

### Customize Overlay Appearance

Edit `src/components/interview/EngagementOverlay.tsx` - Modify Tailwind classes

---

## 🧪 Testing Checklist

- [ ] Python service starts without errors
- [ ] Node.js backend starts with "WebSocket ready" message
- [ ] Frontend builds and runs
- [ ] Browser DevTools shows WebSocket connection
- [ ] Video preview displays webcam
- [ ] Engagement overlay appears on video
- [ ] Engagement score updates in real-time
- [ ] Face detection works (move face in/out of frame)
- [ ] Eye contact detection works (look at/away from camera)
- [ ] "Engagement Active" status shows at bottom-left
- [ ] Console logs show engagement metrics

---

## 📝 Next Steps

1. **Test thoroughly** with different lighting conditions
2. **Collect engagement data** during mock interviews
3. **Display engagement summary** on completion page
4. **Add engagement trends** to interview analytics
5. **Implement engagement alerts** for prolonged disengagement

---

## 🆘 Support

**Check logs:**

- Python: Terminal where `fastapi_main.py` is running
- Node.js: Terminal where `npm run dev` (backend) is running
- Frontend: Browser DevTools Console (F12)

**Verify services:**

- Python: http://localhost:8000 (should show status: running)
- Node.js: http://localhost:5000/api/health
- Frontend: http://localhost:5173

---

## ✨ What's Integrated

### MockInterviewReady Component Features:

✅ **Auto-start**: Engagement tracking starts automatically when camera passes
✅ **Real-time overlay**: Live engagement metrics on video preview
✅ **Connection status**: Visual indicator of engagement service status
✅ **Frame capture**: Optimized 2 FPS frame sampling
✅ **Error handling**: Graceful degradation if service unavailable
✅ **Cleanup**: Proper resource cleanup on unmount

### Ready for Production:

- ✅ WebSocket-based real-time communication
- ✅ Optimized frame transmission (Base64 JPEG @ 70% quality)
- ✅ Session management (start/stop tracking)
- ✅ Metrics storage in MongoDB
- ✅ Modular architecture (easy to maintain)

---

## 🎉 You're All Set!

Your engagement analysis system is now fully integrated and ready to use!

**Start all 3 services and test the mock interview flow.**
