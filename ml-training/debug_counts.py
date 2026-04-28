import os
from pathlib import Path
from collections import Counter

dataset_path = r'd:\lombapuai\ml-training\datasets\colony_dataset'
label_dirs = ['train/labels', 'valid/labels', 'test/labels']

stats = {
    'conteo': {'imgs': 0, 'anns': Counter()},
    'newcolony': {'imgs': 0, 'anns': Counter()},
    'legacy': {'imgs': 0, 'anns': Counter()}
}

for label_dir in label_dirs:
    full_path = os.path.join(dataset_path, label_dir)
    if not os.path.exists(full_path):
        continue
    
    for label_file in Path(full_path).glob('*.txt'):
        prefix = 'conteo' if label_file.name.startswith('conteo_') else \
                 'newcolony' if label_file.name.startswith('newcolony_') else \
                 'legacy'
        
        stats[prefix]['imgs'] += 1
        with open(label_file, 'r') as f:
            for line in f:
                parts = line.split()
                if parts:
                    class_id = int(parts[0])
                    stats[prefix]['anns'][class_id] += 1

print("DATASET COMPOSITION ANALYSIS")
print("="*60)
for group, data in stats.items():
    print(f"Group: {group}")
    print(f"  Images: {data['imgs']:,}")
    total_anns = sum(data['anns'].values())
    print(f"  Total Annotations: {total_anns:,}")
    if data['imgs'] > 0:
        print(f"  Avg Annotations/Image: {total_anns/data['imgs']:.2f}")
    print(f"  Class Distribution: {dict(sorted(data['anns'].items()))}")
    print("-" * 30)

total_real_imgs = stats['conteo']['imgs'] + stats['newcolony']['imgs']
total_real_anns = sum(stats['conteo']['anns'].values()) + sum(stats['newcolony']['anns'].values())
print(f"TOTAL REAL-WORLD DATA (Verified): {total_real_imgs:,} images, {total_real_anns:,} annotations")
print("="*60)
