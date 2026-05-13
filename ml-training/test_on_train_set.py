import os
import cv2
from ultralytics import YOLO
from pathlib import Path

MODEL_PATH = r'D:\lombapuai\backend\models\colony_best.pt'
TRAIN_IMAGE_DIR = r'D:\lombapuai\ml-training\datasets\colony_dataset\train\images'
TRAIN_LABEL_DIR = r'D:\lombapuai\ml-training\datasets\colony_dataset\train\labels'
OUTPUT_DIR = r'D:\lombapuai\ml-training\test_artifact_results'

CLASSES = {0: 'single', 1: 'merged', 2: 'bubble', 3: 'dust', 4: 'crack'}

def run_artifact_test():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        
    model = YOLO(MODEL_PATH)
    
    # Cari gambar di TRAIN yang ada Bubble, Dust, atau Crack (ID 2, 3, 4)
    found_images = []
    for label_file in Path(TRAIN_LABEL_DIR).glob('*.txt'):
        with open(label_file, 'r') as f:
            lines = f.readlines()
            classes = set([int(line.split()[0]) for line in lines])
            if any(c in [2, 3, 4] for c in classes): # Cari yang ada Artifact
                img_path = Path(TRAIN_IMAGE_DIR) / (label_file.stem + '.jpg')
                if img_path.exists():
                    found_images.append((img_path, classes))
        if len(found_images) >= 5: break

    if not found_images:
        print("Pencarian selesai: Tidak menemukan gambar dengan label artifact di folder train.")
        return

    print(f"Testing on {len(found_images)} images from TRAIN containing artifacts...")
    for i, (img_path, labels) in enumerate(found_images):
        results = model(img_path, conf=0.15)
        res_plot = results[0].plot()
        
        out_path = os.path.join(OUTPUT_DIR, f"train_test_{i+1}.jpg")
        cv2.imwrite(out_path, res_plot)
        
        expected = [CLASSES[c] for c in labels]
        detected = [CLASSES[int(box.cls)] for box in results[0].boxes]
        print(f"Sample {i+1} ({img_path.name}): Seharusnya -> {expected} | AI Mendeteksi -> {set(detected)}")

if __name__ == "__main__":
    run_artifact_test()
