#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
TRAINING MODEL DENGAN ARTIFACT CLASSES
Fokus pada akurasi bubble, dust_debris, dan media_crack
"""
from ultralytics import YOLO
import torch

def main():
    print("=" * 70)
    print(" TRAINING COLONYAI WITH ARTIFACTS")
    print("=" * 70)
    print()

    # Check GPU
    if torch.cuda.is_available():
        print(f"✓ GPU available: {torch.cuda.get_device_name(0)}")
        device = 0
    else:
        print("⚠️  No GPU found, using CPU (will be slow)")
        device = 'cpu'

    print()

    # Load model
    print("Loading model...")
    # Gunakan YOLOv8s untuk balance antara speed dan accuracy
    model = YOLO('yolov8s.pt')
    print("✓ Model loaded: YOLOv8s")
    print()

    # Training configuration
    print("Training configuration:")
    print("  Dataset: colonyai_with_artifacts")
    print("  Epochs: 150")
    print("  Image size: 640")
    print("  Batch size: 16")
    print("  Classes: 5 (colony_single, colony_merged, bubble, dust_debris, media_crack)")
    print()

    # Train
    print("Starting training...")
    print("=" * 70)
    print()

    results = model.train(
        # Data
        data='../ml-training/datasets/colonyai_with_artifacts/data.yaml',

        # Training params
        epochs=150,
        imgsz=640,
        batch=16,
        device=device,

        # Optimizer
        optimizer='AdamW',
        lr0=0.001,
        lrf=0.01,
        momentum=0.937,
        weight_decay=0.0005,

        # Loss weights - PENTING untuk artifact!
        # Karena artifact lebih sedikit, beri weight lebih tinggi
        box=7.5,      # Bounding box loss
        cls=1.5,      # Classification loss (tinggi untuk artifact)
        dfl=1.5,      # Distribution Focal Loss

        # Augmentation - agresif untuk artifact
        hsv_h=0.02,   # Hue
        hsv_s=0.8,    # Saturation
        hsv_v=0.5,    # Value
        degrees=20.0, # Rotation
        translate=0.15,
        scale=0.6,
        shear=5.0,
        flipud=0.5,
        fliplr=0.5,
        mosaic=1.0,
        mixup=0.15,
        copy_paste=0.1,  # Copy-paste augmentation untuk artifact

        # Training settings
        patience=25,
        save=True,
        save_period=10,
        cache=True,
        workers=4,
        project='runs/detect',
        name='colonyai_with_artifacts',
        exist_ok=True,

        # Validation
        val=True,
        plots=True,
    )

    print()
    print("=" * 70)
    print(" TRAINING COMPLETE")
    print("=" * 70)
    print()

    # Validate
    print("Validating model...")
    metrics = model.val()

    print()
    print("Validation Metrics:")
    print(f"  mAP@0.5: {metrics.box.map50:.4f}")
    print(f"  mAP@0.5:0.95: {metrics.box.map:.4f}")
    print(f"  Precision: {metrics.box.mp:.4f}")
    print(f"  Recall: {metrics.box.mr:.4f}")
    print()

    # Per-class metrics
    if hasattr(metrics.box, 'maps'):
        print("Per-class mAP@0.5:")
        class_names = ['colony_single', 'colony_merged', 'bubble', 'dust_debris', 'media_crack']
        for i, cls_name in enumerate(class_names):
            if i < len(metrics.box.maps):
                print(f"  {cls_name:15s}: {metrics.box.maps[i]:.4f}")

    print()

    # Export model
    print("Exporting model...")
    model_path = model.export(format='pt')
    print(f"✓ Model exported: {model_path}")
    print()

    # Copy to backend
    import shutil
    backend_model_path = 'models/colony_best_with_artifacts.pt'
    shutil.copy2(model_path, backend_model_path)
    print(f"✓ Model copied to: {backend_model_path}")
    print()

    print("=" * 70)
    print(" NEXT STEPS")
    print("=" * 70)
    print()
    print("1. Test model pada gambar kompetisi:")
    print("   python test_optimized_detector.py")
    print()
    print("2. Update config untuk gunakan model baru:")
    print("   MODEL_PATH=./models/colony_best_with_artifacts.pt")
    print()
    print("3. Validate artifact detection:")
    print("   python check_artifact_accuracy.py")
    print()

if __name__ == "__main__":
    main()
