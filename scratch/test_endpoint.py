import asyncio
import sqlite3
import sys
import os

# Add backend directory to sys.path
sys.path.append("d:/lombapuai/backend")

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.models import Organization

async def test_endpoint():
    # Setup connection
    engine = create_async_engine("sqlite+aiosqlite:///d:/lombapuai/backend/colonyai.db")
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as db:
        result = await db.execute(select(Organization))
        orgs = result.scalars().all()
        
        with open("d:/lombapuai/scratch/endpoint_log.txt", "w", encoding="utf-8") as f:
            f.write("Organization instances in SQLAlchemy:\n")
            for org in orgs:
                status_val = "active" if org.is_active in [1, True, "active", "1"] else ("suspended" if org.is_active in [0, False, "suspended", "0"] else str(org.is_active))
                f.write(f"- Name: {org.name} | is_active: {org.is_active} (type: {type(org.is_active)}) | Mapped Status: {status_val}\n")

if __name__ == "__main__":
    asyncio.run(test_endpoint())
