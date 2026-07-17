# Getting Started with ColonyAI

This guide walks you through setting up and running ColonyAI on your local machine for development, testing, or evaluation.

---

## Prerequisites

| Dependency | Version | Purpose |
|------------|---------|---------|
| Python | 3.10+ | Backend runtime |
| Node.js | 18+ | Frontend runtime |
| PostgreSQL | 14+ | Database (or use Supabase cloud) |
| Docker | 20+ | Containerized deployment (optional) |
| Git | - | Version control |

---

## 1. Clone the Repository

```bash
git clone https://github.com/wi5nuu/colonyai.git
cd colonyai
```

---

## 2. Backend Setup

### 2.1 Create Virtual Environment

```bash
cd backend
python -m venv ..\.venv
..\.venv\Scripts\activate   # Windows
# source ../.venv/bin/activate    # Linux/Mac
```

### 2.2 Install Dependencies

```bash
pip install -r requirements.txt
```

### 2.3 Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Minimum required variables:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/colonyai
JWT_SECRET_KEY=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# S3 Storage (optional for local dev)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=colonyai-images
AWS_REGION=ap-southeast-1

# Model
MODEL_PATH=./models/colony_best.pt
MODEL_CONFIDENCE_THRESHOLD=0.60
MODEL_IOU_THRESHOLD=0.45
```

### 2.4 Database Setup

```bash
# Create database
createdb colonyai

# Run migrations
alembic upgrade head
```

### 2.5 Seed Test Data (Optional)

```bash
python scripts/seed.py
```

### 2.6 Start Backend Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000/api/v1`.  
Interactive docs at `http://localhost:8000/docs`.

---

## 3. Frontend Setup

### 3.1 Install Dependencies

```bash
cd frontend
npm install
```

### 3.2 Configure Environment

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 3.3 Start Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`.

---

## 4. Verify the Installation

### Health Check

```bash
# Backend health
curl http://localhost:8000/health

# Expected response:
# {"status": "healthy", "timestamp": "2026-07-16T10:00:00Z"}
```

### Run Tests

```bash
# Backend tests
cd backend
pytest tests/ -v

# Frontend tests
cd frontend
npm test
```

---

## 5. Your First Analysis

1. Open `http://localhost:3000` in your browser
2. Register a new account or use the seeded account:
   - Email: `analyst@colonyai.com`
   - Password: `ColonyAI2026!`
3. Click **New Analysis** in the sidebar
4. Upload a plate image (JPEG/PNG/WebP, max 10MB)
5. Enter sample details (Sample ID, Media Type, Dilution Factor, Plated Volume)
6. Click **Start Analysis**
7. Wait 1-2 minutes for processing
8. View results with annotated colonies and CFU/ml calculation

---

## 6. Project Structure

```
colonyai/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── api/v1/            # REST API endpoints
│   │   ├── core/              # Security, config, rate limiter
│   │   ├── models/            # SQLAlchemy database models
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   ├── services/          # Business logic (detector, calculator)
│   │   └── utils/             # Audit, sanitization helpers
│   ├── migrations/            # Alembic database migrations
│   ├── models/                # Trained YOLOv8 weights
│   └── tests/                 # Pytest test suite
│
├── frontend/                   # Next.js frontend
│   ├── src/
│   │   ├── app/               # App router pages
│   │   ├── components/        # Reusable UI components
│   │   └── lib/               # API client, utilities
│   └── public/                # Static assets
│
├── ml-training/                # Model training scripts
│   ├── train.py               # Training pipeline
│   └── requirements.txt       # ML dependencies
│
├── docs/                       # Documentation (you are here)
└── docker-compose.yml          # Container orchestration
```

---

## 7. Docker Setup (Alternative)

For a fully containerized setup:

```bash
docker-compose up -d
```

This will start:
- Backend API on port 8000
- Frontend on port 3000
- PostgreSQL on port 5432
- Redis on port 6379

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `port already in use` | Change port in `.env` or stop conflicting service |
| `database connection failed` | Verify PostgreSQL is running and DATABASE_URL is correct |
| `model file not found` | Download model weights or set MODEL_PATH correctly |
| `CORS error` | Ensure `NEXT_PUBLIC_API_URL` matches backend origin |

---

## Next Steps

- Read the [User Manual](./02-user-manual.md) for detailed usage
- Review the [API Reference](./03-api-reference.md) for integration
- See [System Architecture](./04-architecture.md) for design details

---

_Last Updated: July 2026_
