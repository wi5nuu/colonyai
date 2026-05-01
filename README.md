# 🧫 ColonyAI — Laboratory OS for High-Precision AI Plate Reading

**Standardizing Microbiology with Computer Vision & Cryptographic Integrity**

[![AI Open Innovation Challenge 2026](https://img.shields.io/badge/AI%20Open%20Innovation%20Challenge-2026-orange)](#)
[![QA Status](https://img.shields.io/badge/QA%20Audit-10%2F10%20Passed-4CAF50)](#)
[![Architecture](https://img.shields.io/badge/Architecture-Clean%20OOP-4CAF50)](#)
[![Compliance](https://img.shields.io/badge/Standards-ISO%2017025%20%2F%20GUM-blue)](#)

---

## 🌟 Vision & Human Impact

ColonyAI is not just a tool; it is a **Laboratory Operating System (Lab-OS)** designed to solve the most persistent problem in microbiology: **Human Subjectivity**.

In traditional laboratories, manual colony counting is prone to fatigue, eye strain, and inconsistency between analysts. ColonyAI transforms this workflow into a standardized, AI-assisted process that ensures:

- **Reproducibility**: Identical results regardless of which analyst performs the scan.
- **Accreditation Readiness**: Built-in calculations for **Measurement Uncertainty (U)** per ISO/IEC Guide 98-3 (GUM).
- **Human-in-the-Loop (HitL)**: Empowering analysts to spend time on complex diagnostics rather than repetitive counting.

---

## 🚀 Key Professional Features

### 🧠 1. Neural Inference Engine (YOLOv8)

Powered by a custom-trained **YOLOv8** model optimized for high-density agar plates:

- **5-Class Taxonomy**: Distinguishes between `colony_single`, `colony_merged`, and artifacts like `bubbles`, `dust`, and `media_cracks`.
- **Merged Estimation (SA-001)**: Implements area-based estimation for merged clusters, ensuring accuracy even in high-concentration samples.
- **Reliability Indicators**: Real-time confidence scoring that flags samples for manual review if AI certainty drops below 85%.

### 🛡️ 2. Defense-in-Depth Security Methodology

We treat laboratory data as critical infrastructure. Our security implementation is based on **Zero-Trust** principles:

- **Cryptographic Hash Chain (SHA-256)**: Every activity log links to the hash of the previous entry. _Purpose_: Ensures the audit trail is untamperable and legally defensible during regulatory audits.
- **Biosecurity Sanitization**: Automatic **EXIF stripping** (removes GPS/device metadata) and **Magic-Byte validation**. _Purpose_: Protects lab IP and prevents steganographic malware injection.
- **Malware Neutralization**: Real-time **ClamAV** node scanning for every diagnostic upload. _Purpose_: Prevents laboratory servers from becoming vectors for digital threats.

### ⚖️ 3. Scientific & Regulatory Compliance

- **ISO 17025 Section 7.11**: Strict data control and Role-Based Access Control (RBAC).
- **Measurement Uncertainty**: Automated calculation of **U_expanded (k=2, 95%)** factoring in repeatability (sr) and reproducibility (SR).
- **Immutable Ledger**: Once a result is approved by a Manager, the record is locked and hashed.

---

## 🔐 System Roles & Credentials

The system implements a streamlined **4-Tier Access Model** to maximize operational efficiency.

| Role                | Access Level  | Responsibilities                                                            |
| :------------------ | :------------ | :-------------------------------------------------------------------------- |
| **System Admin**    | 🔴 Full       | Node governance, user provisioning, real-time **Kernel Vitals** monitoring. |
| **Lab Manager**     | 🟡 Management | Results verification, final sign-offs, and accredited report generation.    |
| **Lab Analyst**     | 🔵 Limited    | Specimen imaging, AI diagnostic execution, and initial data entry.          |
| **Quality Auditor** | ⚪ Read-Only  | Read-only access to immutable audit trails & cryptographic hash chains.     |

### **Test Accounts (Competition Demo)**

| Email                  | Password              | Role            |
| :--------------------- | :-------------------- | :-------------- |
| `admin@colonyai.com`   | `admin_secure_2026`   | System Admin    |
| `manager@colonyai.com` | `manager_secure_2026` | Lab Manager     |
| `analyst@colonyai.com` | `analyst_secure_2026` | Lab Analyst     |
| `auditor@colonyai.com` | `auditor_secure_2026` | Quality Auditor |

---

## 🏗️ Technical Architecture (OOP Excellence)

ColonyAI is built using **Professional Object-Oriented Programming (OOP)** patterns to ensure scalability and zero-error migrations:

- **Asynchronous Orchestration**: Python **FastAPI** with `async/await` patterns for non-blocking AI inference.
- **Schema-Driven Data**: **Pydantic v2** for strict data validation and type-safety.
- **Database Integrity**: **SQLAlchemy 2.0** (Async) with robust migration handling and relationship mapping.
- **Clean UI Architecture**: **Next.js 14** (App Router) with a unified design system tailored for laboratory environments (High-contrast, responsive, interactive).

---

## 🛠️ Installation & Setup

### **Quick Run (Windows)**

1.  **Backend**:
    ```bash
    cd backend
    python -m venv .venv
    .venv\Scripts\activate
    pip install -r requirements.txt
    uvicorn main:app --reload
    ```
2.  **Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

---

## 📅 Roadmap to Victory (September 2026)

- [x] **Phase 3 (April)**: Core AI Engine & 4-Role RBAC.
- [ ] **Phase 4 (May)**: Pilot Deployment to Food Safety Labs.
- [ ] **Phase 5 (June)**: LIMS Integration & Batch Processing.
- [ ] **Phase 6 (Sept)**: Grand Final Presentation.

---

## 👥 Meet The Team

**Institution:** President University — IT Department

| Member                     | Role                                 |
| :------------------------- | :----------------------------------- |
| **Wisnu Alfian Nur Ashar** | **Product Owner** & Frontend Lead    |
| **Muhammad Faras**         | **Scrum Master** & AI Engineer       |
| **Steven**                 | **Backend Lead** & Security Engineer |
| **Suci**                   | **UI/UX Designer** & Frontend Dev    |

---

<div align="center">
<strong>ColonyAI</strong> — Accurate. Consistent. Reproducible.
🧫🤖 2026
</div>
