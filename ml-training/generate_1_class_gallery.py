import os
import cv2
from ultralytics import YOLO
from pathlib import Path

MODEL_PATH = r'D:\lombapuai\backend\models\colony_best.pt'
TRAIN_IMAGE_DIR = r'D:\lombapuai\ml-training\datasets\colony_dataset\train\images'
TRAIN_LABEL_DIR = r'D:\lombapuai\ml-training\datasets\colony_dataset\train\labels'
OUTPUT_DIR = r'D:\lombapuai\ml-training\test_1_class_1_image'

CLASSES = {0: 'single', 1: 'merged', 2: 'bubble', 3: 'dust', 4: 'crack'}

def generate_gallery():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    model = YOLO(MODEL_PATH)
    
    # Cari 1 contoh terbaik untuk tiap kelas (kecuali merged)
    samples = {} # class_id -> img_path
    
    for label_file in Path(TRAIN_LABEL_DIR).glob('*.txt'):
        with open(label_file, 'r') as f:
            lines = f.readlines()
            if not lines: continue
            
            # Hitung kelas terbanyak di gambar ini
            class_counts = {}
            for line in lines:
                c = int(line.split()[0])
                class_counts[c] = class_counts.get(c, 0) + 1
            
            # Cari kelas yang dominan
            dominant_class = max(class_counts, key=class_counts.get)
            
            if dominant_class not in samples:
                img_path = Path(TRAIN_IMAGE_DIR) / (label_file.stem + '.jpg')
                if img_path.exists():
                    samples[dominant_class] = img_path
        
        if len(samples) >= 4: break # Kita cari 4 yang tersedia saja

    print(f"Generating gallery for {len(samples)} classes...")
    for cls_id, img_path in samples.items():
        cls_name = CLASSES[cls_id]
        results = model(img_path, conf=0.15)
        res_plot = results[0].plot()
        
        # Tambahkan teks besar di atas gambar
        cv2.putText(res_plot, f"TARGET CLASS: {cls_name.upper()}", (20, 50), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 255), 3)
        
        out_path = os.path.join(OUTPUT_DIR, f"pure_class_{cls_name}.jpg")
        cv2.imwrite(out_path, res_plot)
        print(f"  Saved result for class: {cls_name}")

if __name__ == "__main__":
    generate_gallery()
