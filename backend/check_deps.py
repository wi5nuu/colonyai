import sys
import importlib

REQUIRED = [
    "fastapi", "uvicorn", "sqlalchemy", "alembic",
    "pydantic", "jose", "argon2", "PIL",
    "cv2", "ultralytics", "numpy",
]

missing = []
for mod in REQUIRED:
    try:
        importlib.import_module(mod)
    except ImportError:
        missing.append(mod)

if missing:
    print(f"MISSING: {', '.join(missing)}")
    sys.exit(1)
else:
    print("All dependencies OK")
