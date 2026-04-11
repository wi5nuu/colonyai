@echo off
REM Quick training test with CUDA_LAUNCH_BLOCKING for better error messages
set CUDA_LAUNCH_BLOCKING=1
python train.py
pause
