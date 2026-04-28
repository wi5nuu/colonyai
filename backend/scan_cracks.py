import os
import glob
import cv2
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.services.colony_detector import ColonyDetector

detector = ColonyDetector()
imgs = glob.glob(r'd:\lombapuai\ml-training\datasets\colony_dataset\valid\images\*.jpg')

print(f"Scanning {len(imgs)} images for media_crack at 0.05 confidence...")

for i in imgs:
    img = cv2.imread(i)
    if img is None: continue
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    res = detector.get_detection_summary(detector.detect(rgb, confidence_override=0.05))
    
    if res.get('media_crack', 0) > 0:
        print(f"Found crack in: {i} count: {res['media_crack']}")
        break
else:
    print("No media_crack detected in the entire valid set at 0.05 confidence.")
