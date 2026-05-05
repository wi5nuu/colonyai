#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
CARI DATASET ROBOFLOW YANG SUDAH DIDOWNLOAD
"""
import os
from pathlib import Path

def find_datasets():
    """Cari semua dataset Roboflow yang ada"""

    print("=" * 70)
    print(" MENCARI DATASET ROBOFLOW")
    print("=" * 70)
    print()

    # Possible locations
    search_paths = [
        Path('D:/lombapuai'),
        Path('D:/'),
        Path('C:/Users'),
        Path.home() / 'Downloads',
        Path.home() / 'Desktop',
    ]

    found_datasets = []

    print("Mencari di:")
    for base_path in search_paths:
        if not base_path.exists():
            continue

        print(f"  Scanning: {base_path}")

        # Cari file data.yaml (indikator dataset YOLO)
        for root, dirs, files in os.walk(base_path, topdown=True):
            # Skip hidden folders dan folder besar
            dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ['node_modules', 'venv', '.venv', '__pycache__']]

            if 'data.yaml' in files:
                dataset_path = Path(root)

                # Cek apakah ada folder train/valid/test
                has_train = (dataset_path / 'train').exists()
                has_valid = (dataset_path / 'valid').exists() or (dataset_path / 'val').exists()

                if has_train and has_valid:
                    found_datasets.append(dataset_path)
                    print(f"    ✓ Found: {dataset_path}")

            # Limit depth
            if len(Path(root).parts) - len(base_path.parts) > 5:
                dirs.clear()

    print()
    print("=" * 70)
    print(f" DITEMUKAN {len(found_datasets)} DATASET")
    print("=" * 70)
    print()

    if found_datasets:
        for i, dataset_path in enumerate(found_datasets, 1):
            print(f"{i}. {dataset_path}")
        print()
        print("Untuk cek class names, jalankan:")
        print(f"  python check_roboflow_classes.py")
        print()
        print("Atau manual cek file data.yaml di folder dataset")
    else:
        print("❌ Tidak ada dataset ditemukan!")
        print()
        print("KEMUNGKINAN:")
        print("1. Dataset belum didownload")
        print("2. Dataset di-extract ke lokasi lain")
        print("3. Format dataset bukan YOLOv8")
        print()
        print("SOLUSI:")
        print("1. Download dataset dari Roboflow")
        print("2. Extract ZIP ke folder: D:/lombapuai/ml-training/datasets/roboflow/")
        print("3. Jalankan script ini lagi")

    return found_datasets

if __name__ == "__main__":
    find_datasets()
