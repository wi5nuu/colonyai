# ColonyAI System Architecture

## Overview

ColonyAI follows a modern three-tier architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRESENTATION TIER                        │
│                          (Next.js 14)                            │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Client Browser                         │   │
│  │                                                            │   │
│  │  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌──────────┐   │   │
│  │  │  Login  │  │ Dashboard│  │ Upload  │  │  Reports │   │   │
│  │  │  Page   │  │   Home   │  │  Page   │  │  Export  │   │   │
│  │  └─────────┘  └──────────┘  └─────────┘  └──────────┘   │   │
│  │                                                            │   │
│  │  ┌──────────────────────────────────────────────────┐     │   │
│  │  │           UI Components (shadcn/ui)               │     │   │
│  │  │  Buttons, Forms, Tables, Modals, Charts, etc.    │     │   │
│  │  └──────────────────────────────────────────────────┘     │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ HTTPS (REST API)
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                        APPLICATION TIER                          │
│                       (FastAPI Backend)                          │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  API Gateway Layer                         │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │   │
│  │  │   Auth   │  │  Images  │  │ Analyses │  │  Reports │ │   │
│  │  │  Routes  │  │  Routes  │  │  Routes  │  │  Routes  │ │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   Business Logic Layer                     │   │
│  │                                                            │   │
│  │  ┌──────────────┐    ┌──────────────┐                     │   │
│  │  │   Image      │    │   Colony     │                     │   │
│  │  │ Preprocessor │───▶│   Detector   │                     │   │
│  │  │  (OpenCV)    │    │  (YOLOv8)    │                     │   │
│  │  └──────────────┘    └──────┬───────┘                     │   │
│  │                              │                              │   │
│  │                              ▼                              │   │
│  │                       ┌──────────────┐                     │   │
│  │                       │   CFU/ml     │                     │   │
│  │                       │  Calculator  │                     │   │
│  │                       └──────────────┘                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  Middleware & Security                     │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │   │
│  │  │   CORS   │  │   JWT    │  │   Rate   │  │  Logging │ │   │
│  │  │ Handler  │  │  Auth    │  │ Limiter  │  │  System  │ │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ Database Connections
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                          DATA TIER                               │
│                                                                   │
│  ┌────────────────────┐          ┌────────────────────┐         │
│  │   PostgreSQL DB    │          │   AWS S3 Storage   │         │
│  │   (via Supabase)   │          │                    │         │
│  │                    │          │  ┌──────────────┐  │         │
│  │  ┌──────────────┐  │          │  │   Original   │  │         │
│  │  │ - users      │  │          │  │   Images     │  │         │
│  │  │ - analyses   │  │          │  └──────────────┘  │         │
│  │  │ - results    │  │          │  ┌──────────────┐  │         │
│  │  │ - audit_logs │  │          │  │  Annotated   │  │         │
│  │  └──────────────┘  │          │  │   Images     │  │         │
│  └────────────────────┘          │  └──────────────┘  │         │
│                                  └────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### Plate Analysis Workflow

```
┌─────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌─────────┐
│  User   │────▶│ Frontend │────▶│ Backend  │────▶│   AI     │────▶│Database │
│ (Analyst)│     │ (Next.js)│     │ (FastAPI)│     │ Model    │     │  (S3)   │
└─────────┘     └──────────┘     └──────────┘     └──────────┘     └─────────┘
     │                │                 │                │                │
     │ 1. Upload      │                 │                │                │
     │ Image +        │                 │                │                │
     │ Metadata       │                 │                │                │
     │───────────────▶│                 │                │                │
     │                │ 2. POST /api/   │                │                │
     │                │    analyze      │                │                │
     │                │────────────────▶│                │                │
     │                │                 │ 3. Preprocess  │                │
     │                │                 │    Image       │                │
     │                │                 │──┐             │                │
     │                │                 │◀─┘             │                │
     │                │                 │                │                │
     │                │                 │ 4. Run YOLOv8  │                │
     │                │                 │    Inference   │                │
     │                │                 │───────────────▶│                │
     │                │                 │◀───────────────│                │
     │                │                 │ 5. Detections  │                │
     │                │                 │                │                │
     │                │                 │ 6. Calculate   │                │
     │                │                 │    CFU/ml      │                │
     │                │                 │──┐             │                │
     │                │                 │◀─┘             │                │
     │                │                 │                │ 7. Store       │
     │                │                 │                │    Images      │
     │                │                 │────────────────────────────────▶│
     │                │                 │                │                │
     │                │ 8. Return       │                │                │
     │                │    Results      │                │                │
     │                │◀────────────────│                │                │
     │ 9. Display     │                 │                │                │
     │ Annotated      │                 │                │                │
     │ Results        │                 │                │                │
     │◀───────────────│                 │                │                │
```

## Component Details

### 1. Frontend (Next.js 14)

**Tech Stack:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- React Query (Data fetching)
- Zustand (State management)
- Recharts (Data visualization)

**Key Components:**
- Authentication pages (Login, Register, Forgot Password)
- Dashboard (Statistics, Recent analyses, Quick actions)
- Upload interface (Drag & drop, Camera capture)
- Results viewer (Annotated images, Colony count, Confidence scores)
- History table (Filterable, Sortable, Paginated)
- Report generator (PDF/CSV export)
- Settings page (User profile, Lab preferences)

### 2. Backend (FastAPI)

**Tech Stack:**
- FastAPI (Python 3.10+)
- SQLAlchemy (ORM)
- Pydantic (Data validation)
- OpenCV + Pillow (Image processing)
- Ultralytics YOLOv8 (ML inference)
- Celery (Async task queue - optional)
- JWT (Authentication)

**API Endpoints:**

```
Authentication:
  POST   /api/v1/auth/login
  POST   /api/v1/auth/register
  POST   /api/v1/auth/refresh
  POST   /api/v1/auth/logout

Images:
  POST   /api/v1/images/upload
  GET    /api/v1/images/{id}
  DELETE /api/v1/images/{id}

Analyses:
  POST   /api/v1/analyses
  GET    /api/v1/analyses
  GET    /api/v1/analyses/{id}
  GET    /api/v1/analyses/{id}/result

Reports:
  POST   /api/v1/reports/pdf/{analysis_id}
  POST   /api/v1/reports/csv/{analysis_id}
  GET    /api/v1/reports/{id}/download

Users:
  GET    /api/v1/users/me
  PUT    /api/v1/users/me
  GET    /api/v1/users (Admin)
```

### 3. AI Model Pipeline

**Phase 1: Image Preprocessing**
```
Raw Image → Brightness/Contrast Normalization
          → Perspective Correction
          → Circular Plate Detection (Hough Circle Transform)
          → ROI Extraction
          → Standardized Image (512x512)
```

**Phase 2: Colony Detection**
```
Standardized Image → YOLOv8 Inference
                   → NMS (IoU=0.45)
                   → Confidence Filtering (>0.60)
                   → Classification
                   → Bounding Boxes + Labels
```

**Phase 3: CFU/ml Calculation**
```
Valid Colonies Count
                  → Apply Dilution Factor
                  → Apply Plated Volume
                  → Calculate CFU/ml
                  → Apply TNTC/TFTC Flags
                  → Final Result
```

### 4. Database Schema

**Users Table:**
```sql
- id (UUID, PK)
- email (VARCHAR, UNIQUE)
- password_hash (VARCHAR)
- full_name (VARCHAR)
- role (ENUM: admin, analyst, viewer)
- laboratory_id (UUID, FK)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

**Analyses Table:**
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- sample_id (VARCHAR)
- media_type (VARCHAR)
- dilution_factor (FLOAT)
- plated_volume_ml (FLOAT)
- original_image_url (VARCHAR)
- annotated_image_url (VARCHAR)
- colony_count (INT)
- cfu_per_ml (FLOAT)
- status (ENUM: pending, processing, completed, failed)
- confidence_score (FLOAT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

**Audit Logs Table:**
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- action (VARCHAR)
- resource_type (VARCHAR)
- resource_id (UUID)
- timestamp (TIMESTAMP)
- ip_address (VARCHAR)
- user_agent (TEXT)
```

## Deployment Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Vercel CDN                         │
│              (Frontend Static Assets)                 │
└──────────────────────┬───────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────┐
│              Railway / AWS ECS                        │
│           (FastAPI Backend Containers)                │
│                                                       │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐  │
│  │  Web API   │    │  Worker 1  │    │  Worker 2  │  │
│  │ Container  │    │ Container  │    │ Container  │  │
│  └────────────┘    └────────────┘    └────────────┘  │
│                                                       │
│  Auto-scaling: 2-10 instances based on CPU/Memory     │
└──────────────────────┬───────────────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
┌────────▼────────┐         ┌────────▼────────┐
│   Supabase      │         │   AWS S3        │
│  (PostgreSQL)   │         │  (Image Storage)│
│                 │         │                 │
│ - User data     │         │ - Original imgs │
│ - Analyses      │         │ - Annotated imgs│
│ - Audit logs    │         │ - Reports       │
└─────────────────┘         └─────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────┐
│               Security Layers                    │
│                                                   │
│  1. Network Layer                                │
│     - HTTPS/TLS 1.3 everywhere                   │
│     - CORS policy restriction                    │
│     - Rate limiting (100 req/min per IP)         │
│                                                   │
│  2. Application Layer                            │
│     - JWT authentication (15min expiry)          │
│     - Refresh tokens (7 days)                    │
│     - RBAC (Admin, Analyst, Viewer)              │
│     - Input validation (Pydantic)                │
│                                                   │
│  3. Data Layer                                   │
│     - Encrypted S3 buckets (AES-256)             │
│     - Signed URLs (1 hour expiry)                │
│     - Database encryption at rest                │
│     - Parameterized queries (SQL injection prev.)│
│                                                   │
│  4. Audit & Compliance                           │
│     - Immutable audit logs                        │
│     - Timestamped records                         │
│     - ISO 17025 compliance                        │
│     - Data retention policies                     │
└─────────────────────────────────────────────────┘
```
