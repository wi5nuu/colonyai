import os
import glob
from ultralytics import YOLO
import json

# Path Configuration
MODEL_PATH = r"D:\lombapuai\backend\models\colony_best.pt"
DATASET_DIR = r"D:\lombapuai" # Search entire root to find images

print(f"Loading model: {MODEL_PATH}")
model = YOLO(MODEL_PATH)

# Categories to test
categories = {
    "bubble": ["*bubble*", "*air*"],
    "dust_debris": ["*dust*", "*debris*", "*particle*"],
    "media_crack": ["*crack*", "*line*"],
    "colony_single": ["*single*", "*colony*"],
    "colony_merged": ["*merged*", "*clump*"]
}

results_summary = {}

print("\n=== STARTING CATEGORY-SPECIFIC TEST ===\n")

for category, patterns in categories.items():
    print(f"--- Testing Category: {category} ---")
    # Find up to 2 sample images for this category
    samples = []
    for pattern in patterns:
        found = glob.glob(os.path.join(DATASET_DIR, "**", pattern + ".jpg"), recursive=True)
        samples.extend(found)
        if len(samples) >= 2: break
    
    samples = samples[:2] # Limit to 2 per category for speed
    
    if not samples:
        print(f"No samples found for {category}")
        continue
        
    category_results = []
    for img_path in samples:
        fname = os.path.basename(img_path)
        pred = model.predict(img_path, conf=0.25, verbose=False)[0]
        
        counts = {
            "colony_single": 0,
            "colony_merged": 0,
            "bubble": 0,
            "dust_debris": 0,
            "media_crack": 0
        }
        
        for box in pred.boxes:
            cls_id = int(box.cls[0])
            label = model.names[cls_id]
            counts[label] += 1
            
        print(f"File: {fname}")
        print(f"  Expected: {category}")
        print(f"  Detected: {counts}")
        category_results.append({"file": fname, "detected": counts})
    
    results_summary[category] = category_results
    print()

print("=== FINAL AUDIT REPORT ===")
print(json.dumps(results_summary, indent=4))
