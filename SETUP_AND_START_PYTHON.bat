@echo off
title Setup and Start Python Engagement Service
color 0A

echo ========================================
echo   Installing Python Dependencies
echo ========================================
echo.

cd /d "%~dp0engagement_analysis"

echo Activating virtual environment...
call "%~dp0.venv\Scripts\activate.bat"

echo.
echo Installing unified Python dependencies...
pip install -r "%~dp0requirements.txt"

echo.
echo ========================================
echo   Starting FastAPI Service
echo ========================================
echo.
echo Service will run on: http://localhost:8000
echo Keep this window open!
echo.

cd backend
python fastapi_main.py

pause
