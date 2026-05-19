# 🧫 ColonyAI — Enterprise Laboratory Operating System (Lab-OS)

**Standardizing Microbiology with Computer Vision, Cryptographic Integrity & Zero-Trust Security**

[![AI Open Innovation Challenge 2026](https://img.shields.io/badge/AI%20Open%20Innovation%20Challenge-2026-orange)](#)
[![Case 1](https://img.shields.io/badge/Case%201-Microbiology%20Lab-blue)](#)
[![QA Status](https://img.shields.io/badge/QA%20Audit-10%2F10%20Passed-4CAF50)](#)
[![Compliance](https://img.shields.io/badge/Standards-ISO%2017025%20%2F%20GUM-blue)](#)

---

## 🏆 CASE 1 MICROBIOLOGY LABORATORY: 100% COMPLIANCE MATRIX

ColonyAI was specifically engineered to solve and exceed the requirements outlined in **Case 1: Automated Plate Count Reader**.

| Case 1 Requirement                       | ColonyAI Implementation                                                                                                                                                                                                 | Status  |
| :--------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------ |
| **Identifying agar plate area**          | Built-in **Hough Circle Transform & Homography** in `image_processor.py` automatically detects the circular dish, crops the Region of Interest (ROI), and applies perspective correction to eliminate background noise. | ✅ 100% |
| **Automatic detection & counting**       | Powered by a custom **YOLOv8 Neural Engine** that scans the isolated agar plate area in real-time, delivering rapid, highly accurate counts.                                                                            | ✅ 100% |
| **Differentiate colonies vs. artifacts** | A proprietary **5-Class Taxonomy** model separates biological targets (`colony_single`, `colony_merged`) from environmental artifacts (`bubble`, `dust_debris`, `media_crack`).                                         | ✅ 100% |
| **Consistent CFU/ml values**             | The inference engine feeds into `cfu_calculator.py` which takes dynamic inputs (Dilution Factor & Plated Volume) to automatically calculate exact **CFU/mL** alongside ISO GUM Measurement Uncertainty.                 | ✅ 100% |
| **Save results to reporting system**     | Results are cryptographically locked (SHA-256) into a secure PostgreSQL database, tracked via Audit Ledgers, and exportable as ISO-17025 compliant PDF certificates.                                                    | ✅ 100% |

### Scope & Limitations Addressed:

- **Lighting & Camera Quality**: Resolved via CLAHE (Contrast Limited Adaptive Histogram Equalization) preprocessing.
- **Overlapping Colonies**: Resolved via **Area-Based Merged Estimation (SA-001)** for heavily clustered matrices.
- **Analyst Verification**: Built-in **Human-in-the-Loop (HitL)** forces Manager approval before results are locked.

---

## 🌟 Executive Summary: Efficiency & Consistency

ColonyAI is a high-scale, production-ready **Laboratory Operating System (Lab-OS)** designed to eliminate human subjectivity in microbiology.

By digitizing the Total Plate Count (TPC) workflow, ColonyAI achieves two critical objectives:

1. **Efficiency of Analysis Time**: Reduces manual counting and calculation time by up to 94%. What takes an analyst 5 minutes per plate is completed by the YOLOv8 engine in under 50 milliseconds.
2. **Consistency of Results**: Delivers unprecedented reproducibility. The AI provides identical, unbiased analytical results regardless of operator fatigue, eye strain, or physical location.

---

## ⚙️ How It Works (End-to-End Workflow)

ColonyAI digitizes the entire laboratory analytical workflow into a secure, 4-step pipeline:

### **Step 1: Secure Ingestion & Plate Area Identification**

- The Lab Analyst captures an image of the petri dish and inputs the Dilution Factor and Plated Volume.
- **Sanitization Layer**: The system strips EXIF metadata and performs malware scanning.
- **Plate Detection**: The image processor uses the Hough Circle algorithm to strictly identify and isolate the agar plate area, ignoring the laboratory bench background.

### **Step 2: Neural Inference & Differentiation**

- The isolated plate image is routed to our proprietary **YOLOv8 Neural Engine**.
- The AI performs a high-speed micro-scan, identifying and differentiating between valid bacterial colonies and artifacts (`bubbles`, `dust`, `media_cracks`).

### **Step 3: Simulator & HitL Verification**

- **Simulator Module**: Evaluators can use the built-in Simulator dashboard to perform a direct **Comparison of manual vs AI accuracy**, complete with agreement percentage calculations.
- **Verification**: If the AI confidence score is <85% (due to extreme density), the system flags the sample for manual **Analyst Override**, ensuring human expertise remains the ultimate authority.

### **Step 4: CFU/mL Calculation & Reporting**

- The system processes the raw count against the provided dilution factors to generate a consistent **CFU/mL value**.
- The **Lab Manager** reviews and approves the data.
- The diagnostic record is permanently locked into the reporting system with a **SHA-256 Hash**, creating an unbreakable audit trail.

---

## 🔐 System Roles & Strict Access Matrix

ColonyAI implements a specialized **Tiered Access Model** enforcing strict _Separation of Duties_.

| Role                | Access Level    | Responsibilities                                                 |
| :------------------ | :-------------- | :--------------------------------------------------------------- |
| **Super Admin**     | 🟣 Multi-Tenant | Global ecosystem management and node provisioning.               |
| **System Admin**    | 🔴 Local Node   | Local IT governance and user provisioning. No biological access. |
| **Lab Manager**     | 🟡 Scientific   | Final authority. Approves AI results and generates certificates. |
| **Lab Analyst**     | 🔵 Operator     | Uploads imagery, inputs dilution data, runs AI inference.        |
| **Quality Auditor** | ⚪ Read-Only    | Views immutable audit trails & cryptographic hash chains.        |

---

## 🚀 Technical Architecture

- **Backend**: Python **FastAPI** utilizing `async/await` patterns for non-blocking AI inference.
- **Data Integrity**: **Pydantic v2** and **SQLAlchemy 2.0 (Async)** for resilient database transactions.
- **Frontend**: **Next.js 14** (App Router) delivering a premium "Medical-Professional" aesthetic with Tailwind CSS.
- **AI Processing**: Native **PyTorch** integration with automatic GPU acceleration detection.
- **Internationalization (i18n)**: Full dual-language support (English / Bahasa Indonesia) ensuring operational accessibility and regulatory clarity for Indonesian laboratories.
- **Enterprise LIMS Integration**: Seamless transmission simulation to external Laboratory Information Management Systems (e.g., SampleManager 12.4) with supervisor approval workflows.

---

## 📊 System Architecture & Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
│  ┌──────────────────┐  ┌──────────────────┐                        │
│  │  Web Browser     │  │  Mobile Browser  │                        │
│  │  (Desktop)       │  │  (Responsive)    │                        │
│  └────────┬─────────┘  └────────┬─────────┘                        │
└───────────┼─────────────────────┼───────────────────────────────────┘
            │                     │
            └─────────────────────┘
                                  │ HTTPS / REST API
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        APPLICATION LAYER                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Next.js 14 Frontend (Vercel CDN)               │   │
│  │  ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌──────────────┐  │   │
│  │  │  Upload  │ │  Results  │ │ Simulator│ │  Analytics   │  │   │
│  │  │  Module  │ │  Dashboard│ │  Module  │ │  Dashboard   │  │   │
│  │  └──────────┘ └───────────┘ └──────────┘ └──────────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              FastAPI Backend (Railway Docker)               │   │
│  │  ┌────────────┐ ┌────────────┐ ┌──────────┐ ┌───────────┐  │   │
│  │  │  Image     │ │  OpenCV    │ │  YOLOv8  │ │  CFU/ml   │  │   │
│  │  │  Ingest    │ │  Pre-proc  │ │ Inference│ │ Calculator│  │   │
│  │  │  + Security│ │  + CLAHE   │ │ + NMS    │ │ + GUM     │  │   │
│  │  └────────────┘ └────────────┘ └──────────┘ └───────────┘  │   │
│  │  ┌────────────┐ ┌────────────┐ ┌──────────┐ ┌───────────┐  │   │
│  │  │  Argon2    │ │  JWT Auth  │ │  5-Role  │ │  SHA-256  │  │   │
│  │  │  Password  │ │  + Blacklist│ │  RBAC   │ │  Audit    │  │   │
│  │  └────────────┘ └────────────┘ └──────────┘ └───────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          AI MODEL LAYER                              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  YOLOv8n/s — 5-Class Object Detection                        │  │
│  │  Classes: colony_single | colony_merged | bubble             │  │
│  │           dust_debris | media_crack                          │  │
│  │  Input: 512x512px | NMS IoU 0.45 | Per-media thresholds     │  │
│  │  Output: BBox + Class Label + Confidence Score per detection │  │
│  │  SA-001: Area-based merged colony estimation                 │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                    │
│  ┌──────────────────────┐      ┌──────────────────────────────┐   │
│  │  PostgreSQL          │      │  AWS S3 (Encrypted)          │   │
│  │  ┌────────────────┐  │      │  ┌────────────────────────┐  │   │
│  │  │  Users & 5-Role │  │      │  │ Plate Images           │  │   │
│  │  │  RBAC           │  │      │  │ Signed URLs (1hr)      │  │   │
│  │  │  Test Results   │  │      │  │ Encrypted at Rest      │  │   │
│  │  │  Audit Log      │  │      └────────────────────────┘  │   │
│  │  │  (SHA-256 chain)│  │      └──────────────────────────────┘   │
│  │  │  5-Class Counts │  │                                         │
│  │  │  CFU/ml Records │  │                                         │
│  │  │  Simulator Data │  │                                         │
│  │  └────────────────┘  │                                         │
│  └──────────────────────┘                                         │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       EXPORT & INTEGRATION                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  PDF Report  │  │  CSV Export  │  │  LIMS API Sync           │  │
│  │  (BPOM fmt)  │  │  (Lab data)  │  │  (SampleManager, etc.)   │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

**Figure 1 — ColonyAI System Architecture Diagram**

**Data Flow:** Upload → Magic-bytes Validation → CLAHE + Hough Circle + Homography → 5-Class YOLOv8 Inference → SA-001 Merged Estimation → CFU/ml + GUM Uncertainty → Analyst Review → Digital Sign-off → PDF/CSV Export + LIMS Sync

---

## 👥 Meet The Engineering Team

**Institution:** President University — IT Department

| Member                     | Role                                                     |
| :------------------------- | :------------------------------------------------------- |
| **Wisnu Alfian Nur Ashar** | Product Owner & Software Engineer                        |
| **Muhammad Faras**         | Scrum Master, AI/CV Integration, Business Analyst & Docs |
| **Suci**                   | Developer (UI/UX Designer)                               |
| **Steven**                 | Developer (frontend and backend)                         |

---

<div align="center">
<strong>ColonyAI</strong> — Accurate. Consistent. Reproducible. Defensible.<br>
🧫🤖 © 2026
</div>
