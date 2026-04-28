"""
Quick GPU test to verify CUDA is working for YOLOv8 training
"""

import torch
from ultralytics import YOLO

print("="*70)
print("🔥 GPU TEST FOR COLONY TRAINING")
print("="*70)

# Test 1: PyTorch CUDA
print("\n[Test 1] PyTorch CUDA Setup")
print(f"✅ CUDA Available: {torch.cuda.is_available()}")
print(f"✅ CUDA Version: {torch.version.cuda}")
print(f"✅ GPU: {torch.cuda.get_device_name(0)}")
print(f"✅ VRAM: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB")

# Test 2: YOLO model load
print("\n[Test 2] YOLOv8 Model Loading")
try:
    model = YOLO("yolov8n.pt")
    print("✅ YOLOv8n model loaded successfully")
except Exception as e:
    print(f"❌ Failed to load model: {e}")
    exit(1)

# Test 3: Quick inference on GPU
print("\n[Test 3] GPU Inference Test")
try:
    # Create a dummy image (640x640 black image)
    import numpy as np
    dummy_img = np.zeros((640, 640, 3), dtype=np.uint8)
    
    # Run inference
    results = model(dummy_img, device='cuda:0', verbose=False)
    print("✅ GPU inference working!")
    # Fix: access device from the first tensor in results if needed, or just check success
    print(f"✅ Inference successful on: {results[0].boxes.data.device}")
except Exception as e:
    print(f"❌ GPU inference failed: {e}")
    exit(1)

# Test 4: Dataset check
print("\n[Test 4] Dataset Verification")
from pathlib import Path
dataset_path = Path("./datasets/colony_mini")
if (dataset_path / "data.yaml").exists():
    print(f"✅ data.yaml found")
    train_count = len(list((dataset_path / "train/images").glob("*.*")))
    val_count = len(list((dataset_path / "valid/images").glob("*.*")))
    test_count = len(list((dataset_path / "test/images").glob("*.*")))
    print(f"✅ Training images: {train_count}")
    print(f"✅ Validation images: {val_count}")
    print(f"✅ Test images: {test_count}")
    print(f"✅ Total: {train_count + val_count + test_count}")
else:
    print(f"❌ Dataset not configured at {dataset_path}")
    exit(1)

print("\n" + "="*70)
print("🎉 ALL TESTS PASSED! GPU ready for training!")
print("="*70)
print("\n⏱️  Estimated Training Time (100 epochs, 1031 images):")
print("   • YOLOv8n: ~25-35 minutes")
print("   • YOLOv8s: ~35-50 minutes")
print("   • YOLOv8m: ~50-70 minutes")
print("\n🚀 You can now start training:")
print("   python train.py")
print("   OR")
print("   Double-click: run_training.bat")
print("="*70)
