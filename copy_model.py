import shutil
from pathlib import Path

src = Path('C:/Users/Legion/runs/detect/colonyai_custom/weights/best.pt')
dst = Path('D:/lombapuai/backend/models/colony_best_new.pt')

if src.exists():
    shutil.copy2(src, dst)
    print(f"✓ Model copied to: {dst}")
    print(f"  Size: {dst.stat().st_size / 1024 / 1024:.1f} MB")
else:
    print(f"❌ Model not found at: {src}")
    # Try alternate path
    alt = Path('C:/Users/Legion/runs/detect/runs/detect/colonyai_custom/weights/best.pt')
    if alt.exists():
        shutil.copy2(alt, dst)
        print(f"✓ Model copied from alternate path: {dst}")
    else:
        print("Cari manual di: C:/Users/Legion/runs/")
