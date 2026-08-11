"""
ColonyAI — Auto Label Script
=============================
Pakai model colony_best_new.pt untuk auto-generate label YOLO
dari 12 gambar dust_debris yang belum punya anotasi.

Usage:
  python auto_label.py
  python auto_label.py --conf 0.25 --review
"""

import argparse
import shutil
from pathlib import Path

import torch
from ultralytics import YOLO

# ── Konfigurasi ────────────────────────────────────────────────
MODEL_PATH   = r"D:\colonyai\backend\models\colony_best_new.pt"
IMAGES_DIR   = r"D:\colonyai\dust_debris"
OUTPUT_DIR   = r"D:\colonyai\dust_debris_labeled"
DUST_CLASS_ID = 3   # index dust_debris di data.yaml: colony_single=0, colony_merged=1, bubble=2, dust_debris=3, media_crack=4
CONF_THRESHOLD = 0.25  # turunkan jika deteksi terlalu sedikit
IOU_THRESHOLD  = 0.45
IMG_SIZE       = 640
MIN_BOX_AREA   = 0.002  # minimum area bbox (normalized), buang false positive kecil
                        # 0.002 = 0.2% dari luas gambar, ~28x28px di 640x640

CLASS_NAMES = ["colony_single", "colony_merged", "bubble", "dust_debris", "media_crack"]


def auto_label(conf: float, review: bool):
    print("=" * 60)
    print("ColonyAI — Auto Label (Pseudo-Labeling)")
    print(f"  Model  : {MODEL_PATH}")
    print(f"  Input  : {IMAGES_DIR}")
    print(f"  Output : {OUTPUT_DIR}")
    print(f"  Conf   : {conf}")
    print("=" * 60)

    # Setup output folder
    out = Path(OUTPUT_DIR)
    img_out   = out / "images"
    label_out = out / "labels"
    img_out.mkdir(parents=True, exist_ok=True)
    label_out.mkdir(parents=True, exist_ok=True)

    # Load model
    device = 0 if torch.cuda.is_available() else "cpu"
    print(f"[INFO] Loading model on device: {device}")
    model = YOLO(MODEL_PATH)

    # Ambil semua gambar
    img_paths = sorted(Path(IMAGES_DIR).glob("*.png")) + \
                sorted(Path(IMAGES_DIR).glob("*.jpg")) + \
                sorted(Path(IMAGES_DIR).glob("*.jpeg"))

    if not img_paths:
        print(f"[ERROR] Tidak ada gambar di {IMAGES_DIR}")
        return

    print(f"[INFO] Ditemukan {len(img_paths)} gambar")

    total_boxes = 0
    skipped = 0

    for img_path in img_paths:
        # Inferensi
        results = model.predict(
            source=str(img_path),
            conf=conf,
            iou=IOU_THRESHOLD,
            imgsz=IMG_SIZE,
            device=device,
            verbose=False,
        )

        result = results[0]
        boxes  = result.boxes

        # Filter hanya class dust_debris (class_id = 3)
        dust_boxes = []
        if boxes is not None and len(boxes) > 0:
            for box in boxes:
                cls_id = int(box.cls.item())
                if cls_id == DUST_CLASS_ID:
                    # Filter bbox terlalu kecil (noise/false positive)
                    xywhn = box.xywhn[0].tolist()
                    area = xywhn[2] * xywhn[3]  # w * h normalized
                    if area >= MIN_BOX_AREA:
                        dust_boxes.append(box)

        # Kalau model tidak deteksi dust_debris sama sekali,
        # gunakan whole-image bbox karena kita tahu gambar ini pasti dust_debris
        # (domain adaptation: gambar dari Google berbeda dari training data)
        label_lines = []
        if dust_boxes:
            for box in dust_boxes:
                # YOLO format: class_id cx cy w h (normalized 0-1)
                xywhn = box.xywhn[0].tolist()  # [cx, cy, w, h] normalized
                cx, cy, w, h = xywhn
                label_lines.append(f"{DUST_CLASS_ID} {cx:.6f} {cy:.6f} {w:.6f} {h:.6f}")
        else:
            # Whole-image fallback: bbox mencakup 90% gambar (beri sedikit margin)
            label_lines.append(f"{DUST_CLASS_ID} 0.500000 0.500000 0.900000 0.900000")

        # Tulis label file
        label_file = label_out / (img_path.stem + ".txt")
        with open(label_file, "w") as f:
            f.write("\n".join(label_lines))

        # Copy gambar ke output
        shutil.copy2(img_path, img_out / img_path.name)

        n = len(dust_boxes)
        total_boxes += n
        if n == 0:
            skipped += 1
            print(f"  [WARN] {img_path.name}: 0 deteksi dust_debris (label kosong)")
        else:
            print(f"  [OK]   {img_path.name}: {n} bounding box")

    print()
    print("=" * 60)
    print(f"[DONE] {len(img_paths)} gambar diproses")
    print(f"       Total bounding box : {total_boxes}")
    print(f"       Gambar tanpa deteksi: {skipped}")
    print(f"       Output tersimpan di : {OUTPUT_DIR}")
    print("=" * 60)

    if skipped > 0:
        print()
        print("[TIPS] Ada gambar tanpa deteksi. Coba:")
        print(f"       python auto_label.py --conf {max(0.1, conf - 0.1):.2f}")
        print("       Atau review manual dengan --review flag")

    if review:
        _review_labels(img_out, label_out)


def _review_labels(img_dir: Path, label_dir: Path):
    """Tampilkan preview hasil labeling pakai matplotlib."""
    try:
        import matplotlib.pyplot as plt
        import matplotlib.patches as patches
        from PIL import Image
        import math

        label_files = sorted(label_dir.glob("*.txt"))
        n = len(label_files)
        cols = min(4, n)
        rows = math.ceil(n / cols)

        fig, axes = plt.subplots(rows, cols, figsize=(cols * 4, rows * 4))
        axes = [axes] if n == 1 else axes.flatten()

        for i, lf in enumerate(label_files):
            img_file = img_dir / (lf.stem + ".png")
            if not img_file.exists():
                img_file = img_dir / (lf.stem + ".jpg")

            img = Image.open(img_file)
            w, h = img.size
            ax = axes[i]
            ax.imshow(img)
            ax.set_title(lf.stem, fontsize=8)
            ax.axis("off")

            with open(lf) as f:
                for line in f:
                    line = line.strip()
                    if not line:
                        continue
                    parts = line.split()
                    cx, cy, bw, bh = float(parts[1]), float(parts[2]), float(parts[3]), float(parts[4])
                    x1 = (cx - bw / 2) * w
                    y1 = (cy - bh / 2) * h
                    rect = patches.Rectangle(
                        (x1, y1), bw * w, bh * h,
                        linewidth=2, edgecolor="red", facecolor="none"
                    )
                    ax.add_patch(rect)

        # Sembunyikan axes kosong
        for j in range(i + 1, len(axes)):
            axes[j].axis("off")

        plt.suptitle("Auto-Label Review — dust_debris", fontsize=12)
        plt.tight_layout()
        plt.savefig(str(Path(OUTPUT_DIR) / "label_review.png"), dpi=100)
        print(f"[REVIEW] Preview tersimpan: {OUTPUT_DIR}\\label_review.png")
        plt.show()

    except ImportError:
        print("[WARN] matplotlib/PIL tidak tersedia. Skip review.")


def main():
    parser = argparse.ArgumentParser(description="Auto-label dust_debris images using colony_best_new.pt")
    parser.add_argument("--conf", type=float, default=CONF_THRESHOLD,
                        help=f"Confidence threshold (default: {CONF_THRESHOLD})")
    parser.add_argument("--review", action="store_true",
                        help="Tampilkan preview hasil labeling")
    args = parser.parse_args()
    auto_label(conf=args.conf, review=args.review)


if __name__ == "__main__":
    main()
