@echo off
REM ColonyAI - Start Frontend Development Server
REM Run this AFTER backend is running

echo.
echo ========================================================================
echo   COLONYAI - FRONTEND SERVER
echo ========================================================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    echo.
)

REM Start frontend server
echo Starting frontend server...
echo Application will be available at: http://localhost:3000
echo.
echo Make sure backend is already running on http://localhost:8000
echo.
echo Press Ctrl+C to stop the server.
echo ========================================================================
echo.

npm run dev

pause
