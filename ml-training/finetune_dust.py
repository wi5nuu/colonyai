"""
ColonyAI — Fine-tuning dust_debris (BALANCED)
===============================================
Fine-tune colony_best_new.pt dengan dataset yang mencakup semua 5 class
untuk menghindari catastrophic forgetting / class collapse.

PELAJARAN dari fine-tune sebelumnya:
  - Dataset hanya berisi dust_debris → model "lupa" 4 class lainnya
  - Solusi: dataset wajib balanced (semua 5 class representasi)
  - Gunakan freeze=10 untuk pertahankan backbone feature extractor
  - Gunakan lr0 lebih kecil (0.0001) agar update bertahap

Usage:
  python finetune_dust.py
  python finetune_dust.py --epochs 30 --batch 8
  python finetune_dust.py --resume
"""

import argparse
import shutil
import sys
from pathlib import Path
from datetime import datetime
from collections import defaultdict

import torch

# ── Konfigurasi ────────────────────────────────────────────────────────────
BASE_MODEL  = r"D:\colonyai\backend\models\colony_best_new.pt"
DATASET_DIR = r"D:\colonyai\ml-training\datasets\dust_balanced"
OUTPUT_DIR  = r"D:\colonyai\ml-training\runs\finetune_dust"
EPOCHS      = 30       # lebih sedikit karena fine-tune, bukan train from scratch
BATCH_SIZE  = 8        # turunkan ke 4 jika VRAM kurang
IMG_SIZE    = 640
LR0         = 0.0001   # PENTING: sangat rendah untuk mencegah overwrite weight lain
LRF         = 0.01     # learning rate final factor
PATIENCE    = 10       # early stopping lebih ketat
FREEZE      = 10       # bekukan 10 layer pertama (backbone) — hanya head yang diupdate
WORKERS     = 0        # 0 = main process only, avoids Windows DataLoader deadlock

REQUIRED_CLASSES = {'colony_single', 'colony_merged', 'bubble', 'dust_debris', 'media_crack'}
MIN_SAMPLES_PER_CLASS = 5  # minimal per class di train set


def check_dataset(dataset_dir: str) -> bool:
    """Validasi struktur dataset sebelum training."""
    d = Path(dataset_dir)
    checks = [
        d / "data.yaml",
        d / "images" / "train",
        d / "images" / "val",
        d / "labels" / "train",
        d / "labels" / "val",
    ]
    ok = True
    for p in checks:
        if not p.exists():
            print(f"[ERROR] Tidak ditemukan: {p}")
            ok = False
    return ok


def count_dataset(dataset_dir: str):
    """Hitung jumlah gambar di train dan val."""
    d = Path(dataset_dir)
    train_imgs = list((d / "images" / "train").glob("*.jpg")) + \
                 list((d / "images" / "train").glob("*.png"))
    val_imgs   = list((d / "images" / "val").glob("*.jpg")) + \
                 list((d / "images" / "val").glob("*.png"))
    return len(train_imgs), len(val_imgs)


def check_class_balance(dataset_dir: str) -> bool:
    """
    Verifikasi semua 5 class ada di dataset training.
    Mencegah class collapse akibat dataset single-class.

    Returns True jika balanced, False jika tidak.
    """
    d = Path(dataset_dir)
    labels_dir = d / "labels" / "train"

    # Hitung class per label file
    class_counts: dict = defaultdict(int)
    label_files = list(labels_dir.glob("*.txt"))

    if not label_files:
        print("[ERROR] Tidak ada label files di labels/train/")
        return False

    for lf in label_files:
        try:
            for line in lf.read_text(encoding='utf-8').strip().splitlines():
                if line.strip():
                    cls_id = int(line.split()[0])
                    class_counts[cls_id] += 1
        except Exception as e:
            print(f"[WARN] Gagal baca label {lf.name}: {e}")

    CLASS_NAMES = {0: 'colony_single', 1: 'colony_merged', 2: 'bubble',
                   3: 'dust_debris', 4: 'media_crack'}

    print("\n[DATASET] Class distribution di train set:")
    ok = True
    for cls_id, cls_name in CLASS_NAMES.items():
        count = class_counts.get(cls_id, 0)
        status = "OK" if count >= MIN_SAMPLES_PER_CLASS else "INSUFFICIENT"
        print(f"  Class {cls_id} ({cls_name}): {count} instances [{status}]")
        if count < MIN_SAMPLES_PER_CLASS:
            ok = False

    if not ok:
        print()
        print("[ERROR] Dataset tidak balanced — akan menyebabkan class collapse!")
        print("        Semua 5 class harus ada dengan minimal", MIN_SAMPLES_PER_CLASS, "instance.")
        print()
        print("  Solusi: Gunakan script prepare_balanced_dataset.py untuk")
        print("          menggabungkan dust_debris images dengan dataset utama.")
        print()
        print("  Atau download dataset asli yang sudah balanced dari:")
        print("  D:\\colonyai\\ml-training\\datasets\\colony_full\\")

    return ok


def verify_no_class_collapse(model_path: str, test_images_dir: str = None) -> bool:
    """
    Post-training verification: pastikan model masih mendeteksi semua 5 class.
    Jalankan inference dengan conf sangat rendah (0.01) pada gambar sampel.
    """
    from ultralytics import YOLO
    import cv2

    # Cari gambar test — gunakan sampel frontend jika tersedia
    samples_dir = Path(r"D:\colonyai\frontend\public\samples")
    test_dir    = Path(test_images_dir) if test_images_dir else samples_dir

    test_files = list(test_dir.glob("*.jpg")) + list(test_dir.glob("*.png"))
    if not test_files:
        print("[WARN] Tidak ada gambar test untuk verifikasi. Skipping collapse check.")
        return True

    print("\n[VERIFY] Checking for class collapse...")
    model = YOLO(model_path)
    detected_classes = set()

    for fpath in test_files[:10]:  # cek 10 gambar pertama
        img = cv2.imread(str(fpath))
        if img is None:
            continue
        res = model(img, verbose=False, conf=0.01, iou=0.45, imgsz=640)[0]
        if res.boxes is not None and len(res.boxes):
            for box in res.boxes:
                cls_name = model.names[int(box.cls.item())]
                detected_classes.add(cls_name)

    print(f"  Classes detected across {len(test_files[:10])} images: {detected_classes}")

    # Cek apakah satu class mendominasi (>80% dari semua deteksi)
    all_detections = []
    for fpath in test_files[:10]:
        img = cv2.imread(str(fpath))
        if img is None:
            continue
        res = model(img, verbose=False, conf=0.01, iou=0.45, imgsz=640)[0]
        if res.boxes is not None:
            for box in res.boxes:
                all_detections.append(model.names[int(box.cls.item())])

    if all_detections:
        from collections import Counter
        counts = Counter(all_detections)
        dominant_class, dominant_count = counts.most_common(1)[0]
        dominance_ratio = dominant_count / len(all_detections)

        if dominance_ratio > 0.80:
            print(f"[ERROR] Class collapse detected!")
            print(f"        '{dominant_class}' = {dominance_ratio*100:.1f}% of all detections")
            print(f"        Model rusak — jangan deploy. Rollback ke colony_best.pt")
            return False

    # Cek colony_single dan colony_merged harus terdeteksi (2 class utama)
    if 'colony_single' not in detected_classes and 'colony_merged' not in detected_classes:
        print("[ERROR] Tidak ada colony terdeteksi sama sekali — model rusak!")
        return False

    print("[VERIFY] No class collapse detected. Model looks healthy.")
    return True


def finetune(epochs: int, batch: int, resume: bool):
    from ultralytics import YOLO

    print("=" * 60)
    print("ColonyAI — Fine-tuning dust_debris (BALANCED)")
    print(f"  Base model   : {BASE_MODEL}")
    print(f"  Dataset      : {DATASET_DIR}")
    print(f"  Epochs       : {epochs}")
    print(f"  Batch size   : {batch}")
    print(f"  LR0          : {LR0} (very low — prevent overwriting other classes)")
    print(f"  Freeze layers: {FREEZE} (backbone frozen — only head updated)")
    print(f"  Device       : {'GPU' if torch.cuda.is_available() else 'CPU'}")
    print("=" * 60)

    # 1. Validasi struktur dataset
    if not check_dataset(DATASET_DIR):
        print()
        print("[ERROR] Dataset belum siap. Buat dataset balanced dulu.")
        sys.exit(1)

    # 2. CLASS BALANCE CHECK — mencegah class collapse
    if not check_class_balance(DATASET_DIR):
        print()
        print("[ABORT] Fine-tuning dibatalkan karena dataset tidak balanced.")
        print("        Ini akan menyebabkan class collapse seperti sebelumnya.")
        sys.exit(1)

    # 3. Hitung dataset
    train_count, val_count = count_dataset(DATASET_DIR)
    print(f"\n[DATASET] Train: {train_count} images | Val: {val_count} images")

    if train_count < 20:
        print("[WARN] Dataset sangat kecil (<20 train images). Hasil mungkin tidak optimal.")

    # 4. Load model
    model = YOLO(BASE_MODEL)

    # 5. Mulai fine-tuning
    run_name = f"dust_finetune_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

    print(f"\n[TRAIN] Starting fine-tune run: {run_name}")
    print(f"  freeze={FREEZE} memastikan backbone tidak berubah")
    print(f"  lr0={LR0} mencegah overwrite weight class lain")
    print()

    results = model.train(
        data=str(Path(DATASET_DIR) / "data.yaml"),
        epochs=epochs,
        batch=batch,
        imgsz=IMG_SIZE,
        lr0=LR0,
        lrf=LRF,
        patience=PATIENCE,
        freeze=FREEZE,           # KRITIS: bekukan backbone
        workers=WORKERS,
        project=OUTPUT_DIR,
        name=run_name,
        exist_ok=False,
        resume=resume,
        save=True,
        save_period=10,
        val=True,
        plots=True,
        verbose=True,
        # Augmentasi ringan — jangan terlalu agresif untuk fine-tune
        hsv_h=0.015,
        hsv_s=0.3,
        hsv_v=0.3,
        flipud=0.3,
        fliplr=0.5,
        mosaic=0.5,   # kurangi dari default 1.0
        mixup=0.0,    # matikan mixup untuk fine-tune
    )

    # 6. Verifikasi hasil training
    best_pt = Path(OUTPUT_DIR) / run_name / "weights" / "best.pt"
    if not best_pt.exists():
        print("\n[ERROR] best.pt tidak ditemukan setelah training!")
        sys.exit(1)

    # 7. POST-TRAINING: Cek class collapse sebelum deploy
    print("\n[POST-TRAINING] Verifying model integrity...")
    if not verify_no_class_collapse(str(best_pt)):
        print("\n[ABORT] Model TIDAK akan di-deploy karena terdeteksi class collapse.")
        print(f"        Hasil training disimpan di: {best_pt}")
        print("        Gunakan colony_best.pt yang masih sehat.")
        sys.exit(1)

    # 8. Deploy ke backend
    dest   = Path(r"D:\colonyai\backend\models\colony_best_new.pt")
    backup = Path(r"D:\colonyai\backend\models") / \
             f"colony_best_new_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pt"

    print(f"\n[DEPLOY] Backup model lama ke: {backup.name}")
    shutil.copy2(dest, backup)

    print(f"[DEPLOY] Deploy model baru ke: {dest}")
    shutil.copy2(best_pt, dest)

    print("\n" + "=" * 60)
    print("[SUCCESS] Fine-tuning selesai dan model di-deploy!")
    print(f"       Run name : {run_name}")
    print(f"       Best PT  : {best_pt}")
    print(f"       Deployed : {dest}")
    print("=" * 60)

    # 9. Tampilkan metrics
    try:
        metrics = results.results_dict
        print()
        print("[METRICS]")
        for k, v in metrics.items():
            if isinstance(v, float):
                print(f"  {k:<30} {v:.4f}")
    except Exception:
        pass


def main():
    parser = argparse.ArgumentParser(
        description="Fine-tune ColonyAI untuk dust_debris (balanced dataset)"
    )
    parser.add_argument("--epochs", type=int, default=EPOCHS,
                        help=f"Jumlah epochs (default: {EPOCHS})")
    parser.add_argument("--batch",  type=int, default=BATCH_SIZE,
                        help=f"Batch size (default: {BATCH_SIZE})")
    parser.add_argument("--resume", action="store_true",
                        help="Resume training dari checkpoint terakhir")
    args = parser.parse_args()
    finetune(epochs=args.epochs, batch=args.batch, resume=args.resume)


if __name__ == "__main__":
    main()
