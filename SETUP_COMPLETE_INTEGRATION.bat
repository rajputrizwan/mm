@echo off
echo ========================================================================
echo    ENGAGEMENT ANALYSIS INTEGRATION - COMPLETE SETUP
echo ========================================================================
echo.
echo This script will set up the complete engagement analysis integration.
echo.
echo Services to be configured:
echo   1. Python FastAPI Service (Port 8000)
echo   2. Node.js Backend with Socket.IO (Port 5000)
echo   3. React Frontend with Engagement Tracking (Port 5173)
echo.
echo ========================================================================
pause

echo.
echo ========================================================================
echo STEP 1: Setting up Python FastAPI Service
echo ========================================================================
cd /d "%~dp0"

echo.
echo Activating project virtual environment...
call ".venv\Scripts\activate.bat"

echo.
echo Installing Python dependencies...
pip install -r requirements.txt

if errorlevel 1 (
    echo.
    echo ❌ Error: Failed to install Python dependencies
    echo Please check your Python installation and try again.
    pause
    exit /b 1
)

echo.
echo ✅ Python service setup complete!

echo.
echo ========================================================================
echo STEP 2: Setting up Node.js Backend
echo ========================================================================
cd /d "%~dp0intervau-ai-backend"

echo.
echo Installing Socket.IO...
call npm install socket.io

if errorlevel 1 (
    echo.
    echo ❌ Error: Failed to install Socket.IO for backend
    pause
    exit /b 1
)

echo.
echo ✅ Backend setup complete!

echo.
echo ========================================================================
echo STEP 3: Setting up React Frontend
echo ========================================================================
cd /d "%~dp0intervau-ai-frontend"

echo.
echo Installing Socket.IO Client...
call npm install socket.io-client

if errorlevel 1 (
    echo.
    echo ❌ Error: Failed to install Socket.IO Client for frontend
    pause
    exit /b 1
)

echo.
echo ✅ Frontend setup complete!

echo.
echo ========================================================================
echo ✅✅✅ SETUP COMPLETE! ✅✅✅
echo ========================================================================
echo.
echo All dependencies have been installed successfully!
echo.
echo Next Steps:
echo   1. Open 3 separate terminals (or run 3 batch files)
echo.
echo   Terminal 1 - Python Service:
echo      cd engagement_analysis\backend
echo      ..\.venv\Scripts\python.exe fastapi_main.py
echo.
echo   Terminal 2 - Node.js Backend:
echo      cd intervau-ai-backend
echo      npm run dev
echo.
echo   Terminal 3 - React Frontend:
echo      cd intervau-ai-frontend
echo      npm run dev
echo.
echo Then open your browser to: http://localhost:5173
echo.
echo For detailed instructions, see: ENGAGEMENT_INTEGRATION_README.md
echo.
echo ========================================================================
pause
