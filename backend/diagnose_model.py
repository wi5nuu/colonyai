#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Diagnosa model - cek apakah model berfungsi dengan benar
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ultralytics import YOLO
import cv2
import numpy as np

def diagnose():
    model_path = os.path.join(os.path.dirname(__file__), 'models', 'colony_best.pt')
    img_path = os.path.join(os.path.dirname(__file__), 'casseforcompetetions.png')

    print("=" * 70)
    print(" DIAGNOSA MODEL COLONYAI")
    print("=" * 70)
    print()

    # Load model
    print(f"1. Loading model: {model_path}")
    model = YOLO(model_path)
    print(f"   ✓ Model loaded successfully")
    print()

    # Check model info
    print("2. Model Information:")
    print(f"   Class names: {model.names}")
    print(f"   Number of classes: {len(model.names)}")
    print()

    # Load image
    print(f"3. Loading image: {os.path.basename(img_path)}")
    img = cv2.imread(img_path)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    h, w = img.shape[:2]
    print(f"   ✓ Image loaded: {w}x{h}")
    print()

    # Test inference with very low threshold
    print("4. Running inference with VERY LOW threshold (0.01):")
    results = model(img_rgb, conf=0.01, iou=0.45, imgsz=512, verbose=True)

    result = results[0]
    print()
    print(f"5. Results:")
    print(f"   Boxes detected: {len(result.boxes) if result.boxes is not None else 0}")

    if result.boxes is not None and len(result.boxes) > 0:
        boxes = result.boxes
        print(f"   Confidences: min={boxes.conf.min():.4f}, max={boxes.conf.max():.4f}")
        print(f"   Classes detected: {set(boxes.cls.cpu().numpy().astype(int))}")

        # Show top 10 detections
        print()
        print("   Top 10 detections:")
        confs = boxes.conf.cpu().numpy()
        cls_ids = boxes.cls.cpu().numpy().astype(int)
        sorted_idx = np.argsort(confs)[::-1][:10]

        for idx in sorted_idx:
            cls_id = cls_ids[idx]
            conf = confs[idx]
            cls_name = model.names.get(cls_id, f'class_{cls_id}')
            print(f"     - {cls_name:15s}: {conf:.4f}")
    else:
        print("   ✗ NO DETECTIONS AT ALL!")
        print()
        print("   POSSIBLE CAUSES:")
        print("   1. Model tidak di-train dengan benar")
        print("   2. Model di-train dengan dataset yang berbeda")
        print("   3. Gambar kompetisi sangat berbeda dari training data")
        print("   4. Model corrupted atau tidak kompatibel")
        print()
        print("   SOLUSI:")
        print("   - Cek apakah model ini hasil training Anda sendiri")
        print("   - Test dengan gambar dari training dataset")
        print("   - Re-train model dengan data yang lebih representatif")

    print()
    print("6. Testing dengan gambar dari imagetest folder:")

    test_images = [
        'imagetest/sample_macconkey_agar.png',
        'imagetest/sample_pca_agar.png'
    ]

    for test_img_rel in test_images:
        test_img_path = os.path.join(os.path.dirname(__file__), test_img_rel)
        if os.path.exists(test_img_path):
            print(f"\n   Testing: {os.path.basename(test_img_path)}")
            test_img = cv2.imread(test_img_path)
            test_img_rgb = cv2.cvtColor(test_img, cv2.COLOR_BGR2RGB)

            test_results = model(test_img_rgb, conf=0.01, iou=0.45, imgsz=512, verbose=False)
            test_result = test_results[0]

            if test_result.boxes is not None and len(test_result.boxes) > 0:
                print(f"   ✓ Detected {len(test_result.boxes)} objects")
                confs = test_result.boxes.conf.cpu().numpy()
                print(f"   Confidence range: {confs.min():.4f} - {confs.max():.4f}")
            else:
                print(f"   ✗ No detections")

    print()
    print("=" * 70)
    print(" DIAGNOSA SELESAI")
    print("=" * 70)

if __name__ == "__main__":
    diagnose()
