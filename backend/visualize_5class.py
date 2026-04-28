# -*- coding: utf-8 -*-
"""
Buat gambar visual nyata: 5 gambar berbeda (satu per class),
dengan bounding box dari LABEL asli (ground truth), disimpan ke output.
"""
import os
import cv2
import glob
import numpy as np
from pathlib import Path

DATASET_DIR = r"D:\lombapuai\ml-training\datasets\colony_dataset\valid"
IMG_DIR = os.path.join(DATASET_DIR, "images")
LBL_DIR = os.path.join(DATASET_DIR, "labels")

OUTPUT_DIR = r"D:\lombapuai\backend\class_previews"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Class definitions
CLASSES = {
    0: {"name": "Colony Single",  "color": (50, 205, 50)},    # Green
    1: {"name": "Colony Merged",  "color": (0, 215, 255)},    # Gold
    2: {"name": "Bubble",         "color": (0, 70, 255)},     # Red
    3: {"name": "Dust / Debris",  "color": (0, 140, 255)},    # Orange
    4: {"name": "Media Crack",    "color": (220, 0, 220)},    # Purple
}

def draw_labels_on_image(img, label_path, target_class=None, draw_all=False):
    h, w = img.shape[:2]
    found = False
    with open(label_path) as f:
        for line in f:
            parts = line.strip().split()
            if len(parts) < 5:
                continue
            cls_id = int(parts[0])
            cx, cy, bw, bh = float(parts[1]), float(parts[2]), float(parts[3]), float(parts[4])

            # Filter: only draw target class (highlight) or all
            if not draw_all and target_class is not None and cls_id != target_class:
                # Draw others lightly
                color = tuple(max(0, c - 100) for c in CLASSES.get(cls_id, {"color": (100,100,100)})["color"])
                thickness = 1
                alpha = 0.3
            else:
                color = CLASSES.get(cls_id, {"color": (200,200,200)})["color"]
                thickness = 3
                alpha = 1.0
                if cls_id == target_class:
                    found = True

            x1 = int((cx - bw / 2) * w)
            y1 = int((cy - bh / 2) * h)
            x2 = int((cx + bw / 2) * w)
            y2 = int((cy + bh / 2) * h)
            
            cv2.rectangle(img, (x1, y1), (x2, y2), color, thickness)
            
            if cls_id == target_class or draw_all:
                label = CLASSES.get(cls_id, {"name": str(cls_id)})["name"]
                (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.55, 2)
                cv2.rectangle(img, (x1, y1 - th - 8), (x1 + tw + 6, y1), color, -1)
                cv2.putText(img, label, (x1 + 3, y1 - 4),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 2)
    return img, found


def find_best_image(target_class, min_boxes=3):
    """Find image with the most boxes of target_class."""
    best_path = None
    best_lbl = None
    best_count = 0
    
    for lbl_path in Path(LBL_DIR).glob("*.txt"):
        count = 0
        with open(lbl_path) as f:
            for line in f:
                parts = line.strip().split()
                if parts and int(parts[0]) == target_class:
                    count += 1
        if count > best_count:
            img_path = str(lbl_path).replace("labels", "images").replace(".txt", ".jpg")
            if os.path.exists(img_path):
                best_count = count
                best_path = img_path
                best_lbl = str(lbl_path)
    
    return best_path, best_lbl, best_count


def main():
    print("Mencari gambar terbaik untuk masing-masing 5 class...")
    previews = []

    for cls_id in range(5):
        cls_info = CLASSES[cls_id]
        img_path, lbl_path, count = find_best_image(cls_id)
        
        if not img_path:
            print(f"  [X] Class {cls_id} ({cls_info['name']}): Tidak ada gambar ditemukan!")
            # Create empty black card
            card = np.zeros((480, 640, 3), dtype=np.uint8)
            cv2.putText(card, f"NO IMAGE FOUND", (80, 220), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1.0, (100,100,100), 2)
        else:
            print(f"  [OK] Class {cls_id} ({cls_info['name']}): {count} boxes -- {os.path.basename(img_path)}")
            img = cv2.imread(img_path)
            img, _ = draw_labels_on_image(img, lbl_path, target_class=cls_id)
            
            # Resize to fixed height
            target_h = 640
            scale = target_h / img.shape[0]
            new_w = int(img.shape[1] * scale)
            card = cv2.resize(img, (new_w, target_h))

        # Add header banner
        banner_h = 50
        banner = np.zeros((banner_h, card.shape[1], 3), dtype=np.uint8)
        cv2.rectangle(banner, (0, 0), (banner.shape[1], banner_h), cls_info["color"], -1)
        
        cls_num = f"CLASS {cls_id}"
        cls_name = cls_info["name"].upper()
        cv2.putText(banner, f"{cls_num}: {cls_name}", (10, 34),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 255), 2)
        
        final_card = np.vstack([banner, card])
        
        # Save individual class preview
        out_path = os.path.join(OUTPUT_DIR, f"class_{cls_id}_{cls_info['name'].replace(' ', '_').lower()}.jpg")
        cv2.imwrite(out_path, final_card)
        previews.append(final_card)
        print(f"     → Saved: {out_path}")

    # === Create composite 5-class grid ===
    # Make all cards same width (use narrowest)
    min_w = min(p.shape[1] for p in previews)
    resized = [cv2.resize(p, (min_w, p.shape[0])) for p in previews]

    # 2 rows: [0, 1, 2] and [3, 4, blank]
    r1 = np.hstack(resized[:3])
    
    blank = np.zeros_like(resized[0])
    r2 = np.hstack(resized[3:] + [blank])
    
    # Make same width
    max_w = max(r1.shape[1], r2.shape[1])
    def pad_width(img, target_w):
        if img.shape[1] < target_w:
            pad = np.zeros((img.shape[0], target_w - img.shape[1], 3), dtype=np.uint8)
            return np.hstack([img, pad])
        return img
    
    r1 = pad_width(r1, max_w)
    r2 = pad_width(r2, max_w)

    # Title bar
    title_bar = np.zeros((70, max_w, 3), dtype=np.uint8)
    cv2.rectangle(title_bar, (0, 0), (max_w, 70), (30, 30, 30), -1)
    cv2.putText(title_bar, "ColonyAI v7 - 5 Class Detection (Ground Truth Labels)", 
                (20, 45), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 255), 2)

    composite = np.vstack([title_bar, r1, r2])
    
    composite_path = os.path.join(OUTPUT_DIR, "5class_composite.jpg")
    cv2.imwrite(composite_path, composite)
    
    print(f"\n[DONE] Gambar komposit 5 class selesai!")
    print(f"   → {composite_path}")
    print(f"\nBuka folder: {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
