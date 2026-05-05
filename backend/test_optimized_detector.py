#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Test Optimized Detector pada gambar kompetisi
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import cv2
import numpy as np
from app.services.colony_detector_optimized import ColonyDetectorOptimized

def main():
    img_path = os.path.join(os.path.dirname(__file__), 'casseforcompetetions.png')

    print("=" * 70)
    print(" TEST OPTIMIZED DETECTOR - GAMBAR KOMPETISI")
    print("=" * 70)
    print()

    # Load image
    img_bgr = cv2.imread(img_path)
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    h, w = img_bgr.shape[:2]

    print(f"Image: {os.path.basename(img_path)}")
    print(f"Size: {w}x{h}")
    print()

    # Load optimized detector
    print("Loading optimized detector...")
    model_path = os.path.join(os.path.dirname(__file__), 'models', 'colony_best.pt')
    detector = ColonyDetectorOptimized(model_path=model_path)
    print()

    # Test berbagai mode
    modes = [
        {'name': 'Standard', 'aggressive': False, 'use_tta': False},
        {'name': 'Aggressive', 'aggressive': True, 'use_tta': False},
        {'name': 'Aggressive + TTA', 'aggressive': True, 'use_tta': True},
    ]

    best_mode = None
    best_count = 0
    best_detections = []

    for mode in modes:
        print(f"Testing mode: {mode['name']}")
        print(f"  aggressive={mode['aggressive']}, use_tta={mode['use_tta']}")

        detections = detector.detect(
            img_rgb,
            media_type=None,
            aggressive=mode['aggressive'],
            use_tta=mode['use_tta'],
            apply_filters=True
        )

        summary = detector.get_detection_summary(detections)
        total = sum(summary.values())

        print(f"  Results:")
        print(f"    colony_single : {summary.get('colony_single', 0):4d}")
        print(f"    colony_merged : {summary.get('colony_merged', 0):4d}")
        print(f"    bubble        : {summary.get('bubble', 0):4d}")
        print(f"    dust_debris   : {summary.get('dust_debris', 0):4d}")
        print(f"    media_crack   : {summary.get('media_crack', 0):4d}")
        print(f"    TOTAL         : {total:4d}")

        if detections:
            confs = [d['confidence'] for d in detections]
            print(f"    Confidence: min={min(confs):.3f}, max={max(confs):.3f}, avg={np.mean(confs):.3f}")

        print()

        if total > best_count:
            best_count = total
            best_mode = mode['name']
            best_detections = detections

    print("=" * 70)
    print(f" BEST MODE: {best_mode} ({best_count} detections)")
    print("=" * 70)
    print()

    # Save visualization
    if best_detections:
        img_annotated = img_bgr.copy()

        for det in best_detections:
            bbox = det['bbox']
            x1, y1 = bbox['x'], bbox['y']
            x2, y2 = x1 + bbox['width'], y1 + bbox['height']

            color = det['color']
            conf = det['confidence']
            cls_name = det['class_name']

            # Draw box
            cv2.rectangle(img_annotated, (x1, y1), (x2, y2), color, 2)

            # Label
            label = f"{cls_name} {conf:.2f}"
            (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
            cv2.rectangle(img_annotated, (x1, y1-th-6), (x1+tw+4, y1), color, -1)
            cv2.putText(img_annotated, label, (x1+2, y1-3),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255,255,255), 1)

        # Save
        output_path = os.path.join(os.path.dirname(__file__), 'competition_optimized_result.jpg')
        cv2.imwrite(output_path, img_annotated)
        print(f"✓ Saved: {os.path.basename(output_path)}")

        # Save side-by-side
        img_orig_small = cv2.resize(img_bgr, (w//2, h//2))
        img_anno_small = cv2.resize(img_annotated, (w//2, h//2))
        comparison = np.hstack([img_orig_small, img_anno_small])

        comp_path = os.path.join(os.path.dirname(__file__), 'competition_optimized_comparison.jpg')
        cv2.imwrite(comp_path, comparison)
        print(f"✓ Saved: {os.path.basename(comp_path)}")
    else:
        print("✗ No detections to visualize")

    print()
    print("=" * 70)
    print(" KESIMPULAN DAN REKOMENDASI")
    print("=" * 70)
    print()

    if best_count == 0:
        print("MASALAH KRITIS: Model tidak mendeteksi apapun!")
        print()
        print("PENYEBAB UTAMA:")
        print("1. Gambar kompetisi SANGAT BERBEDA dari training data")
        print("2. Model di-train dengan dataset yang tidak representatif")
        print("3. Preprocessing gambar tidak sesuai")
        print()
        print("SOLUSI WAJIB:")
        print("1. RE-TRAIN model dengan data yang mirip gambar kompetisi")
        print("2. Tambahkan gambar kompetisi ke training dataset")
        print("3. Gunakan data augmentation yang lebih agresif")
        print("4. Cek preprocessing: brightness, contrast, color balance")
        print("5. Pertimbangkan fine-tuning dengan transfer learning")
    elif best_count < 10:
        print("AKURASI RENDAH: Deteksi sangat sedikit")
        print()
        print("REKOMENDASI:")
        print("1. Tambahkan gambar serupa ke training dataset")
        print("2. Turunkan threshold lebih lanjut (tapi hati-hati false positive)")
        print("3. Cek apakah gambar kompetisi memiliki preprocessing khusus")
        print("4. Gunakan ensemble model (train 3 model, voting)")
    else:
        print(f"AKURASI BAIK: {best_count} deteksi ditemukan")
        print()
        print("OPTIMASI LANJUTAN:")
        print("1. Fine-tune threshold per-class berdasarkan hasil")
        print("2. Tambahkan post-processing untuk remove false positives")
        print("3. Gunakan TTA untuk meningkatkan recall")
        print("4. Validasi manual untuk memastikan akurasi")

    print()

if __name__ == "__main__":
    main()
