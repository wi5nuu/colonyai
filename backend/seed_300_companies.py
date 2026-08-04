"""
Seed 300 perusahaan + 4 role user per perusahaan.
Hanya superadmin yang TIDAK punya perusahaan.
"""
import asyncio, uuid, secrets, enum, re
from datetime import datetime, timedelta, timezone
from pathlib import Path
from argon2 import PasswordHasher
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, JSON, Enum as SAEnum, select, delete, text as sql_text
from sqlalchemy.orm import declarative_base, relationship
import sqlalchemy.types as types

class GUID(types.TypeDecorator):
    impl = types.CHAR
    cache_ok = True
    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            from sqlalchemy.dialects.postgresql import UUID
            return dialect.type_descriptor(UUID())
        else:
            return dialect.type_descriptor(types.CHAR(36))
    def process_bind_param(self, value, dialect):
        if value is None: return value
        elif dialect.name == 'postgresql': return str(value)
        else:
            if not isinstance(value, uuid.UUID): return str(uuid.UUID(value))
            else: return str(value)
    def process_result_value(self, value, dialect):
        if value is None: return value
        else:
            if not isinstance(value, uuid.UUID): return uuid.UUID(value)
            else: return value

pwd_context = PasswordHasher()
Base = declarative_base()

class UserRole(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    MANAGER = "manager"
    AUDITOR = "auditor"
    ANALYST = "analyst"

class OrgStatus(str, enum.Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    TRIAL = "trial"

class LockoutStatus(str, enum.Enum):
    YES = "yes"
    NO = "no"

class Organization(Base):
    __tablename__ = "organizations"
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    location = Column(String(255), nullable=True)
    license_key = Column(String(100), nullable=True)
    license_expires_at = Column(DateTime, nullable=True)
    is_active = Column(String(20), default=OrgStatus.ACTIVE.value)
    lims_webhook_url = Column(String(512), nullable=True)
    institution_type = Column(String(100), nullable=True, default="Clinical Laboratory")
    compliance_standard = Column(String(100), nullable=True, default="ISO-17025")
    infra_config = Column(JSON, nullable=True)
    max_users = Column(Integer, default=10)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    users = relationship("User", back_populates="organization")

class User(Base):
    __tablename__ = "users"
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    organization_id = Column(GUID(), ForeignKey("organizations.id"), nullable=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole), nullable=False, default=UserRole.ANALYST)
    laboratory_id = Column(GUID(), nullable=True)
    reset_token = Column(String(255), nullable=True, index=True)
    reset_token_expires = Column(DateTime, nullable=True)
    recovery_password = Column(String(255), nullable=True)
    failed_login_attempts = Column(Integer, default=0, nullable=False)
    last_failed_login = Column(DateTime, nullable=True)
    is_locked_out = Column(String(3), nullable=False, default=LockoutStatus.NO.value)
    is_active = Column(Boolean, default=True)
    mfa_code = Column(String(6), nullable=True)
    mfa_expires = Column(DateTime, nullable=True)
    trusted_devices = Column(JSON, nullable=True, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    organization = relationship("Organization", back_populates="users")

# ── 300 Perusahaan ──
COMPANIES = [
    ("PT Indofood Sukses Makmur Tbk", "Jakarta", "Food & Beverage"),
    ("PT Mayora Indah Tbk", "Tangerang", "Food & Beverage"),
    ("PT Nestle Indonesia", "Jakarta", "Food & Beverage"),
    ("PT Unilever Indonesia Tbk", "Tangerang", "Food & Beverage"),
    ("PT Frisian Flag Indonesia", "Jakarta", "Food & Beverage"),
    ("PT Sari Husada", "Yogyakarta", "Food & Beverage"),
    ("PT Aqua Golden Mississippi Tbk", "Jakarta", "Food & Beverage"),
    ("PT Coca-Cola Indonesia", "Jakarta", "Food & Beverage"),
    ("PT Danone Indonesia", "Jakarta", "Food & Beverage"),
    ("PT Wings Group", "Surabaya", "Food & Beverage"),
    ("PT Garudafood Putra Putri Jaya Tbk", "Gresik", "Food & Beverage"),
    ("PT Nippon Indosari Corpindo Tbk", "Jakarta", "Food & Beverage"),
    ("PT Campina Ice Cream Industry Tbk", "Surabaya", "Food & Beverage"),
    ("PT Ultrajaya Milk Industry Tbk", "Bandung", "Food & Beverage"),
    ("PT Sekar Bumi Tbk", "Sidoarjo", "Food & Beverage"),
    ("PT Tiga Pilar Sejahtera Food Tbk", "Surakarta", "Food & Beverage"),
    ("PT Siantar Top Tbk", "Sidoarjo", "Food & Beverage"),
    ("PT Prasidha Aneka Niaga Tbk", "Jakarta", "Food & Beverage"),
    ("PT Multi Bintang Indonesia Tbk", "Tangerang", "Food & Beverage"),
    ("PT Delta Djakarta Tbk", "Bekasi", "Food & Beverage"),
    ("PT Kaldu Sari Nabati Indonesia", "Bandung", "Food & Beverage"),
    ("PT ABC President Indonesia", "Jakarta", "Food & Beverage"),
    ("PT Heinz ABC Indonesia", "Karawang", "Food & Beverage"),
    ("PT Mondelez Indonesia", "Jakarta", "Food & Beverage"),
    ("PT Mars Indonesia", "Jakarta", "Food & Beverage"),
    ("PT Indoagro Nusantara", "Jakarta", "Food & Beverage"),
    ("PT Wilmar Nabati Indonesia", "Medan", "Agribusiness & Food"),
    ("PT BISI International Tbk", "Subang", "Agribusiness & Food"),
    ("PT Austindo Nusantara Jaya Tbk", "Jakarta", "Agribusiness & Food"),
    ("PT Sinar Mas Agro Resources Tbk", "Jakarta", "Agribusiness & Food"),
    ("PT Malindo Feedmill Tbk", "Jakarta", "Agribusiness & Food"),
    ("PT Charoen Pokphand Indonesia Tbk", "Jakarta", "Agribusiness & Food"),
    ("PT Japfa Comfeed Indonesia Tbk", "Jakarta", "Agribusiness & Food"),
    ("PT Medion Farma Jaya", "Bandung", "Veterinary & Feed"),
    ("PT Romindo Primavetcom", "Jakarta", "Veterinary & Feed"),
    ("PT Kalbe Farma Tbk", "Jakarta", "Pharmaceutical"),
    ("PT Kimia Farma Tbk", "Jakarta", "Pharmaceutical"),
    ("PT Bio Farma", "Bandung", "Bio-Pharmaceutical"),
    ("PT Dexa Medica", "Tangerang", "Pharmaceutical"),
    ("PT Soho Global Health Tbk", "Jakarta", "Pharmaceutical"),
    ("PT Pharos International", "Jakarta", "Pharmaceutical"),
    ("PT Sanbe Farma", "Bandung", "Pharmaceutical"),
    ("PT Novartis Indonesia", "Jakarta", "Pharmaceutical"),
    ("PT Pfizer Indonesia", "Jakarta", "Pharmaceutical"),
    ("PT Merck Indonesia", "Jakarta", "Pharmaceutical"),
    ("PT Bayer Indonesia", "Jakarta", "Pharmaceutical"),
    ("PT Roche Indonesia", "Jakarta", "Pharmaceutical"),
    ("PT Sanofi Indonesia", "Jakarta", "Pharmaceutical"),
    ("PT Boehringer Ingelheim Indonesia", "Jakarta", "Pharmaceutical"),
    ("PT AstraZeneca Indonesia", "Jakarta", "Pharmaceutical"),
    ("PT Glaxo Wellcome Indonesia", "Jakarta", "Pharmaceutical"),
    ("PT Johnson & Johnson Indonesia", "Jakarta", "Healthcare"),
    ("PT Abbott Indonesia", "Jakarta", "Healthcare"),
    ("PT Becton Dickinson Indonesia", "Jakarta", "Medical Devices"),
    ("PT Siemens Healthcare Indonesia", "Jakarta", "Medical Devices"),
    ("PT Prodia Widyahusada Tbk", "Jakarta", "Clinical Laboratory"),
    ("PT Cito Laboratorium", "Jakarta", "Clinical Laboratory"),
    ("PT Kimia Farma Diagnostika", "Jakarta", "Clinical Laboratory"),
    ("PT Prima Diagnostika Indonesia", "Jakarta", "Clinical Laboratory"),
    ("PT Indolab Utama", "Jakarta", "Clinical Laboratory"),
    ("PT Diagnos Laboratorium", "Surabaya", "Clinical Laboratory"),
    ("PT Bio Medika Laboratorium", "Bandung", "Clinical Laboratory"),
    ("PT Saraswanti Indo Genetech", "Bogor", "Research Laboratory"),
    ("PT Sucofindo", "Jakarta", "Inspection & Testing"),
    ("PT ALS Indonesia", "Jakarta", "Analytical Laboratory"),
    ("PT Mustika Ratu Tbk", "Jakarta", "Cosmetics"),
    ("PT Mandom Indonesia Tbk", "Jakarta", "Cosmetics"),
    ("PT Martina Berto Tbk", "Jakarta", "Cosmetics"),
    ("PT Paragon Technology and Innovation", "Tangerang", "Cosmetics"),
    ("PT Eterindo Wahanatama Tbk", "Jakarta", "Cosmetics"),
    ("PT Kino Indonesia Tbk", "Tangerang", "Personal Care"),
    ("PT L'Oreal Indonesia", "Jakarta", "Cosmetics"),
    ("PT Procter & Gamble Indonesia", "Jakarta", "Personal Care"),
    ("PT Reckitt Benckiser Indonesia", "Jakarta", "Personal Care"),
    ("PT Akasha Wira International Tbk", "Jakarta", "Personal Care"),
    ("PT Aetra Air Jakarta", "Jakarta", "Water Treatment"),
    ("PT PAM Lyonnaise Jaya", "Jakarta", "Water Treatment"),
    ("PT Tirta Gajah Mungkur", "Wonogiri", "Water Treatment"),
    ("PT Tirta Nusantara", "Jakarta", "Water Treatment"),
    ("PT Adhya Tirta Batam", "Batam", "Water Treatment"),
    ("PT Tirta Gemilang Abadi", "Jakarta", "Water Treatment"),
    ("PT Wijaya Karya Industri & Konstruksi", "Jakarta", "Environmental Testing"),
    ("PT Geotech Sistem Indonesia", "Bandung", "Environmental Testing"),
    ("RS Siloam International Tbk", "Jakarta", "Hospital"),
    ("RS Mitra Keluarga", "Jakarta", "Hospital"),
    ("RS Medistra", "Jakarta", "Hospital"),
    ("RS Cipto Mangunkusumo", "Jakarta", "Hospital"),
    ("RS Hasan Sadikin", "Bandung", "Hospital"),
    ("RS Dr Soetomo", "Surabaya", "Hospital"),
    ("RS Sardjito", "Yogyakarta", "Hospital"),
    ("RS Sanglah", "Denpasar", "Hospital"),
    ("RS Pertamina Jaya", "Jakarta", "Hospital"),
    ("RS Pusat Angkatan Darat", "Jakarta", "Hospital"),
    ("Universitas Indonesia", "Depok", "Research & Education"),
    ("Institut Teknologi Bandung", "Bandung", "Research & Education"),
    ("Universitas Gadjah Mada", "Yogyakarta", "Research & Education"),
    ("Institut Pertanian Bogor", "Bogor", "Research & Education"),
    ("Universitas Airlangga", "Surabaya", "Research & Education"),
    ("Universitas Padjadjaran", "Bandung", "Research & Education"),
    ("Universitas Diponegoro", "Semarang", "Research & Education"),
    ("Universitas Brawijaya", "Malang", "Research & Education"),
    ("Universitas Hasanuddin", "Makassar", "Research & Education"),
    ("Universitas Sumatera Utara", "Medan", "Research & Education"),
    ("LIPI Bioteknologi", "Jakarta", "Research & Education"),
    ("BPPT", "Jakarta", "Research & Education"),
    ("Lembaga Eijkman", "Jakarta", "Research & Education"),
    ("BBPOM Jakarta", "Jakarta", "Regulatory & Testing"),
    ("BBPOM Surabaya", "Surabaya", "Regulatory & Testing"),
    ("Balai Besar Kimia dan Kemasan", "Jakarta", "Regulatory & Testing"),
    ("Balai Besar Industri Agro", "Bogor", "Regulatory & Testing"),
    ("Balai Besar Veteriner", "Bogor", "Regulatory & Testing"),
    ("Balai Besar Teknologi Pencegahan Pencemaran Industri", "Semarang", "Regulatory & Testing"),
    ("PT Phapros Tbk", "Semarang", "Pharmaceutical"),
    ("PT Indophor", "Jakarta", "Pharmaceutical"),
    ("PT Dankos Farma", "Jakarta", "Pharmaceutical"),
    ("PT Bintang Toedjoe", "Jakarta", "Pharmaceutical"),
    ("PT Tempo Scan Pacific Tbk", "Jakarta", "Pharmaceutical"),
    ("PT Darya-Varia Laboratoria Tbk", "Jakarta", "Pharmaceutical"),
    ("PT Merapi Farma", "Yogyakarta", "Pharmaceutical"),
    ("PT Pyridam Farma Tbk", "Jakarta", "Pharmaceutical"),
    ("PT Kapan Tbk", "Jakarta", "Pharmaceutical"),
    ("PT Bernofarm", "Surabaya", "Pharmaceutical"),
    ("PT Indokemika", "Jakarta", "Pharmaceutical"),
    ("PT Aventis Pharma Indonesia", "Jakarta", "Pharmaceutical"),
    ("PT Guna Darma Indonesia", "Jakarta", "Pharmaceutical"),
    ("PT Batu Sinar Abadi", "Bogor", "Food Testing"),
    ("PT Sucofindo Lab Test", "Jakarta", "Analytical Laboratory"),
    ("PT Mutuagung Lestari", "Jakarta", "Testing & Certification"),
    ("PT Surveyor Indonesia", "Jakarta", "Inspection & Testing"),
    ("PT TUV NORD Indonesia", "Jakarta", "Testing & Certification"),
    ("PT SGS Indonesia", "Jakarta", "Testing & Certification"),
    ("PT Intertek Utama Services", "Jakarta", "Testing & Certification"),
    ("PT BSI Group Indonesia", "Jakarta", "Testing & Certification"),
    ("PT Laboratorium Analisis IPB", "Bogor", "Research Laboratory"),
    ("PT Gamma Pilar Optimis", "Bandung", "Research Laboratory"),
    ("PT Indolab Testama", "Jakarta", "Analytical Laboratory"),
    ("PT Kharisma Laboratorium Utama", "Jakarta", "Analytical Laboratory"),
    ("PT Dua Lab Indonesia", "Tangerang", "Clinical Laboratory"),
    ("PT Aditya Laboratorium", "Bandung", "Clinical Laboratory"),
    ("PT Prakarsa Laboratorium", "Semarang", "Clinical Laboratory"),
    ("PT Venantama Laboratorium", "Surabaya", "Clinical Laboratory"),
    ("PT Sentra Laboratorium Medik", "Medan", "Clinical Laboratory"),
    ("PT Dwi Labora Medika", "Yogyakarta", "Clinical Laboratory"),
    ("PT Jaya Laboratorium", "Jakarta", "Clinical Laboratory"),
    ("PT Cendana Laboratorium Utama", "Makassar", "Clinical Laboratory"),
    ("PT Andalas Labora", "Padang", "Clinical Laboratory"),
    ("PT Kalimantan Labora Medika", "Banjarmasin", "Clinical Laboratory"),
    ("PT Sulawesi Labora Raya", "Makassar", "Clinical Laboratory"),
    ("PT Papua Laboratorium Sehat", "Jayapura", "Clinical Laboratory"),
    ("PT Bali Labora Utama", "Denpasar", "Clinical Laboratory"),
    ("PT Lombok Laboratorium Medika", "Mataram", "Clinical Laboratory"),
    ("PT Batam Labora Cemerlang", "Batam", "Clinical Laboratory"),
    ("Nestle S.A.", "Vevey, Switzerland", "Food & Beverage"),
    ("Unilever PLC", "London, UK", "Food & Beverage"),
    ("PepsiCo Inc.", "New York, USA", "Food & Beverage"),
    ("The Coca-Cola Company", "Atlanta, USA", "Food & Beverage"),
    ("Danone S.A.", "Paris, France", "Food & Beverage"),
    ("Kraft Heinz Company", "Chicago, USA", "Food & Beverage"),
    ("General Mills Inc.", "Minneapolis, USA", "Food & Beverage"),
    ("Kellogg Company", "Battle Creek, USA", "Food & Beverage"),
    ("Mars Inc.", "McLean, USA", "Food & Beverage"),
    ("Mondelez International", "Chicago, USA", "Food & Beverage"),
    ("Tyson Foods Inc.", "Springdale, USA", "Food & Beverage"),
    ("Cargill Inc.", "Minneapolis, USA", "Food & Beverage"),
    ("Archer Daniels Midland", "Chicago, USA", "Food & Beverage"),
    ("Associated British Foods", "London, UK", "Food & Beverage"),
    ("Nissin Foods Holdings", "Tokyo, Japan", "Food & Beverage"),
    ("Meiji Holdings", "Tokyo, Japan", "Food & Beverage"),
    ("Yakult Honsha", "Tokyo, Japan", "Food & Beverage"),
    ("Fonterra Co-operative Group", "Auckland, New Zealand", "Dairy & Food"),
    ("Dairy Farmers of America", "Kansas City, USA", "Dairy & Food"),
    ("China Mengniu Dairy", "Hohhot, China", "Dairy & Food"),
    ("Yili Group", "Hohhot, China", "Dairy & Food"),
    ("Heineken N.V.", "Amsterdam, Netherlands", "Beverage"),
    ("Anheuser-Busch InBev", "Leuven, Belgium", "Beverage"),
    ("Carlsberg Group", "Copenhagen, Denmark", "Beverage"),
    ("Suntory Holdings", "Osaka, Japan", "Beverage & Food"),
    ("Kirin Holdings", "Tokyo, Japan", "Beverage & Food"),
    ("Thai Beverage PLC", "Bangkok, Thailand", "Beverage & Food"),
    ("Charoen Pokphand Foods", "Bangkok, Thailand", "Food & Agribusiness"),
    ("CP Group", "Bangkok, Thailand", "Food & Agribusiness"),
    ("Olam International", "Singapore", "Food & Agribusiness"),
    ("Wilmar International", "Singapore", "Food & Agribusiness"),
    ("Pfizer Inc.", "New York, USA", "Pharmaceutical"),
    ("Novartis AG", "Basel, Switzerland", "Pharmaceutical"),
    ("Roche Holding AG", "Basel, Switzerland", "Pharmaceutical"),
    ("Merck KGaA", "Darmstadt, Germany", "Pharmaceutical"),
    ("Merck & Co. Inc.", "Kenilworth, USA", "Pharmaceutical"),
    ("Johnson & Johnson", "New Brunswick, USA", "Pharmaceutical"),
    ("AbbVie Inc.", "North Chicago, USA", "Pharmaceutical"),
    ("Bristol-Myers Squibb", "New York, USA", "Pharmaceutical"),
    ("AstraZeneca PLC", "Cambridge, UK", "Pharmaceutical"),
    ("GlaxoSmithKline PLC", "London, UK", "Pharmaceutical"),
    ("Sanofi S.A.", "Paris, France", "Pharmaceutical"),
    ("Bayer AG", "Leverkusen, Germany", "Pharmaceutical"),
    ("Novo Nordisk A/S", "Bagsvaerd, Denmark", "Pharmaceutical"),
    ("Takeda Pharmaceutical", "Tokyo, Japan", "Pharmaceutical"),
    ("Daiichi Sankyo", "Tokyo, Japan", "Pharmaceutical"),
    ("Astellas Pharma", "Tokyo, Japan", "Pharmaceutical"),
    ("Otsuka Pharmaceutical", "Tokyo, Japan", "Pharmaceutical"),
    ("Hikma Pharmaceuticals", "London, UK", "Pharmaceutical"),
    ("Teva Pharmaceutical", "Tel Aviv, Israel", "Pharmaceutical"),
    ("Cipla Ltd.", "Mumbai, India", "Pharmaceutical"),
    ("Sun Pharmaceutical Industries", "Mumbai, India", "Pharmaceutical"),
    ("Dr. Reddy's Laboratories", "Hyderabad, India", "Pharmaceutical"),
    ("Biocon Ltd.", "Bangalore, India", "Bio-Pharmaceutical"),
    ("WuXi AppTec", "Shanghai, China", "Bio-Pharmaceutical"),
    ("Samsung Biologics", "Incheon, South Korea", "Bio-Pharmaceutical"),
    ("Quest Diagnostics Inc.", "Secaucus, USA", "Clinical Laboratory"),
    ("Laboratory Corporation of America", "Burlington, USA", "Clinical Laboratory"),
    ("Sonic Healthcare Ltd.", "Sydney, Australia", "Clinical Laboratory"),
    ("Unilabs S.A.", "Geneva, Switzerland", "Clinical Laboratory"),
    ("SYNLAB International", "Munich, Germany", "Clinical Laboratory"),
    ("Eurofins Scientific", "Luxembourg", "Analytical Laboratory"),
    ("Bio-Rad Laboratories", "Hercules, USA", "Diagnostics"),
    ("Thermo Fisher Scientific", "Waltham, USA", "Life Sciences"),
    ("Qiagen N.V.", "Venlo, Netherlands", "Molecular Diagnostics"),
    ("Danaher Corporation", "Washington D.C., USA", "Life Sciences"),
    ("Agilent Technologies", "Santa Clara, USA", "Life Sciences"),
    ("Waters Corporation", "Milford, USA", "Analytical Instruments"),
    ("PerkinElmer Inc.", "Waltham, USA", "Diagnostics"),
    ("Charles River Laboratories", "Wilmington, USA", "Research Laboratory"),
    ("Lonza Group Ltd.", "Basel, Switzerland", "Life Sciences"),
    ("L'Oreal S.A.", "Clichy, France", "Cosmetics"),
    ("Procter & Gamble Co.", "Cincinnati, USA", "Personal Care"),
    ("Estee Lauder Companies", "New York, USA", "Cosmetics"),
    ("Shiseido Company", "Tokyo, Japan", "Cosmetics"),
    ("Amorepacific Corporation", "Seoul, South Korea", "Cosmetics"),
    ("LG Household & Health Care", "Seoul, South Korea", "Cosmetics"),
    ("Beiersdorf AG", "Hamburg, Germany", "Cosmetics"),
    ("Colgate-Palmolive Company", "New York, USA", "Personal Care"),
    ("Reckitt Benckiser Group", "Slough, UK", "Personal Care"),
    ("Unilever Personal Care", "Rotterdam, Netherlands", "Personal Care"),
    ("LVMH Perfumes & Cosmetics", "Paris, France", "Cosmetics"),
    ("Chanel S.A.", "Neuilly-sur-Seine, France", "Cosmetics"),
    ("Kao Corporation", "Tokyo, Japan", "Cosmetics"),
    ("Coty Inc.", "New York, USA", "Cosmetics"),
    ("Revlon Inc.", "New York, USA", "Cosmetics"),
    ("American Water Works", "Camden, USA", "Water Treatment"),
    ("Veolia Environnement", "Paris, France", "Water & Environmental"),
    ("Suez S.A.", "Paris, France", "Water & Environmental"),
    ("Xylem Inc.", "Rye Brook, USA", "Water Technology"),
    ("Pentair PLC", "Manchester, UK", "Water Treatment"),
    ("Ecolab Inc.", "St. Paul, USA", "Water & Hygiene"),
    ("Thermax Ltd.", "Pune, India", "Water & Environmental"),
    ("Kurita Water Industries", "Tokyo, Japan", "Water Treatment"),
    ("Organo Corporation", "Tokyo, Japan", "Water Treatment"),
    ("Aquatech International", "Canonsburg, USA", "Water Treatment"),
    ("Harvard University", "Cambridge, USA", "Research & Education"),
    ("Massachusetts Institute of Technology", "Cambridge, USA", "Research & Education"),
    ("Stanford University", "Stanford, USA", "Research & Education"),
    ("University of Cambridge", "Cambridge, UK", "Research & Education"),
    ("University of Oxford", "Oxford, UK", "Research & Education"),
    ("Karolinska Institutet", "Stockholm, Sweden", "Medical Research"),
    ("Max Planck Society", "Munich, Germany", "Research & Education"),
    ("Pasteur Institute", "Paris, France", "Medical Research"),
    ("National University of Singapore", "Singapore", "Research & Education"),
    ("University of Tokyo", "Tokyo, Japan", "Research & Education"),
    ("Seoul National University", "Seoul, South Korea", "Research & Education"),
    ("Tsinghua University", "Beijing, China", "Research & Education"),
    ("Peking University", "Beijing, China", "Research & Education"),
    ("Mahidol University", "Bangkok, Thailand", "Research & Education"),
    ("University of Malaya", "Kuala Lumpur, Malaysia", "Research & Education"),
    ("SGS S.A.", "Geneva, Switzerland", "Testing & Certification"),
    ("Bureau Veritas", "Neuilly-sur-Seine, France", "Testing & Certification"),
    ("Intertek Group PLC", "London, UK", "Testing & Certification"),
    ("DEKRA SE", "Stuttgart, Germany", "Testing & Certification"),
    ("TUV Rheinland", "Cologne, Germany", "Testing & Certification"),
    ("TUV SUD", "Munich, Germany", "Testing & Certification"),
    ("UL LLC", "Northbrook, USA", "Testing & Certification"),
    ("Lloyd's Register", "London, UK", "Testing & Certification"),
    ("ALS Limited", "Brisbane, Australia", "Analytical Laboratory"),
    ("AsureQuality", "Auckland, New Zealand", "Food Testing"),
    ("Campden BRI", "Chipping Campden, UK", "Food Research & Testing"),
    ("Eurofins Microbiology", "Luxembourg", "Microbiology Testing"),
    ("Romer Labs", "Getzersdorf, Austria", "Food Safety Testing"),
    ("IDEXX Laboratories", "Westbrook, USA", "Veterinary Diagnostics"),
    ("Neogen Corporation", "Lansing, USA", "Food Safety"),
    ("Mayo Clinic", "Rochester, USA", "Hospital"),
    ("Cleveland Clinic", "Cleveland, USA", "Hospital"),
    ("Johns Hopkins Hospital", "Baltimore, USA", "Hospital"),
    ("Mass General Brigham", "Boston, USA", "Hospital"),
    ("Kaiser Permanente", "Oakland, USA", "Healthcare"),
    ("National Health Service", "London, UK", "Healthcare"),
    ("Apollo Hospitals", "Chennai, India", "Hospital"),
    ("Bumrungrad International Hospital", "Bangkok, Thailand", "Hospital"),
    ("Gleneagles Hospital", "Singapore", "Hospital"),
    ("Mount Elizabeth Hospital", "Singapore", "Hospital"),
    ("Prince of Wales Hospital", "Hong Kong", "Hospital"),
    ("Seoul National University Hospital", "Seoul, South Korea", "Hospital"),
    ("Tokyo Medical University Hospital", "Tokyo, Japan", "Hospital"),
    ("Charite Universitatsmedizin Berlin", "Berlin, Germany", "Hospital"),
    ("Assistance Publique-Hopitaux de Paris", "Paris, France", "Hospital"),
    ("PT Anugerah Pharmindo Lestari", "Jakarta", "Pharmaceutical Distribution"),
    ("PT Samator Indo Gas Tbk", "Surabaya", "Industrial & Medical Gases"),
    ("PT Enseval Putera Megatrading Tbk", "Jakarta", "Healthcare Distribution"),
    ("PT Millenium Pharmacon International Tbk", "Jakarta", "Pharmaceutical"),
    ("3M Health Care", "St. Paul, USA", "Healthcare & Microbiology"),
    ("BioMerieux S.A.", "Marcy-l'Etoile, France", "Microbiology Diagnostics"),
    ("Becton Dickinson and Company", "Franklin Lakes, USA", "Medical Technology"),
]

def sanitize_email_base(name):
    base = re.sub(r'[^a-z0-9]', '', name.lower().strip())[:25]
    return base or "comp"

async def seed():
    db_path = str(Path(__file__).parent / "colonyai.db")
    engine = create_async_engine(f"sqlite+aiosqlite:///{db_path}", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    # Pre-hash password sekali saja (Argon2 lambat)
    DEFAULT_PASSWORD = "ColonyAI2026!"
    hashed_pw = pwd_context.hash(DEFAULT_PASSWORD)

    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # ── Session 1: Cleanup (if re-running) ──
    # FIX BUG-CRITICAL-001: Use whitelist approach to prevent SQL injection
    ALLOWED_TABLES = [
        "colony_detections", "analyses", "audit_logs", "notifications",
        "token_blacklist", "simulator_comparisons", "lims_logs",
        "user_preferences", "user_sessions", "password_reset_requests",
        "organizations", "users"
    ]
    
    async with AsyncSessionLocal() as db:
        for tbl in ALLOWED_TABLES:
            try:
                # Use parameterized query with whitelisted table name
                # Note: Table names cannot be parameterized in SQLAlchemy,
                # but we validate against whitelist before using
                if tbl not in ALLOWED_TABLES:
                    raise ValueError(f"Invalid table name: {tbl}")
                await db.execute(sql_text(f"DELETE FROM {tbl}"))
            except Exception:
                pass  # Table may not exist on fresh DB
        await db.commit()
    print("[SEED] Cleared all data")

    # ── Session 2: Create superadmin ──
    sa_pw = pwd_context.hash("SuperAdmin2026!")
    async with AsyncSessionLocal() as db:
        superadmin = User(
            id=uuid.uuid4(), organization_id=None,
            email="superadmin@colonyai.com",
            password_hash=sa_pw,
            full_name="Super Administrator", role=UserRole.SUPER_ADMIN,
            is_active=True, is_locked_out=LockoutStatus.NO.value,
            recovery_password="SuperAdmin2026!",
        )
        db.add(superadmin)
        await db.commit()
    print(f"[SEED] SuperAdmin: superadmin@colonyai.com / SuperAdmin2026!")

    # ── Session 3: Batch insert 300 companies + 1200 users ──
    async with AsyncSessionLocal() as db:
        orgs_to_insert = []
        users_to_insert = []
        now = datetime.now(timezone.utc)
        later = now + timedelta(days=365)

        for idx, (name, location, inst_type) in enumerate(COMPANIES, 1):
            oid = uuid.uuid4()
            slug = re.sub(r'[^\w\s-]', '', name.lower().strip())
            slug = re.sub(r'[\s_]+', '-', slug)[:70]
            slug = f"{slug}-{idx}"

            org = Organization(
                id=oid, name=name, slug=slug, location=location,
                license_key=f"CLNY-{secrets.token_hex(4).upper()}-{secrets.token_hex(2).upper()}",
                license_expires_at=later, is_active='active',
                institution_type=inst_type, compliance_standard="ISO-17025",
                infra_config={"node":"primary","storage":"1 TB","region":"ap-southeast-1"},
                max_users=10, created_at=now, updated_at=now,
            )
            orgs_to_insert.append(org)

            b = sanitize_email_base(name)
            for rk, rl, renum in [
                ("admin","Admin",UserRole.ADMIN),
                ("manager","Manager",UserRole.MANAGER),
                ("auditor","Auditor",UserRole.AUDITOR),
                ("analyst","Analyst",UserRole.ANALYST),
            ]:
                u = User(
                    id=uuid.uuid4(), organization_id=oid,
                    email=f"{rk}.{b}{idx}@colonyai.id",
                    password_hash=hashed_pw,
                    full_name=f"{rl} - {name}",
                    role=renum, is_active=True, is_locked_out=LockoutStatus.NO,
                    recovery_password=DEFAULT_PASSWORD,
                    created_at=now, updated_at=now,
                )
                users_to_insert.append(u)

        db.add_all(orgs_to_insert)
        db.add_all(users_to_insert)
        await db.commit()

        print(f"[SEED] SUCCESS: {len(orgs_to_insert)} companies + {len(users_to_insert)} users")
        print(f"[SEED] Password semua user perusahaan: {DEFAULT_PASSWORD}")
        print(f"[SEED] Contoh: admin.{sanitize_email_base(COMPANIES[0][0])}1@colonyai.id")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(seed())
