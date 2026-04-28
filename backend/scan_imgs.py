import os
import glob
import cv2
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.services.colony_detector import ColonyDetector

detector = ColonyDetector()
imgs = glob.glob(r'd:\lombapuai\ml-training\datasets\colony_dataset\valid\images\*.jpg')

found_d = False
found_c = False
d_img = ''
c_img = ''

for i in imgs:
    img = cv2.imread(i)
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    res = detector.get_detection_summary(detector.detect(rgb, confidence_override=0.15))
    
    if not found_d and res.get('dust_debris', 0) > 0:
        found_d = True
        d_img = i
        print('Found dust:', i)
    if not found_c and res.get('media_crack', 0) > 0:
        found_c = True
        c_img = i
        print('Found crack:', i)
        
    if found_d and found_c:
        break

print('Final Dust pred:', d_img)
print('Final Crack pred:', c_img)
