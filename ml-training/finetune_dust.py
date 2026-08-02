"""
ColonyAI — Fine-tuning dust_debris
====================================
Fine-tune colony_best_new.pt dengan dataset augmented dust_debris.
Hanya class dust_debris yang diperkuat, semua 5 class tetap ada.

Usage:
  python finetune_dust.py
  python finetune_dust.py --epochs 50 --batch 8
"""

import argparse
import shutil
from pathlib import Path
from datetime import datetime

import torch

# ── Konfigurasi ────────────────────────────────────────────────
BASE_MODEL   = r"D:\colonyai\backend\models\colony_best_new.pt"
DATASET_DIR  = r"D:\colonyai\dust_debris_augmented"
OUTPUT_DIR   = r"D:\colonyai\ml-training\runs\finetune_dust"
EPOCHS       = 50
BATCH_SIZE   = 8       # turunkan ke 4 jika VRAM kurang
IMG_SIZE     = 640
LR0          = 0.001   # learning rate awal (rendah karena fine-tune)
LRF          = 0.01    # learning rate final factor
PATIENCE     = 15      # early stopping
WORKERS      = 0  # 0 = main process only, avoids Windows DataLoader deadlock


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


def finetune(epochs: int, batch: int, resume: bool):
    from ultralytics import YOLO

    print("=" * 60)
    print("ColonyAI — Fine-tuning dust_debris")
    print(f"  Base model : {BASE_MODEL}")
    print(f"  Dataset    : {DATASET_DIR}")
    print(f"  Epochs     : {epochs}")
    print(f"  Batch size : {batch}")
    print(f"  Device     : {'GPU' if torch.cuda.is_available() else 'CPU'}")
    print("=" * 60)

    # Validasi dataset
    if not check_dataset(DATASET_DIR):
        print()
        print("[ERROR] Dataset belum siap. Jalankan dulu:")
        print("        python auto_label.py")
        print("        python augment_dust.py")
        return

    n_train, n_val = count_dataset(DATASET_DIR)
    print(f"[INFO] Dataset: {n_train} train, {n_val} val")

    if n_train < 10:
        print(f"[WARN] Terlalu sedikit gambar train ({n_train}). Coba augmentasi lebih banyak.")

    # Buat output dir
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    run_name  = f"dust_finetune_{timestamp}"

    # Load model
    print(f"[INFO] Loading base model: {BASE_MODEL}")
    model = YOLO(BASE_MODEL)

    # Training
    print(f"[INFO] Mulai fine-tuning...")
    results = model.train(
        data=str(Path(DATASET_DIR) / "data.yaml"),
        epochs=epochs,
        batch=batch,
        imgsz=IMG_SIZE,
        lr0=LR0,
        lrf=LRF,
        patience=PATIENCE,
        workers=WORKERS,
        project=OUTPUT_DIR,
        name=run_name,
        exist_ok=False,
        resume=resume,
        # Augmentasi YOLOv8 built-in (disable karena sudah augment manual)
        augment=False,
        hsv_h=0.015,
        hsv_s=0.7,
        hsv_v=0.4,
        degrees=10.0,
        translate=0.1,
        scale=0.5,
        fliplr=0.5,
        flipud=0.1,
        mosaic=0.5,   # setengah dari default, sudah ada mosaic manual
        # Freeze backbone, hanya fine-tune head
        freeze=10,
        # Verbose
        verbose=True,
        plots=True,
        save=True,
        save_period=10,
        val=True,
        device=0 if torch.cuda.is_available() else "cpu",
    )

    # Salin model terbaik ke backend
    best_pt = Path(OUTPUT_DIR) / run_name / "weights" / "best.pt"
    if best_pt.exists():
        dest = Path(r"D:\colonyai\backend\models\colony_best_new.pt")
        # Backup model lama dulu
        backup = Path(r"D:\colonyai\backend\models") / f"colony_best_new_backup_{timestamp}.pt"
        shutil.copy2(dest, backup)
        print(f"[INFO] Model lama di-backup ke: {backup.name}")

        shutil.copy2(best_pt, dest)
        print(f"[OK] Model baru tersimpan ke: {dest}")
    else:
        print(f"[WARN] best.pt tidak ditemukan di {best_pt}")

    print()
    print("=" * 60)
    print(f"[DONE] Fine-tuning selesai!")
    print(f"       Run dir : {OUTPUT_DIR}\\{run_name}")
    print(f"       Best PT : {OUTPUT_DIR}\\{run_name}\\weights\\best.pt")
    print("=" * 60)

    # Tampilkan hasil metrics
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
    parser = argparse.ArgumentParser(description="Fine-tune ColonyAI untuk dust_debris")
    parser.add_argument("--epochs",  type=int,  default=EPOCHS,     help=f"Jumlah epochs (default: {EPOCHS})")
    parser.add_argument("--batch",   type=int,  default=BATCH_SIZE, help=f"Batch size (default: {BATCH_SIZE})")
    parser.add_argument("--resume",  action="store_true",           help="Resume training dari checkpoint terakhir")
    args = parser.parse_args()
    finetune(epochs=args.epochs, batch=args.batch, resume=args.resume)


if __name__ == "__main__":
    main()
