# ColonyAI — Laboratory Operating System (Lab-OS)

[![AI Open Innovation Challenge 2026](https://img.shields.io/badge/AI%20Open%20Innovation%20Challenge-2026-orange)](#)
[![Tech Stack](https://img.shields.io/badge/Stack-YOLOv8%20%7C%20FastAPI%20%7C%20Next.js-blue)](#)
[![Security](https://img.shields.io/badge/Security-Enterprise%20Grade-4CAF50)](#)
[![Compliance](https://img.shields.io/badge/Compliance-ISO%2017025%20%2F%20GUM-blue)](#)

---

## 🔬 Project Overview
ColonyAI is an AI-powered **Laboratory Operating System (Lab-OS)** engineered to modernize Total Plate Count (TPC) testing in microbiology laboratories. By integrating deep learning with a zero-trust secure architecture, ColonyAI eliminates manual subjectivity, provides metrological traceability, and ensures regulatory-compliant reporting for accredited testing facilities.

## 🚀 Key Technical Innovations

*   **Real-time AI Inference:** A fine-tuned YOLOv8 neural engine optimized for 5-class object detection (`colony_single`, `colony_merged`, `bubble`, `dust_debris`, `media_crack`).
*   **Metrological Rigor:** SA-001 area-based merged colony estimation combined with GUM-compliant measurement uncertainty calculation (k=2).
*   **Zero-Trust Security:** Multi-layered security stack: magic-bytes file validation, ClamAV malware scanning, EXIF privacy stripping, and Argon2 password hashing.
*   **Cryptographic Auditability:** Every result is permanently secured with a **SHA-256 chained audit log** to ensure tamper-evident records for ISO 17025/BPOM compliance.
*   **RBAC Governance:** 5-tier role-based access control (Super Admin, Admin, Manager, Analyst, Auditor) ensuring strict separation of duties.

## 🏗️ System Architecture
*Detailed technical visualization of the ColonyAI ecosystem:*
[View Technical Architecture](project-management/technical-architecture.md)

## 📋 Core Technology Stack

| Layer | Technology |
| :--- | :--- |
| **AI/ML** | YOLOv8, OpenCV, PyTorch |
| **Backend** | Python, FastAPI, Pydantic v2, SQLAlchemy 2.0 |
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| **Database** | PostgreSQL (ACID-compliant, Multi-tenant) |
| **Infrastructure** | Docker, Railway (Backend), Vercel (Frontend), AWS S3 |

---

## 🛡️ Regulatory Compliance & Standards
ColonyAI supports and adheres to the following laboratory standards:
- **ISO 17025:** General requirements for testing and calibration laboratories.
- **ISO/IEC Guide 98-3:2008 (GUM):** Expression of uncertainty in measurement.
- **BPOM / SNI 2897:2008:** Indonesian regulatory standards for microbial contamination.
- **UU PDP Indonesia:** Compliance with personal data protection laws.

---

## 👥 Engineering Team
**Institution:** President University — IT Department

| Member | Role Focus |
| :--- | :--- |
| **Wisnu Alfian Nur Ashar** | Product Owner & Software Engineer |
| **Muhammad Faras** | Scrum Master, AI/CV Integration, Analyst |
| **Suci Ramadhani** | UI/UX Designer & Frontend Developer |
| **Steven** | Backend Lead & Security Engineer |

---
*ColonyAI — Standardizing Microbiology with Computer Vision & Cryptographic Integrity*
