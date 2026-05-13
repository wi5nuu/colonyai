import os
import shutil
from pathlib import Path

# Configuration
DATASET_DIR = r"D:\lombapuai\ml-training\datasets\colony_dataset"

def move_files(src_dir_name, target_dir_name, classes_to_move):
    src_lbl_dir = os.path.join(DATASET_DIR, src_dir_name, "labels")
    src_img_dir = os.path.join(DATASET_DIR, src_dir_name, "images")
    
    tgt_lbl_dir = os.path.join(DATASET_DIR, target_dir_name, "labels")
    tgt_img_dir = os.path.join(DATASET_DIR, target_dir_name, "images")
    
    if not os.path.exists(src_lbl_dir): return
    
    moved_count = 0
    print(f"📦 Checking {src_dir_name} for classes {classes_to_move}...")
    
    label_files = list(Path(src_lbl_dir).glob("*.txt"))
    for lbl_path in label_files:
        with open(lbl_path, 'r') as f:
            lines = f.readlines()
        
        has_target = False
        for line in lines:
            parts = line.split()
            if parts and int(parts[0]) in classes_to_move:
                has_target = True
                break
        
        if has_target:
            base_name = lbl_path.stem
            # Move label
            shutil.move(str(lbl_path), os.path.join(tgt_lbl_dir, lbl_path.name))
            
            # Move image (check multiple extensions)
            for ext in ['.jpg', '.png', '.jpeg', '.JPG']:
                img_src = os.path.join(src_img_dir, base_name + ext)
                if os.path.exists(img_src):
                    shutil.move(img_src, os.path.join(tgt_img_dir, base_name + ext))
                    break
            moved_count += 1
            
    print(f"✅ Moved {moved_count} images from {src_dir_name} to {target_dir_name}")

def main():
    # Kita pindahkan data class 1, 2, 3, 4 dari test/valid ke train
    # Agar data training tidak kosong untuk class tersebut
    move_files("test", "train", [1, 2, 3, 4])
    move_files("valid", "train", [1, 2, 3, 4])
    print("\n🚀 Rebalancing Selesai! Sekarang folder 'train' sudah memiliki data untuk semua class.")

if __name__ == "__main__":
    main()
