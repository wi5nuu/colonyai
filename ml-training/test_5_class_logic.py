import os
import cv2
from ultralytics import YOLO
from pathlib import Path

# Path Model Backend yang sekarang dipakai
MODEL_PATH = r'D:\lombapuai\backend\models\colony_best.pt'
TEST_IMAGE_DIR = r'D:\lombapuai\ml-training\datasets\colony_dataset\test\images'
TEST_LABEL_DIR = r'D:\lombapuai\ml-training\datasets\colony_dataset\test\labels'
OUTPUT_DIR = r'D:\lombapuai\ml-training\test_results_5_class'

# Mapping Class
CLASSES = {0: 'single', 1: 'merged', 2: 'bubble', 3: 'dust', 4: 'crack'}

def run_test():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    model = YOLO(MODEL_PATH)
    
    # Cari gambar per kategori kelas agar semua kelas muncul
    target_images = []
    found_classes = set()
    
    for label_file in Path(TEST_LABEL_DIR).glob('*.txt'):
        with open(label_file, 'r') as f:
            classes_in_img = set([int(line.split()[0]) for line in f.readlines()])
            
            # Ambil gambar jika mengandung kelas yang belum kita punya sampelnya
            if not classes_in_img.issubset(found_classes) or len(target_images) < 10:
                img_path = Path(TEST_IMAGE_DIR) / (label_file.stem + '.jpg')
                if img_path.exists():
                    target_images.append(img_path)
                    found_classes.update(classes_in_img)
        
        if len(found_classes) == 5 and len(target_images) >= 10:
            break

    print(f"Testing on {len(target_images)} complex images...")
    
    for i, img_path in enumerate(target_images):
        results = model(img_path, conf=0.15) # Confidence rendah dulu biar kelihatan deteksinya
        res_plot = results[0].plot()
        
        # Save result
        out_path = os.path.join(OUTPUT_DIR, f"test_complex_{i+1}.jpg")
        cv2.imwrite(out_path, res_plot)
        
        # Print info class apa saja yang terdeteksi
        detected_classes = [CLASSES[int(box.cls)] for box in results[0].boxes]
        print(f"Image {i+1} ({img_path.name}): Detected -> {set(detected_classes)}")

if __name__ == "__main__":
    run_test()
