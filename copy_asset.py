import shutil
import os

src = r"d:\lombapuai\backend\imagetest\sample_macconkey_agar.png"
dst = r"d:\lombapuai\frontend\public\sample_plate.png"

try:
    shutil.copy2(src, dst)
    print(f"Successfully copied {src} to {dst}")
except Exception as e:
    print(f"Error copying file: {e}")
