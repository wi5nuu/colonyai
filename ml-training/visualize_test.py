import os
import sys
from pathlib import Path
import shutil

# Print immediately before heavy imports
print(">> Menyiapkan script visualisasi... (Mohon tunggu)")

try:
    from ultralytics import YOLO
except ImportError:
    print("❌ ERROR: Library 'ultralytics' tidak ditemukan. Pastikan sudah install: pip install ultralytics")
    sys.exit(1)

# Configuration
MODEL_PATH = r"D:\lombapuai\ml-training\runs\detect\runs\detect\colony_v8_balanced\weights\best.pt"
DATASET_DIR = "d:/lombapuai/ml-training/datasets/colony_dataset"
OUTPUT_DIR = "d:/lombapuai/ml-training/test_results_visualized"
CONF_THRESHOLD = 0.25
IMAGES_PER_CLASS = 5

class_names = {
    0: "colony_single",
    1: "colony_merged",
    2: "bubble",
    3: "dust_debris",
    4: "media_crack"
}

def get_images_for_class(class_id, max_images=5):
    """
    Mencari gambar yang mengandung class_id.
    Prioritas sampel 'murni' (hanya berisi class tersebut).
    """
    search_dirs = [
        Path(DATASET_DIR) / "test",
        Path(DATASET_DIR) / "valid",
        Path(DATASET_DIR) / "train",
    ]
    
    candidates_pure = []
    candidates_mixed = []
    
    print(f"   Scanning labels untuk {class_names[class_id]}...", end="", flush=True)
    
    files_scanned = 0
    for sdir in search_dirs:
        ldir = sdir / "labels"
        idir = sdir / "images"
        if not ldir.exists() or not idir.exists():
            continue
            
        # Gunakan list agar tidak membebani memory jika file sangat banyak
        label_files = list(ldir.glob("*.txt"))
        
        for label_file in label_files:
            files_scanned += 1
            if files_scanned % 500 == 0:
                print(".", end="", flush=True)
                
            try:
                with open(label_file, "r") as f:
                    lines = [line.strip() for line in f if line.strip()]
                    if not lines: continue
                    
                    classes_in_file = set(int(line.split()[0]) for line in lines)
                    
                    if class_id in classes_in_file:
                        img_name = label_file.stem
                        img_path = None
                        for ext in ['.jpg', '.png', '.jpeg', '.JPG']:
                            p = idir / f"{img_name}{ext}"
                            if p.exists():
                                img_path = p
                                break
                        
                        if img_path:
                            if len(classes_in_file) == 1:
                                candidates_pure.append(str(img_path))
                            else:
                                candidates_mixed.append(str(img_path))
            except:
                continue
            
            # Jika sudah dapat cukup sampel murni, stop scanning folder ini
            if len(candidates_pure) >= max_images:
                break
        
        if len(candidates_pure) >= max_images:
            break
            
    print(" Selesai.")
    return (candidates_pure + candidates_mixed)[:max_images]

def main():
    print("\n" + "="*60)
    print("🧪 COLONYAI MODEL VISUALIZATION TEST (FAST MODE)")
    print("="*60)
    
    if not os.path.exists(MODEL_PATH):
        print(f"❌ ERROR: Model tidak ditemukan di {MODEL_PATH}")
        return

    print(">> Loading Model (YOLOv8)...")
    try:
        model = YOLO(MODEL_PATH)
        # Force device to avoid detection hang
        device = 'cpu' # Default to CPU for stability in visualization
        print(f">> Model Loaded. Target Device: {device}")
    except Exception as e:
        print(f"❌ ERROR saat load model: {e}")
        return
    
    out_path = Path(OUTPUT_DIR)
    if out_path.exists():
        try:
            shutil.rmtree(out_path)
        except:
            print(">> Warning: Gagal menghapus folder lama, mungkin sedang dibuka aplikasi lain.")
    out_path.mkdir(parents=True, exist_ok=True)
    
    for class_id, class_name in class_names.items():
        print(f"\n[CLASS {class_id}] {class_name.upper()}")
        
        class_out_dir = out_path / class_name
        class_out_dir.mkdir(parents=True, exist_ok=True)
        
        images = get_images_for_class(class_id, max_images=IMAGES_PER_CLASS)
        
        if not images:
            print(f"   ⚠️ Tidak ada gambar ditemukan!")
            continue
            
        print(f"   Running inference pada {len(images)} gambar...")
        for i, img_path in enumerate(images):
            results = model(img_path, conf=CONF_THRESHOLD, verbose=False)
            result = results[0]
            
            save_name = f"test_{i+1}_{Path(img_path).name}"
            save_path = class_out_dir / save_name
            result.save(filename=str(save_path))
            print(f"   ({i+1}/5) Terdeteksi: {len(result.boxes)} objek -> Saved.")
            
    print("\n" + "="*60)
    print(f"✅ AUDIT VISUAL SELESAI!")
    print(f"Folder: {OUTPUT_DIR}")
    print("="*60)

if __name__ == '__main__':
    main()
