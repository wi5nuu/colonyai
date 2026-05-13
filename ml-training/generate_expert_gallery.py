import os
from ultralytics import YOLO
import cv2
from pathlib import Path

MODEL_PATH = r'D:\lombapuai\backend\models\colony_best.pt'
DATASET_DIR = r'D:\lombapuai\ml-training\datasets\roboflow\agar_converted\train'
OUTPUT_DIR = r'D:\lombapuai\ml-training\test_expert_samples'

CLASSES = {0: 'single', 1: 'merged', 2: 'bubble', 3: 'dust', 4: 'crack'}

def generate_expert_gallery():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    model = YOLO(MODEL_PATH)
    
    samples = {} # class_id -> img_path
    
    label_files = list(Path(DATASET_DIR).joinpath('labels').glob('*.txt'))
    for lb in label_files:
        with open(lb, 'r') as f:
            lines = f.readlines()
            for line in lines:
                c = int(line.split()[0])
                if c not in samples:
                    img_path = Path(DATASET_DIR).joinpath('images', lb.stem + '.jpg')
                    if img_path.exists():
                        samples[c] = img_path
        if len(samples) == 5: break

    print(f"Testing on {len(samples)} expert classes...")
    for cls_id, img_path in samples.items():
        cls_name = CLASSES[cls_id]
        results = model(img_path, conf=0.15)
        res_plot = results[0].plot()
        
        cv2.putText(res_plot, f"EXPERT TEST: {cls_name.upper()}", (20, 50), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 0, 255), 3)
        
        out_path = os.path.join(OUTPUT_DIR, f"expert_{cls_name}.jpg")
        cv2.imwrite(out_path, res_plot)
        print(f"  Result saved: {out_path}")

if __name__ == "__main__":
    generate_expert_gallery()
