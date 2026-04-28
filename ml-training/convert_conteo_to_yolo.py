import json
import os
import shutil
from pathlib import Path

SOURCE_ROOT = r"d:\lombapuai\ml-training\datasets\Conteo-de-colonias-PF-1"
TARGET_ROOT = r"d:\lombapuai\ml-training\datasets\colony_dataset"

# Taxonomy Mapping
# COCO ID 0 (objects-gyd0) -> YOLO ID 0 (colony_single)
# COCO ID 1 (C) -> YOLO ID 1 (colony_merged)
CLASS_MAPPING = {
    0: 0,
    1: 1
}

def convert_coco_to_yolo(split):
    print(f"Processing split: {split}")
    coco_path = os.path.join(SOURCE_ROOT, split, "_annotations.coco.json")
    if not os.path.exists(coco_path):
        print(f"Skipping {split}, JSON not found.")
        return

    with open(coco_path, 'r') as f:
        data = json.load(f)

    # Create target directories
    target_img_dir = os.path.join(TARGET_ROOT, split, "images")
    target_lbl_dir = os.path.join(TARGET_ROOT, split, "labels")
    os.makedirs(target_img_dir, exist_ok=True)
    os.makedirs(target_lbl_dir, exist_ok=True)

    # Map image ID to filename and dimensions
    images = {img['id']: img for img in data['images']}
    
    # Process annotations
    img_annotations = {}
    for ann in data['annotations']:
        img_id = ann['image_id']
        if img_id not in img_annotations:
            img_annotations[img_id] = []
        
        category_id = ann['category_id']
        if category_id not in CLASS_MAPPING:
            continue
            
        new_class_id = CLASS_MAPPING[category_id]
        
        # COCO bbox: [x, y, width, height]
        bbox = ann['bbox']
        img_info = images[img_id]
        img_w = img_info['width']
        img_h = img_info['height']
        
        # YOLO format: [class_id, x_center, y_center, width, height] (normalized)
        x_center = (bbox[0] + bbox[2] / 2) / img_w
        y_center = (bbox[1] + bbox[3] / 2) / img_h
        w_norm = bbox[2] / img_w
        h_norm = bbox[3] / img_h
        
        img_annotations[img_id].append(f"{new_class_id} {x_center:.6f} {y_center:.6f} {w_norm:.6f} {h_norm:.6f}")

    # Copy images and write labels
    count = 0
    for img_id, img_info in images.items():
        filename = img_info['file_name']
        source_img_path = os.path.join(SOURCE_ROOT, split, filename)
        
        # Roboflow sometimes uses subdirectories in file_name, but usually not in COCO export
        # Just in case, get the basename
        basename = os.path.basename(filename)
        target_img_path = os.path.join(target_img_dir, f"conteo_{basename}")
        
        # Copy image
        if os.path.exists(source_img_path):
            shutil.copy2(source_img_path, target_img_path)
        else:
            print(f"Warning: Image {source_img_path} not found.")
            continue
            
        # Write label file
        label_filename = os.path.splitext(basename)[0] + ".txt"
        target_lbl_path = os.path.join(target_lbl_dir, f"conteo_{label_filename}")
        
        annotations = img_annotations.get(img_id, [])
        if annotations:
            with open(target_lbl_path, "w") as f:
                f.write("\n".join(annotations) + "\n")
        
        count += 1

    print(f"Finished {split}: Processed {count} images.")

if __name__ == "__main__":
    for split in ['train', 'valid', 'test']:
        convert_coco_to_yolo(split)
    print("All conversions complete!")
