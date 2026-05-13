import os
import cv2
import numpy as np
from ultralytics import YOLO
from pathlib import Path

# Paths
OLD_MODEL_PATH = r'D:\lombapuai\backend\models\colony_best.pt'
NEW_MODEL_PATH = r'D:\lombapuai\hasil_training_colony\runs\colony_v8\weights\best.pt'
DATASET_PATH = r'D:\lombapuai\ml-training\datasets\colony_dataset\test'
OUTPUT_ROOT = r'D:\lombapuai\ml-training\model_comparison'

CLASSES = {
    0: 'colony_single',
    1: 'colony_merged',
    2: 'bubble',
    3: 'dust_debris',
    4: 'media_crack'
}

def find_samples_per_class(n_samples=5):
    samples = {i: [] for i in CLASSES.keys()}
    label_dir = Path(DATASET_PATH) / 'labels'
    image_dir = Path(DATASET_PATH) / 'images'
    
    for label_file in label_dir.glob('*.txt'):
        with open(label_file, 'r') as f:
            lines = f.readlines()
            if not lines: continue
            
            # Get classes present in this image
            img_classes = set([int(line.split()[0]) for line in lines])
            
            img_name = label_file.stem + '.jpg'
            img_path = image_dir / img_name
            
            if not img_path.exists():
                # Try .png or other extensions if needed
                img_name = label_file.stem + '.png'
                img_path = image_dir / img_name
                if not img_path.exists(): continue

            for cls in img_classes:
                if len(samples[cls]) < n_samples:
                    samples[cls].append(str(img_path))
                    
        # Stop if all classes have enough samples
        if all(len(v) >= n_samples for v in samples.values()):
            break
            
    return samples

def create_comparison():
    print("Loading models...")
    model_old = YOLO(OLD_MODEL_PATH)
    model_new = YOLO(NEW_MODEL_PATH)
    
    print("Finding representative samples...")
    samples = find_samples_per_class(5)
    
    for cls_id, img_paths in samples.items():
        cls_name = CLASSES[cls_id]
        class_output_dir = Path(OUTPUT_ROOT) / cls_name
        class_output_dir.mkdir(parents=True, exist_ok=True)
        
        print(f"Processing class: {cls_name}")
        
        for i, img_path in enumerate(img_paths):
            # Run inference
            res_old = model_old(img_path, conf=0.25)[0].plot()
            res_new = model_new(img_path, conf=0.25)[0].plot()
            
            # Add labels to the images
            h, w, _ = res_old.shape
            font = cv2.FONT_HERSHEY_SIMPLEX
            
            # Create header for side-by-side
            cv2.putText(res_old, "OLD MODEL (6MB)", (20, 50), font, 1, (0, 0, 255), 2)
            cv2.putText(res_new, "NEW MODEL (67MB)", (20, 50), font, 1, (0, 255, 0), 2)
            
            # Combine side by side
            comparison = np.hstack((res_old, res_new))
            
            # Save
            output_path = class_output_dir / f"sample_{i+1}_{Path(img_path).name}"
            cv2.imwrite(str(output_path), comparison)
            print(f"  Saved comparison for {Path(img_path).name}")

if __name__ == "__main__":
    create_comparison()
