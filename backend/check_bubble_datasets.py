#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
CEK DAN VALIDASI DATASET BUBBLE YANG SUDAH DIDOWNLOAD
"""
import os
import yaml
from pathlib import Path
from collections import Counter

def check_dataset(dataset_path):
    dataset_path = Path(dataset_path)

    if not dataset_path.exists():
        print(f"  ❌ Path tidak ditemukan: {dataset_path}")
        return None

    # Cari data.yaml
    yaml_path = dataset_path / 'data.yaml'
    if not yaml_path.exists():
        # Cari di subfolder
        yaml_files = list(dataset_path.rglob('data.yaml'))
        if yaml_files:
            yaml_path = yaml_files[0]
            dataset_path = yaml_path.parent
        else:
            print(f"  ❌ data.yaml tidak ditemukan di: {dataset_path}")
            return None

    with open(yaml_path, 'r') as f:
        data = yaml.safe_load(f)

    class_names = data.get('names', [])
    nc = data.get('nc', len(class_names))

    # Count images dan labels
    counts = {}
    for split in ['train', 'valid', 'val', 'test']:
        img_dir = dataset_path / split / 'images'
        lbl_dir = dataset_path / split / 'labels'
        if img_dir.exists():
            imgs = list(img_dir.glob('*.*'))
            lbls = list(lbl_dir.glob('*.txt')) if lbl_dir.exists() else []
            counts[split] = {'images': len(imgs), 'labels': len(lbls)}

    # Count detections per class
    class_counts = Counter()
    for split in ['train', 'valid', 'val', 'test']:
        lbl_dir = dataset_path / split / 'labels'
        if lbl_dir.exists():
            for lbl_file in lbl_dir.glob('*.txt'):
                with open(lbl_file) as f:
                    for line in f:
                        parts = line.strip().split()
                        if parts:
                            cid = int(parts[0])
                            if cid < len(class_names):
                                class_counts[class_names[cid]] += 1

    print(f"  ✅ Path: {dataset_path}")
    print(f"  Classes ({nc}): {class_names}")
    print(f"  Splits: {counts}")
    print(f"  Detections per class:")
    for cls, cnt in class_counts.most_common():
        print(f"    {cls:30s}: {cnt}")

    return {'path': str(dataset_path), 'classes': class_names, 'counts': counts}

def find_in_downloads():
    """Cari dataset di folder Downloads"""
    downloads = Path.home() / 'Downloads'

    print(f"Scanning: {downloads}")
    print()

    found = []
    for item in downloads.iterdir():
        if item.is_dir() and (item / 'data.yaml').exists():
            found.append(item)
        elif item.suffix == '.zip' and 'bubble' in item.name.lower():
            print(f"  📦 ZIP ditemukan (belum extract): {item.name}")

    return found

def main():
    print("=" * 70)
    print(" CEK DATASET BUBBLE DI FOLDER DOWNLOADS")
    print("=" * 70)
    print()

    # Cari di Downloads
    downloads = Path.home() / 'Downloads'
    print(f"Folder Downloads: {downloads}")
    print()

    # Cari semua folder dengan data.yaml
    print("Mencari dataset (folder dengan data.yaml)...")
    print()

    found_datasets = []

    # Direct subfolders
    for item in downloads.iterdir():
        if item.is_dir():
            yaml_path = item / 'data.yaml'
            if yaml_path.exists():
                found_datasets.append(item)
                print(f"✅ Dataset ditemukan: {item.name}")
            else:
                # Check one level deeper
                for sub in item.iterdir():
                    if sub.is_dir() and (sub / 'data.yaml').exists():
                        found_datasets.append(sub)
                        print(f"✅ Dataset ditemukan: {item.name}/{sub.name}")

    # Cari ZIP yang belum di-extract
    print()
    print("ZIP files (belum di-extract):")
    for item in downloads.iterdir():
        if item.suffix == '.zip':
            print(f"  📦 {item.name}")

    print()

    if not found_datasets:
        print("❌ Tidak ada dataset ditemukan di Downloads!")
        print()
        print("KEMUNGKINAN:")
        print("1. Dataset masih dalam format ZIP - perlu di-extract dulu")
        print("2. Dataset di-extract ke subfolder yang lebih dalam")
        print()
        print("SOLUSI:")
        print("1. Buka Windows Explorer")
        print("2. Buka folder Downloads")
        print("3. Klik kanan file ZIP → Extract Here")
        print("4. Jalankan script ini lagi")
        return

    print("=" * 70)
    print(f" DETAIL {len(found_datasets)} DATASET")
    print("=" * 70)
    print()

    results = []
    for i, ds_path in enumerate(found_datasets, 1):
        print(f"Dataset {i}: {ds_path.name}")
        result = check_dataset(ds_path)
        if result:
            results.append(result)
        print()

    # Analisis untuk bubble
    print("=" * 70)
    print(" ANALISIS UNTUK BUBBLE DETECTION")
    print("=" * 70)
    print()

    bubble_keywords = ['bubble', 'big_bubble', 'small_bubble', 'impurity',
                       'large_bubble', 'multiple_bubble', 'Bubble']

    for result in results:
        classes = result['classes']
        bubble_classes = [c for c in classes if any(k.lower() in c.lower() for k in bubble_keywords)]

        if bubble_classes:
            print(f"✅ {Path(result['path']).name}")
            print(f"   Bubble classes: {bubble_classes}")
            print(f"   → Cocok untuk bubble detection!")
        else:
            print(f"⚠️  {Path(result['path']).name}")
            print(f"   Classes: {classes}")
            print(f"   → Tidak ada bubble class yang jelas")
        print()

    # Rekomendasi path untuk merge
    if results:
        print("=" * 70)
        print(" NEXT STEPS")
        print("=" * 70)
        print()
        print("Copy path dataset ke merge script:")
        for result in results:
            print(f"  '{result['path']}',")
        print()
        print("Kemudian jalankan:")
        print("  python merge_to_2class.py")

if __name__ == "__main__":
    main()
