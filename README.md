<div align="center">
  <img src="frontend/public/company_logo/fablab_jababeka.png" alt="FabLab Jababeka" height="70" style="margin: 0 20px;" />
  <img src="frontend/public/company_logo/KEMENKO-upd.png" alt="KEMENKO" height="70" style="margin: 0 20px;" />
  <img src="frontend/public/company_logo/tuvnord_indonesia.jpeg" alt="TUV Nord Indonesia" height="70" style="margin: 0 20px;" />
</div>

<br />

# ColonyAI

[![AI Open Innovation Challenge 2026](https://img.shields.io/badge/AI%20Open%20Innovation%20Challenge-2026-FF6B35?style=flat-square)](#)
[![Version](https://img.shields.io/badge/version-2.0.0-blue?style=flat-square)](#)
[![Python](https://img.shields.io/badge/Python-3.13-3776AB?style=flat-square&logo=python&logoColor=white)](#)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=next.js&logoColor=white)](#)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white)](#)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-Ultralytics-00DBDE?style=flat-square)](#)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](./LICENSE)
[![Security](https://img.shields.io/badge/Security-Zero--Trust-4CAF50?style=flat-square)](#)
[![Compliance](https://img.shields.io/badge/Compliance-ISO%2017025%20%7C%20GUM-0078D4?style=flat-square)](#)

> **Automated Microbiology Plate Count System with Cryptographic Audit Trail**
>
> ColonyAI replaces manual colony counting with a YOLOv8-powered computer vision pipeline, delivering traceable CFU/ml results compliant with ISO 17025, ISO 4833-1, and GUM uncertainty standards.

---

## Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [System Architecture](#system-architecture)
4. [Tech Stack](#tech-stack)
5. [Detection Classes](#detection-classes)
6. [Quick Start](#quick-start)
7. [Project Structure](#project-structure)
8. [Environment Variables](#environment-variables)
9. [API Reference](#api-reference)
10. [Security Model](#security-model)
11. [Regulatory Compliance](#regulatory-compliance)
12. [Role-Based Access Control](#role-based-access-control)
13. [Docker Deployment](#docker-deployment)
14. [Running Tests](#running-tests)
15. [Documentation](#documentation)
16. [Engineering Team](#engineering-team)

---

## Overview

In traditional microbiology workflows, analysts count bacterial colonies manually on agar plates — a process that is slow, subjective, and prone to inter-analyst variability of **22.7% to 80% coefficient of variation**.

ColonyAI solves this by combining:

- A fine-tuned **YOLOv8** neural network that detects and classifies colonies and non-biological artifacts
- Automated **agar plate localization** via Hough Circle Transform and perspective correction
- **CFU/ml calculation** with expanded measurement uncertainty following ISO/IEC Guide 98-3 (GUM)
- A **cryptographic audit trail** using SHA-256 hash chaining for full ISO 17025 data integrity
- A multi-tenant **web dashboard** with role-based access, LIMS integration, and PDF reporting

---

## Key Features

| Feature | Description |
|---------|-------------|
| **YOLOv8 Colony Detection** | Fine-tuned on curated microbiology dataset; 5-class detection distinguishing colonies from artifacts |
| **Perspective Correction** | Hough Circle Transform + homography matrix maps detection coordinates back to the original plate frame |
| **Artifact Rejection** | >90% precision filtering of bubbles, dust, and media cracks to eliminate false positives |
| **CFU/ml Calculation** | Area-based merged colony estimation (SA-001), dilution factor, and plated volume integration |
| **GUM Uncertainty** | Expanded measurement uncertainty (k=2) per ISO/IEC Guide 98-3:2008 |
| **Cryptographic Audit Log** | SHA-256 hash-chained ledger — tampering any record breaks the chain |
| **Manual Correction Canvas** | Analysts can add, remove, or reclassify detections via an interactive overlay |
| **LIMS Integration** | Structured result export compatible with Laboratory Information Management Systems |
| **Multi-Tenant Architecture** | Organization-scoped data isolation with a Super Admin global governance layer |
| **PDF Report Generation** | Signed, traceable reports with full analysis metadata and uncertainty statement |
| **i18n Support** | Internationalization-ready UI (Bahasa Indonesia / English) |
| **Dark Mode** | Full dark/light theme support across all dashboard views |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT (Next.js 14)                        │
│  Vercel Edge Network · TLS 1.3 · React Server Components        │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS
┌───────────────────────────▼─────────────────────────────────────┐
│                    FASTAPI BACKEND (Python 3.13)                 │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Middleware Layer                                           │ │
│  │  CORS Whitelist · Rate Limiter (Token Bucket, 100 req/min) │ │
│  │  JWT Auth + Blacklist · RBAC Dependency Injection          │ │
│  └───────────────────────────┬────────────────────────────────┘ │
│                              │                                   │
│  ┌────────────────────────────▼───────────────────────────────┐ │
│  │ API Endpoints (v1)                                         │ │
│  │  /analyses  /upload  /reports  /lims  /users  /super       │ │
│  └───────────────────────────┬────────────────────────────────┘ │
│                              │                                   │
│  ┌───────────────────────────▼────────────────────────────────┐ │
│  │ Service Layer                                              │ │
│  │  ImageProcessor · ColonyDetector · CFUCalculator           │ │
│  │  AuditLogger · ReportGenerator · LIMSExporter              │ │
│  └───────────────────────────┬────────────────────────────────┘ │
└──────────────────────────────┼──────────────────────────────────┘
                               │
          ┌────────────────────┼─────────────────┐
          │                    │                 │
   ┌──────▼──────┐    ┌────────▼───────┐  ┌─────▼──────┐
   │  SQLite /   │    │   AWS S3 /     │  │  YOLOv8    │
   │ PostgreSQL  │    │  Local Upload  │  │   Model    │
   │ (Audit Log) │    │   (Images)     │  │  (.pt/.onnx)│
   └─────────────┘    └────────────────┘  └────────────┘
```

### Analysis Pipeline

```
Image Upload
     │
     ▼
File Validation (MIME magic bytes · EXIF strip · ClamAV scan)
     │
     ▼
Plate Localization (CLAHE · Hough Circle Transform)
     │
     ▼
Perspective Correction (Homography Matrix H)
     │
     ▼
YOLOv8 Inference (5-class detection)
     │
     ▼
Coordinate Remapping (H⁻¹ via perspectiveTransform)
     │
     ▼
Artifact Filtering (bubble · dust_debris · media_crack removed)
     │
     ▼
CFU Calculation (SA-001 merged estimation · GUM uncertainty)
     │
     ▼
Cryptographic Audit Entry (SHA-256 hash chain)
     │
     ▼
Result Storage + Annotated Image
```

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **ML / CV** | YOLOv8 (Ultralytics), OpenCV, CLAHE | ultralytics 8.4.36 |
| **Backend** | FastAPI, SQLAlchemy (async), Alembic | Python 3.13.7 |
| **Auth** | Argon2id, JWT HS256 (python-jose), MFA via email | — |
| **Database** | SQLite (dev) / PostgreSQL 14+ (prod) | — |
| **Storage** | AWS S3 / local filesystem | boto3 |
| **Frontend** | Next.js 14.2.15, React 18, TypeScript 5 | App Router |
| **UI** | Tailwind CSS, shadcn/ui, Lucide Icons | — |
| **State** | Zustand (auth + i18n store) | — |
| **Containerization** | Docker, Docker Compose | 20+ |
| **CI/CD** | GitHub Actions (pytest · Jest · Bandit · npm audit) | — |
| **Deployment** | Railway (backend) + Vercel (frontend) | — |

---

## Detection Classes

The YOLOv8 model (`colony_best_new.pt`) detects 5 object classes per image:

| Class | Description | Counted as CFU | Threshold (CALIB-3) | BGR Color |
|-------|-------------|---------------|---------------------|-----------|
| `colony_single` | Individual, non-overlapping bacterial colony | Yes | 0.05 | (50, 220, 80) Green |
| `colony_merged` | Two or more overlapping colonies (area-estimated) | Yes (SA-001) | 0.10 | (255, 140, 0) Orange |
| `bubble` | Air bubble artifact | No | 0.08 | (30, 120, 255) Blue |
| `dust_debris` | Dust particle or foreign debris | No | 0.13 | (220, 50, 50) Red |
| `media_crack` | Physical crack in agar medium | No | 0.05 | (200, 60, 180) Purple |

> **CALIB-3** — thresholds dikalibrasi dari confidence scan 14 sampel nyata (Aug 2026). Model `colony_best_new.pt` beroperasi pada rentang confidence rendah (rata-rata < 0.2, max ~0.35); threshold tinggi seperti 0.60 akan memblokir hampir semua deteksi valid.

Each class is rendered with a distinct color overlay on the annotated result image.

### Model Performance (`colony_best_new.pt`)

| Metric | Value | Notes |
|--------|-------|-------|
| **mAP50 (all classes)** | **0.986** | Validated on held-out test set |
| **Precision** | 0.951 | Weighted average across 5 classes |
| **Recall** | 0.951 | Weighted average across 5 classes |
| **dust_debris mAP50** | 0.986 | After targeted fine-tune (epoch 29/50, run `dust_finetune_20260802_174354`) |
| **Inference speed** | ~120 ms/img | RTX 5050 8GB VRAM, 640×640 input |
| **Training hardware** | NVIDIA RTX 5050 8GB | CUDA 13.1, torch 2.12.0+cu128, Python 3.13.7 |

---

## Quick Start

### Prerequisites

| Dependency | Version |
|------------|---------|
| Python | 3.13+ |
| Node.js | 18+ |
| CUDA | 11.8+ (optional, for GPU inference) |
| Git | any |
| Docker | 20+ (optional) |

### 1. Clone

```bash
git clone https://github.com/wi5nuu/colonyai.git
cd colonyai
```

### 2. Backend

```bash
# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Linux / macOS

# Install dependencies
cd backend
pip install -r requirements.txt

# Configure environment
cp .env.example .env          # then edit .env

# Run database migrations
alembic upgrade head

# Seed test data (optional)
python scripts/seed.py

# Start server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API available at: `http://localhost:8000/api/v1`  
Interactive docs: `http://localhost:8000/docs`

### 3. Frontend

```bash
cd frontend
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

npm run dev
```

Dashboard available at: `http://localhost:3000`

### 4. Verify

```bash
curl http://localhost:8000/health
# {"status": "healthy", "timestamp": "..."}
```

### Default Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `super@colonyai.com` | `ColonyAI2026!` |
| Analyst | `analyst@colonyai.com` | `ColonyAI2026!` |

---

## Project Structure

```
colonyai/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/       # Route handlers (analyses, users, lims, super, …)
│   │   ├── core/                   # Security, config, rate limiter, middleware
│   │   ├── models/                 # SQLAlchemy ORM models
│   │   ├── schemas/                # Pydantic request / response schemas
│   │   ├── services/               # Business logic
│   │   │   ├── colony_detector_optimized.py
│   │   │   ├── image_processor.py
│   │   │   └── cfu_calculator.py
│   │   └── utils/                  # Audit, sanitization, file validation
│   ├── migrations/                 # Alembic migration files
│   ├── models/                     # YOLOv8 weights (.pt / .onnx)
│   ├── scripts/                    # Seed, maintenance scripts
│   └── tests/                      # Pytest test suite
│
├── frontend/
│   └── src/
│       ├── app/                    # Next.js App Router pages
│       │   ├── dashboard/
│       │   │   ├── upload/         # Image upload & analysis trigger
│       │   │   ├── analyses/       # Results viewer + correction canvas
│       │   │   ├── reports/        # PDF report generation
│       │   │   ├── lims/           # LIMS export
│       │   │   └── super/          # Super admin governance panel
│       │   └── (auth)/             # Login / register pages
│       ├── components/             # Reusable UI components
│       │   ├── CorrectionCanvas.tsx
│       │   ├── GlobalPersonnelPanel.tsx
│       │   └── …
│       └── lib/                    # API client, i18n store, utilities
│
├── ml-training/                    # YOLOv8 training scripts and configs
├── docs/                           # Full documentation (see below)
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
└── README.md
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
# Database
DATABASE_URL=sqlite+aiosqlite:///./colonyai.db   # dev
# DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/colonyai  # prod

# JWT
JWT_SECRET_KEY=change-this-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Storage (set USE_S3=false for local filesystem)
USE_S3=false
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=colonyai-images
AWS_REGION=ap-southeast-1

# YOLOv8 Model
MODEL_PATH=./models/colony_best_new.pt
MODEL_CONFIDENCE_THRESHOLD=0.60
MODEL_IOU_THRESHOLD=0.45

# Application mode (set to False in production — affects CSP and CORS)
DEBUG=False

# CORS
ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## API Reference

Base URL: `/api/v1`

| Method | Endpoint | Role Required | Description |
|--------|----------|--------------|-------------|
| `POST` | `/auth/login` | — | Obtain access + refresh tokens (MFA if untrusted device) |
| `POST` | `/auth/verify-mfa` | — | Submit 6-digit MFA code; returns tokens on success |
| `POST` | `/auth/refresh` | — | Rotate refresh token; old JTI is immediately blacklisted |
| `POST` | `/auth/logout` | Any | Revoke access token (blacklist jti) |
| `POST` | `/auth/forgot-password` | — | Trigger anti-phishing password reset flow |
| `POST` | `/auth/reset-password` | — | Submit new password with reset token |
| `POST` | `/analyses/upload` | Analyst+ | Upload plate image and trigger YOLOv8 analysis |
| `POST` | `/analyses/simulate` | Analyst+ | Run analysis without saving to DB (preview mode) |
| `GET` | `/analyses` | Analyst+ | List analyses for current org with pagination |
| `GET` | `/analyses/{id}` | Analyst+ | Get analysis result with detections and bbox_normalized |
| `PATCH` | `/analyses/{id}/corrections` | Analyst+ | Submit manual correction overlay |
| `POST` | `/analyses/{id}/approve` | Manager+ | Approve and sign analysis result |
| `GET` | `/reports/{id}/pdf` | Manager+ | Download signed PDF report |
| `POST` | `/lims/export/{id}` | Manager+ | Export result to LIMS format |
| `GET` | `/lims/logs` | Manager+ | Paginated LIMS audit logs with date/action filtering |
| `GET` | `/audit/logs` | Auditor+ | View cryptographic audit log |
| `GET` | `/search` | Analyst+ | Full-text search across analyses and specimens |
| `GET` | `/super/organizations` | Super Admin | List all organizations |
| `GET` | `/super/organizations/{id}/personnel` | Super Admin | List org personnel |

Full API documentation available at `/docs` (Swagger UI) when the backend is running.

---

## Security Model

ColonyAI implements a **Zero-Trust, defense-in-depth** architecture across 12 security layers:

| Layer | Control | Implementation |
|-------|---------|---------------|
| 1 | TLS 1.3 in transit | Vercel Edge + Let's Encrypt |
| 2 | Secure response headers | HSTS · X-Frame-Options · CSP · Permissions-Policy |
| 3 | CORS origin whitelist | FastAPI `CORSMiddleware`; strict in production (`DEBUG=False`) |
| 4 | Rate limiting | Token Bucket, 100 req/min per IP (in-memory, per-process) |
| 5 | Account lockout | 5 failed login or MFA attempts → 15-min lockout |
| 6 | Multi-factor authentication | 6-digit TOTP-style code via email; brute-force protected |
| 7 | JWT authentication | Argon2id passwords · HS256 JWT · 15-min access / 7-day refresh |
| 8 | Refresh token rotation | Old refresh JTI blacklisted on every `/auth/refresh` call |
| 9 | RBAC | FastAPI dependency injection per route; org-scoped data isolation |
| 10 | File upload validation | Magic bytes · EXIF strip · MIME type allowlist |
| 11 | Input sanitization | Pydantic schemas + HTML escape; parameterized ORM queries |
| 12 | Cryptographic audit log | SHA-256 hash chaining (ISO 17025 s.7.11) |

**Password hashing:** Argon2id (2015 PHC winner) — resistant to GPU brute-force.  
**Timing attack mitigation:** Unknown-email login path delays 0.5 s to match Argon2 verification time.  
**Source map protection:** `productionBrowserSourceMaps: false` — compiled source not served to browsers.  
**Encryption at rest:** AES-256 (PostgreSQL storage layer + AWS S3 SSE-S3).

---

## Regulatory Compliance

| Standard | Scope | Status |
|----------|-------|--------|
| **ISO 17025:2017** | Data integrity, access control, audit trail (§7.11) | Implemented |
| **ISO/IEC Guide 98-3:2008 (GUM)** | Expanded measurement uncertainty (k=2) | Implemented |
| **ISO 4833-1:2013** | CFU countable range 25–250, dilution reporting | Implemented |
| **ISO/IEC 27001** | Information security management | Implemented |
| **OWASP Top 10:2021** | A01–A10 security controls | Implemented |
| **NIST SP 800-63B** | Password strength (Argon2id) | Implemented |
| **BPOM / SNI 2897:2008** | Indonesian national microbial testing standards | Implemented |
| **UU PDP Indonesia** | Personal data protection, 5-year retention auto-purge | Implemented |
| **GDPR Article 32** | Encryption at rest and in transit | Implemented |

---

## Role-Based Access Control

| Role | Scope | Key Permissions |
|------|-------|----------------|
| `super_admin` | Global (all orgs) | Organization governance, user provisioning, system config |
| `admin` | Single org | User management, org settings, all data within org |
| `manager` | Single org | Result approval, report generation, LIMS export, final sign-off |
| `analyst` | Single org | Image upload, AI analysis, manual corrections, data entry |
| `auditor` | Single org | Read-only access to audit trail and cryptographic verification |

---

## Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# Services started:
#   Backend API    → http://localhost:8000
#   Frontend       → http://localhost:3000
#   PostgreSQL     → localhost:5432
#   Redis          → localhost:6379
```

For production deployment, refer to [`docs/05-deployment.md`](./docs/05-deployment.md).

---

## Running Tests

```bash
# Backend (pytest)
cd backend
pytest tests/ -v --cov=app --cov-report=term-missing

# Frontend (Jest + React Testing Library)
cd frontend
npm test

# Security audit
cd backend && bandit -r app/
cd frontend && npm audit
```

CI/CD pipeline runs all tests, linting (flake8, black, TypeScript strict), and security scans on every push to `main`.

---

## Documentation

| Document | Description |
|----------|-------------|
| [`docs/01-getting-started.md`](./docs/01-getting-started.md) | Setup guide for local development |
| [`docs/02-user-manual.md`](./docs/02-user-manual.md) | End-user operational guide |
| [`docs/03-api-reference.md`](./docs/03-api-reference.md) | Full API endpoint reference |
| [`docs/04-architecture.md`](./docs/04-architecture.md) | System design and data flow |
| [`docs/05-deployment.md`](./docs/05-deployment.md) | Production deployment guide |
| [`docs/06-model-training.md`](./docs/06-model-training.md) | YOLOv8 training pipeline |
| [`docs/07-model-validation-report.md`](./docs/07-model-validation-report.md) | Model accuracy and validation metrics |
| [`docs/08-security-architecture.md`](./docs/08-security-architecture.md) | Security layers and compliance mapping |
| [`docs/09-scrum-agile-plan.md`](./docs/09-scrum-agile-plan.md) | Project management and sprint plan |
| [`docs/10-competition-compliance.md`](./docs/10-competition-compliance.md) | AI Open Innovation Challenge compliance |

---

## Engineering Team

**Institution:** President University  
**Event:** AI Open Innovation Challenge 2026

| Member | Role |
|--------|------|
| **Wisnu Alfian Nur Ashar** | Product Owner & Software Engineer |
| **Muhammad Faras** | Scrum Master |
| **Suci Ramadhani** | UI/UX Designer |
| **Steven Anderson Siagian** | Developer |

---

<p align="center">
  <sub>ColonyAI — Standardizing Microbiology with Computer Vision &amp; Cryptographic Data Integrity</sub><br>
  <sub>President University · AI Open Innovation Challenge 2026 · Version 2.0.0</sub>
</p>
