# ColonyAI

<div align="center">

**AI-Powered Automated Plate Count Reader for Microbiology Laboratories**

[![AI Open Innovation Challenge 2026](https://img.shields.io/badge/AI%20Open%20Innovation%20Challenge-2026-orange)](https://github.com/wi5nuu/colonyai)
[![YOLOv8](https://img.shields.io/badge/AI%20Model-YOLOv8-red)](https://github.com/ultralytics/ultralytics)
[![Next.js 14](https://img.shields.io/badge/Frontend-Next.js%2014-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-green)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)](https://www.postgresql.org/)

🧫 _Modernizing microbiology through AI-powered automation_

</div>

---

## Project Overview

ColonyAI is an intelligent laboratory platform that transforms agar plate images into accurate, standardized CFU/ml reports in under two minutes. Built for the **AI Open Innovation Challenge 2026**, the system addresses critical inefficiencies in manual Total Plate Count (TPC) workflows across Indonesian microbiology laboratories.

> **The Problem:** Manual colony counting suffers from 22.7%–80% inter-analyst variability (ASTM F2944), creating bottlenecks in food safety testing, environmental monitoring, and clinical diagnostics across Indonesia's 500+ accredited testing facilities.

> **The Solution:** A fine-tuned YOLOv8 model integrated with a Next.js web dashboard that automates colony detection, 5-class artifact classification, and CFU/ml calculation — delivering consistent, reproducible results with full audit trails for ISO 17025 compliance.

## Core Capabilities

| Capability | Description |
|------------|-------------|
| **Automated Colony Detection** | YOLOv8-based object detection with ≥ 92% target accuracy across diverse media types and lighting conditions |
| **5-Class Intelligent Classification** | Simultaneous classification of `colony_single`, `colony_merged`, `bubble`, `dust_debris`, and `media_crack` — enabling precise artifact rejection |
| **CFU/ml Auto-Calculation** | Automated colony counting with dilution factor integration, TNTC/TFTC flagging, and standardized reporting |
| **Digital Audit Trail** | Immutable, timestamped PostgreSQL audit logs with analyst digital sign-off for ISO 17025 / BPOM compliance |
| **LIMS-Ready Export** | PDF and CSV reports in BPOM/SNI format, with API hooks for SampleManager, LabVantage, and other LIMS platforms |
| **Media-Agnostic Design** | Trained across 8+ agar media types (PCA, VRBA, BGBB, etc.) for real-world laboratory conditions |

## System Architecture

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Browser   │  │   Mobile    │  │  Smartphone │
│  (Desktop)  │  │   Browser   │  │   Camera    │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │
       └────────────────┼────────────────┘
                        │ HTTPS / REST API
                        ▼
┌───────────────────────────────────────────────┐
│           Next.js 14  Frontend                 │
│  Upload │ Results │ Simulator │ Analytics     │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│          FastAPI  Backend (Python)             │
│  Image Pre-processing │ OpenCV │ CFU Calc     │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│        YOLOv8  —  5-Class Inference            │
│  colony_single │ colony_merged │ bubble        │
│  dust_debris │ media_crack                     │
└───────────────────────┬───────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        ▼                               ▼
┌───────────────┐               ┌───────────────┐
│  PostgreSQL   │               │   AWS S3      │
│  (Supabase)   │               │  (Encrypted)  │
│  Audit Log    │               │   Images      │
└───────────────┘               └───────────────┘
```

## Getting Started

### Prerequisites

| Requirement | Version | Download |
|-------------|---------|----------|
| Python | 3.10+ | https://www.python.org/downloads/ |
| Node.js | 18+ | https://nodejs.org/ |
| PostgreSQL | 15+ | https://www.postgresql.org/download/ |
| Git | Latest | https://git-scm.com/ |

### Quick Run (Standard)

1. **Backend**: Open terminal in `backend/`, run `start_backend.bat`.
2. **Frontend**: Open terminal in `frontend/`, run `npm run dev`.

Access at `http://localhost:3000`.

### Full Installation (Windows)

**1. Clone the Repository**
```bash
git clone https://github.com/wi5nuu/colonyai.git
cd colonyai
```

**2. Setup Backend**
```bash
# Create virtual environment
python -m venv .venv
.venv\Scripts\activate

# Install Python dependencies
pip install -r backend\requirements.txt

# Create .env file from template
copy backend\.env.example backend\.env
# Edit backend\.env and set your DATABASE_URL and SECRET_KEY

# Start backend server
backend\start_backend.bat
```
Backend will be available at: **http://localhost:8000**  
API Documentation: **http://localhost:8000/docs**

**3. Setup Frontend (Open a NEW terminal)**
```bash
cd frontend

# Install dependencies
npm install

# Create .env file
copy .env.example .env.local

# Start frontend server
npm run dev
```
Frontend will be available at: **http://localhost:3000**

### Manual Start (Alternative)

If the batch scripts don't work, run manually:

```bash
# Backend (Terminal 1)
cd d:\lombapuai
.venv\Scripts\activate
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Frontend (Terminal 2)
cd d:\lombapuai\frontend
npm run dev
```

### Environment Variables

**Backend** (`backend/.env`):
```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/colonyai
SECRET_KEY=your-secret-key-change-in-production
JWT_SECRET_KEY=your-jwt-secret-key
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=ColonyAI
```

### Running ML Training (Optional)

```bash
cd ml-training

# Install ML training dependencies
pip install -r requirements.txt

# Verify dataset
python train.py --mode verify

# Train model (requires GPU for best results)
python train.py --mode full

# Train on CPU (slower, smaller model)
python train.py --mode train --batch 4
```

---

## Project Structure

```
colonyai/
├── ColonyAI_Proposal.md      # Competition proposal (complete)
├── backend/                  # FastAPI REST API
│   ├── app/
│   │   ├── api/v1/           # API endpoints
│   │   ├── core/             # Configuration & security
│   │   ├── models/           # Database models
│   │   └── services/         # Business logic (CFU, detection)
│   └── requirements.txt
├── frontend/                 # Next.js 14 dashboard
│   └── src/
│       ├── app/              # App Router pages
│       └── components/       # Reusable UI components
├── ml-training/              # YOLOv8 training pipeline
│   ├── train.py              # Training script
│   ├── download_dataset.py   # AGAR dataset downloader
│   └── requirements.txt
└── docs/                     # Technical documentation
```

## Technology Stack

| Layer | Technology |
|-------|-----------|
| AI Model | YOLOv8n / YOLOv8s (Ultralytics) |
| Backend | FastAPI (Python 3.10+) |
| Frontend | Next.js 14 + TypeScript + Tailwind CSS |
| Database | PostgreSQL (Supabase) |
| Storage | AWS S3 (encrypted, signed URLs) |
| Deployment | Railway (backend) + Vercel (frontend) |
| Model Tracking | MLflow |

## Team

**ColonyAI** — AI Open Innovation Challenge 2026

| Member | Role |
|--------|------|
| **Wisnu Alfian Nur Ashar** | Product Owner |
| **Muhammad Faras** | Scrum Master |
| **Suci** | Developer |
| **Steven** | Developer |

**Institution:** President University — Bachelor of Information Technology  
**GitHub:** https://github.com/wi5nuu/colonyai

## Competition Status

| Milestone | Status |
|-----------|--------|
| Proposal submitted | ✅ Complete |
| System architecture defined | ✅ Complete |
| Technology stack selected | ✅ Complete |
| Dataset identified (AGAR + Roboflow) | ✅ Complete |
| Development environment initialized | ✅ Complete |
| Model training (Phase 1) | 🔄 In Progress |
| Backend API scaffold | 🔄 In Progress |
| Frontend dashboard | 📋 Planned |
| Full system integration | 📋 Planned |
| Pilot deployment | 📋 Planned |

## Key References

1. Coutinho, C., et al. (2021). AGAR microbial colony dataset. *Scientific Reports, 11*, 16365. [DOI](https://doi.org/10.1038/s41598-021-99300-z)
2. ASTM F2944. Standard Test Method for Automated Colony Forming Unit (CFU) Assays.
3. FDA (2023). Bacteriological Analytical Manual — Chapter 3: Aerobic Plate Count.
4. ISO/IEC 17025:2017. General requirements for testing and calibration laboratories.
5. Jocher, G., et al. (2023). Ultralytics YOLOv8. [GitHub](https://github.com/ultralytics/ultralytics)

## Contact

**Team Leader:** Wisnu Alfian Nur Ashar  
**Email:** wisnu.ashar@student.president.ac.id  
**WhatsApp:** +62 813-9488-2490

---

<div align="center">
<strong>ColonyAI</strong> — Accurate. Consistent. Reproducible.
<br>
🧫🤖 AI Open Innovation Challenge 2026
</div>
