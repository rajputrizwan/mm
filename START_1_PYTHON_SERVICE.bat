@echo off
title Python FastAPI Service (Port 8000)
color 0A

echo ========================================
echo   Starting Python FastAPI Service
echo ========================================
echo.

set "PORT=8000"
set "PORT_PID="
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":%PORT% .*LISTENING"') do (
		set "PORT_PID=%%P"
		goto :PORT_IN_USE_CHECK
)
goto :START_SERVICE

:PORT_IN_USE_CHECK
echo [INFO] Port %PORT% is already in use (PID: %PORT_PID%).
curl.exe -s --max-time 2 http://localhost:%PORT%/ >nul 2>nul
if %errorlevel%==0 (
		echo [OK] Engagement FastAPI service is already running on port %PORT%.
		echo [OK] Reusing existing instance.
		exit /b 0
)

echo [ERROR] Port %PORT% is busy and does not look like the engagement service.
echo [ERROR] Stop the process using PID %PORT_PID% or change the service port.
exit /b 1

:START_SERVICE

cd /d "%~dp0engagement_analysis\backend"

set "VENV_PY=%~dp0.venv\Scripts\python.exe"

if exist "%VENV_PY%" (
	"%VENV_PY%" fastapi_main.py
) else (
	echo [WARN] Virtual environment Python not found at:
	echo        %VENV_PY%
	echo [WARN] Falling back to system/default Python.
	python fastapi_main.py
)

pause
