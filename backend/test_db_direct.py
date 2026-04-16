import asyncio
import sys
sys.path.insert(0, '.')

from app.core.database import init_db, AsyncSessionLocal
from app.core.security import verify_password
from sqlalchemy import select
from app.models import User

async def test_db():
    print("Initializing DB...")
    await init_db()
    
    print("Creating session...")
    async with AsyncSessionLocal() as session:
        print("Querying for admin user...")
        result = await session.execute(select(User).where(User.email == "admin@colonyai.com"))
        user = result.scalar_one_or_none()
        
        if not user:
            print("❌ User not found!")
            return
        
        print(f"✅ User found: {user.email}")
        print(f"Password hash: {user.password_hash[:20]}...")
        
        test_password = "admin_secure_2026"
        is_valid = verify_password(test_password, user.password_hash)
        print(f"Password verification: {is_valid}")
        
        print(f"Role: {user.role}")
        print(f"Role type: {type(user.role)}")
        print(f"Role value: {user.role.value if hasattr(user.role, 'value') else str(user.role)}")

asyncio.run(test_db())
