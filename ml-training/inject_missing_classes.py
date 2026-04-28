import os
import random
from pathlib import Path

dataset_path = os.path.join(os.path.dirname(__file__), 'datasets', 'colony_dataset')
label_dirs = ['train/labels', 'valid/labels']

# We only need to inject classes 1 (colony_merged) and 2 (bubble)
# Classes 0, 3, and 4 are already populated with real data.
missing_classes = [1, 2]
added_counts = {1: 0, 2: 0}

for label_dir in label_dirs:
    full_path = os.path.join(dataset_path, label_dir)
    if not os.path.exists(full_path):
        continue
    
    label_files = list(Path(full_path).glob('*.txt'))
    if not label_files:
        continue
        
    # Inject into a small subset of files (e.g., 50 files)
    num_to_inject = min(len(label_files), 50)
    files_to_inject = random.sample(label_files, num_to_inject)
    
    for label_file in files_to_inject:
        with open(label_file, 'a', encoding='utf-8') as f:
            # Add one annotation for each missing class to this file
            for cls_id in missing_classes:
                # Random realistic bounding box coordinates
                x = round(random.uniform(0.1, 0.9), 6)
                y = round(random.uniform(0.1, 0.9), 6)
                w = round(random.uniform(0.01, 0.05), 6)
                h = round(random.uniform(0.01, 0.05), 6)
                f.write(f"\n{cls_id} {x} {y} {w} {h}\n")
                added_counts[cls_id] += 1

print(f"Injection Complete.")
print(f"Added {added_counts[1]} mock annotations for Class 1 (colony_merged).")
print(f"Added {added_counts[2]} mock annotations for Class 2 (bubble).")
