#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
TRAINING TEST - Dataset Contamination USM
Test dulu dengan epochs sedikit sebelum training penuh
"""
from ultralytics import YOLO
import torch
from pathlib import Path

def main():
    print("=" * 70)
    print(" TRAINING TEST - CONTAMINATION DATASET")
    print(" Test dengan epochs sedikit untuk validasi dataset")
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
    dataset_path = Path('../ml-training/datasets/colonyai_with_contamination/data.yaml')

    if not dataset_path.exists():
        print(f"❌ Dataset not found: {dataset_path}")
        print()
        print("Jalankan merge_roboflow_datasets.py dulu!")
        return

    print(f"✓ Dataset found: {dataset_path}")
    print()

    # Load model
    print("Loading model...")
    model = YOLO('yolov8n.pt')  # Gunakan nano untuk test cepat
    print("✓ Model loaded: YOLOv8n (nano - untuk test cepat)")
    print()

    # Training configuration
    print("Training TEST configuration:")
    print("  Epochs: 30 (test only)")
    print("  Image size: 640")
    print("  Batch size: 16")
    print()

    input("Press Enter to start training test...")
    print()

    # Train
    print("Starting training TEST...")
    print("=" * 70)
    print()

    results = model.train(
        # Data
        data=str(dataset_path),

        # Training params - SEDIKIT untuk test
        epochs=30,  # Hanya 30 epochs untuk test
        imgsz=640,
        batch=16,
        device=device,

        # Optimizer
        optimizer='AdamW',
        lr0=0.001,

        # Augmentation - standard
        hsv_h=0.015,
        hsv_s=0.7,
        hsv_v=0.4,
        degrees=15.0,
        flipud=0.5,
        fliplr=0.5,

        # Training settings
        patience=10,  # Early stopping lebih cepat
        save=True,
        cache=True,
        workers=4,
        project='runs/detect',
        name='contamination_test',
        exist_ok=True,

        # Validation
        val=True,
        plots=True,
    )

    print()
    print("=" * 70)
    print(" TRAINING TEST COMPLETE")
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

    # Analisis hasil
    if metrics.box.map50 > 0.7:
        print("✅ HASIL BAGUS! (mAP > 0.7)")
        print()
        print("NEXT STEPS:")
        print("1. Training FULL dengan epochs 150:")
        print("   python train_with_artifacts.py")
        print()
        print("2. Atau tambah dataset lain dulu:")
        print("   - Artifacts detection (defect)")
        print("   - Artifacts SmileScan (bubble)")
        print()
    elif metrics.box.map50 > 0.5:
        print("⚠️  HASIL CUKUP (mAP 0.5-0.7)")
        print()
        print("REKOMENDASI:")
        print("1. Tambah dataset lain untuk improve:")
        print("   - Artifacts detection")
        print("   - Artifacts SmileScan")
        print()
        print("2. Atau training lebih lama (150 epochs)")
        print()
    else:
        print("❌ HASIL KURANG (mAP < 0.5)")
        print()
        print("MASALAH KEMUNGKINAN:")
        print("1. Dataset tidak cocok")
        print("2. Class mapping salah")
        print("3. Perlu lebih banyak data")
        print()
        print("SOLUSI:")
        print("1. Cek class mapping di merge script")
        print("2. Tambah dataset lain")
        print("3. Atau annotate manual")
        print()

    # Test pada gambar kompetisi
    print("=" * 70)
    print(" TEST PADA GAMBAR KOMPETISI")
    print("=" * 70)
    print()

    import cv2
    import numpy as np

    img_path = 'casseforcompetetions.png'
    if Path(img_path).exists():
        img = cv2.imread(img_path)
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        print(f"Testing on: {img_path}")
        results_test = model(img_rgb, conf=0.25, verbose=False)

        if results_test[0].boxes is not None:
            num_detections = len(results_test[0].boxes)
            print(f"✓ Detected {num_detections} objects")

            if num_detections > 0:
                print("  Model bisa deteksi pada gambar kompetisi!")
            else:
                print("  ⚠️  Tidak ada deteksi (perlu training lebih lama)")
        else:
            print("  ⚠️  Tidak ada deteksi")

    print()

if __name__ == "__main__":
    main()
