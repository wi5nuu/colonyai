import os
import cv2
import numpy as np
from ultralytics import YOLO
import sys

# Path Konfigurasi
MODEL_PATH = r"D:\lombapuai\backend\models\colony_best_new.pt"
TEST_IMG_DIR = r"D:\lombapuai\ml-training\datasets\colonyai_merged\test\images"

def verify_ai_intelligence():
    print("====================================================")
    print("       ColonyAI - 5-Class Intelligence Audit        ")
    print("====================================================")
    
    if not os.path.exists(MODEL_PATH):
        print(f"❌ Model tidak ditemukan di: {MODEL_PATH}")
        return

    # Load Model
    print(f"🧠 Memuat Model: {os.path.basename(MODEL_PATH)}")
    model = YOLO(MODEL_PATH)
    
    # Ambil 3 gambar tes secara acak
    test_files = [f for f in os.listdir(TEST_IMG_DIR) if f.endswith(('.jpg', '.jpeg', '.png'))]
    if not test_files:
        print("❌ Tidak ada gambar tes di folder dataset.")
        return
        
    import random
    selected_files = random.sample(test_files, min(3, len(test_files)))

    for filename in selected_files:
        img_path = os.path.join(TEST_IMG_DIR, filename)
        print(f"\n🔍 Menganalisis Gambar: {filename}")
        
        # Jalankan Inference
        results = model(img_path, conf=0.25, verbose=False)
        result = results[0]
        
        # Hitung Distribusi Kelas
        counts = {
            "colony_single": 0,
            "colony_merged": 0,
            "bubble": 0,
            "dust_debris": 0,
            "media_crack": 0
        }
        
        for box in result.boxes:
            cls_id = int(box.cls[0])
            cls_name = model.names[cls_id]
            if cls_name in counts:
                counts[cls_name] += 1
            else:
                counts[f"Unknown_{cls_id}"] = counts.get(f"Unknown_{cls_id}", 0) + 1

        # Tampilkan Hasil
        print("----------------------------------------------------")
        print(f"✅ HASIL DETEKSI (Confidence > 0.25):")
        total = sum(counts.values())
        
        for cls, count in counts.items():
            bar = "█" * (count // 10) if count > 0 else ""
            status = "✨ AKTIF" if count > 0 else "💤 Tidak ditemukan di sampel ini"
            print(f"  - {cls.ljust(15)}: {str(count).rjust(4)} nodes | {status} {bar}")
            
        print(f"\n  TOTAL OBJECTS: {total}")
        print("----------------------------------------------------")

if __name__ == "__main__":
    verify_ai_intelligence()
