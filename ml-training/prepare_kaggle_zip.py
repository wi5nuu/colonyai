import os
import zipfile
import sys

dataset_dir = r"D:\lombapuai\ml-training\datasets\colony_dataset"
last_pt_path = r"D:\lombapuai\ml-training\runs\detect\runs\detect\colony_v8_balanced\weights\last.pt"
output_zip = r"D:\lombapuai\kaggle_colony_ready.zip"

def create_zip():
    print(f"📦 Menyiapkan file ZIP untuk Kaggle: {output_zip}")
    print("⏳ Mohon tunggu, proses memakan waktu 1-3 menit karena ada ribuan gambar...")
    
    try:
        with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
            # 1. Masukkan file last.pt
            if os.path.exists(last_pt_path):
                print("   -> Membungkus file last.pt (Otak AI)...")
                zipf.write(last_pt_path, arcname="last.pt")
            else:
                print(f"   ⚠️ WARNING: last.pt tidak ditemukan di {last_pt_path}")

            # 2. Masukkan folder dataset
            print("   -> Membungkus folder dataset...")
            
            # Hitung jumlah file dulu untuk progress bar sederhana
            total_files = sum([len(files) for r, d, files in os.walk(dataset_dir)])
            count = 0
            
            for root, dirs, files in os.walk(dataset_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.join("colony_dataset", os.path.relpath(file_path, start=dataset_dir))
                    zipf.write(file_path, arcname)
                    
                    count += 1
                    if count % 1000 == 0:
                        print(f"      Telah membungkus {count}/{total_files} file...")

        print("\n✅ SELESAI TOTAL!")
        print("="*50)
        print("File Anda sudah siap di-upload ke Kaggle:")
        print(f"👉 {output_zip}")
        print("="*50)
        
    except Exception as e:
        print(f"\n❌ Terjadi kesalahan saat membuat ZIP: {e}")

if __name__ == "__main__":
    create_zip()
