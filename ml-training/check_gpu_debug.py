import os
print("Checking for GPU...")
try:
    import torch
    print(f"PyTorch Version: {torch.__version__}")
    if torch.cuda.is_available():
        print(f" CUDA is available!")
        print(f" GPU: {torch.cuda.get_device_name(0)}")
        print(f" Memory: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.2f} GB")
    else:
        print(" CUDA is NOT available. Running on CPU.")
except Exception as e:
    print(f" Error: {str(e)}")
