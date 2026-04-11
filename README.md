# ColonyAI - AI-Powered Bacterial Colony Detection & CFU/ml Reporting System

![ColonyAI](https://img.shields.io/badge/ColonyAI-v1.0.0-blue)
![YOLOv8](https://img.shields.io/badge/YOLOv8-Object%20Detection-red)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![FastAPI](https://img.shields.io/badge/FastAPI-Python%20Backend-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🎯 Overview

ColonyAI is an AI-powered Automated Plate Count Reader system designed to modernize Total Plate Count (TPC) testing in microbiology laboratories. It integrates computer vision (YOLOv8) with a modern web dashboard to automate bacterial colony detection, differentiation, and CFU/ml calculation in real time.

## ✨ Key Features

- 🤖 **AI-Powered Detection**: YOLOv8-based colony detection with ≥92% accuracy
- 🎨 **Smart Artifact Removal**: Differentiates colonies from bubbles, dust, and media cracks
- 📊 **Automated CFU/ml Calculation**: Automatic dilution factor integration
- 🌐 **Modern Web Dashboard**: Next.js 14 with TypeScript and Tailwind CSS
- 🔐 **Secure & Compliant**: JWT auth, RBAC, ISO 17025 compliant audit trails
- 📈 **LIMS Integration**: Ready for Laboratory Information Management Systems
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     User Interface                       │
│              (Next.js 14 + TypeScript)                   │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │  Upload  │  │ Results  │  │ History  │  │Reports │  │
│  │  Module  │  │ Dashboard│  │ Analytics│  │ Export │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP/REST API
┌────────────────────────▼────────────────────────────────┐
│                   Backend API                            │
│                  (FastAPI - Python)                      │
│                                                          │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐     │
│  │  Image   │  │   YOLOv8     │  │   CFU/ml      │     │
│  │ Preproc. │→ │  Inference   │→ │  Calculator   │     │
│  └──────────┘  └──────────────┘  └───────────────┘     │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                  Data Layer                              │
│                                                          │
│  ┌──────────────┐       ┌──────────────────┐           │
│  │  PostgreSQL  │       │  AWS S3 Storage  │           │
│  │  (Supabase)  │       │  (Images)        │           │
│  └──────────────┘       └──────────────────┘           │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- PostgreSQL database (or Supabase account)
- GPU (recommended for model training, but CPU works too)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/wi5nuu/colonyai.git
cd colonyai
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup Frontend**
```bash
cd frontend
npm install
cp .env.example .env.local
cd ..
```

4. **Setup Backend**
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
cd ..
```

5. **Setup ML Training (Local - No Colab Needed!)**
```bash
cd ml-training
# Windows: Double-click setup.bat
# Or manually:
pip install -r requirements.txt
python download_dataset.py
```

6. **Run Development Servers**
```bash
# Run both frontend and backend
npm run dev

# Or run separately
npm run dev:frontend  # http://localhost:3000
npm run dev:backend   # http://localhost:8000
```

### 🏋️ Model Training (100% Local!)

**No Google Colab needed** - train directly on your laptop!

```bash
# Quick setup (Windows)
cd ml-training
setup.bat

# Or manually:
1. Download dataset (see ml-training/LOCAL_TRAINING_GUIDE.md)
2. Verify: python verify_dataset.py
3. Train: python train.py
   Or Windows: Double-click run_training.bat
```

**See detailed guide**: [LOCAL_TRAINING_GUIDE.md](./ml-training/LOCAL_TRAINING_GUIDE.md)

## 📁 Project Structure

```
colonyai/
├── frontend/               # Next.js 14 web application
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # Utility functions
│   │   ├── services/      # API service layer
│   │   └── types/         # TypeScript type definitions
│   ├── public/            # Static assets
│   └── package.json
├── backend/               # FastAPI backend
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── core/         # Core configuration
│   │   ├── models/       # ML models
│   │   ├── services/     # Business logic
│   │   └── utils/        # Utility functions
│   ├── requirements.txt
│   └── main.py
├── ml-training/          # Model training scripts
│   ├── datasets/         # Training datasets
│   ├── models/           # Trained model weights
│   └── train.py          # Training script
├── docs/                 # Documentation
└── README.md
```

## 🔬 AI Model Details

### Model Architecture
- **Base Model**: YOLOv8n / YOLOv8s (Ultralytics)
- **Detection Classes**:
  - `colony_single`: Individual bacterial colonies
  - `colony_merged`: Overlapping/merged colonies
  - `bubble`: Air bubbles (artifact)
  - `dust_debris`: Dust and debris (artifact)
  - `media_crack`: Agar plate cracks (artifact)

### Training Dataset
- **AGAR Public Dataset**: 18,000+ annotated images
- **Roboflow Universe**: Additional colony datasets
- **Synthetic Augmentation**: 3× dataset expansion
- **Local Lab Data**: 500-1,000 real-world images (pilot phase)

### Performance Metrics
- **Detection Accuracy**: ≥ 92%
- **mAP@0.5**: > 0.90
- **Inference Time**: < 2 seconds per plate
- **Artifact Rejection**: > 90% precision

## 📊 CFU/ml Calculation

The system automatically calculates Colony Forming Units per milliliter:

```
CFU/ml = Colony Count / (Plated Volume (ml) × Dilution Factor)
```

**Automatic Flags**:
- **TNTC** (Too Numerous To Count): > 250 colonies
- **TFTC** (Too Few To Count): < 25 colonies

## 🔐 Security Features

- JWT-based authentication
- Role-Based Access Control (RBAC)
- Encrypted AWS S3 storage with signed URLs
- Immutable audit logs with timestamps
- HTTPS enforcement
- API rate limiting

## 📈 Development Roadmap

| Phase | Timeline | Deliverables |
|-------|----------|--------------|
| 1 | Week 1-2 | Dataset collection, environment setup |
| 2 | Week 3-5 | YOLOv8 training, backend scaffold |
| 3 | Week 6-8 | Model optimization, dashboard UI |
| 4 | Week 9-11 | Full integration, CFU module, auth |
| 5 | Week 12-14 | Testing, pilot deployment, demo prep |

## 💼 Business Model

### SaaS Subscription Tiers

| Tier | Price | Features |
|------|-------|----------|
| **Starter** | IDR 500K/mo | 500 analyses/month |
| **Professional** | IDR 1.5M/mo | Unlimited analyses |
| **Enterprise** | Custom | LIMS integration, SLA |

## 📚 Documentation

- [System Architecture](./docs/architecture.md)
- [API Documentation](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)
- [User Manual](./docs/user-manual.md)
- [Model Training Guide](./docs/model-training.md)

## 🤝 Contributing

This project is part of the AI Open Innovation Challenge 2026. Contributions are welcome!

## 📧 Contact

**Team Leader**: Wisnu Alfian Nur Ashar  
**Email**: wisnu.ashar@student.president.ac.id  
**GitHub**: https://github.com/wi5nuu  
**Institution**: President University | Bachelor of Information Technology

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- AI Open Innovation Challenge 2026
- President University
- AGAR Dataset (Macquarie University)
- Ultralytics YOLOv8
- Roboflow

## 📖 References

1. Coutinho, C., et al. (2021). "AGAR a microbial colony dataset for deep learning detection." *Scientific Reports, 11*, 16365.
2. Trevisan, N. M., et al. (2022). "Automated bacterial colony counting using deep learning object detection." *Computers and Electronics in Agriculture, 200*, 107226.
3. Jocher, G., Chaurasia, A., & Qiu, J. (2023). "Ultralytics YOLOv8 [Software]." GitHub.
4. FDA (2023). "Bacteriological Analytical Manual (BAM) — Chapter 3: Aerobic Plate Count."
5. ISO (2017). "ISO 17025:2017 — General requirements for testing and calibration laboratories."

---

**ColonyAI** — Modernizing microbiology laboratories through AI-powered automation 🧫🤖
