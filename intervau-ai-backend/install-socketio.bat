@echo off
echo ========================================
echo Installing Socket.IO for Engagement Tracking
echo ========================================
echo.

cd /d "%~dp0"

echo Installing socket.io...
call npm install socket.io

echo.
echo Installing @types/socket.io for TypeScript...
call npm install --save-dev @types/socket.io

echo.
echo ✅ Installation complete!
echo.
echo You can now run: npm run dev
pause
