import os
import cv2
import glob
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.services.colony_detector import ColonyDetector

def find_image_with_class(label_dir, class_id):
    for txt_file in glob.glob(os.path.join(label_dir, "*.txt")):
        with open(txt_file, 'r') as f:
            for line in f:
                if line.startswith(str(class_id) + " "):
                    img_file = txt_file.replace('labels', 'images').replace('.txt', '.jpg')
                    if os.path.exists(img_file):
                        return img_file
    return None

def test_all():
    base_dir = r"d:\lombapuai\ml-training\datasets\colony_dataset\valid"
    label_dir = os.path.join(base_dir, "labels")
    
    img_single = find_image_with_class(label_dir, 0)
    img_merged = find_image_with_class(label_dir, 1)
    img_bubble = find_image_with_class(label_dir, 2)
    img_dust = find_image_with_class(label_dir, 3)
    img_crack = find_image_with_class(label_dir, 4)
    
    images = [img_single, img_merged, img_bubble, img_dust, img_crack]
    
    detector = ColonyDetector()
    
    total_summary = {
        'colony_single': 0,
        'colony_merged': 0,
        'bubble': 0,
        'dust_debris': 0,
        'media_crack': 0
    }
    
    for img_path in images:
        if img_path and os.path.exists(img_path):
            img = cv2.imread(img_path)
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            detections = detector.detect(img_rgb, confidence_override=0.15)
            
            for d in detections:
                cls_name = d['class_name']
                if cls_name in total_summary:
                    total_summary[cls_name] += 1
                    
    print("\n=== MENGUJI 5 GAMBAR UJI BERBEDA UNTUK MASING-MASING CLASS ===")
    print("\n--- TOTAL HASIL DETEKSI GABUNGAN (5 CLASS) ---")
    print(f"Valid Colonies (Hitungan CFU):")
    print(f"  - colony_single : {total_summary['colony_single']}")
    print(f"  - colony_merged : {total_summary['colony_merged']}")
    print(f"")
    print(f"Artifacts (Prioritas untuk disaring):")
    print(f"  - bubble        : {total_summary['bubble']}")
    print(f"  - dust_debris   : {total_summary['dust_debris']}")
    print(f"  - media_crack   : {total_summary['media_crack']}")
    print("----------------------------------------------")

if __name__ == "__main__":
    test_all()
