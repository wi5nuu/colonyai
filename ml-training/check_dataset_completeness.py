import os
from pathlib import Path

DATASET_ROOT = r'D:\lombapuai\ml-training\datasets\colony_dataset'
CLASSES = {0: 'single', 1: 'merged', 2: 'bubble', 3: 'dust', 4: 'crack'}

for split in ['train', 'valid', 'test']:
    label_dir = Path(DATASET_ROOT) / split / 'labels'
    if not label_dir.exists(): continue
    
    found_in_split = set()
    for label_file in label_dir.glob('*.txt'):
        with open(label_file, 'r') as f:
            classes = [int(line.split()[0]) for line in f.readlines()]
            found_in_split.update(classes)
    
    names = [CLASSES[c] for c in found_in_split if c in CLASSES]
    print(f"Folder {split.upper()}: Berisi kelas -> {names}")
