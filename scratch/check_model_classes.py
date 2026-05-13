from ultralytics import YOLO
import os

model_path = r"d:\lombapuai\backend\models\colony_best.pt"
if os.path.exists(model_path):
    model = YOLO(model_path)
    print(f"Model Names: {model.names}")
    print(f"Number of classes: {len(model.names)}")
else:
    print(f"Model not found at {model_path}")
