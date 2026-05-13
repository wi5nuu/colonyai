"""
ColonyAI - 5 Class Visual Test
Pilih 1 gambar per kelas, jalankan deteksi, simpan gambar anotasi.
Output: D:\\lombapuai\\audit_visuals\\5class_test\\
"""
import os
import cv2
from ultralytics import YOLO

MODEL_PATH    = r"D:\lombapuai\backend\models\colony_best_new.pt"
TEST_IMG_DIR  = r"D:\lombapuai\ml-training\datasets\colonyai_merged\test\images"
OUTPUT_DIR    = r"D:\lombapuai\audit_visuals\5class_test"
CONF          = 0.15   # threshold sangat rendah agar semua terdeteksi

# Warna BGR per kelas
COLORS = {
    "colony_single":  (0,   220,  80),   # Hijau
    "colony_merged":  (0,   165, 255),   # Oranye
    "bubble":         (255, 100, 100),   # Biru muda
    "dust_debris":    (0,   0,   220),   # Merah
    "media_crack":    (200,   0, 200),   # Ungu
}

# Kandidat gambar per kelas (prefix nama file)
CLASS_CANDIDATES = {
    "colony_single":  "cfu_colony_12997",
    "colony_merged":  "agar_converted_agar_13938",
    "bubble":         "bubble_srieit_237",
    "dust_debris":    "new_colony_5033",
    "media_crack":    "crack_raimundo_1021",
}

def draw_boxes(img, boxes, names):
    """Gambar bounding box di atas gambar."""
    for box in boxes:
        cls_id = int(box.cls[0])
        cls_name = names[cls_id]
        conf = float(box.conf[0])
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        color = COLORS.get(cls_name, (255, 255, 255))
        cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)
        label = f"{cls_name} {conf:.0%}"
        (lw, lh), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.55, 2)
        cv2.rectangle(img, (x1, y1 - lh - 6), (x1 + lw, y1), color, -1)
        cv2.putText(img, label, (x1, y1 - 4),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 0, 0), 2)
    return img

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print("=" * 60)
    print("    ColonyAI - 5-Class Visual Audit Test")
    print("=" * 60)

    if not os.path.exists(MODEL_PATH):
        print(f"❌ Model tidak ditemukan: {MODEL_PATH}")
        return

    model = YOLO(MODEL_PATH)
    print(f"✅ Model dimuat: {os.path.basename(MODEL_PATH)}")
    print(f"   Kelas: {list(model.names.values())}\n")

    all_files = os.listdir(TEST_IMG_DIR)
    found_all = True

    for cls_name, prefix in CLASS_CANDIDATES.items():
        # Cari file yang cocok dengan prefix
        match = next((f for f in all_files if f.startswith(prefix)), None)
        if match is None:
            print(f"⚠️  [{cls_name}] File dengan prefix '{prefix}' tidak ditemukan!")
            found_all = False
            continue

        img_path = os.path.join(TEST_IMG_DIR, match)
        print(f"🔍 [{cls_name}]")
        print(f"   Gambar : {match}")

        results = model(img_path, conf=CONF, verbose=False)
        result  = results[0]

        # Hitung deteksi per kelas
        cls_counts = {}
        for box in result.boxes:
            cid = int(box.cls[0])
            cname = model.names[cid]
            cls_counts[cname] = cls_counts.get(cname, 0) + 1

        print(f"   Deteksi: {cls_counts if cls_counts else 'Tidak ada deteksi'}")

        # Simpan gambar teranotasi
        img = cv2.imread(img_path)
        img = draw_boxes(img, result.boxes, model.names)
        out_path = os.path.join(OUTPUT_DIR, f"test_{cls_name}.jpg")
        cv2.imwrite(out_path, img)
        print(f"   Disimpan: {out_path}")
        print()

    print("=" * 60)
    print(f"✅ Selesai! Buka folder berikut untuk melihat hasilnya:")
    print(f"   {OUTPUT_DIR}")
    print("=" * 60)

if __name__ == "__main__":
    main()
