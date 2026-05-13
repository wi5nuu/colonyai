import os
from ultralytics import YOLO
import cv2
import json

# Paths
MODEL_PATH = r"D:\lombapuai\backend\models\colony_best.pt"
TEST_IMAGES_DIR = r"D:\lombapuai\ml-training\datasets\colony_dataset\test\images"

# Target classes mapping (from our project config)
CLASS_NAMES = {
    0: "colony_single",
    1: "colony_merged",
    2: "bubble",
    3: "dust_debris",
    4: "media_crack"
}

def test_inference():
    print(f"Loading model: {MODEL_PATH}")
    if not os.path.exists(MODEL_PATH):
        print("Error: Model weights not found!")
        return

    model = YOLO(MODEL_PATH)
    
    # Pick a few representative images
    test_files = [
        "bubble_162_png.rf.f4e3e1e53356d5e6807c1ec53787bc5d.jpg",
        "newcolony_10004_jpg.rf.28a9ef6562e2439c38bc1ebb83ee94cc.jpg",
        "10_JPG_jpg.rf.0166ebd65ca7c3ed8c9c5c833f74ee2b.jpg",
        "bubble_image_1_174_jpg.rf.4cded4fc45b9d2683b00b6a567b5a028.jpg"
    ]

    results_summary = {}

    for filename in test_files:
        img_path = os.path.join(TEST_IMAGES_DIR, filename)
        if not os.path.exists(img_path):
            print(f"Skipping {filename}, file not found.")
            continue

        print(f"\nProcessing: {filename}")
        results = model(img_path, conf=0.25, verbose=False)
        
        counts = {name: 0 for name in CLASS_NAMES.values()}
        
        for result in results:
            boxes = result.boxes
            for box in boxes:
                cls_id = int(box.cls[0])
                class_name = CLASS_NAMES.get(cls_id, f"unknown_{cls_id}")
                counts[class_name] += 1
        
        results_summary[filename] = counts
        print(f"Detections: {counts}")

    print("\n" + "="*30)
    print("FINAL 5-CLASS TEST SUMMARY")
    print("="*30)
    print(json.dumps(results_summary, indent=4))

if __name__ == "__main__":
    test_inference()
