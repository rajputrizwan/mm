@echo off
echo ========================================
echo Starting Engagement Analysis FastAPI Service
echo ========================================
echo.

cd /d "%~dp0"

echo Installing dependencies...
pip install -r "..\..\requirements.txt"

echo.
echo Starting FastAPI server on http://localhost:8000
echo.

python fastapi_main.py

pause
