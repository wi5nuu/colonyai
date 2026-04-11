@echo off
REM ColonyAI - Training Runner
REM Double-click this file to start training

echo.
echo ========================================================================
echo   COLONYAI - YOLOv8 MODEL TRAINING
echo ========================================================================
echo.

REM Check if dataset exists
if not exist "datasets\colony_dataset\data.yaml" (
    echo ERROR: Dataset not configured!
    echo.
    echo Please setup dataset first:
    echo   1. Run: setup.bat
    echo   2. Download dataset (see LOCAL_TRAINING_GUIDE.md)
    echo   3. Run: python verify_dataset.py
    echo.
    pause
    exit /b 1
)

REM Check GPU
echo Checking GPU...
python -c "import torch; print(f'✅ GPU Available: {torch.cuda.is_available()}'); print(f'✅ GPU: {torch.cuda.get_device_name(0)}'); print(f'✅ CUDA Version: {torch.version.cuda}'); print(f'✅ VRAM: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB'); print(f'🚀 GPU STATUS: READY FOR TRAINING!')"
echo.

echo ========================================================================
echo   TRAINING CONFIGURATION
echo ========================================================================
echo   Model: YOLOv8n (Nano) - GPU Optimized
echo   Epochs: 100
echo   Batch Size: 32 (GPU-accelerated)
echo   Image Size: 512
echo   Dataset: datasets/colony_dataset (1,477 images)
echo   Device: NVIDIA GeForce RTX 5050 Laptop GPU ⚡
echo   CUDA: 12.8 (Nightly Build)
echo ========================================================================
echo.
echo ⚡  Estimated Training Time: 25-35 minutes
echo.

set /p confirm="Start training? (y/n): "
if /i not "%confirm%"=="y" (
    echo Training cancelled.
    pause
    exit /b 0
)

echo.
echo ========================================================================
echo   STARTING TRAINING...
echo ========================================================================
echo.
echo Training will take 30 minutes to 3 hours depending on:
echo   - GPU capability
echo   - Dataset size
echo   - Number of epochs
echo.
echo You can monitor progress in another terminal:
echo   python monitor_training.py
echo.
echo Press Ctrl+C to stop training at any time.
echo ========================================================================
echo.

REM Run training
python train.py

if %errorlevel% equ 0 (
    echo.
    echo ========================================================================
    echo   TRAINING COMPLETE!
    echo ========================================================================
    echo.
    echo Best model saved to:
    echo   runs\detect\colony_detection\weights\best.pt
    echo.
    echo Next steps:
    echo   1. Test model: python train.py (will run validation)
    echo   2. Deploy to backend:
    echo      copy runs\detect\colony_detection\weights\best.pt ..\backend\models\colony_best.pt
    echo   3. Test backend inference
    echo.
) else (
    echo.
    echo ========================================================================
    echo   TRAINING FAILED
    echo ========================================================================
    echo.
    echo Check error messages above and fix any issues.
    echo See LOCAL_TRAINING_GUIDE.md for troubleshooting.
    echo.
)

pause
