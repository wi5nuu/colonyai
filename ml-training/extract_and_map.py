import os
import zipfile
import shutil
from pathlib import Path

ZIP_PATH = r"C:\Users\Legion\Downloads\new colony.v1i.yolov8.zip"
TARGET_DIR = r"d:\lombapuai\ml-training\datasets\colony_dataset"

# Mapping from 'new colony.v1i.yolov8' to ColonyAI 5-class taxonomy
# Original: ['B-subtilis', 'C-albicans', 'Contamination', 'Defect', 'E-coli', 'P-aeruginosa', 'S-aureus']
# Target:
# 0: colony_single
# 1: colony_merged
# 2: bubble
# 3: dust_debris
# 4: media_crack

CLASS_MAPPING = {
    '0': '0', # B-subtilis -> colony_single
    '1': '0', # C-albicans -> colony_single
    '2': '3', # Contamination -> dust_debris
    '3': '4', # Defect -> media_crack
    '4': '0', # E-coli -> colony_single
    '5': '0', # P-aeruginosa -> colony_single
    '6': '0'  # S-aureus -> colony_single
}

def process_zip():
    if not os.path.exists(ZIP_PATH):
        print(f"File not found: {ZIP_PATH}")
        return

    print("Extracting and mapping dataset...")
    with zipfile.ZipFile(ZIP_PATH, 'r') as z:
        file_list = z.namelist()
        
        # Counters
        img_count = 0
        lbl_count = 0
        
        for file_path in file_list:
            # Only process train, valid, test directories
            parts = file_path.split('/')
            if len(parts) < 3:
                continue
                
            split = parts[0] # train, valid, test
            folder = parts[1] # images, labels
            filename = parts[-1]
            
            if not filename or split not in ['train', 'valid', 'test'] or folder not in ['images', 'labels']:
                continue
                
            # Create a unique prefix to avoid overwriting existing dataset files
            new_filename = f"newcolony_{filename}"
            target_path = os.path.join(TARGET_DIR, split, folder, new_filename)
            
            # Make sure directory exists
            os.makedirs(os.path.dirname(target_path), exist_ok=True)
            
            if folder == 'images':
                # Just extract and rename
                with z.open(file_path) as source, open(target_path, "wb") as target:
                    shutil.copyfileobj(source, target)
                img_count += 1
                
            elif folder == 'labels':
                # Extract, map classes, and save
                content = z.read(file_path).decode('utf-8')
                lines = content.strip().split('\n')
                
                new_lines = []
                for line in lines:
                    if not line.strip():
                        continue
                    tokens = line.strip().split()
                    orig_cls = tokens[0]
                    if orig_cls in CLASS_MAPPING:
                        new_cls = CLASS_MAPPING[orig_cls]
                        tokens[0] = new_cls
                        new_lines.append(" ".join(tokens))
                
                if new_lines:
                    with open(target_path, "w", encoding='utf-8') as f:
                        f.write("\n".join(new_lines) + "\n")
                    lbl_count += 1

    print(f"Successfully extracted and merged {img_count} images and {lbl_count} labels!")

if __name__ == "__main__":
    process_zip()
