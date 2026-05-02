import shutil
import os

def copy_test_images():
    # Direktori tujuan
    target_dir = r"d:\lombapuai\backend\imagetest"
    os.makedirs(target_dir, exist_ok=True)

    # Direktori asal (Gambar AI yang di-generate)
    src_pca = r"C:\Users\Legion\.gemini\antigravity\brain\b50d680a-1f0e-4bd8-983b-46a4eccb15aa\sample_pca_agar_1777701274584.png"
    src_mac = r"C:\Users\Legion\.gemini\antigravity\brain\b50d680a-1f0e-4bd8-983b-46a4eccb15aa\sample_macconkey_agar_1777701346278.png"
    src_5classes = r"C:\Users\Legion\.gemini\antigravity\brain\b50d680a-1f0e-4bd8-983b-46a4eccb15aa\sample_5classes_agar_1777702203693.png"

    # Tujuan file
    dst_pca = os.path.join(target_dir, "sample_pca_agar.png")
    dst_mac = os.path.join(target_dir, "sample_macconkey_agar.png")
    dst_5classes = os.path.join(target_dir, "sample_5classes_agar.png")

    try:
        shutil.copy2(src_pca, dst_pca)
        print(f"[BERHASIL] Gambar PCA disalin ke: {dst_pca}")
    except Exception as e:
        print(f"[GAGAL] Gagal menyalin gambar PCA: {e}")

    try:
        shutil.copy2(src_mac, dst_mac)
        print(f"[BERHASIL] Gambar MacConkey disalin ke: {dst_mac}")
    except Exception as e:
        print(f"[GAGAL] Gagal menyalin gambar MacConkey: {e}")

    try:
        shutil.copy2(src_5classes, dst_5classes)
        print(f"[BERHASIL] Gambar 5-Classes disalin ke: {dst_5classes}")
    except Exception as e:
        print(f"[GAGAL] Gagal menyalin gambar 5-Classes: {e}")

if __name__ == "__main__":
    copy_test_images()
