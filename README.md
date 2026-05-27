# ColonyAI — Laboratory Operating System (Lab-OS)

[![AI Open Innovation Challenge 2026](https://img.shields.io/badge/AI%20Open%20Innovation%20Challenge-2026-orange)](#)
[![Tech Stack](https://img.shields.io/badge/Stack-YOLOv8%20%7C%20FastAPI%20%7C%20Next.js-blue)](#)
[![Security](https://img.shields.io/badge/Security-Enterprise%20Grade-4CAF50)](#)
[![Compliance](https://img.shields.io/badge/Compliance-ISO%2017025%20%2F%20GUM-blue)](#)

---

## 🔬 Project Overview
ColonyAI is an AI-powered **Automated Plate Count Reader and Laboratory Operating System** engineered to modernize Total Plate Count (TPC) testing in microbiology laboratories. By integrating deep learning with a zero-trust secure architecture, ColonyAI eliminates manual subjectivity, provides metrological traceability, and ensures regulatory-compliant reporting for accredited testing facilities.

## 🚀 Key Technical Innovations

*   **Real-time AI Inference:** A fine-tuned YOLOv8 neural engine optimized for 5-class object detection (`colony_single`, `colony_merged`, `bubble`, `dust_debris`, `media_crack`).
*   **Metrological Rigor:** SA-001 area-based merged colony estimation combined with GUM-compliant measurement uncertainty calculation (k=2) per ISO/IEC Guide 98-3:2008.
*   **Zero-Trust Security:** Multi-layered security stack: magic-bytes file validation, ClamAV malware scanning, EXIF privacy stripping, multi-layered Anti-Phishing engine, and Argon2 password hashing.
*   **Cryptographic Auditability:** Every result is permanently secured with a **SHA-256 chained audit log** to ensure tamper-evident records for ISO 17025/BPOM compliance.
*   **RBAC Governance:** 5-tier role-based access control (Super Admin, Admin, Manager, Analyst, Auditor) ensuring strict separation of duties.

## 🏗️ System Architecture & Documentation

We maintain comprehensive documentation for our system architecture, security implementation, and user guidelines:

- 📊 **[Technical Architecture Diagram & Details](project-management/technical-architecture.md)**
- 🛡️ **[Enterprise Security Features Checklist](project-management/SECURITY_FEATURES_CHECKLIST.md)**
- 📖 **[User Manual & Quick Start Guide](project-management/user-manual.md)**
- 👥 **[Team Structure & Roles](project-management/team-structure.md)**

## 📋 Core Technology Stack

| Layer | Technology |
| :--- | :--- |
| **AI/ML Vision** | YOLOv8s, OpenCV (CLAHE), PyTorch |
| **Backend API** | Python, FastAPI, Pydantic v2, SQLAlchemy 2.0 (Async) |
| **Frontend App** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand |
| **Database** | PostgreSQL 15 (ACID-compliant, Multi-tenant, 13 Tables) |
| **Infrastructure** | Docker, Railway, Vercel, AWS S3 (Encrypted) |

---

## 🛡️ Regulatory Compliance & Standards
ColonyAI supports and adheres to the following laboratory standards:
- **ISO 17025:2017:** General requirements for testing and calibration laboratories.
- **ISO/IEC Guide 98-3:2008 (GUM):** Expression of uncertainty in measurement.
- **ISO 4833-1:2013:** Microbiology of the food chain — Horizontal method for the enumeration of microorganisms.
- **BPOM / SNI 2897:2008:** Indonesian regulatory standards for microbial contamination.
- **UU PDP Indonesia:** Compliance with personal data protection laws.

---

## 👥 Engineering Team
**Institution:** President University
**Event:** AI Open Innovation Challenge 2026

| Member | Role |
| :--- | :--- |
| **Wisnu Alfian Nur Ashar** | Product Owner & Software Engineer |
| **Muhammad Faras** | Scrum Master |
| **Suci Ramadhani** | UI/UX Designer |
| **Steven Anderson Siagian** | Developer |

---
*ColonyAI — Standardizing Microbiology with Computer Vision & Cryptographic Integrity*
