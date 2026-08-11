"""
ColonyAI — Augmentasi Dataset dust_debris
==========================================
Generate 300+ gambar dari hasil auto-labeling (12 gambar)
dengan transform yang juga diterapkan ke bounding box.

Augmentasi yang dilakukan:
  - Horizontal & vertical flip
  - Rotasi (±15°)
  - Brightness & contrast
  - Gaussian noise
  - Mosaic (gabung 4 gambar jadi 1)
  - Random crop
  - HSV shift
  - Blur

Usage:
  python augment_dust.py
  python augment_dust.py --input D:\\colonyai\\dust_debris_labeled --output D:\\colonyai\\dust_debris_augmented --count 30
"""

import argparse
import random
import shutil
import math
from pathlib import Path

import cv2
import numpy as np

# ── Konfigurasi ────────────────────────────────────────────────
INPUT_DIR      = r"D:\colonyai\dust_debris_labeled"   # output dari auto_label.py
OUTPUT_DIR     = r"D:\colonyai\dust_debris_augmented"
AUG_PER_IMAGE  = 25   # 12 gambar × 25 = 300 gambar augmented
SEED           = 42
IMG_SIZE       = 640  # resize output ke 640×640

random.seed(SEED)
np.random.seed(SEED)


# ── Utilitas YOLO bbox ─────────────────────────────────────────

def yolo_to_xyxy(cx, cy, w, h, img_w, img_h):
    """Konversi YOLO normalized ke pixel absolute."""
    x1 = (cx - w / 2) * img_w
    y1 = (cy - h / 2) * img_h
    x2 = (cx + w / 2) * img_w
    y2 = (cy + h / 2) * img_h
    return x1, y1, x2, y2


def xyxy_to_yolo(x1, y1, x2, y2, img_w, img_h):
    """Konversi pixel absolute ke YOLO normalized."""
    cx = (x1 + x2) / 2 / img_w
    cy = (y1 + y2) / 2 / img_h
    w  = (x2 - x1) / img_w
    h  = (y2 - y1) / img_h
    return cx, cy, w, h


def clip_bbox(cx, cy, w, h):
    """Clip bbox agar tetap dalam range [0, 1]."""
    cx = max(0.0, min(1.0, cx))
    cy = max(0.0, min(1.0, cy))
    w  = max(0.0, min(1.0, w))
    h  = max(0.0, min(1.0, h))
    # Pastikan tidak keluar batas
    if cx - w / 2 < 0: w = cx * 2
    if cy - h / 2 < 0: h = cy * 2
    if cx + w / 2 > 1: w = (1 - cx) * 2
    if cy + h / 2 > 1: h = (1 - cy) * 2
    return cx, cy, w, h


def is_valid_bbox(cx, cy, w, h, min_size=0.01):
    """Cek apakah bbox masih cukup besar setelah transform."""
    return w >= min_size and h >= min_size


def load_labels(label_path):
    """Baca file label YOLO, return list of (cls_id, cx, cy, w, h)."""
    labels = []
    if not Path(label_path).exists():
        return labels
    with open(label_path) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            parts = line.split()
            cls_id = int(parts[0])
            cx, cy, w, h = float(parts[1]), float(parts[2]), float(parts[3]), float(parts[4])
            labels.append((cls_id, cx, cy, w, h))
    return labels


def save_labels(label_path, labels):
    """Tulis list of (cls_id, cx, cy, w, h) ke file YOLO format."""
    with open(label_path, "w") as f:
        for cls_id, cx, cy, w, h in labels:
            f.write(f"{cls_id} {cx:.6f} {cy:.6f} {w:.6f} {h:.6f}\n")


# ── Augmentasi Transforms ──────────────────────────────────────

def aug_hflip(img, labels):
    """Horizontal flip."""
    img = cv2.flip(img, 1)
    new_labels = []
    for cls_id, cx, cy, w, h in labels:
        cx = 1.0 - cx
        new_labels.append((cls_id, cx, cy, w, h))
    return img, new_labels


def aug_vflip(img, labels):
    """Vertical flip."""
    img = cv2.flip(img, 0)
    new_labels = []
    for cls_id, cx, cy, w, h in labels:
        cy = 1.0 - cy
        new_labels.append((cls_id, cx, cy, w, h))
    return img, new_labels


def aug_rotate(img, labels, angle=None):
    """Rotasi gambar dan bbox."""
    if angle is None:
        angle = random.uniform(-15, 15)
    h, w = img.shape[:2]
    M = cv2.getRotationMatrix2D((w / 2, h / 2), angle, 1.0)
    img = cv2.warpAffine(img, M, (w, h), borderMode=cv2.BORDER_REFLECT_101)

    new_labels = []
    for cls_id, cx, cy, bw, bh in labels:
        x1, y1, x2, y2 = yolo_to_xyxy(cx, cy, bw, bh, w, h)
        # Transform 4 corner points
        corners = np.array([[x1, y1, 1], [x2, y1, 1], [x2, y2, 1], [x1, y2, 1]], dtype=np.float32)
        rotated = (M @ corners.T).T
        nx1, ny1 = rotated[:, 0].min(), rotated[:, 1].min()
        nx2, ny2 = rotated[:, 0].max(), rotated[:, 1].max()
        ncx, ncy, nbw, nbh = xyxy_to_yolo(nx1, ny1, nx2, ny2, w, h)
        ncx, ncy, nbw, nbh = clip_bbox(ncx, ncy, nbw, nbh)
        if is_valid_bbox(ncx, ncy, nbw, nbh):
            new_labels.append((cls_id, ncx, ncy, nbw, nbh))
    return img, new_labels


def aug_brightness_contrast(img, labels):
    """Random brightness dan contrast."""
    alpha = random.uniform(0.6, 1.4)  # contrast
    beta  = random.randint(-40, 40)   # brightness
    img = cv2.convertScaleAbs(img, alpha=alpha, beta=beta)
    return img, labels


def aug_hsv(img, labels):
    """Random HSV shift."""
    img_hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV).astype(np.float32)
    img_hsv[:, :, 0] += random.uniform(-18, 18)   # hue
    img_hsv[:, :, 1] *= random.uniform(0.7, 1.3)  # saturation
    img_hsv[:, :, 2] *= random.uniform(0.7, 1.3)  # value
    img_hsv = np.clip(img_hsv, 0, 255).astype(np.uint8)
    img = cv2.cvtColor(img_hsv, cv2.COLOR_HSV2BGR)
    return img, labels


def aug_gaussian_noise(img, labels):
    """Tambah Gaussian noise."""
    noise = np.random.normal(0, random.uniform(5, 20), img.shape).astype(np.float32)
    img = np.clip(img.astype(np.float32) + noise, 0, 255).astype(np.uint8)
    return img, labels


def aug_blur(img, labels):
    """Gaussian blur ringan."""
    k = random.choice([3, 5])
    img = cv2.GaussianBlur(img, (k, k), 0)
    return img, labels


def aug_random_crop(img, labels, crop_ratio=None):
    """Random crop lalu resize balik ke ukuran asli."""
    if crop_ratio is None:
        crop_ratio = random.uniform(0.75, 0.95)
    h, w = img.shape[:2]
    ch, cw = int(h * crop_ratio), int(w * crop_ratio)
    top  = random.randint(0, h - ch)
    left = random.randint(0, w - cw)

    img = img[top:top + ch, left:left + cw]

    new_labels = []
    for cls_id, cx, cy, bw, bh in labels:
        x1, y1, x2, y2 = yolo_to_xyxy(cx, cy, bw, bh, w, h)
        # Sesuaikan dengan crop
        x1 = (x1 - left) / cw
        y1 = (y1 - top)  / ch
        x2 = (x2 - left) / cw
        y2 = (y2 - top)  / ch
        x1, y1, x2, y2 = max(0, x1), max(0, y1), min(1, x2), min(1, y2)
        if x2 > x1 and y2 > y1:
            ncx = (x1 + x2) / 2
            ncy = (y1 + y2) / 2
            nbw = x2 - x1
            nbh = y2 - y1
            if is_valid_bbox(ncx, ncy, nbw, nbh):
                new_labels.append((cls_id, ncx, ncy, nbw, nbh))

    img = cv2.resize(img, (w, h))
    return img, new_labels


def aug_mosaic(imgs_labels, out_size=640):
    """Gabung 4 gambar jadi 1 (mosaic augmentation)."""
    assert len(imgs_labels) == 4
    half = out_size // 2
    mosaic_img = np.zeros((out_size, out_size, 3), dtype=np.uint8)
    all_labels = []

    positions = [
        (0, 0, half, half),          # top-left
        (half, 0, out_size, half),   # top-right
        (0, half, half, out_size),   # bottom-left
        (half, half, out_size, out_size),  # bottom-right
    ]

    for i, (img, labels) in enumerate(imgs_labels):
        x1, y1, x2, y2 = positions[i]
        cell_w, cell_h = x2 - x1, y2 - y1
        resized = cv2.resize(img, (cell_w, cell_h))
        mosaic_img[y1:y2, x1:x2] = resized

        for cls_id, cx, cy, bw, bh in labels:
            # Konversi ke mosaic koordinat
            ncx = (x1 + cx * cell_w) / out_size
            ncy = (y1 + cy * cell_h) / out_size
            nbw = bw * cell_w / out_size
            nbh = bh * cell_h / out_size
            ncx, ncy, nbw, nbh = clip_bbox(ncx, ncy, nbw, nbh)
            if is_valid_bbox(ncx, ncy, nbw, nbh):
                all_labels.append((cls_id, ncx, ncy, nbw, nbh))

    return mosaic_img, all_labels


# ── Pipeline Augmentasi ────────────────────────────────────────

TRANSFORMS = [
    aug_hflip,
    aug_vflip,
    aug_brightness_contrast,
    aug_hsv,
    aug_gaussian_noise,
    aug_blur,
    aug_random_crop,
]


def apply_random_augmentations(img, labels, n_transforms=3):
    """Terapkan n_transforms acak dari daftar transform."""
    selected = random.sample(TRANSFORMS, min(n_transforms, len(TRANSFORMS)))
    for fn in selected:
        img, labels = fn(img, labels)
    return img, labels


def augment_dataset(input_dir: str, output_dir: str, aug_per_image: int):
    print("=" * 60)
    print("ColonyAI — Augmentasi Dataset dust_debris")
    print(f"  Input         : {input_dir}")
    print(f"  Output        : {output_dir}")
    print(f"  Aug per gambar: {aug_per_image}")
    print("=" * 60)

    inp = Path(input_dir)
    img_in  = inp / "images"
    lbl_in  = inp / "labels"

    if not img_in.exists():
        print(f"[ERROR] Folder images tidak ditemukan: {img_in}")
        print("        Pastikan sudah jalankan auto_label.py terlebih dahulu.")
        return

    # Buat struktur output YOLO
    out = Path(output_dir)
    for split in ["train", "val"]:
        (out / "images" / split).mkdir(parents=True, exist_ok=True)
        (out / "labels" / split).mkdir(parents=True, exist_ok=True)

    # Load semua gambar
    img_files = sorted(list(img_in.glob("*.png")) + list(img_in.glob("*.jpg")))
    if not img_files:
        print(f"[ERROR] Tidak ada gambar di {img_in}")
        return

    print(f"[INFO] Ditemukan {len(img_files)} gambar sumber")

    all_imgs_labels = []
    for img_path in img_files:
        img = cv2.imread(str(img_path))
        if img is None:
            print(f"[WARN] Gagal baca: {img_path.name}")
            continue
        img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
        labels = load_labels(lbl_in / (img_path.stem + ".txt"))
        all_imgs_labels.append((img_path.stem, img, labels))

    print(f"[INFO] Loaded {len(all_imgs_labels)} gambar")

    # ── Generate augmented images ──
    generated = []  # list of (stem, img, labels)

    # 1. Simpan gambar original juga
    for stem, img, labels in all_imgs_labels:
        generated.append((f"{stem}_orig", img, labels))

    # 2. Augmentasi per-gambar
    aug_count = 0
    for stem, img, labels in all_imgs_labels:
        for i in range(aug_per_image):
            n_t = random.randint(2, 4)
            aug_img, aug_labels = apply_random_augmentations(img.copy(), labels.copy(), n_t)
            aug_img = cv2.resize(aug_img, (IMG_SIZE, IMG_SIZE))
            generated.append((f"{stem}_aug{i:03d}", aug_img, aug_labels))
            aug_count += 1

    # 3. Mosaic augmentation (butuh minimal 4 gambar)
    if len(all_imgs_labels) >= 4:
        mosaic_count = min(50, len(all_imgs_labels) * 4)
        for i in range(mosaic_count):
            sampled = random.sample(all_imgs_labels, 4)
            imgs_labels = [(cv2.resize(img, (IMG_SIZE, IMG_SIZE)), lbl) for _, img, lbl in sampled]
            mos_img, mos_labels = aug_mosaic(imgs_labels, IMG_SIZE)
            generated.append((f"mosaic_{i:03d}", mos_img, mos_labels))

    print(f"[INFO] Total generated: {len(generated)} gambar")

    # ── Train / Val split 80/20 ──
    random.shuffle(generated)
    n_val   = max(1, int(len(generated) * 0.2))
    n_train = len(generated) - n_val
    train_data = generated[:n_train]
    val_data   = generated[n_train:]

    # Simpan ke disk
    saved_train, saved_val = 0, 0
    for stem, img, labels in train_data:
        cv2.imwrite(str(out / "images" / "train" / f"{stem}.jpg"), img,
                    [cv2.IMWRITE_JPEG_QUALITY, 95])
        save_labels(out / "labels" / "train" / f"{stem}.txt", labels)
        saved_train += 1

    for stem, img, labels in val_data:
        cv2.imwrite(str(out / "images" / "val" / f"{stem}.jpg"), img,
                    [cv2.IMWRITE_JPEG_QUALITY, 95])
        save_labels(out / "labels" / "val" / f"{stem}.txt", labels)
        saved_val += 1

    # ── Tulis data.yaml ──
    data_yaml = {
        "path": str(out).replace("\\", "/"),
        "train": "images/train",
        "val":   "images/val",
        "nc":    5,
        "names": ["colony_single", "colony_merged", "bubble", "dust_debris", "media_crack"],
    }
    import yaml
    with open(out / "data.yaml", "w") as f:
        yaml.dump(data_yaml, f, default_flow_style=False, allow_unicode=True)

    print()
    print("=" * 60)
    print(f"[DONE] Dataset augmented siap:")
    print(f"       Train : {saved_train} gambar")
    print(f"       Val   : {saved_val} gambar")
    print(f"       Total : {saved_train + saved_val} gambar")
    print(f"       Lokasi: {output_dir}")
    print(f"       Config: {output_dir}\\data.yaml")
    print("=" * 60)
    print()
    print("[NEXT] Jalankan fine-tuning:")
    print(f"       python finetune_dust.py")


def main():
    parser = argparse.ArgumentParser(description="Augmentasi dataset dust_debris")
    parser.add_argument("--input",  default=INPUT_DIR,  help="Folder hasil auto_label.py")
    parser.add_argument("--output", default=OUTPUT_DIR, help="Folder output dataset augmented")
    parser.add_argument("--count",  type=int, default=AUG_PER_IMAGE,
                        help=f"Jumlah augmentasi per gambar (default: {AUG_PER_IMAGE})")
    args = parser.parse_args()
    augment_dataset(args.input, args.output, args.count)


if __name__ == "__main__":
    main()
