from ultralytics import YOLO
import sys
import os
from pathlib import Path

MODEL_PATH = r"D:\lombapuai\ml-training\runs\detect\colony_v8_balanced\weights\best.pt"
TEST_IMG = "datasets/colony_dataset/test/images/13002_jpg.rf.92930c764be6916f3e2cce4d61858f34.jpg"

def test_single_image(img_arg=None):
    if not os.path.exists(MODEL_PATH):
        print(f"Error: Model not found at {MODEL_PATH}")
        return

    img_path_str = img_arg if img_arg else TEST_IMG

    print(f"📦 Loading model: {MODEL_PATH}")
    model = YOLO(MODEL_PATH)
    
    print(f"🎯 Model Classes: {model.names}")
    
    # Check if image exists
    img_path = Path(img_path_str)
    if not img_path.exists():
        print(f"⚠️  Image not found: {img_path_str}")
        # Try to find any image in the test directory if the specific one is missing
        test_dir = Path("datasets/colony_dataset/test/images")
        images = list(test_dir.glob("*.jpg"))
        if images:
            img_path = images[0]
            print(f"🔄 Using alternative image: {img_path}")
        else:
            print(f"Error: No images found in {test_dir}")
            return

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
    
    # Logic check for the 5 classes
    valid_colonies = counts.get('colony_single', 0) + counts.get('colony_merged', 0)
    artifacts = counts.get('bubble', 0) + counts.get('dust_debris', 0) + counts.get('media_crack', 0)
    
    print(f"Verified Colonies: {valid_colonies}")
    print(f"Rejected Artifacts: {artifacts}")
    
    if artifacts > 0:
        print("\n✨ SUCCESS: Model successfully distinguished between colonies and artifacts!")
    else:
        print("\n⚠️  Note: No artifacts were found in this specific image.")

if __name__ == "__main__":
    arg = sys.argv[1] if len(sys.argv) > 1 else None
    test_single_image(arg)
