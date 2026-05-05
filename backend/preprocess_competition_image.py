#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
PREPROCESSING GAMBAR KOMPETISI
Quick fix untuk meningkatkan deteksi tanpa re-training
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import cv2
import numpy as np
from app.services.colony_detector_optimized import ColonyDetectorOptimized

def preprocess_v1_histogram_eq(img):
    """Histogram equalization untuk normalize brightness"""
    img_yuv = cv2.cvtColor(img, cv2.COLOR_RGB2YUV)
    img_yuv[:,:,0] = cv2.equalizeHist(img_yuv[:,:,0])
    return cv2.cvtColor(img_yuv, cv2.COLOR_YUV2RGB)

def preprocess_v2_clahe(img):
    """CLAHE (Contrast Limited Adaptive Histogram Equalization)"""
    img_lab = cv2.cvtColor(img, cv2.COLOR_RGB2LAB)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    img_lab[:,:,0] = clahe.apply(img_lab[:,:,0])
    return cv2.cvtColor(img_lab, cv2.COLOR_LAB2RGB)

def preprocess_v3_contrast_brightness(img):
    """Adjust contrast and brightness"""
    alpha = 1.3  # Contrast
    beta = 15    # Brightness
    return cv2.convertScaleAbs(img, alpha=alpha, beta=beta)

def preprocess_v4_sharpen(img):
    """Sharpen image"""
    kernel = np.array([[-1,-1,-1],
                       [-1, 9,-1],
                       [-1,-1,-1]])
    return cv2.filter2D(img, -1, kernel)

def preprocess_v5_denoise(img):
    """Denoise dengan bilateral filter"""
    return cv2.bilateralFilter(img, 9, 75, 75)

def preprocess_v6_combined(img):
    """Kombinasi preprocessing"""
    # 1. Denoise
    img = cv2.bilateralFilter(img, 5, 50, 50)

    # 2. CLAHE
    img_lab = cv2.cvtColor(img, cv2.COLOR_RGB2LAB)
    clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8,8))
    img_lab[:,:,0] = clahe.apply(img_lab[:,:,0])
    img = cv2.cvtColor(img_lab, cv2.COLOR_LAB2RGB)

    # 3. Slight sharpen
    kernel = np.array([[0,-1,0],
                       [-1,5,-1],
                       [0,-1,0]])
    img = cv2.filter2D(img, -1, kernel)

    # 4. Contrast boost
    img = cv2.convertScaleAbs(img, alpha=1.2, beta=10)

    return img

def main():
    img_path = os.path.join(os.path.dirname(__file__), 'casseforcompetetions.png')

    print("=" * 70)
    print(" PREPROCESSING GAMBAR KOMPETISI - QUICK FIX")
    print("=" * 70)
    print()

    # Load image
    img_bgr = cv2.imread(img_path)
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    h, w = img_bgr.shape[:2]

    print(f"Image: {os.path.basename(img_path)}")
    print(f"Size: {w}x{h}")
    print()

    # Load detector
    print("Loading detector...")
    model_path = os.path.join(os.path.dirname(__file__), 'models', 'colony_best.pt')
    detector = ColonyDetectorOptimized(model_path=model_path)
    print()

    # Test berbagai preprocessing
    preprocessors = [
        ('Original (No Preprocessing)', lambda x: x),
        ('Histogram Equalization', preprocess_v1_histogram_eq),
        ('CLAHE', preprocess_v2_clahe),
        ('Contrast + Brightness', preprocess_v3_contrast_brightness),
        ('Sharpen', preprocess_v4_sharpen),
        ('Denoise', preprocess_v5_denoise),
        ('Combined (Best)', preprocess_v6_combined),
    ]

    results = []

    for name, preprocess_func in preprocessors:
        print(f"Testing: {name}")

        # Preprocess
        img_processed = preprocess_func(img_rgb.copy())

        # Detect dengan aggressive mode
        detections = detector.detect(
            img_processed,
            aggressive=True,
            use_tta=False,
            apply_filters=True
        )

        summary = detector.get_detection_summary(detections)
        total = sum(summary.values())

        print(f"  colony_single : {summary.get('colony_single', 0):4d}")
        print(f"  colony_merged : {summary.get('colony_merged', 0):4d}")
        print(f"  bubble        : {summary.get('bubble', 0):4d}")
        print(f"  dust_debris   : {summary.get('dust_debris', 0):4d}")
        print(f"  media_crack   : {summary.get('media_crack', 0):4d}")
        print(f"  TOTAL         : {total:4d}")

        if detections:
            confs = [d['confidence'] for d in detections]
            print(f"  Confidence: min={min(confs):.3f}, max={max(confs):.3f}, avg={np.mean(confs):.3f}")

        print()

        results.append({
            'name': name,
            'total': total,
            'detections': detections,
            'img_processed': img_processed
        })

    # Find best
    best = max(results, key=lambda x: x['total'])

    print("=" * 70)
    print(f" BEST PREPROCESSING: {best['name']}")
    print(f" Total detections: {best['total']}")
    print("=" * 70)
    print()

    # Save best result
    if best['total'] > 0:
        img_processed_bgr = cv2.cvtColor(best['img_processed'], cv2.COLOR_RGB2BGR)

        # Annotate
        img_annotated = img_processed_bgr.copy()
        for det in best['detections']:
            bbox = det['bbox']
            x1, y1 = bbox['x'], bbox['y']
            x2, y2 = x1 + bbox['width'], y1 + bbox['height']

            color = det['color']
            conf = det['confidence']
            cls_name = det['class_name']

            cv2.rectangle(img_annotated, (x1, y1), (x2, y2), color, 2)

            label = f"{cls_name} {conf:.2f}"
            (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
            cv2.rectangle(img_annotated, (x1, y1-th-6), (x1+tw+4, y1), color, -1)
            cv2.putText(img_annotated, label, (x1+2, y1-3),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255,255,255), 1)

        # Save
        output_path = os.path.join(os.path.dirname(__file__), 'competition_preprocessed_result.jpg')
        cv2.imwrite(output_path, img_annotated)
        print(f"✓ Saved annotated: {os.path.basename(output_path)}")

        # Save comparison: original vs preprocessed vs annotated
        img_orig_small = cv2.resize(img_bgr, (w//3, h//3))
        img_proc_small = cv2.resize(img_processed_bgr, (w//3, h//3))
        img_anno_small = cv2.resize(img_annotated, (w//3, h//3))

        comparison = np.hstack([img_orig_small, img_proc_small, img_anno_small])

        # Add labels
        cv2.putText(comparison, 'Original', (10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255,255,255), 2)
        cv2.putText(comparison, best['name'], (w//3 + 10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255,255,255), 2)
        cv2.putText(comparison, f'Detected: {best["total"]}', (2*w//3 + 10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255,255,255), 2)

        comp_path = os.path.join(os.path.dirname(__file__), 'competition_preprocessing_comparison.jpg')
        cv2.imwrite(comp_path, comparison)
        print(f"✓ Saved comparison: {os.path.basename(comp_path)}")

        print()
        print("REKOMENDASI:")
        print(f"Gunakan preprocessing: {best['name']}")
        print(f"Implementasi di production untuk gambar serupa")
    else:
        print("✗ Tidak ada preprocessing yang berhasil")
        print()
        print("SOLUSI WAJIB:")
        print("1. RE-TRAIN model dengan gambar kompetisi")
        print("2. Tambahkan gambar serupa ke training dataset")
        print("3. Cek apakah gambar kompetisi memiliki format khusus")

    print()

if __name__ == "__main__":
    main()
