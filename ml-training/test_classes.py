import os
from pathlib import Path
from ultralytics import YOLO

# Configuration
MODEL_PATH = "d:/lombapuai/backend/models/colony_best.pt"
DATASET_DIR = "d:/lombapuai/ml-training/datasets/colony_dataset/test"
CONF_THRESHOLD = 0.25

class_names = {
    0: "colony_single",
    1: "colony_merged",
    2: "bubble",
    3: "dust_debris",
    4: "media_crack"
}

def get_images_for_class(class_id, max_images=10):
    images_dir = Path(DATASET_DIR) / "images"
    labels_dir = Path(DATASET_DIR) / "labels"
    
    # fallback to valid or train if test doesn't have enough
    search_dirs = [
        "d:/lombapuai/ml-training/datasets/colony_dataset/test",
        "d:/lombapuai/ml-training/datasets/colony_dataset/valid",
        "d:/lombapuai/ml-training/datasets/colony_dataset/train",
    ]
    
    found_images = []
    
    for sdir in search_dirs:
        if len(found_images) >= max_images:
            break
        ldir = Path(sdir) / "labels"
        idir = Path(sdir) / "images"
        if not ldir.exists() or not idir.exists():
            continue
            
        for label_file in ldir.glob("*.txt"):
            if len(found_images) >= max_images:
                break
            with open(label_file, "r") as f:
                lines = f.readlines()
                has_class = any(line.startswith(f"{class_id} ") for line in lines)
                if has_class:
                    img_name = label_file.stem
                    img_path = idir / f"{img_name}.jpg"
                    if not img_path.exists():
                        img_path = idir / f"{img_name}.png"
                    if img_path.exists():
                        found_images.append(str(img_path))
    
    return found_images

def main():
    print("Loading model...")
    model = YOLO(MODEL_PATH)
    
    overall_stats = {}
    
    for class_id, class_name in class_names.items():
        print(f"\n{'='*50}")
        print(f"Testing Class {class_id}: {class_name}")
        print(f"{'='*50}")
        
        images = get_images_for_class(class_id, max_images=10)
        print(f"Found {len(images)} images for {class_name}")
        
        correct = 0
        for img_path in images:
            results = model(img_path, device='cuda:0', conf=CONF_THRESHOLD, verbose=False)
            result = results[0]
            
            # check if class_id is in predictions
            predicted_classes = [int(cls) for cls in result.boxes.cls.tolist()]
            if class_id in predicted_classes:
                correct += 1
                status = "✅ ACCURATE"
            else:
                status = "❌ MISSED"
                
            print(f"Image: {Path(img_path).name} -> {status} (Predicted: {predicted_classes})")
            
        overall_stats[class_name] = {
            "total": len(images),
            "correct": correct,
            "accuracy": (correct / len(images) * 100) if len(images) > 0 else 0
        }
        
    print(f"\n{'='*50}")
    print("OVERALL SUMMARY")
    print(f"{'='*50}")
    for cname, stats in overall_stats.items():
        print(f"{cname:15s}: {stats['correct']}/{stats['total']} ({stats['accuracy']:.2f}%)")

if __name__ == '__main__':
    main()
