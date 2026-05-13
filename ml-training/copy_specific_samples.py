import shutil
import os
from pathlib import Path

# Paths source yang Anda berikan
SOURCE_BUBBLE = r'D:\lombapuai\ml-training\datasets\roboflow\bubble_haldia\train\images\frame_0000_jpg.rf.1f0fb284485f3b8f46f949d1241492f7.jpg'
SOURCE_CRACK = r'D:\lombapuai\ml-training\datasets\roboflow\crack_tuandung\test\images\crack-100-_jpg.rf.7ad9f17d7f1da98b851bee11c4c2a238.jpg'
SOURCE_MERGED = r'D:\lombapuai\ml-training\datasets\Conteo-de-colonias-PF-1\valid\20131113_132558_jpg.rf.c7073ebf352dd80b056064cad18b0551.jpg'

# Target folder
TARGET_DIR = r'D:\lombapuai\frontend\public\samples'
os.makedirs(TARGET_DIR, exist_ok=True)

def copy_specific_samples():
    try:
        shutil.copy(SOURCE_BUBBLE, os.path.join(TARGET_DIR, 'bubble.jpg'))
        print("Copied high-quality Bubble sample.")
        
        shutil.copy(SOURCE_CRACK, os.path.join(TARGET_DIR, 'crack.jpg'))
        print("Copied high-quality Crack sample.")
        
        shutil.copy(SOURCE_MERGED, os.path.join(TARGET_DIR, 'merged.jpg'))
        print("Copied high-quality Merged sample.")
        
        print("\nAll samples updated successfully!")
    except Exception as e:
        print(f"Error copying files: {e}")

if __name__ == "__main__":
    copy_specific_samples()
