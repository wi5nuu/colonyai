import asyncio
import sys

# Add backend directory to sys.path
sys.path.append("d:/lombapuai/backend")

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.models import Organization, User, Analysis, UserRole

async def test_endpoint():
    engine = create_async_engine("sqlite+aiosqlite:///d:/lombapuai/backend/colonyai.db")
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as db:
        result = await db.execute(select(Organization))
        orgs = result.scalars().all()
        
        with open("d:/lombapuai/scratch/json_log.txt", "w", encoding="utf-8") as f:
            for org in orgs:
                status_val = str(getattr(org.is_active, "value", org.is_active) or "active").lower()
                f.write(f"Name: {org.name} | raw is_active: {repr(org.is_active)} | status_val: {repr(status_val)}\n")

if __name__ == "__main__":
    asyncio.run(test_endpoint())
