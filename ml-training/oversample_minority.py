import os
import cv2
import numpy as np
import shutil
import random
from pathlib import Path

# Configuration
DATASET_DIR = r"D:\lombapuai\ml-training\datasets\colonyai_merged"
TRAIN_IMG_DIR = os.path.join(DATASET_DIR, "train", "images")
TRAIN_LBL_DIR = os.path.join(DATASET_DIR, "train", "labels")

# Target classes for oversampling (Adjusted based on audit: 0.2% dust, 1% crack)
TARGET_CLASSES = {
    1: {"multiplier": 3, "name": "colony_merged"},
    2: {"multiplier": 6, "name": "bubble"},
    3: {"multiplier": 50, "name": "dust_debris"},
    4: {"multiplier": 30, "name": "media_crack"}
}

def augment_image(image, flip_code=None):
    if flip_code is not None:
        image = cv2.flip(image, flip_code)
    
    aug_type = random.choice(['brightness', 'contrast', 'none'])
    if aug_type == 'brightness':
        factor = random.uniform(0.8, 1.2)
        return np.clip(image.astype(np.float64) * factor, 0, 255).astype(np.uint8)
    elif aug_type == 'contrast':
        alpha = random.uniform(0.9, 1.1)
        return cv2.convertScaleAbs(image, alpha=alpha, beta=0)
    return image

def flip_polygon(lines, flip_code):
    """Handles both Box (5 cols) and Polygon (N cols) format for YOLO."""
    new_lines = []
    for line in lines:
        parts = line.strip().split()
        if len(parts) < 5:
            new_lines.append(line)
            continue
            
        cls_id = parts[0]
        coords = [float(x) for x in parts[1:]]
        new_coords = []
        
        # YOLO format: cls x1 y1 x2 y2 ...
        for i in range(0, len(coords), 2):
            x = coords[i]
            y = coords[i+1]
            
            if flip_code == 1:   # horizontal
                x = 1.0 - x
            elif flip_code == 0: # vertical
                y = 1.0 - y
            elif flip_code == -1: # both
                x = 1.0 - x
                y = 1.0 - y
            
            new_coords.extend([x, y])
            
        coord_str = " ".join([f"{c:.6f}" for c in new_coords])
        new_lines.append(f"{cls_id} {coord_str}\n")
    return new_lines

def main():
    print("🚀 Starting Polygon-Aware Oversampling...")
    
    if not os.path.exists(TRAIN_LBL_DIR):
        print(f"❌ Error: Labels directory not found at {TRAIN_LBL_DIR}")
        return

    label_files = list(Path(TRAIN_LBL_DIR).glob("*.txt"))
    candidates = {1: [], 2: [], 3: [], 4: []}
    
    print("🔍 Scanning for minority classes in real data...")
    for lbl_path in label_files:
        if "_aug_" in lbl_path.name: continue # Skip existing augmented files
        
        with open(lbl_path, 'r') as f:
            lines = f.readlines()
            
        classes_in_file = set()
        for line in lines:
            parts = line.split()
            if parts: classes_in_file.add(int(parts[0]))
            
        for cls_id in [4, 3, 2, 1]: # Priority order
            if cls_id in classes_in_file:
                candidates[cls_id].append((lbl_path, lines))
                break

    for cls_id, data in candidates.items():
        print(f"📊 Class {cls_id} ({TARGET_CLASSES[cls_id]['name']}): {len(data)} files found.")

    total_added = 0
    for cls_id, data in candidates.items():
        multiplier = TARGET_CLASSES[cls_id]['multiplier']
        if multiplier <= 1 or not data: continue
        
        print(f"✨ Oversampling {TARGET_CLASSES[cls_id]['name']} x{multiplier}...")
        
        for lbl_path, lines in data:
            base_name = lbl_path.stem
            img_exts = ['.jpg', '.png', '.jpeg']
            img_path = None
            for ext in img_exts:
                test_path = os.path.join(TRAIN_IMG_DIR, base_name + ext)
                if os.path.exists(test_path):
                    img_path = test_path
                    current_ext = ext
                    break
            
            if not img_path: continue
            img = cv2.imread(img_path)
            if img is None: continue
            
            flip_cycle = [1, 0, -1, None]
            for i in range(multiplier - 1):
                new_base = f"{base_name}_aug_v2_{cls_id}_{i}"
                new_img_path = os.path.join(TRAIN_IMG_DIR, new_base + current_ext)
                new_lbl_path = os.path.join(TRAIN_LBL_DIR, new_base + ".txt")
                
                if os.path.exists(new_lbl_path): continue
                
                flip_code = flip_cycle[i % len(flip_cycle)]
                aug_img = augment_image(img, flip_code)
                cv2.imwrite(new_img_path, aug_img)
                
                adjusted_lines = flip_polygon(lines, flip_code) if flip_code is not None else lines
                with open(new_lbl_path, 'w') as f:
                    f.writelines(adjusted_lines)
                total_added += 1

    print(f"\n✅ Oversampling Complete! Generated {total_added} new training samples.")

if __name__ == "__main__":
    main()
