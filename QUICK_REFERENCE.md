# ⚡ QUICK REFERENCE CARD - Engagement Integration

## 🚀 Installation (One Command)

```batch
SETUP_COMPLETE_INTEGRATION.bat
```

## ▶️ Start Services (3 Commands)

```batch
START_1_PYTHON_SERVICE.bat    # Port 8000
START_2_BACKEND.bat            # Port 5000
START_3_FRONTEND.bat           # Port 5173
```

## 🧪 Test Connection

```batch
TEST_ALL_SERVICES.bat
```

## 📍 Service URLs

- Python: http://localhost:8000
- Backend: http://localhost:5000/api/health
- Frontend: http://localhost:5173

## 🔑 Key Files

### Created (17 files)

```
Python Service:
├─ engagement_analysis/backend/fastapi_main.py
├─ engagement_analysis/backend/fastapi_requirements.txt
└─ engagement_analysis/backend/start_fastapi.bat

Node.js Backend:
├─ intervau-ai-backend/src/services/engagementService.ts
├─ intervau-ai-backend/src/sockets/engagementSocket.ts
└─ intervau-ai-backend/install-socketio.bat

React Frontend:
├─ intervau-ai-frontend/src/hooks/useEngagementTracking.ts
├─ intervau-ai-frontend/src/components/interview/EngagementOverlay.tsx
└─ intervau-ai-frontend/install-socketio-client.bat

Setup Scripts:
├─ SETUP_COMPLETE_INTEGRATION.bat
├─ START_1_PYTHON_SERVICE.bat
├─ START_2_BACKEND.bat
├─ START_3_FRONTEND.bat
└─ TEST_ALL_SERVICES.bat

Documentation:
├─ ENGAGEMENT_INTEGRATION_README.md (Detailed guide)
├─ INTEGRATION_COMPLETE_SUMMARY.md (Summary)
└─ MOCKINTERVIEWREADY_WALKTHROUGH.md (Visual guide)
```

### Modified (3 files)

```
├─ intervau-ai-backend/src/index.ts (Socket.IO added)
├─ intervau-ai-backend/src/models/MockInterviewSession.ts (Engagement fields)
├─ intervau-ai-backend/.env (PYTHON_SERVICE_URL added)
└─ intervau-ai-frontend/src/pages/MockInterviewReady.tsx (Full integration)
```

## 🎯 How It Works

```
MockInterviewReady (React)
    ↓ WebSocket (2 FPS)
Node.js Backend (Socket.IO)
    ↓ HTTP REST
Python FastAPI (MediaPipe + PyTorch)
```

## 📊 What's Tracked

- Face Detection (Yes/No)
- Eye Contact (Yes/No + Duration)
- Head Pose (Pitch, Yaw, Roll)
- Engagement Score (0-100%)
- Engagement Level (Fully/Partially/Disengaged)
- Yawn Detection
- Distraction Duration

## 🖥️ UI Elements (MockInterviewReady Page)

```
┌─────────────────────────────────┐
│ [Engagement Overlay]  [LIVE]   │
│  Score: 85%                     │
│  ████████░░                     │
│  ✓ Face Detected                │
│  ✓ Eye Contact                  │
│  Fully Engaged                  │
│                                 │
│      [WEBCAM VIDEO]             │
│                                 │
│ ⚫ Engagement Active             │
└─────────────────────────────────┘
```

## 🐛 Troubleshooting

### Python Service Won't Start

```bash
cd engagement_analysis\backend
pip install -r fastapi_requirements.txt
python fastapi_main.py
```

### Backend: Socket.IO Not Found

```bash
cd intervau-ai-backend
npm install socket.io
```

### Frontend: Module Not Found

```bash
cd intervau-ai-frontend
npm install socket.io-client
```

### Engagement Overlay Not Showing

1. Check all 3 services are running
2. Open browser console (F12)
3. Look for: "✅ Connected to engagement socket"
4. Check camera permission granted

## 📝 Console Messages (When Working)

### Python

```
🚀 Initializing Face Feature Extractor...
🚀 Loading Engagement Prediction Model...
✅ Engagement Analysis API Ready!
INFO: Uvicorn running on http://0.0.0.0:8000
```

### Node.js

```
🔌 WebSocket ready for engagement tracking
✅ Client connected to engagement namespace
```

### Browser

```
✅ Connected to engagement socket
🚀 Auto-starting engagement tracking...
📊 Real-time engagement: {engagement_score: 85, ...}
```

## ⚙️ Configuration

### Frame Rate

`MockInterviewReady.tsx` line ~92:

```typescript
frameInterval: 500,  // 2 FPS (500ms)
```

### Engagement Thresholds

`fastapi_main.py` line ~190:

```python
level_scores = {
    'Fully Engaged': 90,
    'Partially Engaged': 60,
    'Disengaged': 30
}
```

### WebSocket URL

`useEngagementTracking.ts` line ~67:

```typescript
const backendUrl =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";
```

## 📦 Dependencies Installed

### Python

- fastapi==0.115.0
- uvicorn==0.32.1
- pydantic==2.10.3
- python-multipart==0.0.20
- (Reuses existing: opencv-python, mediapipe, torch)

### Node.js

- socket.io (latest)

### React

- socket.io-client (latest)

## ✅ Testing Checklist

- [ ] Python service starts (port 8000)
- [ ] Node.js backend starts (port 5000)
- [ ] React frontend starts (port 5173)
- [ ] WebSocket connects (check console)
- [ ] Video shows webcam
- [ ] Engagement overlay appears
- [ ] Score updates in real-time
- [ ] Face detection works
- [ ] Eye contact tracking works
- [ ] "Engagement Active" shows

## 📖 Full Documentation

- `ENGAGEMENT_INTEGRATION_README.md` - Complete setup guide
- `INTEGRATION_COMPLETE_SUMMARY.md` - Implementation summary
- `MOCKINTERVIEWREADY_WALKTHROUGH.md` - Visual walkthrough
- Session folder `plan.md` - Architecture details

## 🎉 Status

✅ **COMPLETE AND READY FOR TESTING**

---

**Quick Start:** Double-click `SETUP_COMPLETE_INTEGRATION.bat` then start the 3 services!
