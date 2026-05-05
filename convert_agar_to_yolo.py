#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
KONVERSI AGAR DEMO (JSON) → YOLO FORMAT
Untuk menambah data dust_debris dari gambar petri dish asli
"""
import json
import shutil
import random
from pathlib import Path
from PIL import Image

AGAR_PATH = Path('D:/lombapuai/ml-training/datasets/roboflow/agar_demo/AGAR_representative')
OUTPUT_PATH = Path('D:/lombapuai/ml-training/datasets/roboflow/agar_converted')

# Mapping AGAR classes → ColonyAI classes
CLASS_MAPPING = {
    'S.aureus':     'colony_single',
    'E.coli':       'colony_single',
    'B.subtilis':   'colony_single',
    'P.aeruginosa': 'colony_single',
    'C.albicans':   'colony_merged',
    'Contamination':'dust_debris',
}

COLONYAI_CLASSES = ['colony_single', 'colony_merged', 'bubble', 'dust_debris', 'media_crack']
CLASS_ID = {name: i for i, name in enumerate(COLONYAI_CLASSES)}

def convert():
    print("=" * 60)
    print(" KONVERSI AGAR DEMO → YOLO FORMAT")
    print("=" * 60)
    print()

    # Collect all image-json pairs
    pairs = []
    for json_file in AGAR_PATH.rglob('*.json'):
        img_file = json_file.with_suffix('.jpg')
        if img_file.exists():
            pairs.append((img_file, json_file))

    print(f"Total gambar ditemukan: {len(pairs)}")
    print()

    # Split train/valid/test (70/20/10)
    random.seed(42)
    random.shuffle(pairs)
    n = len(pairs)
    train_pairs = pairs[:int(n*0.7)]
    valid_pairs = pairs[int(n*0.7):int(n*0.9)]
    test_pairs  = pairs[int(n*0.9):]

    splits = {'train': train_pairs, 'valid': valid_pairs, 'test': test_pairs}

    # Create output dirs
    for split in splits:
        (OUTPUT_PATH / split / 'images').mkdir(parents=True, exist_ok=True)
        (OUTPUT_PATH / split / 'labels').mkdir(parents=True, exist_ok=True)

    from collections import Counter
    stats = Counter()
    total = 0

    for split, split_pairs in splits.items():
        for img_path, json_path in split_pairs:
            # Read image size
            with Image.open(img_path) as img:
                W, H = img.size

            # Read JSON
            with open(json_path) as f:
                data = json.load(f)

            labels = data.get('labels', [])
            if not labels:
                continue

            # Convert to YOLO format
            yolo_lines = []
            for label in labels:
                cls_name = label.get('class', '')
                new_cls = CLASS_MAPPING.get(cls_name)
                if new_cls is None:
                    continue

                # AGAR format: x, y = top-left corner, width, height
                x = label['x']
                y = label['y']
                w = label['width']
                h = label['height']

                # Convert to YOLO normalized center format
                cx = (x + w/2) / W
                cy = (y + h/2) / H
                nw = w / W
                nh = h / H

                # Clamp to [0, 1]
                cx = max(0, min(1, cx))
                cy = max(0, min(1, cy))
                nw = max(0, min(1, nw))
                nh = max(0, min(1, nh))

                cid = CLASS_ID[new_cls]
                yolo_lines.append(f"{cid} {cx:.6f} {cy:.6f} {nw:.6f} {nh:.6f}")
                stats[new_cls] += 1

            if not yolo_lines:
                continue

            # Copy image
            out_img = OUTPUT_PATH / split / 'images' / f"agar_{img_path.name}"
            shutil.copy2(img_path, out_img)

            # Write label
            out_lbl = OUTPUT_PATH / split / 'labels' / f"agar_{img_path.stem}.txt"
            with open(out_lbl, 'w') as f:
                f.write('\n'.join(yolo_lines))

            total += 1

    # Write data.yaml
    import yaml
    data_yaml = {
        'path': str(OUTPUT_PATH.absolute()),
        'train': 'train/images',
        'val': 'valid/images',
        'test': 'test/images',
        'nc': 5,
        'names': COLONYAI_CLASSES
    }
    with open(OUTPUT_PATH / 'data.yaml', 'w') as f:
        yaml.dump(data_yaml, f, default_flow_style=False)

    print(f"Total gambar dikonversi: {total}")
    print()
    print("Detections per class:")
    for cls in COLONYAI_CLASSES:
        count = stats[cls]
        status = "✅" if count > 0 else "❌"
        print(f"  {status} {cls:15s}: {count}")

    print()
    print(f"✓ Output: {OUTPUT_PATH}")
    print()

if __name__ == "__main__":
    convert()
