#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
MERGE SEMUA DATASET KE 5 CLASS COLONYAI + TRAINING
"""
import os
import shutil
import yaml
from pathlib import Path
from collections import Counter
import random

# ============================================================
# CLASS MAPPING: Roboflow → ColonyAI 5 Class
# ============================================================
CLASS_MAPPING = {
    # BUBBLE (class 2)
    'bubble': 'bubble',
    'Bubble': 'bubble',
    'big_bubble': 'bubble',
    'small_bubbles': 'bubble',
    'multiple_small_bubbles': 'bubble',
    'large_bubble_cluster': 'bubble',
    'impurity': 'dust_debris',   # impurity → dust_debris

    # DUST/DEBRIS (class 3)
    'Contamination': 'dust_debris',
    'contamination': 'dust_debris',

    # MEDIA CRACK (class 4)
    'Defect': 'media_crack',
    'defect': 'media_crack',
    'crack': 'media_crack',
    'Crack': 'media_crack',
    'cracks': 'media_crack',

    # VALID COLONY (class 0 & 1)
    'CFU': 'colony_single',
    'circles': 'colony_single',
    'B-subtilis': 'colony_single',
    'E-coli': 'colony_single',
    'S-aureus': 'colony_single',
    'P-aeruginosa': 'colony_single',
    'C-albicans': 'colony_merged',
    # AGAR converted (already remapped)
    'colony_single': 'colony_single',
    'colony_merged': 'colony_merged',
    'bubble': 'bubble',
    'dust_debris': 'dust_debris',
    'media_crack': 'media_crack',  # Yeast cenderung merged
}

# ColonyAI 5 classes
COLONYAI_CLASSES = ['colony_single', 'colony_merged', 'bubble', 'dust_debris', 'media_crack']
CLASS_ID = {name: i for i, name in enumerate(COLONYAI_CLASSES)}

# ============================================================
# DATASET SOURCES
# ============================================================
ROBOFLOW_BASE = Path('D:/lombapuai/ml-training/datasets/roboflow')
OUTPUT_DIR = Path('D:/lombapuai/ml-training/datasets/colonyai_merged')

DATASETS = [
    ROBOFLOW_BASE / 'bubble_haldia',
    ROBOFLOW_BASE / 'bubble_srieit',
    ROBOFLOW_BASE / 'cfu_colony',
    ROBOFLOW_BASE / 'colony_counter',
    ROBOFLOW_BASE / 'new_colony',
    ROBOFLOW_BASE / 'crack_raimundo',
    ROBOFLOW_BASE / 'crack_tuandung',
    ROBOFLOW_BASE / 'agar_converted',  # AGAR demo - gambar petri dish asli!
]

def get_yaml_and_classes(ds_path):
    yaml_files = list(ds_path.rglob('data.yaml'))
    if not yaml_files:
        return None, []
    yaml_path = yaml_files[0]
    with open(yaml_path) as f:
        data = yaml.safe_load(f)
    return yaml_path.parent, data.get('names', [])

def process_label(label_path, original_classes):
    """Remap class IDs ke ColonyAI classes"""
    new_lines = []
    with open(label_path) as f:
        for line in f:
            parts = line.strip().split()
            if len(parts) < 5:
                continue
            cid = int(parts[0])
            if cid >= len(original_classes):
                continue
            orig_name = original_classes[cid]
            new_name = CLASS_MAPPING.get(orig_name)
            if new_name is None:
                continue  # Skip unmapped classes
            new_cid = CLASS_ID[new_name]
            parts[0] = str(new_cid)
            new_lines.append(' '.join(parts))
    return new_lines

def merge_datasets():
    print("=" * 70)
    print(" MERGE DATASETS → COLONYAI 5 CLASS")
    print("=" * 70)
    print()

    # Create output dirs
    for split in ['train', 'valid', 'test']:
        (OUTPUT_DIR / split / 'images').mkdir(parents=True, exist_ok=True)
        (OUTPUT_DIR / split / 'labels').mkdir(parents=True, exist_ok=True)

    stats = Counter()
    file_count = 0

    for ds_path in DATASETS:
        if not ds_path.exists():
            print(f"⚠️  SKIP (not found): {ds_path.name}")
            continue

        ds_root, orig_classes = get_yaml_and_classes(ds_path)
        if not ds_root:
            print(f"⚠️  SKIP (no yaml): {ds_path.name}")
            continue

        print(f"Processing: {ds_path.name}")
        print(f"  Classes: {orig_classes}")

        for split in ['train', 'valid', 'val', 'test']:
            img_dir = ds_root / split / 'images'
            lbl_dir = ds_root / split / 'labels'

            if not img_dir.exists():
                continue

            # Map 'val' → 'valid'
            out_split = 'valid' if split == 'val' else split

            all_imgs = [p for p in img_dir.glob('*.*')
                       if p.suffix.lower() in ['.jpg', '.jpeg', '.png']]

            # Limit new_colony to 3000 per split to keep dataset balanced
            if ds_path.name == 'new_colony' and len(all_imgs) > 3000:
                random.seed(42)
                all_imgs = random.sample(all_imgs, 3000)
                print(f"  (Sampling 3000/{len(list(img_dir.glob('*.*')))} from {split})")

            for idx, img_path in enumerate(all_imgs):
                lbl_path = lbl_dir / f"{img_path.stem}.txt"
                if not lbl_path.exists():
                    continue

                # Process label
                new_lines = process_label(lbl_path, orig_classes)
                if not new_lines:
                    continue

                # Unique filename
                out_name = f"{ds_path.name}_{img_path.name}"
                out_img = OUTPUT_DIR / out_split / 'images' / out_name
                out_lbl = OUTPUT_DIR / out_split / 'labels' / f"{ds_path.name}_{img_path.stem}.txt"

                shutil.copy2(img_path, out_img)

                with open(out_lbl, 'w') as f:
                    f.write('\n'.join(new_lines))

                for line in new_lines:
                    cid = int(line.split()[0])
                    stats[COLONYAI_CLASSES[cid]] += 1

                file_count += 1

                if idx % 500 == 0:
                    print(f"  {split}: {idx}/{len(all_imgs)} processed...")

        print(f"  ✓ Done")

    # Write data.yaml
    data_yaml = {
        'path': str(OUTPUT_DIR.absolute()),
        'train': 'train/images',
        'val': 'valid/images',
        'test': 'test/images',
        'nc': 5,
        'names': COLONYAI_CLASSES
    }
    with open(OUTPUT_DIR / 'data.yaml', 'w') as f:
        yaml.dump(data_yaml, f, default_flow_style=False)

    print()
    print("=" * 70)
    print(" MERGE COMPLETE")
    print("=" * 70)
    print(f"Total files: {file_count}")
    print()
    print("Detections per class:")
    for cls in COLONYAI_CLASSES:
        count = stats[cls]
        bar = '█' * min(50, count // 500)
        status = "✅" if count > 1000 else "⚠️ " if count > 100 else "❌"
        print(f"  {status} {cls:15s}: {count:6d}  {bar}")
    print()
    print(f"✓ Dataset saved to: {OUTPUT_DIR}")
    print(f"✓ data.yaml created")
    print()

    return stats

if __name__ == "__main__":
    stats = merge_datasets()

    # Check if ready to train
    print("=" * 70)
    print(" STATUS TRAINING READINESS")
    print("=" * 70)
    print()

    ready = True
    for cls in COLONYAI_CLASSES:
        count = stats[cls]
        if count < 100:
            print(f"❌ {cls:15s}: {count} deteksi (KURANG - perlu >100)")
            ready = False
        elif count < 500:
            print(f"⚠️  {cls:15s}: {count} deteksi (CUKUP tapi bisa lebih baik)")
        else:
            print(f"✅ {cls:15s}: {count} deteksi (BAGUS)")

    print()
    if ready:
        print("✅ Dataset siap untuk training!")
        print()
        print("Jalankan training:")
        print("  D:\\lombapuai\\.venv\\Scripts\\python.exe D:\\lombapuai\\backend\\train_custom_dataset.py")
    else:
        print("⚠️  Beberapa class masih kurang data.")
        print("Tapi tetap bisa training, hasilnya mungkin kurang akurat untuk class tersebut.")
        print()
        print("Lanjut training atau cari data tambahan?")
