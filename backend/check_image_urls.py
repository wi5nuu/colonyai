import asyncio
from app.core.database import AsyncSessionLocal
from sqlalchemy import text

async def check():
    async with AsyncSessionLocal() as s:
        result = await s.execute(text(
            "SELECT id, original_image_url, annotated_image_url FROM analyses ORDER BY created_at DESC LIMIT 5"
        ))
        rows = result.fetchall()
        if not rows:
            print("No analyses found in DB.")
        for r in rows:
            print(f"\nID: {str(r[0])[:8]}...")
            print(f"  original : {r[1]}")
            print(f"  annotated: {r[2]}")

if __name__ == "__main__":
    asyncio.run(check())
