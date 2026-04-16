@echo off
title React Frontend (Port 5173)
color 0E

echo ========================================
echo   Starting React Frontend
echo ========================================
echo.

cd /d "%~dp0intervau-ai-frontend"

call npm run dev

pause
