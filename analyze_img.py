import cv2
import os

img_path = 'backend/casseforcompetetions.png'
if os.path.exists(img_path):
    img = cv2.imread(img_path)
    print(f"Image size: {img.shape[1]}x{img.shape[0]}")
    print(f"File: {img_path}")
else:
    print("File not found")
