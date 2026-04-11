@echo off
REM ColonyAI - Quick Setup Script for Local Training
REM Run this script to prepare your laptop for training

echo.
echo ========================================================================
echo   COLONYAI - LOCAL TRAINING SETUP
echo ========================================================================
echo.

REM Check Python installation
echo [1/5] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python not found!
    echo Please install Python 3.10+ from https://www.python.org/downloads/
    pause
    exit /b 1
)
echo OK: Python found
echo.

REM Install dependencies
echo [2/5] Installing Python dependencies...
echo This may take a few minutes...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo OK: Dependencies installed
echo.

REM Check GPU availability
echo [3/5] Checking GPU availability...
python -c "import torch; print(f'CUDA Available: {torch.cuda.is_available()}'); print(f'CUDA Version: {torch.version.cuda}' if torch.cuda.is_available() else 'Using CPU only')"
echo.

REM Setup dataset structure
echo [4/5] Setting up dataset structure...
python download_dataset.py
if %errorlevel% neq 0 (
    echo ERROR: Failed to setup dataset structure
    pause
    exit /b 1
)
echo.

REM Verify dataset
echo [5/5] Verifying dataset...
python verify_dataset.py
echo.

echo ========================================================================
echo   SETUP COMPLETE!
echo ========================================================================
echo.
echo Next steps:
echo   1. Download dataset (see LOCAL_TRAINING_GUIDE.md)
echo   2. Place images in: datasets\colony_dataset\images\
echo   3. Place labels in: datasets\colony_dataset\labels\
echo   4. Run: python verify_dataset.py
echo   5. Run: python train.py
echo.
echo For detailed guide, see:
echo   ml-training\LOCAL_TRAINING_GUIDE.md
echo   ml-training\DATASET_GUIDE.md
echo.
pause
