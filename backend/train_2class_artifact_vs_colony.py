#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
TRAINING 2 CLASS: ARTIFACT vs VALID COLONY
Fokus pada differentiate artifact dari colony yang valid
"""
from ultralytics import YOLO
import torch
from pathlib import Path

def main():
    print("=" * 70)
    print(" TRAINING 2 CLASS: ARTIFACT vs VALID COLONY")
    print(" Class 0: valid_colony (colony_single + colony_merged)")
    print(" Class 1: artifact (bubble + dust_debris + media_crack)")
    print("=" * 70)
    print()

    # Check GPU
    if torch.cuda.is_available():
        print(f"✓ GPU available: {torch.cuda.get_device_name(0)}")
        device = 0
    else:
        print("⚠️  No GPU found, using CPU")
        device = 'cpu'

    print()

    # Dataset path
    dataset_path = Path('../ml-training/datasets/colonyai_2class/data.yaml')

    if not dataset_path.exists():
        print(f"❌ Dataset not found: {dataset_path}")
        print()
        print("Jalankan script merge untuk 2 class dulu:")
        print("  python merge_to_2class.py")
        return

    print(f"✓ Dataset found: {dataset_path}")
    print()

    # Load model
    print("Loading model...")
    model = YOLO('yolov8s.pt')  # Small untuk balance
    print("✓ Model loaded: YOLOv8s")
    print()

    # Training configuration
    print("Training configuration:")
    print("  Classes: 2 (binary classification)")
    print("  Epochs: 100 (lebih cepat karena 2 class)")
    print("  Image size: 640")
    print("  Batch size: 16")
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
        epochs=100,  # Lebih sedikit karena 2 class
        imgsz=640,
        batch=16,
        device=device,

        # Optimizer
        optimizer='AdamW',
        lr0=0.001,
        lrf=0.01,

        # Loss weights - balance untuk 2 class
        box=7.5,
        cls=2.0,  # Higher untuk classification
        dfl=1.5,

        # Augmentation
        hsv_h=0.02,
        hsv_s=0.8,
        hsv_v=0.5,
        degrees=20.0,
        translate=0.15,
        scale=0.6,
        flipud=0.5,
        fliplr=0.5,
        mosaic=1.0,
        mixup=0.15,

        # Training settings
        patience=20,
        save=True,
        save_period=10,
        cache=True,
        workers=4,
        project='runs/detect',
        name='colonyai_2class',
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
    if hasattr(metrics.box, 'maps') and len(metrics.box.maps) >= 2:
        print("Per-class mAP@0.5:")
        print(f"  valid_colony : {metrics.box.maps[0]:.4f}")
        print(f"  artifact     : {metrics.box.maps[1]:.4f}")

    print()

    # Analisis
    if metrics.box.map50 > 0.85:
        print("✅ EXCELLENT! Model bisa differentiate artifact vs colony dengan baik!")
    elif metrics.box.map50 > 0.75:
        print("✅ GOOD! Model cukup akurat untuk production")
    elif metrics.box.map50 > 0.65:
        print("⚠️  ACCEPTABLE. Perlu improvement dengan lebih banyak data")
    else:
        print("❌ POOR. Perlu re-train dengan dataset lebih baik")

    print()

    # Export model
    print("Exporting model...")
    best_model_path = Path('runs/detect/colonyai_2class/weights/best.pt')

    if best_model_path.exists():
        import shutil
        backend_model_path = 'models/colony_2class_artifact_vs_colony.pt'
        shutil.copy2(best_model_path, backend_model_path)
        print(f"✓ Model saved: {backend_model_path}")

    print()
    print("=" * 70)
    print(" NEXT STEPS")
    print("=" * 70)
    print()
    print("1. Test model pada gambar kompetisi")
    print("2. Jika akurasi bagus (>85%), gunakan untuk production")
    print("3. Jika perlu, tambah detail 5 class nanti")
    print()

if __name__ == "__main__":
    main()
