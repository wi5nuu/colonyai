import os
import shutil
import random
from pathlib import Path

SOURCE_DIR = r"d:\lombapuai\ml-training\datasets\colony_dataset"
TARGET_DIR = r"d:\lombapuai\ml-training\datasets\colony_mini"
SAMPLES_PER_SPLIT = {"train": 500, "valid": 100, "test": 50}

def create_subset():
    print(f"Creating mini dataset at {TARGET_DIR}...")
    if os.path.exists(TARGET_DIR):
        shutil.rmtree(TARGET_DIR)
        
    for split, count in SAMPLES_PER_SPLIT.items():
        src_img_dir = os.path.join(SOURCE_DIR, split, "images")
        src_lbl_dir = os.path.join(SOURCE_DIR, split, "labels")
        
        dest_img_dir = os.path.join(TARGET_DIR, split, "images")
        dest_lbl_dir = os.path.join(TARGET_DIR, split, "labels")
        
        os.makedirs(dest_img_dir, exist_ok=True)
        os.makedirs(dest_lbl_dir, exist_ok=True)
        
        images = list(Path(src_img_dir).glob("*"))
        selected = random.sample(images, min(count, len(images)))
        
        print(f"  Copying {len(selected)} images for {split}...")
        for img_path in selected:
            # Copy image
            shutil.copy2(img_path, dest_img_dir)
            
            # Copy label
            lbl_path = os.path.join(src_lbl_dir, img_path.stem + ".txt")
            if os.path.exists(lbl_path):
                shutil.copy2(lbl_path, dest_lbl_dir)

    # Create data.yaml for mini dataset
    with open(os.path.join(TARGET_DIR, "data.yaml"), "w") as f:
        f.write(f"""path: {TARGET_DIR.replace('\\', '/')}
train: train/images
val: valid/images
test: test/images

nc: 5
names:
  0: colony_single
  1: colony_merged
  2: bubble
  3: dust_debris
  4: media_crack
""")
    print("Mini dataset created successfully!")

if __name__ == "__main__":
    create_subset()
