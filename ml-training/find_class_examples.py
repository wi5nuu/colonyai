import os
from pathlib import Path

TEST_LABEL_DIR = r'D:\lombapuai\ml-training\datasets\colony_dataset\test\labels'
CLASSES = {0: 'single', 1: 'merged', 2: 'bubble', 3: 'dust', 4: 'crack'}

# Kita cari minimal 1 contoh untuk tiap kelas
examples = {i: None for i in CLASSES.keys()}

for label_file in Path(TEST_LABEL_DIR).glob('*.txt'):
    with open(label_file, 'r') as f:
        classes_in_img = set([int(line.split()[0]) for line in f.readlines()])
        for c in classes_in_img:
            if examples[c] is None:
                examples[c] = label_file.name

print("--- LOKASI SAMPEL PER KELAS ---")
for cls_id, f_name in examples.items():
    status = f_name if f_name else "TIDAK DITEMUKAN"
    print(f"Kelas {cls_id} ({CLASSES[cls_id]}): {status}")
