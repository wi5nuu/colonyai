import asyncio
from app.core.database import AsyncSessionLocal, init_db
from app.models import User
from sqlalchemy.future import select

async def get_mfa(email):
    await init_db()
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.email == email))
        user = result.scalars().first()
        if user and user.mfa_code:
            print(f"\n==================================================")
            print(f"🔐 CURRENT MFA CODE FOR {email}")
            print(f"👉 CODE: {user.mfa_code}")
            print(f"⌛ EXPIRES: {user.mfa_expires}")
            print(f"==================================================\n")
        else:
            print(f"No active MFA code found for {email}")

if __name__ == "__main__":
    import sys
    email = sys.argv[1] if len(sys.argv) > 1 else "wisnu.ashar@gmail.com"
    asyncio.run(get_mfa(email))
