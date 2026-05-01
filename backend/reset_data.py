import asyncio
import os
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_path = Path(__file__).parent.resolve()
sys.path.append(str(backend_path))

from app.core.database import AsyncSessionLocal, init_db
from app.models import User, Analysis, ColonyDetection, AuditLog, SimulatorComparison, TokenBlacklist, Organization
from app.models.preferences import UserPreference, UserSession
from app.core.config import settings
from sqlalchemy import delete

async def reset_data():
    print("--- Memulai Reset Data ColonyAI (Factory Reset) ---")
    
    if not AsyncSessionLocal:
        print("Database tidak tersedia atau tidak terkonfigurasi.")
        return

    async with AsyncSessionLocal() as session:
        try:
            # 1. Hapus data transaksi (Data yang diinput user)
            print("Membersihkan tabel transaksi, organisasi, dan log...")
            # ColonyDetection depends on Analysis
            await session.execute(delete(ColonyDetection))
            await session.execute(delete(SimulatorComparison))
            await session.execute(delete(Analysis))
            await session.execute(delete(AuditLog))
            await session.execute(delete(TokenBlacklist))
            await session.execute(delete(UserSession))
            await session.execute(delete(UserPreference))
            await session.execute(delete(Organization))
            
            # Clear users to ensure fresh seeding
            print("Membersihkan tabel users...")
            await session.execute(delete(User))
            
            await session.commit()
            print("[BERHASIL] Seluruh tabel database telah dikosongkan.")
        except Exception as e:
            print(f"[GAGAL] Gagal mengosongkan database: {e}")
            await session.rollback()
            return

    # 2. Hapus file fisik (images & reports)
    print("\n--- Menghapus File Unggahan & Laporan ---")
    upload_dirs = [
        Path(backend_path) / "uploads" / "original",
        Path(backend_path) / "uploads" / "annotated",
        Path(backend_path) / "uploads" / "reports"
    ]
    
    # Also check from settings just in case it's different
    settings_upload_dir = Path(settings.UPLOAD_DIR)
    if settings_upload_dir.is_absolute():
        upload_dirs.append(settings_upload_dir / "original")
        upload_dirs.append(settings_upload_dir / "annotated")
        upload_dirs.append(settings_upload_dir / "reports")
    else:
        # relative to current working directory or backend
        upload_dirs.append(backend_path / settings_upload_dir / "original")
        upload_dirs.append(backend_path / settings_upload_dir / "annotated")
        upload_dirs.append(backend_path / settings_upload_dir / "reports")

    # Remove duplicates and normalize
    unique_dirs = []
    for d in upload_dirs:
        norm_d = d.resolve()
        if norm_d not in unique_dirs:
            unique_dirs.append(norm_d)

    for d in unique_dirs:
        try:
            if d.exists() and d.is_dir():
                file_count = 0
                for item in d.iterdir():
                    if item.is_file() and item.name != ".gitkeep":
                        item.unlink()
                        file_count += 1
                print(f"[BERHASIL] Direktori dibersihkan: {d} ({file_count} file dihapus)")
        except Exception as e:
            print(f"[GAGAL] Gagal membersihkan direktori {d}: {e}")

    # 3. Re-initialize database (Seeding default users)
    print("\n--- Menginisialisasi Ulang Database (Seeding) ---")
    try:
        await init_db()
        print("[BERHASIL] Database telah di-seed dengan user default (Admin, Manager, Auditor, Analyst).")
    except Exception as e:
        print(f"[GAGAL] Gagal inisialisasi ulang database: {e}")

    print("\nSistem ColonyAI sekarang kembali ke 0 (Fresh Start).")
    print("Silakan login kembali menggunakan kredensial default.")

if __name__ == "__main__":
    try:
        asyncio.run(reset_data())
    except KeyboardInterrupt:
        print("\nReset dibatalkan oleh pengguna.")
    except Exception as e:
        print(f"\nTerjadi kesalahan sistem: {e}")
