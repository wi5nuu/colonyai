#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
MERGE ROBOFLOW DATASETS
Gabungkan dataset dari Roboflow dengan dataset existing
dan remap class names ke 5 class ColonyAI
"""
import os
import shutil
from pathlib import Path
import yaml

# Mapping class dari Roboflow ke ColonyAI (5 class)
CLASS_MAPPING = {
    # Dari menlo college dataset
    'Contamination': 'dust_debris',
    'Defect': 'media_crack',
    'B-subtilis': 'colony_single',
    'E-coli': 'colony_single',
    'S-aureus': 'colony_single',
    'C-albicans': 'colony_merged',
    'P-aeruginosa': 'colony_single',

    # Dari contamination dataset
    'contaminated': 'dust_debris',
    'uncontaminated': None,  # Skip

    # Dari artifacts dataset
    'defect': 'media_crack',
    'green': 'bubble',
    'purple': 'bubble',

    # Dari bacterial growth
    'Petri-Dish': None,  # Skip (background)
    'Petri-dish': None,

    # Generic mapping
    'contamination': 'dust_debris',
    'artifact': 'dust_debris',
    'crack': 'media_crack',
    'bubble': 'bubble',
    'dust': 'dust_debris',
    'debris': 'dust_debris',
}

# ColonyAI 5 classes
COLONYAI_CLASSES = {
    'colony_single': 0,
    'colony_merged': 1,
    'bubble': 2,
    'dust_debris': 3,
    'media_crack': 4,
}

def remap_label_file(label_path, class_mapping, output_path):
    """
    Remap class IDs dalam label file YOLO
    """
    # Read original data.yaml to get class names
    dataset_dir = Path(label_path).parent.parent
    yaml_path = dataset_dir / 'data.yaml'

    if not yaml_path.exists():
        print(f"  Warning: data.yaml not found at {yaml_path}")
        return False

    with open(yaml_path, 'r') as f:
        data = yaml.safe_load(f)

    original_classes = data.get('names', [])

    # Read label file
    with open(label_path, 'r') as f:
        lines = f.readlines()

    new_lines = []
    for line in lines:
        parts = line.strip().split()
        if len(parts) < 5:
            continue

        old_class_id = int(parts[0])

        # Get original class name
        if old_class_id >= len(original_classes):
            continue

        old_class_name = original_classes[old_class_id]

        # Map to ColonyAI class
        new_class_name = class_mapping.get(old_class_name)

        if new_class_name is None:
            # Skip this detection
            continue

        if new_class_name not in COLONYAI_CLASSES:
            print(f"  Warning: Unknown target class {new_class_name}")
            continue

        new_class_id = COLONYAI_CLASSES[new_class_name]

        # Replace class ID
        parts[0] = str(new_class_id)
        new_lines.append(' '.join(parts) + '\n')

    # Write new label file
    if new_lines:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, 'w') as f:
            f.writelines(new_lines)
        return True

    return False

def merge_datasets(roboflow_dirs, output_dir):
    """
    Merge multiple Roboflow datasets into one ColonyAI dataset

    Args:
        roboflow_dirs: List of paths to Roboflow datasets
        output_dir: Output directory for merged dataset
    """
    print("=" * 70)
    print(" MERGE ROBOFLOW DATASETS")
    print("=" * 70)
    print()

    output_dir = Path(output_dir)

    # Create output structure
    for split in ['train', 'valid', 'test']:
        (output_dir / split / 'images').mkdir(parents=True, exist_ok=True)
        (output_dir / split / 'labels').mkdir(parents=True, exist_ok=True)

    stats = {
        'total_images': 0,
        'total_labels': 0,
        'by_class': {cls: 0 for cls in COLONYAI_CLASSES.keys()},
        'skipped': 0,
    }

    # Process each Roboflow dataset
    for roboflow_dir in roboflow_dirs:
        roboflow_dir = Path(roboflow_dir)

        if not roboflow_dir.exists():
            print(f"⚠️  Dataset not found: {roboflow_dir}")
            continue

        print(f"Processing: {roboflow_dir.name}")

        # Process each split
        for split in ['train', 'valid', 'test']:
            img_dir = roboflow_dir / split / 'images'
            lbl_dir = roboflow_dir / split / 'labels'

            if not img_dir.exists():
                continue

            # Process images
            for img_path in img_dir.glob('*.*'):
                if img_path.suffix.lower() not in ['.jpg', '.jpeg', '.png']:
                    continue

                # Copy image
                output_img_path = output_dir / split / 'images' / f"{roboflow_dir.name}_{img_path.name}"
                shutil.copy2(img_path, output_img_path)
                stats['total_images'] += 1

                # Process label
                label_path = lbl_dir / f"{img_path.stem}.txt"
                if label_path.exists():
                    output_lbl_path = output_dir / split / 'labels' / f"{roboflow_dir.name}_{img_path.stem}.txt"

                    if remap_label_file(label_path, CLASS_MAPPING, output_lbl_path):
                        stats['total_labels'] += 1

                        # Count by class
                        with open(output_lbl_path, 'r') as f:
                            for line in f:
                                class_id = int(line.split()[0])
                                class_name = list(COLONYAI_CLASSES.keys())[class_id]
                                stats['by_class'][class_name] += 1
                    else:
                        stats['skipped'] += 1

        print(f"  ✓ Processed {roboflow_dir.name}")

    # Create data.yaml
    data_yaml = {
        'path': str(output_dir.absolute()),
        'train': 'train/images',
        'val': 'valid/images',
        'test': 'test/images',
        'nc': 5,
        'names': list(COLONYAI_CLASSES.keys())
    }

    with open(output_dir / 'data.yaml', 'w') as f:
        yaml.dump(data_yaml, f, default_flow_style=False)

    print()
    print("=" * 70)
    print(" MERGE COMPLETE")
    print("=" * 70)
    print()
    print(f"Total images: {stats['total_images']}")
    print(f"Total labels: {stats['total_labels']}")
    print(f"Skipped: {stats['skipped']}")
    print()
    print("Detections by class:")
    for cls_name, count in stats['by_class'].items():
        print(f"  {cls_name:15s}: {count:5d}")
    print()
    print(f"✓ Merged dataset saved to: {output_dir}")
    print(f"✓ data.yaml created")
    print()

def main():
    print("=" * 70)
    print(" ROBOFLOW DATASET MERGER FOR COLONYAI")
    print("=" * 70)
    print()

    # Konfigurasi
    roboflow_datasets = [
        'ml-training/datasets/roboflow/menlo_petri',
        'ml-training/datasets/roboflow/petri_contamination',
        'ml-training/datasets/roboflow/artifacts_detection',
        'ml-training/datasets/roboflow/artifacts_smilescan',
    ]

    output_dir = 'ml-training/datasets/colonyai_with_artifacts'

    print("Roboflow datasets to merge:")
    for ds in roboflow_datasets:
        exists = "✓" if Path(ds).exists() else "✗"
        print(f"  {exists} {ds}")
    print()

    print(f"Output directory: {output_dir}")
    print()

    # Merge
    merge_datasets(roboflow_datasets, output_dir)

    print("=" * 70)
    print(" NEXT STEPS")
    print("=" * 70)
    print()
    print("1. Review merged dataset:")
    print(f"   cd {output_dir}")
    print("   ls train/images | wc -l")
    print()
    print("2. Train model:")
    print("   python train_with_artifacts.py")
    print()

if __name__ == "__main__":
    main()
