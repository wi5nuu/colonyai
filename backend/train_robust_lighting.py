#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
TRAINING ROBUST - 5 CLASS dengan augmentation cahaya agresif
Tahan terhadap variasi cahaya, foto HP, cahaya dari berbagai arah
"""
from ultralytics import YOLO
import torch
import shutil
from pathlib import Path

def main():
    print("=" * 70)
    print(" TRAINING COLONYAI - ROBUST LIGHTING")
    print(" 5 Class: colony_single, colony_merged, bubble, dust_debris, media_crack")
    print(" Augmentation: Variasi cahaya agresif untuk foto HP")
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

    dataset_path = Path('D:/lombapuai/ml-training/datasets/colonyai_merged/data.yaml')

    if not dataset_path.exists():
        print(f"❌ Dataset not found: {dataset_path}")
        return

    print(f"✓ Dataset: {dataset_path}")
    print()

    # Load model - gunakan YOLOv8s
    model = YOLO('yolov8s.pt')
    print("✓ Model: YOLOv8s")
    print()

    print("Konfigurasi:")
    print("  Epochs    : 150")
    print("  Image size: 640")
    print("  Batch     : 8")
    print("  Augmentation: AGRESIF (variasi cahaya, rotasi, blur)")
    print()

    input("Press Enter to start training...")
    print()

    results = model.train(
        data=str(dataset_path),

        # Training params
        epochs=150,
        imgsz=640,
        batch=8,
        device=device,

        # Optimizer
        optimizer='AdamW',
        lr0=0.001,
        lrf=0.01,
        momentum=0.937,
        weight_decay=0.0005,

        # Loss weights
        box=7.5,
        cls=2.0,   # Lebih tinggi untuk class discrimination
        dfl=1.5,

        # ============================================
        # AUGMENTATION AGRESIF UNTUK VARIASI CAHAYA
        # ============================================

        # Warna & Cahaya - SANGAT AGRESIF
        # Simulasi foto HP dengan cahaya dari berbagai arah
        hsv_h=0.05,    # Hue variation (warna media berbeda)
        hsv_s=0.9,     # Saturation (cahaya terang/redup)
        hsv_v=0.6,     # Value/brightness (cahaya dari kanan/kiri)

        # Geometri
        degrees=30.0,  # Rotasi lebih besar (foto miring)
        translate=0.2, # Translasi
        scale=0.7,     # Scale variation
        shear=5.0,     # Shear
        perspective=0.0005,  # Perspektif (foto dari sudut)

        # Flip
        flipud=0.5,
        fliplr=0.5,

        # Advanced augmentation
        mosaic=1.0,    # Mosaic (gabungkan 4 gambar)
        mixup=0.2,     # Mixup
        copy_paste=0.1,

        # Blur - simulasi foto HP tidak fokus
        # (dihandle oleh mosaic dan augmentation internal)

        # Training settings
        patience=30,
        save=True,
        save_period=10,
        cache=False,
        workers=2,
        project='runs/detect',
        name='colonyai_robust',
        exist_ok=True,
        val=True,
        plots=True,

        # Class weights untuk balance imbalance dataset
        # colony_single: 210k, colony_merged: 23k, bubble: 28k
        # dust_debris: 612, media_crack: 4k
        # Semakin sedikit data → weight lebih tinggi
        cls_pw=1.0,   # Classification positive weight
    )

    print()
    print("=" * 70)
    print(" TRAINING COMPLETE")
    print("=" * 70)
    print()

    # Copy model
    best_paths = [
        Path('C:/Users/Legion/runs/detect/colonyai_robust/weights/best.pt'),
        Path('runs/detect/colonyai_robust/weights/best.pt'),
    ]

    for best_path in best_paths:
        if best_path.exists():
            dst = Path('D:/lombapuai/backend/models/colony_best_robust.pt')
            shutil.copy2(best_path, dst)
            print(f"✓ Model saved: {dst}")
            print(f"  Size: {dst.stat().st_size/1024/1024:.1f} MB")
            break

    print()
    print("Test model:")
    print("  D:\\lombapuai\\.venv\\Scripts\\python.exe D:\\lombapuai\\backend\\test_new_model.py")
    print()

if __name__ == "__main__":
    main()
