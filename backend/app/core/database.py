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
    from app.models import User, Analysis, ColonyDetection, AuditLog, SimulatorComparison, UserRole
    from sqlalchemy.future import select
    from app.core.security import get_password_hash

    try:
        async with engine.begin() as conn:
            print("[DATABASE] Creating/Verifying tables...")
            await conn.run_sync(Base.metadata.create_all)
        DB_AVAILABLE = True
        print("[DATABASE] Connection successful and tables synchronized.")
        
        # Seed initial users
        async with AsyncSessionLocal() as session:
            # 1. System Admin
            print(f"[DATABASE] Checking initial admin: {settings.INITIAL_ADMIN_EMAIL}")
            result = await session.execute(select(User).where(User.email == settings.INITIAL_ADMIN_EMAIL))
            admin_user = result.scalars().first()
            if not admin_user:
                logger.info(f"Seeding initial admin user: {settings.INITIAL_ADMIN_EMAIL}")
                new_admin = User(
                    email=settings.INITIAL_ADMIN_EMAIL,
                    password_hash=get_password_hash(settings.INITIAL_ADMIN_PASSWORD),
                    full_name="System Administrator",
                    role=UserRole.ADMIN
                )
                session.add(new_admin)
            else:
                # Update password to match .env
                admin_user.password_hash = get_password_hash(settings.INITIAL_ADMIN_PASSWORD)

            # 2. Lead Analyst (from README)
            analyst_email = "analyst@colonyai.com"
            result = await session.execute(select(User).where(User.email == analyst_email))
            analyst_user = result.scalars().first()
            if not analyst_user:
                logger.info(f"Seeding lead analyst: {analyst_email}")
                session.add(User(
                    email=analyst_email,
                    password_hash=get_password_hash("[REDACTED_SECRET]"),
                    full_name="Lead Analyst Primary",
                    role=UserRole.ANALYST
                ))
            else:
                analyst_user.password_hash = get_password_hash("[REDACTED_SECRET]")

            # 3. Lab Manager (from README)
            manager_email = "manager@colonyai.com"
            result = await session.execute(select(User).where(User.email == manager_email))
            manager_user = result.scalars().first()
            if not manager_user:
                logger.info(f"Seeding lab manager: {manager_email}")
                session.add(User(
                    email=manager_email,
                    password_hash=get_password_hash("[REDACTED_SECRET]"),
                    full_name="Laboratory Manager",
                    role=UserRole.MANAGER
                ))
            else:
                manager_user.password_hash = get_password_hash("[REDACTED_SECRET]")
                manager_user.role = UserRole.MANAGER

            # 4. Independent Auditor
            auditor_email = "auditor@colonyai.com"
            result = await session.execute(select(User).where(User.email == auditor_email))
            auditor_user = result.scalars().first()
            if not auditor_user:
                logger.info(f"Seeding auditor: {auditor_email}")
                session.add(User(
                    email=auditor_email,
                    password_hash=get_password_hash("[REDACTED_SECRET]"),
                    full_name="External Auditor",
                    role=UserRole.AUDITOR
                ))
            else:
                auditor_user.password_hash = get_password_hash("[REDACTED_SECRET]")
                auditor_user.role = UserRole.AUDITOR

            await session.commit()
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
