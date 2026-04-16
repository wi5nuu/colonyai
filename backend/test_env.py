from pathlib import Path
from dotenv import dotenv_values

backend_dir = Path(__file__).parent
env_path = backend_dir / ".env"

print(f"Backend dir: {backend_dir}")
print(f"Env path: {env_path}")
print(f"Env exists: {env_path.exists()}")

vals = dotenv_values(str(env_path))
print(f"Dotenv values: {vals}")
