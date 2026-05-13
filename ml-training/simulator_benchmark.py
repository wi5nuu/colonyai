import os
import torch
from ultralytics import YOLO
import pandas as pd
from pathlib import Path

# Paths
MODEL_PATH = "runs/detect/colony_detection_full/weights/best.pt"
DATASET_PATH = "datasets/colony_dataset"
TEST_LABELS = os.path.join(DATASET_PATH, "test/labels")
TEST_IMAGES = os.path.join(DATASET_PATH, "test/images")

def run_benchmark():
    if not os.path.exists(MODEL_PATH):
        print(f"❌ Model belum ditemukan di {MODEL_PATH}. Tunggu training selesai.")
        return

    print("🚀 Memulai Simulator Akurasi (AI vs Manual Benchmarking)...")
    model = YOLO(MODEL_PATH)
    
    results_data = []
    class_names = {0: 'colony_single', 1: 'colony_merged', 2: 'bubble', 3: 'dust_debris', 4: 'media_crack'}
    
    # Ambil 10 gambar random dari test set untuk simulasi cepat
    image_files = list(Path(TEST_IMAGES).glob("*.jpg"))[:10]
    
    for img_path in image_files:
        # 1. Hitung Manual (dari Label File)
        label_path = os.path.join(TEST_LABELS, img_path.stem + ".txt")
        manual_counts = {name: 0 for name in class_names.values()}
        
        if os.path.exists(label_path):
            with open(label_path, 'r') as f:
                for line in f:
                    cls_id = int(line.split()[0])
                    if cls_id in class_names:
                        manual_counts[class_names[cls_id]] += 1
        
        # 2. Hitung AI (Inference)
        results = model(img_path, imgsz=640, verbose=False)
        ai_counts = {name: 0 for name in class_names.values()}
        for box in results[0].boxes:
            cls_id = int(box.cls[0])
            if cls_id in class_names:
                ai_counts[class_names[cls_id]] += 1
        
        # 3. Hitung Akurasi
        total_manual = manual_counts['colony_single'] + manual_counts['colony_merged']
        total_ai = ai_counts['colony_single'] + ai_counts['colony_merged']
        
        accuracy = 100 - (abs(total_manual - total_ai) / max(total_manual, 1) * 100)
        
        results_data.append({
            "Image": img_path.name,
            "Manual_Valid": total_manual,
            "AI_Valid": total_ai,
            "Accuracy_%": round(max(0, accuracy), 2),
            "Bubbles_AI": ai_counts['bubble'],
            "Dust_AI": ai_counts['dust_debris']
        })

    df = pd.DataFrame(results_data)
    print("\n" + "="*50)
    print("HASIL SIMULATOR AKURASI (10 SAMPEL PERTAMA)")
    print("="*50)
    print(df.to_string(index=False))
    print("="*50)
    print(f"Rata-rata Akurasi Deteksi Koloni: {df['Accuracy_%'].mean():.2f}%")
    print("="*50)

if __name__ == "__main__":
    run_benchmark()
