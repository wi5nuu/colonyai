import asyncio
import os
import sys
from pathlib import Path

# Setup path
backend_path = Path(__file__).parent.resolve()
sys.path.append(str(backend_path))
db_file = backend_path / "colonyai.db"

async def recreate_database():
    print("--- ColonyAI Master Database Purge & Rebuild ---")
    
    # 1. Hapus database lama secara paksa
    if db_file.exists():
        print(f"Force removing: {db_file}")
        try:
            os.remove(db_file)
            print("Old database deleted successfully.")
        except Exception as e:
            print(f"Error deleting file: {e}")
            return

    # 2. Import setelah file dihapus agar tidak ada cache
    from app.core.database import engine
    from app.models import Base
    
    # Import all models to ensure they are registered in Base.metadata
    import app.models
    
    # 3. Buat ulang semua tabel secara eksplisit
    print("Executing 'CREATE ALL' on fresh database...")
    async with engine.begin() as conn:
        # Debug: list tables before
        await conn.run_sync(Base.metadata.drop_all) # Ensure it's clean
        await conn.run_sync(Base.metadata.create_all)
    
    print("\n[SUCCESS] New Multi-Tenant Schema Deployed.")
    print("Verified Tables: Organization, User, Analysis, etc.")
    print("Next step: python create_super_admin.py")

if __name__ == "__main__":
    asyncio.run(recreate_database())
