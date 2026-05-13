import os
import shutil
from pathlib import Path

# Config
DATASET_DIR = Path(r'D:\lombapuai\ml-training\datasets\colony_dataset')
PUBLIC_DIR = Path(r'D:\lombapuai\frontend\public\samples')
os.makedirs(PUBLIC_DIR, exist_ok=True)

# 5 target classes
CLASSES = {
    0: 'single',
    1: 'merged',
    2: 'bubble',
    3: 'dust',
    4: 'crack'
}

# Find representative images
found_samples = {}

# Check all splits
for split in ['train', 'valid', 'test']:
    label_dir = DATASET_DIR / split / 'labels'
    image_dir = DATASET_DIR / split / 'images'
    if not label_dir.exists(): continue
    
    for label_file in label_dir.glob('*.txt'):
        with open(label_file, 'r') as f:
            classes = set([int(line.split()[0]) for line in f.readlines()])
            for c in classes:
                if c not in found_samples:
                    img_name = label_file.stem + '.jpg'
                    img_path = image_dir / img_name
                    if img_path.exists():
                        target_path = PUBLIC_DIR / f"{CLASSES[c]}.jpg"
                        shutil.copy(img_path, target_path)
                        found_samples[c] = f"{split}/{img_name}"
                        print(f"Copied {CLASSES[c]} from {split}")
        
        if len(found_samples) == 5: break
    if len(found_samples) == 5: break

print(f"Found samples: {found_samples}")
