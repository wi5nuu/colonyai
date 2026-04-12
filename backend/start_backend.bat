@echo off
REM ColonyAI - Start Backend Server
REM Run this to start the API server with the trained model

echo.
echo ========================================================================
echo   COLONYAI - BACKEND SERVER
echo ========================================================================
echo.

REM Activate virtual environment
echo Activating virtual environment...
call ..\.venv\Scripts\activate.bat
echo.

REM Check if model exists
if not exist "..\backend\models\colony_best.pt" (
    echo WARNING: Model not found at ..\backend\models\colony_best.pt
    echo.
    echo Please train model first or copy from:
    echo   ml-training\runs\detect\runs\detect\colony_detection\weights\best.pt
    echo.
    pause
) else (
    echo ✅ Model found: ..\backend\models\colony_best.pt
    echo.
)

REM Start backend server
cd ..\backend
echo Starting backend server...
echo Server will be available at: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server.
echo ========================================================================
echo.

python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

pause
