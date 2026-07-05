$modelPath = "D:\lombapuai\backend\models\colony_best_new.pt"
$testDir = "D:\lombapuai\audit_visuals\5class_test"

python -c @"
import warnings; warnings.filterwarnings('ignore')
import os
os.environ['CUDA_MODULE_LOADING'] = 'LAZY'
from ultralytics import YOLO
import json

model = YOLO(r'$modelPath')
CLASS_NAMES = ['colony_single', 'colony_merged', 'bubble', 'dust_debris', 'media_crack']

test_files = [
    (r'$testDir\test_colony_single.jpg', 'colony_single'),
    (r'$testDir\test_colony_merged.jpg', 'colony_merged'),
    (r'$testDir\test_bubble.jpg', 'bubble'),
    (r'$testDir\test_dust_debris.jpg', 'dust_debris'),
    (r'$testDir\test_media_crack.jpg', 'media_crack'),
]

for img_path, expected_class in test_files:
    if not os.path.exists(img_path):
        print(f'[SKIP] {expected_class}: file not found')
        continue
    results = model(img_path, conf=0.15, iou=0.45, imgsz=640, device=0, verbose=False)
    r = results[0]
    boxes = r.boxes
    print(f'\n=== {expected_class.upper()} ===')
    print(f'  Image: {os.path.basename(img_path)}')
    if boxes is None or len(boxes) == 0:
        print(f'  No detections')
        continue
    detections = []
    for i in range(len(boxes)):
        cls_id = int(boxes.cls[i].item())
        conf = boxes.conf[i].item()
        cls_name = CLASS_NAMES[cls_id] if cls_id < len(CLASS_NAMES) else f'cls_{cls_id}'
        detections.append({'class': cls_name, 'conf': f'{conf:.2%}'})
    # Count per class
    from collections import Counter
    counts = Counter(d['class'] for d in detections)
    for cls_name in CLASS_NAMES:
        c = counts.get(cls_name, 0)
        if c > 0:
            max_conf = max(d['conf'] for d in detections if d['class'] == cls_name)
            print(f'  {cls_name}: {c}x (max conf: {max_conf})')
        else:
            print(f'  {cls_name}: 0')
"@ 2>&1
