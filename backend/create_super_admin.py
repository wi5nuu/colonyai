import asyncio
import os
import sys
from pathlib import Path
import uuid

# Add backend directory to sys.path
backend_path = Path(__file__).parent.resolve()
sys.path.append(str(backend_path))

from app.core.database import AsyncSessionLocal
from app.models import User, UserRole, Organization
from app.core.security import get_password_hash
from sqlalchemy import select, text

async def setup_super_admin():
    print("--- ColonyAI Super Admin Provisioning (Multi-Tenant) ---")
    
    email = "master@colonyai.diag"
    password = "SuperAdmin2026!"
    
    async with AsyncSessionLocal() as session:
        try:
            # Check schema integrity first
            print("Verifying database schema...")
            await session.execute(text("SELECT organization_id FROM users LIMIT 1"))
            
            # 1. Check if SUPER_ADMIN already exists
            result = await session.execute(select(User).where(User.email == email))
            user = result.scalar_one_or_none()
            
            if user:
                print(f"Super Admin {email} already exists. Updating password...")
                user.password_hash = get_password_hash(password)
                user.role = UserRole.SUPER_ADMIN
                user.is_locked_out = 'no'
            else:
                print(f"Creating new Super Admin: {email}")
                user = User(
                    id=uuid.uuid4(),
                    email=email,
                    password_hash=get_password_hash(password),
                    full_name="Global Master Administrator",
                    role=UserRole.SUPER_ADMIN,
                    organization_id=None # Super Admin is global
                )
                session.add(user)
            
            await session.commit()
            print(f"\n[SUCCESS] Super Admin Provisioned.")
            print(f"Email: {email}")
            print(f"Password: {password}")
        except Exception as e:
            print(f"\n[CRITICAL ERROR] Database issue: {e}")
            print("Tip: Run 'python recreate_db.py' first to fix the schema.")
            await session.rollback()

if __name__ == "__main__":
    asyncio.run(setup_super_admin())
