# 👥 Roles & Responsibilities — ColonyAI

This document outlines the core team structure and individual areas of focus for the ColonyAI project.

---

## 🏛️ Team Structure

| Name | Role | Primary Focus |
| :--- | :--- | :--- |
| **Wisnu Alfian Nur Ashar** | Product Owner | **Frontend Lead** & UI/UX Vision. Responsible for the Dashboard OS, scientific nomenclature, and user experience. |
| **Muhammad Faras** | Scrum Master | **AI/ML Lead**. Responsible for model training, dataset curation, inference optimization, and CI/CD pipelines. |
| **Suci** | Developer | **UI/UX Designer**. Responsible for component styling, color-coded annotation systems, and marketing assets. |
| **Steven** | Developer | **Backend Lead**. Responsible for API security, database architecture, ISO 17025 compliance, and report generation. |

---

## 📑 Detailed Responsibilities

### Product Owner (Wisnu)
- Ensuring the product meets microbiology laboratory standards.
- Managing the sprint backlog and prioritizing high-value features.
- Finalizing the presentation and defense strategy.

### Scrum Master / AI Lead (Faras)
- Facilitating daily standups and resolving technical blockers.
- Fine-tuning YOLOv8 for 5-class detection.
- Optimizing model performance for local and cloud environments.

### Backend Engineer (Steven)
- Implementing secure file upload protocols (EXIF stripping, magic bytes).
- Developing the SA-001 CFU/ml calculation engine.
- Managing the PostgreSQL/SQLite database and audit logging systems.

### UI/UX Developer (Suci)
- Developing responsive layouts using Tailwind CSS.
- Creating intuitive data visualizations for laboratory analytics.
- Ensuring the dashboard feels like a professional "Laboratory OS."

---

## 🔐 Application Access Roles (RBAC)
*Updated for Presentation Defense (April 30)*

To ensure ISO 17025 compliance and separation of duties, ColonyAI implements a 4-tier access model:

1.  **Laboratory Analyst**: Authorized for specimen imaging, executing AI diagnostics, and managing initial data entry.
2.  **Laboratory Manager**: Authorized for results verification, final sign-offs, and generating accredited reports.
3.  **Quality Auditor**: Authorized for viewing read-only audit trails, verifying cryptographic integrity chains, and monitoring compliance metrics.
4.  **System Administrator**: Authorized for node governance, user provisioning, and real-time kernel health monitoring.
