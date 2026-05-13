import os
from pathlib import Path

TEST_LABEL_DIR = r'D:\lombapuai\ml-training\datasets\colony_dataset\test\labels'
CLASSES = {0: 'single', 1: 'merged', 2: 'bubble', 3: 'dust', 4: 'crack'}

# List gambar yang tadi di-test (diambil dari log Anda)
test_files = [
    '10_JPG_jpg.rf.0166ebd65ca7c3ed8c9c5c833f74ee2b.txt',
    '11_JPG_jpg.rf.2cba44e18a02d15fcac62a9a9a487f17.txt',
    '12997_jpg.rf.8a90d8739f4fdbe833f7f62743ffa153.txt',
    '12_JPG_jpg.rf.de1b19d6ba3b9842e15517b4f175cf17.txt',
    '13002_jpg.rf.92930c764be6916f3e2cce4d61858f34.txt'
]

print("--- GROUND TRUTH (Label Asli dari Dataset) ---")
for f_name in test_files:
    path = Path(TEST_LABEL_DIR) / f_name
    if path.exists():
        with open(path, 'r') as f:
            classes = set([int(line.split()[0]) for line in f.readlines()])
            class_names = [CLASSES[c] for c in classes]
            print(f"{f_name}: Seharusnya ada -> {class_names}")
