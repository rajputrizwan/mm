@echo off
title Node.js Backend (Port 5000)
color 0B

echo ========================================
echo   Starting Node.js Backend
echo ========================================
echo.

echo [INFO] Checking FastAPI engagement service on port 8000...
set /a RETRIES=30

:WAIT_FOR_FASTAPI
curl.exe -s --max-time 2 http://localhost:8000/ >nul 2>nul
if %errorlevel%==0 goto FASTAPI_READY

set /a RETRIES-=1
if %RETRIES% LEQ 0 goto FASTAPI_TIMEOUT

echo [WAIT] FastAPI service not ready yet. Retries left: %RETRIES%
timeout /t 1 /nobreak >nul
goto WAIT_FOR_FASTAPI

:FASTAPI_READY
echo [OK] FastAPI service is reachable.
echo.

cd /d "%~dp0intervau-ai-backend"

set "PYTHON_SERVICE_URL=http://localhost:8000"

call npm run dev

pause
exit /b 0

:FASTAPI_TIMEOUT
echo [ERROR] FastAPI service on port 8000 is not reachable.
echo [ERROR] Start it first with START_1_PYTHON_SERVICE.bat
exit /b 1
