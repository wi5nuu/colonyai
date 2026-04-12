import os
from pathlib import Path

dataset_path = os.path.join(os.path.dirname(__file__), 'datasets', 'colony_dataset')
label_dirs = ['train/labels', 'valid/labels', 'test/labels']
class_counts = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0}
total_annotations = 0

for label_dir in label_dirs:
    full_path = os.path.join(dataset_path, label_dir)
    if not os.path.exists(full_path):
        print(f"⚠️  Missing: {label_dir}")
        continue
    for label_file in Path(full_path).glob('*.txt'):
        with open(label_file, 'r') as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                parts = line.split()
                class_id = int(parts[0])
                if class_id in class_counts:
                    class_counts[class_id] += 1
                    total_annotations += 1

class_names = {0: 'colony_single', 1: 'colony_merged', 2: 'bubble', 3: 'dust_debris', 4: 'media_crack'}

print('='*60)
print('📊 DISTRIBUTUSI KELAS DI DATASET COLONYAI')
print('='*60)
print(f'Total Anotasi Bounding Box: {total_annotations:,}')
print()
for cls_id, count in sorted(class_counts.items()):
    pct = (count / total_annotations * 100) if total_annotations > 0 else 0
    status = '✅' if count > 100 else '⚠️' if count > 50 else '❌ RENDAH'
    print(f'{status} Class {cls_id} ({class_names[cls_id]}): {count:,} anotasi ({pct:.1f}%)')
print('='*60)

# Check for class imbalance
min_count = min(class_counts.values())
max_count = max(class_counts.values())
if max_count > min_count * 5:
    print('⚠️  PERINGATAN: Imbalance terdeteksi! Kelas minoritas perlu augmentasi.')
else:
    print('✅ Distribusi kelas cukup seimbang untuk training.')
print('='*60)
