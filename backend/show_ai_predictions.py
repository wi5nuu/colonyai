# -*- coding: utf-8 -*-
"""
Tampilkan PREDIKSI NYATA dari AI model v7 (bukan ground truth),
dibandingkan dengan gambar aslinya.
"""
import os
import cv2
import sys
import numpy as np

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.services.colony_detector import ColonyDetector

OUTPUT_DIR = r"D:\lombapuai\backend\class_previews\ai_predict"
os.makedirs(OUTPUT_DIR, exist_ok=True)

CLASSES = {
    "colony_single": {"color": (50, 200, 50),   "label": "Colony Single"},
    "colony_merged": {"color": (0, 200, 255),   "label": "Colony Merged"},
    "bubble":        {"color": (30, 80, 255),   "label": "Bubble"},
    "dust_debris":   {"color": (0, 140, 255),   "label": "Dust/Debris"},
    "media_crack":   {"color": (200, 0, 200),   "label": "Media Crack"},
}

# 5 gambar bersih yang representatif (pilih manual)
TEST_IMAGES = [
    r"D:\lombapuai\ml-training\datasets\colony_dataset\valid\images\conteo_cell202404012-28-12_png.rf.336b65188af64662d0774387d4a63ff6.jpg",
    r"D:\lombapuai\ml-training\datasets\colony_dataset\valid\images\bubble_image_1_166_jpg.rf.b9dbc9db0e99547a415233834b1d97c1.jpg",
    r"D:\lombapuai\ml-training\datasets\colony_dataset\valid\images\newcolony_13022_jpg.rf.325e3c9b9cd4923ecb9694948fa0aece.jpg",
    r"D:\lombapuai\ml-training\datasets\colony_dataset\valid\images\newcolony_3668_jpg.rf.3767e4cf751112d210633219b1033dc0.jpg",
    r"D:\lombapuai\ml-training\datasets\colony_dataset\valid\images\IMG_1701_JPG_jpg.rf.02902a7e949baf23d57091bfd8ca259b.jpg",
]

def draw_predictions(img, detections, conf_threshold=0.25):
    h, w = img.shape[:2]
    for det in detections:
        cls_name = det["class_name"]
        conf = det["confidence"]
        if conf < conf_threshold:
            continue
        
        info = CLASSES.get(cls_name, {"color": (200,200,200), "label": cls_name})
        color = info["color"]
        
        bbox = det["bbox"]
        x1 = int(bbox["x"])
        y1 = int(bbox["y"])
        x2 = int(bbox["x"] + bbox["width"])
        y2 = int(bbox["y"] + bbox["height"])
        
        # Box
        cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)
        
        # Label with confidence
        text = f"{info['label']} {conf:.0%}"
        (tw, th), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
        cv2.rectangle(img, (x1, y1 - th - 6), (x1 + tw + 4, y1), color, -1)
        cv2.putText(img, text, (x1 + 2, y1 - 3),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255,255,255), 1)
    return img


def main():
    print("Loading ColonyDetector (v7 model)...")
    detector = ColonyDetector()
    
    panels = []
    
    for i, img_path in enumerate(TEST_IMAGES):
        if not os.path.exists(img_path):
            print(f"  [SKIP] {os.path.basename(img_path)} - not found")
            continue
        
        img_bgr = cv2.imread(img_path)
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        
        # Run AI inference
        detections = detector.detect(img_rgb, confidence_override=0.25)
        summary = detector.get_detection_summary(detections)
        
        # Draw predictions on copy
        result_img = img_bgr.copy()
        draw_predictions(result_img, detections, conf_threshold=0.25)
        
        # Stats bar
        total = sum(summary.values())
        fname = os.path.basename(img_path)[:40]
        stats = (f"colony_single:{summary.get('colony_single',0)}  "
                 f"merged:{summary.get('colony_merged',0)}  "
                 f"bubble:{summary.get('bubble',0)}  "
                 f"dust:{summary.get('dust_debris',0)}  "
                 f"crack:{summary.get('media_crack',0)}  "
                 f"| TOTAL:{total}")
        
        print(f"  Image {i+1}: {fname}")
        print(f"    -> {stats}")
        
        # Resize
        max_h = 800
        scale = min(max_h / result_img.shape[0], 1200 / result_img.shape[1])
        disp = cv2.resize(result_img, 
                          (int(result_img.shape[1]*scale), int(result_img.shape[0]*scale)))
        
        # Info bar
        bar = np.zeros((55, disp.shape[1], 3), dtype=np.uint8)
        cv2.rectangle(bar, (0,0), (disp.shape[1], 55), (25,25,25), -1)
        cv2.putText(bar, f"AI PREDICTION #{i+1}: {fname}", 
                   (8, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200,200,200), 1)
        cv2.putText(bar, stats,
                   (8, 44), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (100,255,100), 1)
        
        panel = np.vstack([disp, bar])
        
        out = os.path.join(OUTPUT_DIR, f"ai_pred_{i+1}.jpg")
        cv2.imwrite(out, panel)
        panels.append(panel)
    
    if not panels:
        print("[ERROR] Tidak ada gambar yang bisa diproses.")
        return
    
    # Save individual panels
    for idx, panel in enumerate(panels):
        out = os.path.join(OUTPUT_DIR, f"ai_pred_{idx+1}.jpg")
        cv2.imwrite(out, panel)
    
    print(f"\n[DONE] Saved {len(panels)} AI prediction images to:")
    print(f"  {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
