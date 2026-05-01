import asyncio
import os
import sys
from pathlib import Path
import uuid

# Add backend directory to sys.path
backend_path = Path(__file__).parent.resolve()
sys.path.append(str(backend_path))

from app.core.database import AsyncSessionLocal, get_db
from app.models import User, UserRole
from app.core.security import get_password_hash
from sqlalchemy import select

async def emergency_reset():
    print("--- ColonyAI Emergency Admin Recovery ---")
    
    email = input("Enter Admin Email to reset: ")
    new_password = input("Enter New Password: ")
    
    if len(new_password) < 8:
        print("Error: Password must be at least 8 characters.")
        return

    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if not user:
            print(f"Error: User with email {email} not found.")
            return
            
        if user.role != UserRole.ADMIN:
            confirm = input(f"Warning: User {email} is not an ADMIN. Promote to ADMIN? (y/n): ")
            if confirm.lower() == 'y':
                user.role = UserRole.ADMIN
                print(f"Promoting {email} to ADMIN.")
        
        user.password_hash = get_password_hash(new_password)
        user.is_locked_out = 'no'
        user.failed_login_attempts = 0
        
        await session.commit()
        print(f"\n[SUCCESS] Password for {email} has been reset.")
        print("You can now login via the web interface.")

if __name__ == "__main__":
    asyncio.run(emergency_reset())
