import os
from pathlib import Path

# Target the merged dataset mentioned by user
dataset_path = r'D:\lombapuai\ml-training\datasets\colonyai_merged'
label_dirs = ['train/labels', 'valid/labels', 'test/labels']
class_counts = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0}
total_annotations = 0
file_count = 0

class_names = {0: 'colony_single', 1: 'colony_merged', 2: 'bubble', 3: 'dust_debris', 4: 'media_crack'}

print('='*60)
print(f'AUDIT DATASET: {os.path.basename(dataset_path)}')
print('='*60)

for label_dir in label_dirs:
    full_path = os.path.join(dataset_path, label_dir)
    if not os.path.exists(full_path):
        print(f"[-] Folder tidak ditemukan: {label_dir}")
        continue
    
    dir_files = list(Path(full_path).glob('*.txt'))
    file_count += len(dir_files)
    
    for label_file in dir_files:
        with open(label_file, 'r') as f:
            for line in f:
                line = line.strip()
                if not line: continue
                try:
                    class_id = int(line.split()[0])
                    if class_id in class_counts:
                        class_counts[class_id] += 1
                        total_annotations += 1
                except: continue

print(f'Total File Label: {file_count}')
print(f'Total Bounding Box: {total_annotations:,}')
print('-'*60)

for cls_id, count in sorted(class_counts.items()):
    pct = (count / total_annotations * 100) if total_annotations > 0 else 0
    print(f'Class {cls_id} ({class_names[cls_id]:<15}): {count:,} ({pct:.1f}%)')

print('='*60)
