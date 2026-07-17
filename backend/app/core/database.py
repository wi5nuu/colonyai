from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

DB_AVAILABLE = False


def get_engine():
    """Create async engine with graceful fallback"""
    try:
        # SQLite specific logic: pool_size and max_overflow are NOT supported
        if settings.DATABASE_URL.startswith("sqlite"):
            # For SQLite, ensure the path is absolute for reliability
            db_url = settings.DATABASE_URL
            # If it's a relative path like sqlite+aiosqlite:///colonyai.db,
            # aiosqlite will handle it relative to cwd
            engine = create_async_engine(
                db_url,
                echo=settings.DEBUG
            )
        else:
            engine = create_async_engine(
                settings.DATABASE_URL,
                pool_size=settings.DATABASE_POOL_SIZE,
                max_overflow=settings.DATABASE_MAX_OVERFLOW,
                echo=settings.DEBUG
            )
        return engine
    except Exception as e:
        logger.warning(f"[DATABASE] Database engine init failed: {e}")
        return None


engine = get_engine()

if engine:
    AsyncSessionLocal = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False
    )
else:
    AsyncSessionLocal = None

Base = declarative_base()


async def init_db():
    """Initialize database connection and create tables.
    Gracefully handles missing PostgreSQL for demo mode."""
    global DB_AVAILABLE, engine

    if engine is None:
        logger.warning("[DATABASE] Database not configured. Running in DEMO MODE (no persistence).")
        logger.warning("   To enable full features: install PostgreSQL and set DATABASE_URL in .env")
        DB_AVAILABLE = False
        return

    # Import all models to ensure they are registered with Base.metadata
    from app.models import (
        User, Organization, Analysis, ColonyDetection, AuditLog, 
        SimulatorComparison, Correction, CorrectionSession, UserRole,
        Notification, LimsLog, PasswordResetRequest, TokenBlacklist
    )
    from app.models.preferences import UserPreference, UserSession
    from sqlalchemy.future import select
    from app.core.security import get_password_hash

    try:
        async with engine.begin() as conn:
            logger.info("[DATABASE] Creating/Verifying tables...")
            await conn.run_sync(Base.metadata.create_all)
        DB_AVAILABLE = True
        logger.info("[DATABASE] Connection successful and tables synchronized.")
        
        # Seed only Super Admin (all other users must belong to an organization)
        async with AsyncSessionLocal() as session:
            super_admin_email = settings.INITIAL_SUPER_ADMIN_EMAIL
            result = await session.execute(select(User).where(User.email == super_admin_email))
            super_admin_user = result.scalars().first()
            if not super_admin_user:
                logger.info(f"Seeding super admin: {super_admin_email}")
                session.add(User(
                    email=super_admin_email,
                    password_hash=get_password_hash(settings.INITIAL_SUPER_ADMIN_PASSWORD),
                    full_name="Super Administrator",
                    role=UserRole.SUPER_ADMIN,
                    organization_id=None,
                ))
                await session.commit()
            else:
                # Only update if needed (password changed), skip if already correct
                if super_admin_user.organization_id is not None:
                    super_admin_user.organization_id = None
                super_admin_user.role = UserRole.SUPER_ADMIN
                try:
                    await session.commit()
                except Exception:
                    await session.rollback()
                    # User exists and is correct - no need to force update
    except Exception as e:
        logger.warning(f"[DATABASE] Database connection failed: {e}")
        logger.warning("   Running in DEMO MODE. Endpoints respond but data not persisted.")
        logger.warning("   To fix: Install PostgreSQL and set DATABASE_URL in backend/.env")
        DB_AVAILABLE = False


async def get_db():
    """Get database session"""
    if AsyncSessionLocal is None:
        raise Exception("Database not available. Configure DATABASE_URL in .env")
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
