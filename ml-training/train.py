# YOLOv8 Training Pipeline for Colony Detection
# Dataset: Colony Detection & Artifact Differentiation (5 Classes)
# Classes: colony_single, colony_merged, bubble, dust_debris, media_crack
# Images: ~1,477 (1k train, 306 val, 140 test)

from ultralytics import YOLO
import torch
import os
from pathlib import Path

# Configuration
DATASET_PATH = "./datasets/colony_dataset"  # Path to your dataset
MODEL_SIZE = "n"  # Use 'n' for nano, 's' for small, 'm' for medium
EPOCHS = 100
BATCH_SIZE = 4  # Reduced for RTX 5050 8GB VRAM stability
IMG_SIZE = 512
CLASSES = [
    "colony_single",
    "colony_merged", 
    "bubble",
    "dust_debris",
    "media_crack",
]
USE_GPU = True  # ✅ GPU ENABLED - RTX 5050 working with CUDA 12.8!

def train_model():
    """Train YOLOv8 model on colony dataset"""

    print("🚀 Starting Colony Detection Model Training")
    print(f"📊 Model: YOLOv8{MODEL_SIZE}")
    print(f"🎯 Classes: {CLASSES}")
    print(f"📁 Dataset: {DATASET_PATH}")

    # Load pretrained YOLOv8 model
    # Using YOLOv8n for object detection
    # RESUME from last checkpoint if available
    checkpoint_path = "runs/detect/runs/detect/colony_detection/weights/last.pt"
    if os.path.exists(checkpoint_path):
        print(f"📂 Resuming from checkpoint: {checkpoint_path}")
        model = YOLO(checkpoint_path)
    else:
        print("🆕 Starting fresh training from yolov8n.pt")
        model = YOLO(f"yolov8{MODEL_SIZE}.pt")
    
    # FORCE GPU - RTX 5050
    if USE_GPU and torch.cuda.is_available():
        device = 'cuda:0'
        torch.cuda.set_device(0)
        print(f"🎮 FORCING GPU: {torch.cuda.get_device_name(0)}")
        print(f"💾 VRAM: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB")
        print(f"🔥 CUDA version: {torch.version.cuda}")
    else:
        device = 'cpu'
        print("⚠️  WARNING: Running on CPU (GPU not available)")
    
    results = model.train(
        data=f"{DATASET_PATH}/data.yaml",
        epochs=EPOCHS,
        imgsz=IMG_SIZE,
        batch=BATCH_SIZE,
        name="colony_detection",
        project="runs/detect",
        exist_ok=True,
        pretrained=True,
        device=device,
        amp=False,  # Disable AMP for stability with nightly build
        optimizer='Adam',
        lr0=0.001,
        lrf=0.01,
        momentum=0.937,
        weight_decay=0.0005,
        warmup_epochs=3.0,
        warmup_momentum=0.8,
        warmup_bias_lr=0.1,
        box=7.5,  # Box loss gain
        cls=0.5,  # Class loss gain
        dfl=1.5,  # DFL loss gain
        hsv_h=0.015,  # Image HSV-Hue augmentation
        hsv_s=0.7,    # Image HSV-Saturation augmentation
        hsv_v=0.4,    # Image HSV-Value augmentation
        degrees=15.0, # Image rotation augmentation
        translate=0.1,# Image translation augmentation
        scale=0.5,    # Image scale augmentation
        shear=10.0,   # Image shear augmentation
        perspective=0.0,  # Image perspective augmentation
        flipud=0.5,   # Image flip up-down probability
        fliplr=0.5,   # Image flip left-right probability
        mosaic=1.0,   # Image mosaic probability
        mixup=0.1,    # Image mixup probability
        copy_paste=0.1,  # Image copy-paste probability
        workers=2,  # Reduced to avoid RAM/pagefile issues on Windows
    )
    
    print("✅ Training Complete!")
    print(f"📁 Results saved to: {results.save_dir}")
    
    # Export model to multiple formats
    print("\n📦 Exporting Models...")
    
    # Export to PyTorch
    model.export(format='pt')
    print("✓ Exported to PyTorch (.pt)")
    
    # Export to ONNX
    model.export(format='onnx', opset=12)
    print("✓ Exported to ONNX (.onnx)")
    
    # Export to TensorRT (if on GPU)
    try:
        model.export(format='engine')
        print("✓ Exported to TensorRT (.engine)")
    except:
        print("⚠ TensorRT export skipped (requires GPU)")
    
    return results

def validate_model(model_path):
    """Validate trained model"""
    print(f"\n🔍 Validating Model: {model_path}")
    
    model = YOLO(model_path)
    
    metrics = model.val(
        data=f"{DATASET_PATH}/data.yaml",
        split='val',
        imgsz=IMG_SIZE,
        save_json=True,
        conf=0.001,
        iou=0.6,
        max_det=300,
        half=False,
    )
    
    print(f"\n📊 Validation Results:")
    print(f"  mAP@0.5: {metrics.box.map50:.4f}")
    print(f"  mAP@0.5:0.95: {metrics.box.map:.4f}")
    print(f"  Precision: {metrics.box.mp:.4f}")
    print(f"  Recall: {metrics.box.mr:.4f}")
    
    return metrics

def test_inference(model_path, test_image):
    """Test model inference on sample image"""
    print(f"\n🧪 Testing Inference on: {test_image}")
    
    model = YOLO(model_path)
    
    results = model(
        test_image,
        conf=0.60,
        iou=0.45,
        imgsz=IMG_SIZE,
        verbose=True
    )
    
    # Print detections
    result = results[0]
    print(f"\n🎯 Detected {len(result.boxes)} objects:")
    
    for box in result.boxes:
        cls = int(box.cls)
        conf = float(box.conf)
        print(f"  - {CLASSES[cls]}: {conf:.2f}")
    
    # Save annotated image
    result.plot()
    result.save(filename="test_result.jpg")
    print("✓ Annotated image saved as test_result.jpg")
    
    return results

if __name__ == "__main__":
    # Step 1: Train model
    training_results = train_model()
    
    # Step 2: Validate model
    best_model_path = "runs/detect/colony_detection/weights/best.pt"
    if os.path.exists(best_model_path):
        validation_metrics = validate_model(best_model_path)
        
        # Step 3: Test on sample image
        test_image_path = "datasets/sample_test.jpg"
        if os.path.exists(test_image_path):
            test_results = test_inference(best_model_path, test_image_path)
        
        print("\n🎉 Training Pipeline Complete!")
        print(f"📊 Best model saved to: {best_model_path}")
    else:
        print("❌ Training failed. Check logs for details.")
