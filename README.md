# ColonyAI - Automated Plate Count Reader and Laboratory Integration System

[![AI Open Innovation Challenge 2026](https://img.shields.io/badge/AI%20Open%20Innovation%20Challenge-2026-orange)](#)
[![Tech Stack](https://img.shields.io/badge/Stack-YOLOv8%20%7C%20FastAPI%20%7C%20Next.js-blue)](#)
[![Security](https://img.shields.io/badge/Security-Enterprise%20Grade-4CAF50)](#)
[![Compliance](https://img.shields.io/badge/Compliance-ISO%2017025%20%2F%20GUM-blue)](#)

---

## Project Overview

ColonyAI is an automated system powered by deep learning designed to count bacterial colonies and manage data in microbiology laboratories. In traditional workflows, laboratory analysts count bacterial colonies manually on agar plates. This process is time-consuming and prone to human error, with inter-analyst variability ranging from 22.7% to 80% coefficient of variation. 

ColonyAI resolves this issue by integrating a computer vision pipeline with a secure web dashboard. The system automates agar plate localization, detects and counts colonies, differentiates valid biological specimens from non-biological artifacts, and calculates concentration levels (CFU/ml) with standardized scientific calculations.

## Key Technical Features

*   **Computer Vision Pipeline:** Utilizes a fine-tuned YOLOv8 neural network optimized to detect and classify objects into 5 distinct classes (colony_single, colony_merged, bubble, dust_debris, and media_crack). Preprocessing is accelerated using Contrast Limited Adaptive Histogram Equalization (CLAHE) and Hough Circle Transform to isolate the agar plate area automatically.
*   **Artifact Rejection:** Differentiates valid colonies from non-biological noise (such as air bubbles, dust, or cracks in the agar medium) with an artifact rejection precision of over 90%, preventing false positives in the final count.
*   **Scientific Concentration Calculations:** Automatically calculates Colony Forming Units per milliliter (CFU/ml) based on the dilution factor and volume plated. The system incorporates area-based merged colony estimation (SA-001) for overlapping colonies and calculates expanded measurement uncertainty (k=2) following the ISO/IEC Guide 98-3 (GUM) standard.
*   **Cryptographic Audit Trail:** To satisfy ISO 17025 regulatory compliance, every analysis and modification is recorded in a tamper-evident database log using SHA-256 cryptographic hash chaining. Any unauthorized modification to past logs automatically invalidates the subsequent chain, making data tampering detectable.
*   **Enterprise-Grade Security:** Incorporates a Zero-Trust architecture featuring Argon2 password hashing, JSON Web Tokens (JWT) with JTI-based blacklisting for instant session revocation, magic-bytes verification to prevent MIME-type spoofing, automatic EXIF metadata stripping for GPS privacy, and integrated ClamAV malware scanning.
*   **Multi-Role Governance:** Implements a 4-tier Role-Based Access Control (RBAC) system (Admin, Manager, Analyst, and Auditor) to enforce strict separation of duties within the laboratory.

## System Architecture & Documentation

Comprehensive documentation regarding the architecture, security mechanisms, and guides is located in the docs directory:

*   [System Architecture & Data Flow](docs/architecture.md)
*   [Model Validation & Performance Report](docs/MODEL_VALIDATION_REPORT.md)
*   [Case 1 Challenge Compliance Evidence](docs/CASE1_EVIDENCE.md)
*   [Enterprise Security Architecture](docs/SECURITY_PRESENTATION.md)
*   [User Manual & Laboratory Protocol](docs/user-manual.md)
*   [API Reference Specification](docs/api.md)
*   [Model Training Documentation](docs/model-training.md)
*   [Deployment Guide](docs/deployment.md)

## Core Technology Stack

| Layer | Technology |
| :--- | :--- |
| **AI/ML Vision** | YOLOv8s, OpenCV, PyTorch |
| **Backend API** | Python, FastAPI, Pydantic v2, SQLAlchemy 2.0 (Async) |
| **Frontend App** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand |
| **Database** | PostgreSQL 15 (ACID-compliant) |
| **Infrastructure** | Docker, Railway, Vercel, AWS S3 (AES-256 Encrypted) |

## Regulatory Compliance & Standards

ColonyAI is built to comply with international and national standards governing laboratory management and food safety:
*   **ISO/IEC 17025:2017:** General requirements for the competence of testing and calibration laboratories (specifically for data integrity and access control).
*   **ISO/IEC Guide 98-3:2008 (GUM):** Expression of uncertainty in measurement.
*   **ISO 4833-1:2013:** Microbiology of the food chain — Horizontal method for the enumeration of microorganisms (standardizing countable ranges between 25 and 250 CFU).
*   **BPOM / SNI 2897:2008:** Indonesian national standards for microbial contamination testing.
*   **UU PDP Indonesia:** Compliance with the national personal data protection framework.

## Engineering Team

**Institution:** President University  
**Event:** AI Open Innovation Challenge 2026  

| Member | Role |
| :--- | :--- |
| **Wisnu Alfian Nur Ashar** | Product Owner & Software Engineer |
| **Muhammad Faras** | Scrum Master |
| **Suci Ramadhani** | UI/UX Designer |
| **Steven Anderson Siagian** | Developer |

---
*ColonyAI - Standardizing Microbiology with Computer Vision & Cryptographic Integrity*
