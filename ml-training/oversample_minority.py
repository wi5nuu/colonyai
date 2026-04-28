import os
import cv2
import numpy as np
import shutil
import random
from pathlib import Path

# Configuration
DATASET_DIR = r"D:\lombapuai\ml-training\datasets\colony_dataset"
TRAIN_IMG_DIR = os.path.join(DATASET_DIR, "train", "images")
TRAIN_LBL_DIR = os.path.join(DATASET_DIR, "train", "labels")

# Target classes for oversampling
# 2: bubble, 3: dust_debris, 4: media_crack
# Goals: dust_debris -> ~5% total, media_crack -> ~3% total
TARGET_CLASSES = {
    2: {"multiplier": 2, "name": "bubble"},
    3: {"multiplier": 40, "name": "dust_debris"},
    4: {"multiplier": 100, "name": "media_crack"}
}

def augment_image(image, flip_code=None):
    """Apply safe augmentations that don't affect bounding box coordinates."""
    # Optional flip first (doesn't affect YOLO bbox coords for horizontal)
    if flip_code is not None:
        image = cv2.flip(image, flip_code)
    
    aug_type = random.choice(['brightness', 'contrast', 'noise', 'blur', 'gamma', 'none'])
    
    if aug_type == 'brightness':
        factor = random.uniform(0.6, 1.4)
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        hsv = np.array(hsv, dtype=np.float64)
        hsv[:, :, 2] = hsv[:, :, 2] * factor
        hsv[:, :, 2][hsv[:, :, 2] > 255] = 255
        hsv = np.array(hsv, dtype=np.uint8)
        return cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
    
    elif aug_type == 'contrast':
        alpha = random.uniform(0.7, 1.6)
        beta = random.randint(-30, 30)
        return cv2.convertScaleAbs(image, alpha=alpha, beta=beta)
        
    elif aug_type == 'noise':
        row, col, ch = image.shape
        mean = 0
        var = 0.05
        sigma = var**0.5
        gauss = np.random.normal(mean, sigma, (row, col, ch))
        gauss = gauss.reshape(row, col, ch)
        noisy = image + gauss * 255
        return np.clip(noisy, 0, 255).astype(np.uint8)
        
    elif aug_type == 'blur':
        ksize = random.choice([3, 5])
        return cv2.GaussianBlur(image, (ksize, ksize), 0)

    elif aug_type == 'gamma':
        gamma = random.uniform(0.6, 1.8)
        inv_gamma = 1.0 / gamma
        table = np.array([(i / 255.0) ** inv_gamma * 255 for i in np.arange(0, 256)]).astype(np.uint8)
        return cv2.LUT(image, table)
        
    return image


def flip_labels(lines, flip_code):
    """Adjust YOLO label x-coords for horizontal flip (flip_code=1).
    For vertical flip (flip_code=0) adjust y-coords.
    For both (flip_code=-1) adjust both.
    """
    new_lines = []
    for line in lines:
        parts = line.strip().split()
        if len(parts) < 5:
            new_lines.append(line)
            continue
        cls_id = parts[0]
        x, y, w, h = float(parts[1]), float(parts[2]), float(parts[3]), float(parts[4])
        if flip_code == 1:   # horizontal
            x = 1.0 - x
        elif flip_code == 0: # vertical
            y = 1.0 - y
        elif flip_code == -1: # both
            x = 1.0 - x
            y = 1.0 - y
        new_lines.append(f"{cls_id} {x:.6f} {y:.6f} {w:.6f} {h:.6f}\n")
    return new_lines

def main():
    print("Scanning dataset for minority classes...")
    
    if not os.path.exists(TRAIN_LBL_DIR):
        print(f"Error: Labels directory not found at {TRAIN_LBL_DIR}")
        return

    label_files = list(Path(TRAIN_LBL_DIR).glob("*.txt"))
    
    candidates = {2: [], 3: [], 4: []}
    
    for lbl_path in label_files:
        with open(lbl_path, 'r') as f:
            lines = f.readlines()
            
        classes_in_file = set()
        for line in lines:
            if not line.strip(): continue
            cls_id = int(line.split()[0])
            classes_in_file.add(cls_id)
            
        # Determine highest priority class in image
        if 4 in classes_in_file:
            candidates[4].append((lbl_path, lines))
        elif 3 in classes_in_file:
            candidates[3].append((lbl_path, lines))
        elif 2 in classes_in_file:
            candidates[2].append((lbl_path, lines))

    for cls_id, data in candidates.items():
        print(f"Found {len(data)} base images for class {TARGET_CLASSES[cls_id]['name']} (ID: {cls_id})")

    total_augmented = 0

    for cls_id, data in candidates.items():
        multiplier = TARGET_CLASSES[cls_id]['multiplier']
        if multiplier <= 1: continue
        
        print(f"\nAugmenting {TARGET_CLASSES[cls_id]['name']} (x{multiplier})...")
        
        for lbl_path, lines in data:
            base_name = lbl_path.stem
            
            # Find corresponding image (could be .jpg, .png, etc.)
            img_path_jpg = os.path.join(TRAIN_IMG_DIR, f"{base_name}.jpg")
            img_path_png = os.path.join(TRAIN_IMG_DIR, f"{base_name}.png")
            
            if os.path.exists(img_path_jpg):
                img_path = img_path_jpg
                ext = ".jpg"
            elif os.path.exists(img_path_png):
                img_path = img_path_png
                ext = ".png"
            else:
                continue # Image not found
                
            img = cv2.imread(img_path)
            if img is None: continue
            
            # Generate augmentations with varied flips
            flip_cycle = [None, 1, 0, -1]  # no flip, horiz, vert, both
            for i in range(multiplier - 1): # -1 because original counts as 1
                new_base = f"{base_name}_aug_c{cls_id}_{i}"
                new_img_path = os.path.join(TRAIN_IMG_DIR, f"{new_base}{ext}")
                new_lbl_path = os.path.join(TRAIN_LBL_DIR, f"{new_base}.txt")
                
                # If already augmented in a previous run, skip
                if os.path.exists(new_lbl_path):
                    continue
                
                # Cycle through flips for variety
                flip_code = flip_cycle[i % len(flip_cycle)]
                
                # Create augmented image
                aug_img = augment_image(img, flip_code=flip_code)
                cv2.imwrite(new_img_path, aug_img)
                
                # Adjust labels if flip was applied
                if flip_code is not None:
                    adjusted_lines = flip_labels(lines, flip_code)
                else:
                    adjusted_lines = lines
                
                with open(new_lbl_path, 'w') as f:
                    f.writelines(adjusted_lines)
                    
                total_augmented += 1

    print(f"\nOversampling complete. Generated {total_augmented} new augmented images/labels.")

if __name__ == "__main__":
    main()
