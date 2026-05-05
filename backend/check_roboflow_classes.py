#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
CEK CLASS NAMES DI DATASET ROBOFLOW YANG SUDAH DIDOWNLOAD
Validasi apakah dataset punya artifact classes yang dibutuhkan
"""
import os
import yaml
from pathlib import Path
from collections import Counter

def check_dataset_classes(dataset_path):
    """
    Cek class names dan distribusi di dataset Roboflow
    """
    dataset_path = Path(dataset_path)

    print("=" * 70)
    print(" CEK CLASS NAMES DATASET ROBOFLOW")
    print("=" * 70)
    print()

    # Cek data.yaml
    yaml_path = dataset_path / 'data.yaml'

    if not yaml_path.exists():
        print(f"❌ File data.yaml tidak ditemukan di: {dataset_path}")
        print()
        print("Pastikan path dataset benar. Struktur harus seperti ini:")
        print("  dataset_folder/")
        print("    ├── data.yaml")
        print("    ├── train/")
        print("    ├── valid/")
        print("    └── test/")
        return None

    # Read data.yaml
    with open(yaml_path, 'r') as f:
        data = yaml.safe_load(f)

    class_names = data.get('names', [])
    num_classes = data.get('nc', len(class_names))

    print(f"Dataset: {dataset_path.name}")
    print(f"Path: {dataset_path}")
    print()
    print(f"Jumlah Classes: {num_classes}")
    print()
    print("Class Names:")
    for i, cls_name in enumerate(class_names):
        print(f"  {i}: {cls_name}")

    print()
    print("=" * 70)
    print(" ANALISIS CLASS UNTUK COLONYAI")
    print("=" * 70)
    print()

    # Mapping ke ColonyAI classes
    colonyai_mapping = {
        'colony_single': [],
        'colony_merged': [],
        'bubble': [],
        'dust_debris': [],
        'media_crack': [],
    }

    # Cek setiap class
    for cls_name in class_names:
        cls_lower = cls_name.lower()

        # Colony detection
        if any(x in cls_lower for x in ['bacil', 'coli', 'aureus', 'aeruginosa', 'subtilis', 'bacteria', 'colony']):
            if 'merged' in cls_lower or 'cluster' in cls_lower or 'group' in cls_lower:
                colonyai_mapping['colony_merged'].append(cls_name)
            else:
                colonyai_mapping['colony_single'].append(cls_name)

        # Bubble detection
        elif any(x in cls_lower for x in ['bubble', 'air', 'green', 'purple']):
            colonyai_mapping['bubble'].append(cls_name)

        # Dust/Debris detection
        elif any(x in cls_lower for x in ['contamination', 'contaminated', 'dust', 'debris', 'artifact', 'dirt']):
            colonyai_mapping['dust_debris'].append(cls_name)

        # Media crack detection
        elif any(x in cls_lower for x in ['defect', 'crack', 'damage', 'broken']):
            colonyai_mapping['media_crack'].append(cls_name)

        # Yeast/Fungus (bisa jadi merged)
        elif any(x in cls_lower for x in ['albicans', 'yeast', 'fungus']):
            colonyai_mapping['colony_merged'].append(cls_name)

    # Display mapping
    print("Mapping ke ColonyAI 5 Classes:")
    print()

    has_all_classes = True

    for colonyai_class, roboflow_classes in colonyai_mapping.items():
        marker = "✅" if roboflow_classes else "❌"
        print(f"{marker} {colonyai_class:15s}: ", end="")

        if roboflow_classes:
            print(f"{len(roboflow_classes)} class(es) → {', '.join(roboflow_classes)}")
        else:
            print("TIDAK ADA")
            if colonyai_class in ['bubble', 'dust_debris', 'media_crack']:
                has_all_classes = False

    print()
    print("=" * 70)
    print(" DISTRIBUSI DATA")
    print("=" * 70)
    print()

    # Count detections per class
    class_counts = Counter()

    for split in ['train', 'valid', 'test']:
        label_dir = dataset_path / split / 'labels'

        if not label_dir.exists():
            continue

        for label_file in label_dir.glob('*.txt'):
            with open(label_file, 'r') as f:
                for line in f:
                    parts = line.strip().split()
                    if parts:
                        class_id = int(parts[0])
                        if class_id < len(class_names):
                            class_counts[class_names[class_id]] += 1

    print("Jumlah deteksi per class:")
    for cls_name in class_names:
        count = class_counts.get(cls_name, 0)
        print(f"  {cls_name:30s}: {count:6d} deteksi")

    print()
    print("=" * 70)
    print(" KESIMPULAN")
    print("=" * 70)
    print()

    if has_all_classes:
        print("✅ DATASET INI COCOK!")
        print()
        print("Dataset ini memiliki class untuk:")
        print("  ✅ colony_single")
        print("  ✅ colony_merged")
        print("  ✅ bubble")
        print("  ✅ dust_debris")
        print("  ✅ media_crack")
        print()
        print("NEXT STEPS:")
        print("1. Jalankan merge script:")
        print("   python merge_roboflow_datasets.py")
        print()
        print("2. Training model:")
        print("   python train_with_artifacts.py")
        print()
    else:
        print("⚠️  DATASET INI KURANG LENGKAP!")
        print()
        print("Class yang TIDAK ADA:")
        for colonyai_class, roboflow_classes in colonyai_mapping.items():
            if not roboflow_classes and colonyai_class in ['bubble', 'dust_debris', 'media_crack']:
                print(f"  ❌ {colonyai_class}")
        print()
        print("REKOMENDASI:")
        print("1. Cari dataset tambahan untuk class yang kurang")
        print("2. Atau annotate manual gambar untuk class tersebut")
        print("3. Atau gunakan dataset ini untuk colony saja (tanpa artifact)")
        print()

    return colonyai_mapping

def main():
    print("=" * 70)
    print(" ROBOFLOW DATASET CLASS CHECKER")
    print("=" * 70)
    print()

    # Cari dataset yang sudah didownload
    possible_paths = [
        'D:/lombapuai/ml-training/datasets/roboflow/menlo_petri',
        '../ml-training/datasets/roboflow/menlo_petri',
        'ml-training/datasets/roboflow/menlo_petri',
    ]

    dataset_path = None
    for path in possible_paths:
        if Path(path).exists():
            dataset_path = path
            break

    if dataset_path:
        print(f"✓ Dataset ditemukan: {dataset_path}")
        print()
        check_dataset_classes(dataset_path)
    else:
        print("❌ Dataset tidak ditemukan!")
        print()
        print("Masukkan path dataset Roboflow yang sudah didownload:")
        print("Contoh: D:/lombapuai/ml-training/datasets/roboflow/menlo_petri")
        print()

        # Manual input
        user_path = input("Path dataset: ").strip()
        if user_path and Path(user_path).exists():
            check_dataset_classes(user_path)
        else:
            print(f"❌ Path tidak valid: {user_path}")

if __name__ == "__main__":
    main()
