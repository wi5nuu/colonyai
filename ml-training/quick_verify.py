import os
from ultralytics import YOLO

MODEL_PATH = r"D:\lombapuai\backend\models\colony_best.pt"
IMG_PATH = r"D:\lombapuai\ml-training\datasets\colony_dataset\test\images\newcolony_1000_jpg.rf.bd4933c85d221ec88d93592f8184989c.jpg"

def quick_test():
    if not os.path.exists(MODEL_PATH):
        print("Model not found")
        return
    
    model = YOLO(MODEL_PATH)
    results = model(IMG_PATH, conf=0.25, verbose=False)
    
    print(f"\n--- Inference Results for newcolony_1000 ---")
    print(f"Model Classes: {model.names}")
    
    detections = results[0].boxes
    print(f"Total Detections: {len(detections)}")
    
    for i, box in enumerate(detections):
        cls_id = int(box.cls[0])
        conf = float(box.conf[0])
        name = model.names[cls_id]
        print(f"Det {i+1}: {name} ({cls_id}) - Conf: {conf:.2f}")

if __name__ == "__main__":
    quick_test()
