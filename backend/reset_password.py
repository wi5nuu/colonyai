import asyncio
from app.core.database import AsyncSessionLocal, init_db
from app.models import User
from app.core.security import get_password_hash
from sqlalchemy.future import select

async def reset_password(email, new_password):
    await init_db()
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.email == email))
        user = result.scalars().first()
        if user:
            print(f"Resetting password for {email}...")
            user.password_hash = get_password_hash(new_password)
            await session.commit()
            print("Password reset successful!")
        else:
            print(f"User {email} not found.")

if __name__ == "__main__":
    import sys
    email = sys.argv[1] if len(sys.argv) > 1 else "wisnualfian117@gmail.com"
    pw = sys.argv[2] if len(sys.argv) > 2 else "ColonyAI2026!"
    asyncio.run(reset_password(email, pw))
