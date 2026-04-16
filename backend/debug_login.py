import asyncio
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

async def test_login():
    from app.core.database import init_db, AsyncSessionLocal
    from app.core.security import verify_password, get_password_hash
    from sqlalchemy import select
    from app.models import User
    from app.api.v1.endpoints.auth import login
    from pydantic import BaseModel
    
    print("1. Initializing database...")
    await init_db()
    
    print("2. Checking if admin user exists...")
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.email == "admin@colonyai.com"))
        user = result.scalar_one_or_none()
        
        if not user:
            print("❌ Admin user not found in database!")
            print("   This means init_db() didn't seed the admin user properly.")
            return
        
        print(f"✅ Admin user found: {user.email}")
        print(f"   ID: {user.id}")
        print(f"   Full name: {user.full_name}")
        print(f"   Role: {user.role}")
        print(f"   Password hash present: {bool(user.password_hash)}")
        
        # Test password verification
        test_pwd = "admin_secure_2026"
        is_valid = verify_password(test_pwd, user.password_hash)
        print(f"   Password verification: {is_valid}")

asyncio.run(test_login())
