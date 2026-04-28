from roboflow import Roboflow
import os
import shutil
from pathlib import Path

# Configuration
API_KEY = "SVudZsk83foPt6TvfOJ1"
WORKSPACE = "pucv"
PROJECT = "bubbles-finger"
VERSION = 5
TARGET_DATASET_DIR = r"d:\lombapuai\ml-training\datasets\colony_dataset"
TEMP_DOWNLOAD_DIR = r"d:\lombapuai\ml-training\datasets\temp_bubbles"

def download_and_map_bubbles():
    # 1. Download dataset
    print(f"Connecting to Roboflow to download {WORKSPACE}/{PROJECT} v{VERSION}...")
    rf = Roboflow(api_key=API_KEY)
    project = rf.workspace(WORKSPACE).project(PROJECT)
    version = project.version(VERSION)
    
    os.makedirs(TEMP_DOWNLOAD_DIR, exist_ok=True)
    os.chdir(TEMP_DOWNLOAD_DIR)
    
    print("Downloading dataset in YOLOv8 format...")
    dataset = version.download("yolov8")
    source_dir = dataset.location

    # 2. Process and Map to Class 2
    print("Mapping bubble class to Class ID 2 and merging into master dataset...")
    
    for split in ['train', 'valid', 'test']:
        src_img_dir = os.path.join(source_dir, split, "images")
        src_lbl_dir = os.path.join(source_dir, split, "labels")
        
        dest_img_dir = os.path.join(TARGET_DATASET_DIR, split, "images")
        dest_lbl_dir = os.path.join(TARGET_DATASET_DIR, split, "labels")
        
        os.makedirs(dest_img_dir, exist_ok=True)
        os.makedirs(dest_lbl_dir, exist_ok=True)
        
        if not os.path.exists(src_lbl_dir):
            continue
            
        label_files = list(Path(src_lbl_dir).glob("*.txt"))
        count = 0
        
        for lbl_file in label_files:
            # Map labels
            with open(lbl_file, 'r') as f:
                lines = f.readlines()
            
            new_lines = []
            for line in lines:
                parts = line.strip().split()
                if parts:
                    # In Bubbles Finger, there is only 1 class. We map it to 2.
                    parts[0] = "2" 
                    new_lines.append(" ".join(parts))
            
            if not new_lines:
                continue
                
            # Save new label with prefix
            filename_base = lbl_file.stem
            dest_lbl_path = os.path.join(dest_lbl_dir, f"bubble_{filename_base}.txt")
            with open(dest_lbl_path, 'w') as f:
                f.write("\n".join(new_lines) + "\n")
                
            # Copy corresponding image
            # Try different extensions just in case
            img_found = False
            for ext in ['.jpg', '.jpeg', '.png', '.JPG']:
                src_img_path = os.path.join(src_img_dir, filename_base + ext)
                if os.path.exists(src_img_path):
                    dest_img_path = os.path.join(dest_img_dir, f"bubble_{filename_base}{ext}")
                    shutil.copy2(src_img_path, dest_img_path)
                    img_found = True
                    break
            
            if img_found:
                count += 1
        
        print(f"Integrated {count} bubble images into {split} set.")

    # 3. Cleanup
    print("Cleaning up temporary files...")
    os.chdir(r"d:\lombapuai\ml-training")
    shutil.rmtree(TEMP_DOWNLOAD_DIR)
    print("Integration complete!")

if __name__ == "__main__":
    download_and_map_bubbles()
