import asyncio
from sqlalchemy import text
from app.core.database import SessionLocal

async def activate_users():
    db = SessionLocal()
    try:
        # Set all users to active (True/1)
        await db.execute(text("UPDATE users SET is_active = 1"))
        await db.commit()
        print("Successfully activated all users in database.")
    except Exception as e:
        print(f"Error: {e}")
        await db.rollback()
    finally:
        await db.close()

if __name__ == "__main__":
    asyncio.run(activate_users())
