import os
from ultralytics import YOLO
import pandas as pd
from pathlib import Path

# Paths
MODEL_PATH = r"D:\lombapuai\backend\models\colony_best.pt"
TEST_IMAGES = r"D:\lombapuai\ml-training\datasets\colony_dataset\test\images"
TEST_LABELS = r"D:\lombapuai\ml-training\datasets\colony_dataset\test\labels"

# Correct mapping from data.yaml
CLASS_NAMES = {
    0: "colony_single",
    1: "colony_merged",
    2: "bubble",
    3: "dust_debris",
    4: "media_crack"
}

def run_comprehensive_test():
    if not os.path.exists(MODEL_PATH):
        print(f"ERROR: Model not found at {MODEL_PATH}")
        return

    print(f"📦 Loading Model: {MODEL_PATH}")
    model = YOLO(MODEL_PATH)
    
    # Test on a variety of images
    image_files = list(Path(TEST_IMAGES).glob("*.jpg"))
    if not image_files:
        print("ERROR: No test images found.")
        return

    print(f"🔍 Found {len(image_files)} test images. Auditing top 20 for diverse class verification...")
    
    audit_results = []

    for img_path in image_files[:20]:
        filename = img_path.name
        label_path = Path(TEST_LABELS) / filename.replace(".jpg", ".txt")
        
        # Get Ground Truth (GT)
        gt_counts = {name: 0 for name in CLASS_NAMES.values()}
        if label_path.exists():
            with open(label_path, 'r') as f:
                for line in f:
                    parts = line.strip().split()
                    if parts:
                        cls_id = int(parts[0])
                        if cls_id in CLASS_NAMES:
                            gt_counts[CLASS_NAMES[cls_id]] += 1

        # Run AI Inference
        results = model(str(img_path), conf=0.25, verbose=False)
        ai_counts = {name: 0 for name in CLASS_NAMES.values()}
        
        for result in results:
            for box in result.boxes:
                cls_id = int(box.cls[0])
                if cls_id in CLASS_NAMES:
                    ai_counts[CLASS_NAMES[cls_id]] += 1

        # Calculate metrics
        total_gt = sum(gt_counts.values())
        total_ai = sum(ai_counts.values())
        
        # Agreement for artifacts
        gt_artifacts = gt_counts['bubble'] + gt_counts['dust_debris'] + gt_counts['media_crack']
        ai_artifacts = ai_counts['bubble'] + ai_counts['dust_debris'] + ai_counts['media_crack']
        
        audit_results.append({
            "File": filename,
            "GT_Colonies": gt_counts['colony_single'] + gt_counts['colony_merged'],
            "AI_Colonies": ai_counts['colony_single'] + ai_counts['colony_merged'],
            "GT_Artifacts": gt_artifacts,
            "AI_Artifacts": ai_artifacts,
            "Accuracy": 100 - (abs(total_gt - total_ai) / max(total_gt, 1) * 100) if total_gt > 0 else 100
        })

    df = pd.DataFrame(audit_results)
    
    print("\n" + "="*60)
    print("🚀 COLONYAI 5-CLASS ACCURACY AUDIT REPORT")
    print("="*60)
    print(df.to_string(index=False))
    
    avg_acc = df['Accuracy'].mean()
    print("\n" + "-"*60)
    print(f"AVERAGE COUNT ACCURACY: {avg_acc:.2f}%")
    print("-"*60)
    
    if avg_acc >= 92:
        print("✅ STATUS: CHAMPION-GRADE ACCURACY (Matches Proposal Target)")
    else:
        print("⚠️  STATUS: NEEDS FINE-TUNING (Below 92% target)")

if __name__ == "__main__":
    run_comprehensive_test()
