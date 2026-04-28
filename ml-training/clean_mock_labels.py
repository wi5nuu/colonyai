import os
from pathlib import Path

dataset_path = os.path.join(os.path.dirname(__file__), 'datasets', 'colony_dataset')
label_dirs = ['train/labels', 'valid/labels', 'test/labels']

removed_count = 0

for label_dir in label_dirs:
    full_path = os.path.join(dataset_path, label_dir)
    if not os.path.exists(full_path):
        continue
    
    label_files = list(Path(full_path).glob('*.txt'))
    for label_file in label_files:
        with open(label_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        new_lines = []
        for line in lines:
            line_stripped = line.strip()
            if not line_stripped:
                continue
            
            # Check the class ID (first character)
            parts = line_stripped.split()
            if parts and parts[0] in ['1', '2', '3', '4']:
                removed_count += 1
            else:
                new_lines.append(line)
                
        # Write back only if we removed something
        if len(new_lines) != len(lines):
            with open(label_file, 'w', encoding='utf-8') as f:
                for line in new_lines:
                    f.write(line)

print(f"Cleanup Complete. Removed {removed_count} mock annotations for classes 1, 2, 3, and 4.")
