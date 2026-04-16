@echo off
echo ========================================
echo Installing Socket.IO Client for Frontend
echo ========================================
echo.

cd /d "%~dp0"

echo Installing socket.io-client...
call npm install socket.io-client

echo.
echo ✅ Installation complete!
echo.
echo You can now run: npm run dev
pause
