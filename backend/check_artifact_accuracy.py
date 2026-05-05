#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
CEK AKURASI CLASS ARTIFACT (bubble, dust_debris, media_crack)
Apakah perlu cari data tambahan di Roboflow?
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import cv2
import numpy as np
from ultralytics import YOLO

def main():
    model_path = os.path.join(os.path.dirname(__file__), 'models', 'colony_best.pt')

    print("=" * 70)
    print(" CEK AKURASI CLASS ARTIFACT")
    print(" (bubble, dust_debris, media_crack)")
    print("=" * 70)
    print()

    # Load model
    model = YOLO(model_path)
    print(f"✓ Model loaded: {os.path.basename(model_path)}")
    print(f"✓ Classes: {model.names}")
    print()

    # Test pada gambar yang ada
    test_images = [
        'imagetest/sample_macconkey_agar.png',
        'imagetest/sample_pca_agar.png',
    ]

    print("=" * 70)
    print(" TEST DETEKSI ARTIFACT PADA GAMBAR EXISTING")
    print("=" * 70)
    print()

    artifact_classes = ['bubble', 'dust_debris', 'media_crack']
    total_artifacts = {cls: 0 for cls in artifact_classes}
    total_colonies = 0

    for img_rel in test_images:
        img_path = os.path.join(os.path.dirname(__file__), img_rel)
        if not os.path.exists(img_path):
            continue

        print(f"Testing: {os.path.basename(img_path)}")

        img = cv2.imread(img_path)
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        # Detect dengan threshold rendah untuk artifact
        results = model(img_rgb, conf=0.25, iou=0.45, imgsz=512, verbose=False)
        result = results[0]

        if result.boxes is not None and len(result.boxes) > 0:
            boxes = result.boxes
            class_ids = boxes.cls.cpu().numpy().astype(int)
            confidences = boxes.conf.cpu().numpy()

            # Count per class
            class_counts = {}
            for cls_id, conf in zip(class_ids, confidences):
                cls_name = model.names.get(cls_id, f'class_{cls_id}')
                if cls_name not in class_counts:
                    class_counts[cls_name] = {'count': 0, 'confs': []}
                class_counts[cls_name]['count'] += 1
                class_counts[cls_name]['confs'].append(conf)

            # Display
            print(f"  Total detections: {len(boxes)}")

            for cls_name in ['colony_single', 'colony_merged', 'bubble', 'dust_debris', 'media_crack']:
                if cls_name in class_counts:
                    data = class_counts[cls_name]
                    count = data['count']
                    confs = data['confs']
                    avg_conf = np.mean(confs)
                    min_conf = np.min(confs)
                    max_conf = np.max(confs)

                    marker = "🔴" if cls_name in artifact_classes else "🟢"
                    print(f"  {marker} {cls_name:15s}: {count:3d} deteksi | "
                          f"conf avg={avg_conf:.3f} min={min_conf:.3f} max={max_conf:.3f}")

                    if cls_name in artifact_classes:
                        total_artifacts[cls_name] += count
                    else:
                        total_colonies += count
                else:
                    marker = "🔴" if cls_name in artifact_classes else "🟢"
                    print(f"  {marker} {cls_name:15s}: {0:3d} deteksi | TIDAK ADA")

        print()

    print("=" * 70)
    print(" SUMMARY ARTIFACT DETECTION")
    print("=" * 70)
    print()

    print("Total deteksi per class:")
    print(f"  🟢 Colonies (colony_single + colony_merged): {total_colonies}")
    for cls_name in artifact_classes:
        count = total_artifacts[cls_name]
        print(f"  🔴 {cls_name:15s}: {count}")

    print()

    # Analisis
    total_artifact_count = sum(total_artifacts.values())

    print("=" * 70)
    print(" ANALISIS & REKOMENDASI")
    print("=" * 70)
    print()

    if total_artifact_count == 0:
        print("⚠️  MASALAH KRITIS: TIDAK ADA ARTIFACT TERDETEKSI!")
        print()
        print("PENYEBAB:")
        print("1. Model tidak di-train dengan artifact class")
        print("2. Gambar test tidak memiliki artifact")
        print("3. Threshold terlalu tinggi untuk artifact")
        print()
        print("✅ SOLUSI WAJIB:")
        print("1. CARI DATA ARTIFACT DI ROBOFLOW (WAJIB!)")
        print("2. Cari dataset dengan keyword:")
        print("   - 'bacterial colony bubble'")
        print("   - 'agar plate artifacts'")
        print("   - 'petri dish contamination'")
        print("   - 'colony counting artifacts'")
        print("3. Minimal 200-300 gambar per artifact class")
        print("4. Re-train atau fine-tune model")
        print()

    elif total_artifact_count < 10:
        print("⚠️  AKURASI ARTIFACT RENDAH")
        print()
        print(f"Total artifact terdeteksi: {total_artifact_count}")
        print()
        print("✅ REKOMENDASI:")
        print("1. TAMBAH DATA ARTIFACT (Sangat Disarankan)")
        print("2. Cari di Roboflow Universe:")
        print("   - Search: 'bacterial colony artifacts'")
        print("   - Filter: YOLOv8 format")
        print("   - Download 100-200 gambar per class")
        print("3. Gabungkan dengan dataset existing")
        print("4. Fine-tune model dengan focus pada artifact")
        print()

    else:
        print("✅ AKURASI ARTIFACT CUKUP BAIK")
        print()
        print(f"Total artifact terdeteksi: {total_artifact_count}")
        print()

        # Check individual class
        need_more_data = []
        for cls_name, count in total_artifacts.items():
            if count < 5:
                need_more_data.append(cls_name)

        if need_more_data:
            print("⚠️  Class yang perlu data tambahan:")
            for cls_name in need_more_data:
                print(f"   - {cls_name}: hanya {total_artifacts[cls_name]} deteksi")
            print()
            print("✅ REKOMENDASI:")
            print(f"1. Cari data tambahan untuk: {', '.join(need_more_data)}")
            print("2. Minimal 50-100 gambar per class")
            print("3. Fine-tune model")
        else:
            print("✅ Semua artifact class terdeteksi dengan baik")
            print()
            print("OPTIMASI LANJUTAN:")
            print("1. Turunkan threshold untuk artifact (0.35-0.40)")
            print("2. Tambah data augmentation")
            print("3. Gunakan class weights saat training")

    print()
    print("=" * 70)
    print(" CARA CARI DATA DI ROBOFLOW")
    print("=" * 70)
    print()
    print("1. Buka: https://universe.roboflow.com/")
    print("2. Search keyword:")
    print("   - 'bacterial colony'")
    print("   - 'petri dish'")
    print("   - 'agar plate'")
    print("   - 'colony counting'")
    print("3. Filter:")
    print("   - Format: YOLOv8")
    print("   - License: Public Domain atau CC BY")
    print("4. Download dataset yang punya artifact class")
    print("5. Gabungkan dengan dataset Anda")
    print()
    print("DATASET REKOMENDASI:")
    print("- 'AGAR Dataset' (Macquarie University)")
    print("- 'Bacterial Colony Detection'")
    print("- 'Petri Dish Colony Counter'")
    print()

if __name__ == "__main__":
    main()
