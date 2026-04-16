@echo off
echo ========================================
echo   Testing Service Connections
echo ========================================
echo.

echo Testing Python Service (http://localhost:8000)...
curl -s http://localhost:8000 > nul 2>&1
if errorlevel 1 (
    echo ❌ Python service is NOT running
) else (
    echo ✅ Python service is running
)

echo.
echo Testing Node.js Backend (http://localhost:5000)...
curl -s http://localhost:5000/api/health > nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js backend is NOT running
) else (
    echo ✅ Node.js backend is running
)

echo.
echo Testing React Frontend (http://localhost:5173)...
curl -s http://localhost:5173 > nul 2>&1
if errorlevel 1 (
    echo ❌ React frontend is NOT running
) else (
    echo ✅ React frontend is running
)

echo.
echo ========================================
echo.
echo If all services show ✅, you're ready to test!
echo Open your browser to: http://localhost:5173
echo.
pause
