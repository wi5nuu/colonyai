#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
TRAINING MODEL DENGAN DATASET CUSTOM (ANNOTATE SENDIRI)
5 Class: colony_single, colony_merged, bubble, dust_debris, media_crack
"""
from ultralytics import YOLO
import torch
from pathlib import Path

def main():
    print("=" * 70)
    print(" TRAINING COLONYAI - CUSTOM DATASET")
    print(" 5 Class: colony_single, colony_merged, bubble, dust_debris, media_crack")
    print("=" * 70)
    print()

    # Check GPU
    if torch.cuda.is_available():
        print(f"✓ GPU available: {torch.cuda.get_device_name(0)}")
        device = 0
    else:
        print("⚠️  No GPU found, using CPU (will be VERY slow)")
        device = 'cpu'

    print()

    # Dataset path
    dataset_path = Path('D:/lombapuai/ml-training/datasets/colonyai_merged/data.yaml')

    if not dataset_path.exists():
        print(f"❌ Dataset not found: {dataset_path}")
        print()
        print("SOLUSI:")
        print("1. Download dataset dari Roboflow")
        print("2. Extract ke: ml-training/datasets/colonyai_custom/")
        print("3. Pastikan ada file data.yaml")
        return

    print(f"✓ Dataset found: {dataset_path}")
    print()

    # Load model
    print("Loading model...")
    # Gunakan YOLOv8s untuk balance
    model = YOLO('yolov8s.pt')
    print("✓ Model loaded: YOLOv8s")
    print()

    # Training configuration
    print("Training configuration:")
    print("  Epochs: 150")
    print("  Image size: 640")
    print("  Batch size: 16")
    print("  Optimizer: AdamW")
    print()

    input("Press Enter to start training...")
    print()

    # Train
    print("Starting training...")
    print("=" * 70)
    print()

    results = model.train(
        # Data
        data=str(dataset_path),

        # Training params
        epochs=150,
        imgsz=640,
        batch=8,       # Turunkan dari 16 ke 8 untuk hemat VRAM
        device=device,

        # Optimizer
        optimizer='AdamW',
        lr0=0.001,
        lrf=0.01,
        momentum=0.937,
        weight_decay=0.0005,

        # Loss weights
        box=7.5,
        cls=1.5,
        dfl=1.5,

        # Augmentation
        hsv_h=0.02,
        hsv_s=0.8,
        hsv_v=0.5,
        degrees=20.0,
        translate=0.15,
        scale=0.6,
        shear=5.0,
        flipud=0.5,
        fliplr=0.5,
        mosaic=1.0,
        mixup=0.15,
        copy_paste=0.1,

        # Training settings
        patience=25,
        save=True,
        save_period=10,
        cache=False,   # Matikan cache untuk hemat RAM
        workers=2,     # Turunkan dari 4 ke 2
        project='runs/detect',
        name='colonyai_custom',
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
                map_val = metrics.box.maps[i]
                marker = "✅" if map_val > 0.7 else "⚠️" if map_val > 0.5 else "❌"
                print(f"  {marker} {cls_name:15s}: {map_val:.4f}")

    print()

    # Export model
    print("Exporting model...")
    best_model_path = Path('runs/detect/colonyai_custom/weights/best.pt')

    if best_model_path.exists():
        # Copy to backend
        import shutil
        backend_model_path = 'models/colony_best_custom.pt'
        shutil.copy2(best_model_path, backend_model_path)
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
    print("   MODEL_PATH=./models/colony_best_custom.pt")
    print()
    print("3. Validate artifact detection:")
    print("   python check_artifact_accuracy.py")
    print()
    print("4. Jika akurasi kurang, tambah data annotate lagi")
    print()

if __name__ == "__main__":
    main()
