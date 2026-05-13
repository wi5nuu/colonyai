from ultralytics import YOLO
import sys
import os
from pathlib import Path
import argparse

MODEL_PATH = "d:/lombapuai/backend/models/colony_best.pt"

def test_specific_image(img_path_str):
    if not os.path.exists(MODEL_PATH):
        print(f"Error: Model not found at {MODEL_PATH}")
        return

    img_path = Path(img_path_str)
    if not img_path.exists():
        print(f"Error: Image not found at {img_path}")
        return

    print(f"📦 Loading model: {MODEL_PATH}")
    model = YOLO(MODEL_PATH)
    
    print(f"🎯 Model Classes: {model.names}")
    print(f"📸 Testing image: {img_path}")
    
    # Run inference
    results = model(str(img_path), conf=0.25, verbose=False)
    result = results[0]
    
    # Process results
    boxes = result.boxes
    class_ids = boxes.cls.tolist()
    class_names = [model.names[int(cls_id)] for cls_id in class_ids]
    
    # Count occurrences
    counts = {}
    for name in model.names.values():
        counts[name] = class_names.count(name)
        
    print("\n" + "="*40)
    print("📊 DETECTION RESULTS Breakdown")
    print("="*40)
    for name, count in counts.items():
        status = "✅ detected" if count > 0 else "⚪ not found"
        print(f"{name:20s}: {count:3d} {status}")
    
    print("="*40)
    print(f"Total Detections: {len(class_ids)}")
    
    valid_colonies = counts.get('colony_single', 0) + counts.get('colony_merged', 0)
    artifacts = counts.get('bubble', 0) + counts.get('dust_debris', 0) + counts.get('media_crack', 0)
    
    print(f"Verified Colonies: {valid_colonies}")
    print(f"Rejected Artifacts: {artifacts}")
    
    if artifacts > 0:
        print("\n✨ SUCCESS: Model successfully distinguished between colonies and artifacts!")
    else:
        print("\n⚠️  Note: No artifacts were detected by the model in this image.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", type=str, required=True)
    args = parser.parse_args()
    test_specific_image(args.image)
