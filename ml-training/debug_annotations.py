import os
from pathlib import Path

dataset_path = os.path.join(os.path.dirname(__file__), 'datasets', 'colony_dataset')
label_dirs = ['train/labels', 'valid/labels', 'test/labels']

print("🔍 Scanning for files with unusually high number of annotations...")

for label_dir in label_dirs:
    full_path = os.path.join(dataset_path, label_dir)
    if not os.path.exists(full_path):
        continue
    
    for label_file in Path(full_path).glob('*.txt'):
        with open(label_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            if len(lines) > 500:
                print(f"⚠️ HIGH COUNT: {label_file.name} has {len(lines)} annotations!")
                
print("✅ Scan complete.")
