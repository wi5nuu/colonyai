import os
import cv2
import glob
import numpy as np
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.services.colony_detector import ColonyDetector

def find_image_with_class(label_dir, class_id):
    # Cari file txt yang memiliki class_id di awal baris
    for txt_file in glob.glob(os.path.join(label_dir, "*.txt")):
        with open(txt_file, 'r') as f:
            for line in f:
                if line.startswith(str(class_id) + " "):
                    # Return the corresponding image path
                    # Dataset structure usually has labels/ and images/
                    img_file = txt_file.replace('labels', 'images').replace('.txt', '.jpg')
                    if os.path.exists(img_file):
                        return img_file
    return None

def create_and_test():
    base_dir = r"d:\lombapuai\ml-training\datasets\colony_dataset\valid"
    label_dir = os.path.join(base_dir, "labels")
    
    print("Mencari gambar untuk masing-masing 5 class di dataset...")
    img_single = find_image_with_class(label_dir, 0)
    img_merged = find_image_with_class(label_dir, 1)
    img_bubble = find_image_with_class(label_dir, 2)
    img_dust = find_image_with_class(label_dir, 3)
    img_crack = find_image_with_class(label_dir, 4)
    
    images = [img_single, img_merged, img_bubble, img_dust, img_crack]
    
    # Read and resize all to 500x500
    mats = []
    for img_path in images:
        if img_path and os.path.exists(img_path):
            img = cv2.imread(img_path)
            img = cv2.resize(img, (500, 500))
            mats.append(img)
        else:
            # Empty black image if not found
            mats.append(np.zeros((500, 500, 3), dtype=np.uint8))
            
    # Create a composite image (2x3 grid)
    row1 = np.hstack((mats[0], mats[1], mats[2]))
    row2 = np.hstack((mats[3], mats[4], np.zeros((500, 500, 3), dtype=np.uint8)))
    composite = np.vstack((row1, row2))
    
    comp_path = r"d:\lombapuai\backend\composite_test.jpg"
    cv2.imwrite(comp_path, composite)
    print(f"Gambar komposit 5-class berhasil dibuat di {comp_path}")
    
    print("\nMenjalankan inferensi YOLOv8 v7 pada gambar komposit...")
    detector = ColonyDetector()
    
    # Preprocess
    comp_rgb = cv2.cvtColor(composite, cv2.COLOR_BGR2RGB)
    detections = detector.detect(comp_rgb, confidence_override=0.15)
    
    summary = detector.get_detection_summary(detections)
    
    print("\n--- HASIL DETEKSI (GAMBAR KOMPOSIT 5 CLASS) ---")
    print(f"Valid Colonies:")
    print(f"  - colony_single : {summary.get('colony_single', 0)}")
    print(f"  - colony_merged : {summary.get('colony_merged', 0)}")
    print(f"")
    print(f"Artifacts (Prioritas):")
    print(f"  - bubble        : {summary.get('bubble', 0)}")
    print(f"  - dust_debris   : {summary.get('dust_debris', 0)}")
    print(f"  - media_crack   : {summary.get('media_crack', 0)}")
    print("-----------------------------------------------")

if __name__ == "__main__":
    create_and_test()
