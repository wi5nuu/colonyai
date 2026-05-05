#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
FINE-TUNE model existing dengan augmentation cahaya
Lebih cepat dari training ulang (~30-45 menit)
"""
from ultralytics import YOLO
import torch
import shutil
from pathlib import Path

def main():
    print("=" * 70)
    print(" FINE-TUNE - ROBUST LIGHTING")
    print(" Base: colony_best_new.pt (sudah trained 150 epochs)")
    print(" Fine-tune: 50 epochs dengan augmentation cahaya agresif")
    print("=" * 70)
    print()

    if torch.cuda.is_available():
        print(f"✓ GPU: {torch.cuda.get_device_name(0)}")
        device = 0
    else:
        device = 'cpu'

    dataset_path = Path('D:/lombapuai/ml-training/datasets/colonyai_merged/data.yaml')
    base_model = Path('D:/lombapuai/backend/models/colony_best_new.pt')

    if not base_model.exists():
        print(f"❌ Base model tidak ditemukan: {base_model}")
        return

    print(f"✓ Base model: {base_model.name}")
    print(f"✓ Dataset: {dataset_path}")
    print()
    print("Konfigurasi fine-tune:")
    print("  Epochs    : 50 (bukan 150)")
    print("  LR        : 0.0001 (sangat rendah, jaga pengetahuan lama)")
    print("  Augmentation: Cahaya agresif")
    print()

    input("Press Enter to start fine-tuning...")
    print()

    # Load model EXISTING (bukan dari scratch)
    model = YOLO(str(base_model))

    results = model.train(
        data=str(dataset_path),

        # Fine-tune params - SEDIKIT epoch, LR rendah
        epochs=50,
        imgsz=640,
        batch=8,
        device=device,

        # Learning rate SANGAT RENDAH untuk fine-tune
        optimizer='AdamW',
        lr0=0.0001,   # 10x lebih rendah dari training normal
        lrf=0.01,
        momentum=0.937,
        weight_decay=0.0005,

        # Loss weights
        box=7.5,
        cls=2.0,
        dfl=1.5,

        # AUGMENTATION CAHAYA AGRESIF
        hsv_h=0.05,
        hsv_s=0.9,
        hsv_v=0.6,    # Brightness variation (cahaya HP)
        degrees=30.0,
        translate=0.2,
        scale=0.7,
        shear=5.0,
        perspective=0.0005,
        flipud=0.5,
        fliplr=0.5,
        mosaic=1.0,
        mixup=0.2,
        copy_paste=0.1,
        cls_pw=1.0,

        # Settings
        patience=15,
        save=True,
        cache=False,
        workers=2,
        project='runs/detect',
        name='colonyai_finetune',
        exist_ok=True,
        val=True,
        plots=True,
    )

    print()
    print("=" * 70)
    print(" FINE-TUNE COMPLETE")
    print("=" * 70)
    print()

    # Copy model
    best_paths = [
        Path('C:/Users/Legion/runs/detect/colonyai_finetune/weights/best.pt'),
        Path('runs/detect/colonyai_finetune/weights/best.pt'),
    ]

    for best_path in best_paths:
        if best_path.exists():
            dst = Path('D:/lombapuai/backend/models/colony_best_finetune.pt')
            shutil.copy2(best_path, dst)
            print(f"✓ Model saved: {dst}")
            break

    print()
    print("Test model:")
    print("  D:\\lombapuai\\.venv\\Scripts\\python.exe D:\\lombapuai\\backend\\test_new_model.py")

if __name__ == "__main__":
    main()
