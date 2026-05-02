import asyncio
from app.core.database import AsyncSessionLocal
from sqlalchemy import text

async def check():
    print("--- Database Integrity Check ---")
    async with AsyncSessionLocal() as s:
        try:
            tables = await s.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
            print("Tables found:", [t[0] for t in tables.all()])
            
            org_count = await s.execute(text("SELECT count(*) FROM organizations"))
            print("Organizations count:", org_count.scalar())
            
            user_count = await s.execute(text("SELECT count(*) FROM users"))
            print("Users count:", user_count.scalar())
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(check())
