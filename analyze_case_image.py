import cv2
import numpy as np

img = cv2.imread('D:/lombapuai/backend/casseforcompetetions.png')
h, w = img.shape[:2]
print(f'Size: {w}x{h}')

gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
print(f'Mean brightness: {gray.mean():.1f} (255=white)')
print(f'White pixels: {(np.sum(gray > 200) / (h*w) * 100):.1f}%')
print(f'Dark pixels: {(np.sum(gray < 50) / (h*w) * 100):.1f}%')

# Check dominant colors
print(f'Mean BGR: {img.mean(axis=(0,1))}')
