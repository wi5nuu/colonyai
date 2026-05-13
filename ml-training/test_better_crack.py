import os
from ultralytics import YOLO
import cv2
from pathlib import Path

MODEL_PATH = r'D:\lombapuai\backend\models\colony_best.pt'
CRACK_DIR = r'D:\lombapuai\ml-training\datasets\roboflow\crack_raimundo\train'
OUTPUT_DIR = r'D:\lombapuai\ml-training\test_better_samples'

os.makedirs(OUTPUT_DIR, exist_ok=True)
model = YOLO(MODEL_PATH)

def test_crack():
    print("Searching for a clear crack image...")
    # Ambil label pertama yang tidak kosong
    label_files = list(Path(CRACK_DIR).joinpath('labels').glob('*.txt'))
    for lb in label_files:
        with open(lb, 'r') as f:
            if len(f.readlines()) > 0:
                img_path = Path(CRACK_DIR).joinpath('images', lb.stem + '.jpg')
                if img_path.exists():
                    print(f"Testing crack on: {img_path.name}")
                    results = model(img_path, conf=0.1)
                    res_plot = results[0].plot()
                    cv2.imwrite(os.path.join(OUTPUT_DIR, "better_crack_test.jpg"), res_plot)
                    return
    print("No crack image found.")

if __name__ == "__main__":
    test_crack()
