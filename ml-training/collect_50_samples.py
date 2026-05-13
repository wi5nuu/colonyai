import os
import shutil
from pathlib import Path

# Config
DATASET_DIR = r'D:\lombapuai\ml-training\datasets\roboflow\agar_converted\train'
TARGET_DIR = r'D:\lombapuai\frontend\public\samples'
os.makedirs(TARGET_DIR, exist_ok=True)

def collect_50_samples():
    print("Collecting 50 diverse samples...")
    images = list(Path(DATASET_DIR).joinpath('images').glob('*.jpg'))
    
    # Ambil 50 gambar pertama
    count = 0
    for img in images[:50]:
        target_name = f"sample_{count + 1}.jpg"
        shutil.copy(img, os.path.join(TARGET_DIR, target_name))
        count += 1
    
    print(f"Successfully copied {count} samples to {TARGET_DIR}")

if __name__ == "__main__":
    collect_50_samples()
