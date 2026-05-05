#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
ANALISIS AKURASI UNTUK KOMPETISI
Menganalisis gambar kompetisi dan memberikan rekomendasi class yang wajib akurat
"""
import sys
import os
import cv2
import numpy as np

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.colony_detector import ColonyDetector, CLASS_COLORS_BGR

def main():
    img_path = os.path.join(os.path.dirname(__file__), 'casseforcompetetions.png')

    if not os.path.exists(img_path):
        print(f"ERROR: {img_path} tidak ditemukan!")
        return

    # Load image
    img_bgr = cv2.imread(img_path)
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    h, w = img_bgr.shape[:2]

    print("=" * 70)
    print(" ANALISIS AKURASI GAMBAR KOMPETISI - ColonyAI")
    print("=" * 70)
    print(f"File: casseforcompetetions.png")
    print(f"Resolusi: {w}x{h} pixels")
    print(f"Size: {os.path.getsize(img_path)/1024:.1f} KB")
    print()

    # Load model
    print("Loading model...")
    try:
        # Use absolute path for model
        model_path = os.path.join(os.path.dirname(__file__), 'models', 'colony_best.pt')
        detector = ColonyDetector(model_path=model_path)
        print(f"✓ Model loaded: {os.path.basename(detector.model_path)}")
    except Exception as e:
        print(f"✗ Error loading model: {e}")
        import traceback
        traceback.print_exc()
        return

    print()
    print("=" * 70)
    print(" TESTING BERBAGAI CONFIDENCE THRESHOLD")
    print("=" * 70)

    # Test multiple thresholds
    thresholds = [0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75]
    results_by_threshold = {}

    for conf_th in thresholds:
        detections = detector.detect(img_rgb, confidence_override=conf_th)
        summary = detector.get_detection_summary(detections)

        total = sum(summary.values())
        results_by_threshold[conf_th] = {
            'detections': detections,
            'summary': summary,
            'total': total
        }

        print(f"\nThreshold: {conf_th:.2f}")
        print(f"  colony_single : {summary.get('colony_single', 0):4d}")
        print(f"  colony_merged : {summary.get('colony_merged', 0):4d}")
        print(f"  bubble        : {summary.get('bubble', 0):4d}")
        print(f"  dust_debris   : {summary.get('dust_debris', 0):4d}")
        print(f"  media_crack   : {summary.get('media_crack', 0):4d}")
        print(f"  " + "─" * 30)
        print(f"  TOTAL         : {total:4d}")

        if detections:
            confs = [d['confidence'] for d in detections]
            print(f"  Conf range: {min(confs):.3f} - {max(confs):.3f} (avg: {np.mean(confs):.3f})")

            # Per-class confidence stats
            for cls_name in ['colony_single', 'colony_merged', 'bubble', 'dust_debris', 'media_crack']:
                cls_dets = [d for d in detections if d['class_name'] == cls_name]
                if cls_dets:
                    cls_confs = [d['confidence'] for d in cls_dets]
                    print(f"    {cls_name:14s}: avg={np.mean(cls_confs):.3f} min={min(cls_confs):.3f} max={max(cls_confs):.3f}")

    # Find optimal threshold
    best_th = max(results_by_threshold.keys(), key=lambda k: results_by_threshold[k]['total'])
    best_result = results_by_threshold[best_th]

    print()
    print("=" * 70)
    print(" REKOMENDASI UNTUK AKURASI MAKSIMAL")
    print("=" * 70)
    print()
    print(f"✓ Threshold optimal: {best_th:.2f}")
    print(f"✓ Total deteksi: {best_result['total']} objek")
    print()

    # Analyze per-class confidence distribution
    print("DISTRIBUSI CONFIDENCE PER CLASS:")
    print()

    all_detections = best_result['detections']
    class_stats = {}

    for cls_name in ['colony_single', 'colony_merged', 'bubble', 'dust_debris', 'media_crack']:
        cls_dets = [d for d in all_detections if d['class_name'] == cls_name]
        if cls_dets:
            confs = [d['confidence'] for d in cls_dets]
            class_stats[cls_name] = {
                'count': len(cls_dets),
                'avg': np.mean(confs),
                'min': min(confs),
                'max': max(confs),
                'std': np.std(confs)
            }

            stats = class_stats[cls_name]
            print(f"{cls_name:15s}: count={stats['count']:3d}  avg={stats['avg']:.3f}  "
                  f"min={stats['min']:.3f}  max={stats['max']:.3f}  std={stats['std']:.3f}")

    print()
    print("=" * 70)
    print(" STRATEGI PENINGKATAN AKURASI - IMPLEMENTASI WAJIB")
    print("=" * 70)
    print()

    print("1. THRESHOLD PER-CLASS (Prioritas Tertinggi)")
    print("   Gunakan threshold berbeda untuk setiap class:")
    print()

    # Recommend thresholds based on stats
    for cls_name in ['colony_single', 'colony_merged', 'bubble', 'dust_debris', 'media_crack']:
        if cls_name in class_stats:
            stats = class_stats[cls_name]
            # Recommend threshold at mean - 1 std dev
            recommended = max(0.25, stats['avg'] - stats['std'])
            print(f"   {cls_name:15s}: {recommended:.2f}  (avg={stats['avg']:.2f}, std={stats['std']:.2f})")
        else:
            print(f"   {cls_name:15s}: 0.35  (default, tidak ada deteksi)")

    print()
    print("2. IMAGE SIZE OPTIMIZATION")
    print(f"   - Gambar saat ini: {w}x{h}")
    print(f"   - Model size: {detector.img_size}px")
    print(f"   - Rekomendasi: Tingkatkan ke 640 atau 768px")
    print(f"   - Untuk gambar kompetisi: Gunakan resolusi penuh tanpa resize")
    print()

    print("3. IOU THRESHOLD TUNING")
    print(f"   - Saat ini: {detector.iou_threshold}")
    print(f"   - Rekomendasi: 0.35 (global)")
    print(f"   - Untuk colony_merged: 0.30 (lebih rendah karena overlap)")
    print()

    print("4. POST-PROCESSING FILTERS")
    print("   - Size filter: Buang deteksi <8px atau >400px")
    print("   - Aspect ratio filter: Buang deteksi dengan ratio >3:1")
    print("   - Edge filter: Boost confidence untuk deteksi di center plate")
    print("   - Duplicate removal: NMS per-class dengan IOU 0.3")
    print()

    print("5. MODEL IMPROVEMENTS")
    print("   - Gunakan YOLOv8m atau YOLOv8l (model lebih besar)")
    print("   - Train dengan class weights untuk balance dataset")
    print("   - Tambah augmentation: mosaic, mixup, copy-paste")
    print("   - Test-Time Augmentation (TTA): flip + multi-scale")
    print()

    # Save visualizations
    print("=" * 70)
    print(" MENYIMPAN VISUALISASI")
    print("=" * 70)
    print()

    # Save with best threshold
    img_annotated = img_bgr.copy()
    detections = best_result['detections']

    for det in detections:
        bbox = det['bbox']
        x1, y1 = bbox['x'], bbox['y']
        x2, y2 = x1 + bbox['width'], y1 + bbox['height']

        color = det['color']
        conf = det['confidence']
        cls_name = det['class_name']

        # Draw box
        cv2.rectangle(img_annotated, (x1, y1), (x2, y2), color, 2)

        # Label with confidence
        label = f"{cls_name} {conf:.2f}"
        (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
        cv2.rectangle(img_annotated, (x1, y1-th-6), (x1+tw+4, y1), color, -1)
        cv2.putText(img_annotated, label, (x1+2, y1-3),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255,255,255), 1)

    # Add stats overlay
    overlay = img_annotated.copy()
    cv2.rectangle(overlay, (10, 10), (400, 200), (0, 0, 0), -1)
    cv2.addWeighted(overlay, 0.7, img_annotated, 0.3, 0, img_annotated)

    y_pos = 35
    cv2.putText(img_annotated, f"Threshold: {best_th:.2f}", (20, y_pos),
               cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255,255,255), 2)
    y_pos += 25

    for cls_name, color in CLASS_COLORS_BGR.items():
        count = best_result['summary'].get(cls_name, 0)
        cv2.putText(img_annotated, f"{cls_name}: {count}", (20, y_pos),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
        y_pos += 22

    output_path = os.path.join(os.path.dirname(__file__), 'competition_result_annotated.jpg')
    cv2.imwrite(output_path, img_annotated)
    print(f"✓ Hasil annotated: {os.path.basename(output_path)}")

    # Save side-by-side comparison
    img_original_resized = cv2.resize(img_bgr, (img_annotated.shape[1]//2, img_annotated.shape[0]//2))
    img_annotated_resized = cv2.resize(img_annotated, (img_annotated.shape[1]//2, img_annotated.shape[0]//2))
    comparison = np.hstack([img_original_resized, img_annotated_resized])

    comparison_path = os.path.join(os.path.dirname(__file__), 'competition_comparison.jpg')
    cv2.imwrite(comparison_path, comparison)
    print(f"✓ Comparison: {os.path.basename(comparison_path)}")

    print()
    print("=" * 70)
    print(" SELESAI")
    print("=" * 70)
    print()
    print("Langkah selanjutnya:")
    print("1. Review hasil visualisasi")
    print("2. Implementasikan threshold per-class")
    print("3. Tingkatkan image size ke 640px")
    print("4. Tambahkan post-processing filters")
    print("5. Re-train model dengan improvements")
    print()

if __name__ == "__main__":
    main()
