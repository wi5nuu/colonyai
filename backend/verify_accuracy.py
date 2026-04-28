# -*- coding: utf-8 -*-
"""
VERIFIKASI AKURASI: Tampilkan crop zoom-in untuk masing-masing class
agar user bisa melihat apakah bounding box benar-benar tepat pada objeknya.
"""
import os
import cv2
import numpy as np
from pathlib import Path

DATASET_DIR = r"D:\lombapuai\ml-training\datasets\colony_dataset\valid"
IMG_DIR = os.path.join(DATASET_DIR, "images")
LBL_DIR = os.path.join(DATASET_DIR, "labels")
OUTPUT_DIR = r"D:\lombapuai\backend\class_previews\verify"
os.makedirs(OUTPUT_DIR, exist_ok=True)

CLASSES = {
    0: {"name": "Colony Single",  "color": (50, 200, 50)},
    1: {"name": "Colony Merged",  "color": (0, 200, 255)},
    2: {"name": "Bubble",         "color": (30, 80, 255)},
    3: {"name": "Dust / Debris",  "color": (0, 140, 255)},
    4: {"name": "Media Crack",    "color": (200, 0, 200)},
}

def find_image_with_clear_boxes(target_class, max_boxes=20, min_boxes=3):
    """
    Cari gambar yang punya bounding box JELAS untuk class target:
    - Tidak terlalu banyak box (< max_boxes) agar tidak tumpang tindih
    - Minimal min_boxes box
    """
    best_path = None
    best_lbl = None
    best_score = 0

    for lbl_path in Path(LBL_DIR).glob("*.txt"):
        boxes_target = []
        boxes_all = []
        with open(lbl_path) as f:
            for line in f:
                parts = line.strip().split()
                if len(parts) < 5:
                    continue
                cls_id = int(parts[0])
                boxes_all.append(cls_id)
                if cls_id == target_class:
                    boxes_target.append([float(x) for x in parts[1:5]])

        count = len(boxes_target)
        if count < min_boxes or count > max_boxes:
            continue
        
        img_path = str(lbl_path).replace("labels", "images").replace(".txt", ".jpg")
        if not os.path.exists(img_path):
            continue

        # Score: prefer images where our class is dominant
        score = count / (len(boxes_all) + 1)
        if score > best_score:
            best_score = score
            best_path = img_path
            best_lbl = str(lbl_path)

    return best_path, best_lbl


def draw_clean(img_path, lbl_path, target_class):
    """Draw only target class boxes, clearly labeled."""
    img = cv2.imread(img_path)
    h, w = img.shape[:2]
    
    color = CLASSES[target_class]["color"]
    name = CLASSES[target_class]["name"]
    boxes_drawn = 0

    with open(lbl_path) as f:
        for line in f:
            parts = line.strip().split()
            if len(parts) < 5:
                continue
            cls_id = int(parts[0])
            cx, cy, bw, bh = float(parts[1]), float(parts[2]), float(parts[3]), float(parts[4])
            
            x1 = int((cx - bw/2) * w)
            y1 = int((cy - bh/2) * h)
            x2 = int((cx + bw/2) * w)
            y2 = int((cy + bh/2) * h)
            
            if cls_id == target_class:
                # Draw box with thick border
                cv2.rectangle(img, (x1, y1), (x2, y2), color, 3)
                # Corner markers for precision
                corner_len = min(20, (x2-x1)//4, (y2-y1)//4)
                for px, py in [(x1,y1), (x2,y1), (x1,y2), (x2,y2)]:
                    dx = 1 if px == x1 else -1
                    dy = 1 if py == y1 else -1
                    cv2.line(img, (px, py), (px + dx*corner_len, py), color, 4)
                    cv2.line(img, (px, py), (px, py + dy*corner_len), color, 4)
                boxes_drawn += 1
            else:
                # Other classes: very faint gray
                cv2.rectangle(img, (x1, y1), (x2, y2), (60, 60, 60), 1)

    # Resize for display
    max_dim = 900
    scale = min(max_dim / h, max_dim / w)
    img = cv2.resize(img, (int(w * scale), int(h * scale)))
    
    return img, boxes_drawn


def main():
    print("Membuat verifikasi zoom-in per class...")
    panels = []
    
    for cls_id in range(5):
        info = CLASSES[cls_id]
        
        # Use different max_boxes limit for different classes
        max_b = 15 if cls_id in (3, 4) else 25
        min_b = 1 if cls_id == 4 else 3
        
        img_path, lbl_path = find_image_with_clear_boxes(cls_id, max_boxes=max_b, min_boxes=min_b)
        
        if not img_path:
            print(f"  [SKIP] Class {cls_id} ({info['name']}): tidak ada gambar cocok")
            card = np.zeros((500, 700, 3), dtype=np.uint8)
            cv2.putText(card, "NOT FOUND", (150, 250),
                       cv2.FONT_HERSHEY_SIMPLEX, 1.5, (80,80,80), 3)
        else:
            img, count = draw_clean(img_path, lbl_path, cls_id)
            print(f"  Class {cls_id} ({info['name']}): {count} boxes -- {os.path.basename(img_path)}")
            
            # Add info overlay at bottom
            info_bar = np.zeros((80, img.shape[1], 3), dtype=np.uint8)
            cv2.rectangle(info_bar, (0,0), (img.shape[1], 80), info["color"], -1)
            cv2.rectangle(info_bar, (0,0), (img.shape[1], 80), (0,0,0), 2)
            cv2.putText(info_bar, f"CLASS {cls_id}: {info['name'].upper()}", 
                       (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (255,255,255), 2)
            cv2.putText(info_bar, f"Bounding boxes terdeteksi: {count}  |  File: {os.path.basename(img_path)}", 
                       (10, 62), cv2.FONT_HERSHEY_SIMPLEX, 0.48, (255,255,255), 1)
            
            card = np.vstack([img, info_bar])
        
        # Save individual
        out = os.path.join(OUTPUT_DIR, f"verify_class{cls_id}_{info['name'].replace(' ','_').replace('/','').lower()}.jpg")
        cv2.imwrite(out, card)
        panels.append((cls_id, card, img_path))
        print(f"     -> {out}")

    # Make composite: 2 rows
    # Normalize heights
    target_h = min(p[1].shape[0] for p in panels)
    resized = []
    for cls_id, card, _ in panels:
        scale = target_h / card.shape[0]
        new_w = int(card.shape[1] * scale)
        resized.append(cv2.resize(card, (new_w, target_h)))

    # Target width per panel
    target_w = min(p.shape[1] for p in resized)
    resized = [cv2.resize(p, (target_w, target_h)) for p in resized]

    # Row 1: class 0,1,2 | Row 2: class 3,4
    r1 = np.hstack(resized[:3])
    
    blank = np.zeros((target_h, target_w, 3), dtype=np.uint8)
    r2 = np.hstack(resized[3:] + [blank])

    # Title
    title_w = max(r1.shape[1], r2.shape[1])
    title = np.zeros((65, title_w, 3), dtype=np.uint8)
    cv2.rectangle(title, (0,0), (title_w, 65), (20,20,20), -1)
    cv2.putText(title, "ColonyAI v7 - VERIFIKASI AKURASI 5 CLASS (Ground Truth dari Dataset Asli)",
               (12, 43), cv2.FONT_HERSHEY_SIMPLEX, 0.72, (255,255,255), 2)

    def pad_w(img, target):
        if img.shape[1] < target:
            pad = np.zeros((img.shape[0], target - img.shape[1], 3), dtype=np.uint8)
            return np.hstack([img, pad])
        return img

    r1 = pad_w(r1, title_w)
    r2 = pad_w(r2, title_w)
    composite = np.vstack([title, r1, r2])

    comp_path = os.path.join(OUTPUT_DIR, "5class_verification.jpg")
    cv2.imwrite(comp_path, composite)
    print(f"\n[DONE] Verifikasi selesai!")
    print(f"  Composite: {comp_path}")
    print(f"  Folder   : {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
