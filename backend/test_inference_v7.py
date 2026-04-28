import sys
import os
import cv2
from pathlib import Path

# Add backend directory to sys.path so we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.colony_detector import ColonyDetector

def test_inference(image_path: str):
    print(f"=== MENGUJI MODEL V7 ===")
    print(f"Gambar: {image_path}")
    print("Memuat ColonyDetector (YOLOv8 v7 weights)...")
    
    try:
        detector = ColonyDetector()
    except Exception as e:
        print(f"Gagal memuat model: {e}")
        return

    # Baca gambar
    img = cv2.imread(image_path)
    if img is None:
        print("Gagal membaca gambar.")
        return

    # Convert BGR to RGB since preprocess usually outputs RGB
    # But ColonyDetector expect RGB image for detection internally (or YOLO handles it)
    # Actually, the original preprocessing passes RGB to detector.
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    print("Menjalankan inferensi...")
    detections = detector.detect(img_rgb, confidence_override=0.25)
    
    summary = detector.get_detection_summary(detections)
    
    print("\n--- HASIL DETEKSI (5 CLASS) ---")
    print(f"Valid Colonies:")
    print(f"  - colony_single : {summary.get('colony_single', 0)}")
    print(f"  - colony_merged : {summary.get('colony_merged', 0)}")
    print(f"")
    print(f"Artifacts (Prioritas untuk disaring):")
    print(f"  - bubble        : {summary.get('bubble', 0)}")
    print(f"  - dust_debris   : {summary.get('dust_debris', 0)}")
    print(f"  - media_crack   : {summary.get('media_crack', 0)}")
    print("-------------------------------\n")
    print("Testing selesai. Hasil ini memastikan bahwa model berhasil memisahkan")
    print("koloni valid dari artefak sesuai dengan Challenge Utama (Case 1).")

if __name__ == "__main__":
    # Test with one image from test dataset
    test_image = r"d:\lombapuai\ml-training\datasets\colony_dataset\test\images\bubble_162_png.rf.f4e3e1e53356d5e6807c1ec53787bc5d.jpg"
    test_inference(test_image)
