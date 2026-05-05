#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
TEST MODEL BARU vs MODEL LAMA pada gambar kompetisi
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import cv2
import numpy as np
from ultralytics import YOLO

def test_model(model_path, img_path, label):
    if not os.path.exists(model_path):
        print(f"  ❌ Model tidak ditemukan: {model_path}")
        return

    model = YOLO(model_path)
    img = cv2.imread(img_path)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    results = model(img_rgb, conf=0.25, iou=0.45, imgsz=640, verbose=False)
    result = results[0]

    print(f"\n{'='*50}")
    print(f" {label}")
    print(f"{'='*50}")

    if result.boxes is not None and len(result.boxes) > 0:
        boxes = result.boxes
        class_ids = boxes.cls.cpu().numpy().astype(int)
        confidences = boxes.conf.cpu().numpy()

        from collections import Counter
        class_counts = Counter()
        class_confs = {}

        for cls_id, conf in zip(class_ids, confidences):
            cls_name = model.names.get(cls_id, f'class_{cls_id}')
            class_counts[cls_name] += 1
            if cls_name not in class_confs:
                class_confs[cls_name] = []
            class_confs[cls_name].append(conf)

        for cls_name in ['colony_single', 'colony_merged', 'bubble', 'dust_debris', 'media_crack']:
            count = class_counts.get(cls_name, 0)
            if count > 0:
                avg_conf = np.mean(class_confs[cls_name])
                marker = "🔴" if cls_name in ['bubble', 'dust_debris', 'media_crack'] else "🟢"
                print(f"  {marker} {cls_name:15s}: {count:3d} deteksi (avg conf: {avg_conf:.3f})")
            else:
                marker = "🔴" if cls_name in ['bubble', 'dust_debris', 'media_crack'] else "🟢"
                print(f"  {marker} {cls_name:15s}:   0 deteksi")

        total = len(boxes)
        print(f"  {'─'*40}")
        print(f"  TOTAL: {total} deteksi")
    else:
        print("  ❌ Tidak ada deteksi!")

    # Save annotated image
    annotated = result.plot()
    out_path = os.path.join(os.path.dirname(__file__),
                            f"test_result_{label.replace(' ', '_').lower()}.jpg")
    cv2.imwrite(out_path, cv2.cvtColor(annotated, cv2.COLOR_RGB2BGR))
    print(f"  ✓ Saved: {os.path.basename(out_path)}")

def main():
    print("=" * 60)
    print(" TEST MODEL BARU vs MODEL LAMA")
    print("=" * 60)

    test_images = [
        os.path.join(os.path.dirname(__file__), 'imagetest', 'sample_macconkey_agar.png'),
        os.path.join(os.path.dirname(__file__), 'imagetest', 'sample_pca_agar.png'),
    ]

    old_model = os.path.join(os.path.dirname(__file__), 'models', 'colony_best.pt')
    new_model = os.path.join(os.path.dirname(__file__), 'models', 'colony_best_new.pt')

    for img_path in test_images:
        if not os.path.exists(img_path):
            print(f"❌ Gambar tidak ditemukan: {img_path}")
            continue

        print(f"\n📸 Gambar: {os.path.basename(img_path)}")
        test_model(old_model, img_path, "MODEL LAMA")
        test_model(new_model, img_path, "MODEL BARU")

    print()
    print("=" * 60)
    print(" SELESAI")
    print("=" * 60)

if __name__ == "__main__":
    main()
