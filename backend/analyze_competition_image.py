#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Analisis gambar kompetisi untuk menentukan class yang wajib akurat
"""
import sys
import os
import cv2
import numpy as np

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.services.colony_detector import ColonyDetector

def analyze_competition_image():
    img_path = 'casseforcompetetions.png'

    if not os.path.exists(img_path):
        print(f"ERROR: File {img_path} tidak ditemukan!")
        return

    # Load image
    img = cv2.imread(img_path)
    if img is None:
        print("ERROR: Tidak bisa membaca gambar!")
        return

    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    h, w = img.shape[:2]

    print("=" * 60)
    print("ANALISIS GAMBAR KOMPETISI - casseforcompetetions.png")
    print("=" * 60)
    print(f"Resolusi gambar: {w}x{h} pixels")
    print(f"File size: {os.path.getsize(img_path) / 1024:.1f} KB")
    print()

    # Initialize detector
    print("Loading ColonyAI model...")
    detector = ColonyDetector()
    print(f"Model loaded: {detector.model_path}")
    print()

    # Test dengan berbagai confidence threshold
    thresholds = [0.20, 0.30, 0.40, 0.50, 0.60, 0.70]

    print("=" * 60)
    print("HASIL DETEKSI DENGAN BERBAGAI THRESHOLD")
    print("=" * 60)

    best_threshold = None
    best_total = 0

    for conf in thresholds:
        detections = detector.detect(img_rgb, confidence_override=conf)
        summary = detector.get_detection_summary(detections)

        total = sum(summary.values())

        print(f"\n--- Confidence Threshold: {conf:.2f} ---")
        print(f"  colony_single : {summary.get('colony_single', 0):4d}")
        print(f"  colony_merged : {summary.get('colony_merged', 0):4d}")
        print(f"  bubble        : {summary.get('bubble', 0):4d}")
        print(f"  dust_debris   : {summary.get('dust_debris', 0):4d}")
        print(f"  media_crack   : {summary.get('media_crack', 0):4d}")
        print(f"  {'─' * 25}")
        print(f"  TOTAL         : {total:4d}")

        if detections:
            confs = [d['confidence'] for d in detections]
            print(f"  Confidence range: {min(confs):.3f} - {max(confs):.3f}")
            print(f"  Average conf: {np.mean(confs):.3f}")

            # Breakdown per class
            for cls_name in ['colony_single', 'colony_merged', 'bubble', 'dust_debris', 'media_crack']:
                cls_dets = [d for d in detections if d['class_name'] == cls_name]
                if cls_dets:
                    cls_confs = [d['confidence'] for d in cls_dets]
                    print(f"    {cls_name:15s}: avg={np.mean(cls_confs):.3f}, min={min(cls_confs):.3f}, max={max(cls_confs):.3f}")

        if total > best_total:
            best_total = total
            best_threshold = conf

    print("\n" + "=" * 60)
    print("REKOMENDASI UNTUK AKURASI MAKSIMAL")
    print("=" * 60)
    print(f"✓ Threshold optimal: {best_threshold:.2f} (deteksi {best_total} objek)")
    print()
    print("STRATEGI PENINGKATAN AKURASI:")
    print()
    print("1. THRESHOLD PER-CLASS (Implementasi Prioritas):")
    print("   - colony_single: 0.55-0.65 (high confidence)")
    print("   - colony_merged: 0.45-0.55 (medium, karena overlap)")
    print("   - bubble: 0.40-0.50 (lower, objek kecil)")
    print("   - dust_debris: 0.35-0.45 (lowest, sangat kecil)")
    print("   - media_crack: 0.40-0.50 (medium)")
    print()
    print("2. IMAGE SIZE:")
    print("   - Tingkatkan dari 512 → 640 atau 768")
    print("   - Untuk gambar kompetisi, gunakan resolusi penuh")
    print()
    print("3. IOU THRESHOLD:")
    print("   - Turunkan dari 0.45 → 0.35")
    print("   - Untuk colony_merged, gunakan IOU 0.30")
    print()
    print("4. POST-PROCESSING:")
    print("   - Filter size: buang deteksi <5px atau >300px")
    print("   - Confidence boosting untuk deteksi di center plate")
    print("   - NMS per-class (bukan global)")
    print()

    # Save annotated result
    print("=" * 60)
    print("MENYIMPAN HASIL VISUALISASI")
    print("=" * 60)

    # Use best threshold
    detections = detector.detect(img_rgb, confidence_override=best_threshold)

    # Draw annotations
    img_annotated = img.copy()
    for det in detections:
        bbox = det['bbox']
        x1 = bbox['x']
        y1 = bbox['y']
        x2 = x1 + bbox['width']
        y2 = y1 + bbox['height']

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

    output_path = 'competition_analysis_result.jpg'
    cv2.imwrite(output_path, img_annotated)
    print(f"✓ Hasil disimpan: {output_path}")
    print()

if __name__ == "__main__":
    analyze_competition_image()
