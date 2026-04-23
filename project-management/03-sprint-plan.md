# 🗓️ ColonyAI — Extended Weekly Sprint Plan (April - September 2026)

This document outlines the detailed sprint plan, task distribution, and high-stakes technical challenges encountered throughout the ColonyAI development lifecycle.

---

## 🏛️ SYSTEM ROLES & ACCESS CONTROL (RBAC)
To comply with ISO 17025 (Section 7.11), the system implements three distinct operational roles:
1.  **System Administrator**: Responsible for infrastructure maintenance, audit log monitoring, and global configuration.
2.  **Senior Analyst (Manager)**: Authorized to verify AI results, perform final sign-offs, and export accredited PDF/CSV reports.
3.  **Laboratory Analyst**: Authorized to perform specimen imaging, execute AI detection, and manage initial data entry.

---

## 📅 PHASE 1: MVP FOUNDATION & HARDENING (APRIL)

### 🔹 Week 1 (2 Apr): Inception & Compliance Architecture
*   **Goal**: Establish the ISO-compliant foundation.
*   **Challenge**: **The "Regulation-Logic Gap"**. Mapping the exact "Audit Trail" requirements to a stateless JWT-based API.
*   **Solution**: Shadow Ledger system with SHA-256 hashing.
*   **Evidence**: `backend/app/utils/audit.py` initialization and `audit_logs` table creation.

### 🔹 Week 2 (9 Apr): Engine Training & Taxonomy Confusion
*   **Goal**: Achieve high-precision detection across 5 classes.
*   **Classes**: `colony_single`, `colony_merged`, `bubble`, `dust_debris`, `media_crack`.
*   **Challenge**: **"Bubble-Colony Mimicry"**. AI confusing air bubbles in agar with colonies due to identical circular geometry.
*   **Solution**: 5-Class Taxonomy training with 500+ negative samples.
*   **Evidence**: `backend/app/services/colony_detector.py` (Class list definition).

### 🔹 Week 3 (16 Apr): Integration & Latency Bottlenecks
*   **Goal**: Functional Real-Time Dashboard.
*   **Challenge**: **The "Image Buffer Overflow"**. Worker crashes due to 12MP image memory spikes during OpenCV processing.
*   **Solution**: Stream-based image processing pipeline.
*   **Evidence**: `backend/app/services/image_processor.py` (Resize & CLAHE logic).

### 🔹 Week 4 (23 Apr): QA Audit & Production Hardening (Current)
*   **Goal**: 10/10 Production Readiness.
*   **Challenge 1: "Ghost Metadata" Persistence Failure**.
    - **Issue**: CFU calculations were perfect, but metadata (`cfu_status`, `uncertainty_u`) was failing to persist in the database.
    - **Evidence**: `backend/app/models/__init__.py` (Missing SQLAlchemy columns) & `backend/app/schemas/analyses.py` (Schema mismatch).
    - **Fix**: Synchronized models with Pydantic schemas and implemented DB migration.
*   **Challenge 2: Absolute Path Portability Lock-in**.
    - **Issue**: `DATABASE_URL` was hardcoded as an absolute Windows path (`D:/...`), breaking cloud deployment.
    - **Evidence**: `backend/app/core/config.py` (Hardcoded SQLITE path).
    - **Fix**: Refactored to relative path `./colonyai.db`.
*   **Challenge 3: Authentication Auth-Store Bypass**.
    - **Issue**: Missing `datetime` imports causing password reset failures and hardcoded demo-bypass logic in the frontend.
    - **Evidence**: `backend/app/api/v1/endpoints/auth.py` (Import error) & `frontend/src/lib/auth-store.ts` (Hardcoded mapping).
    - **Fix**: Removed all auth-bypass logic and fixed dependency imports.

---

## 🧪 PHASE 2: LABORATORY PILOT & VALIDATION (MAY)

### 🔹 Week 5 (30 Apr)
*   **Goal**: Cloud Staging Deployment & Pilot Readiness.
*   **Challenge**: -
*   **Solution**: -

### 🔹 Week 6 (7 May)
*   **Goal**: Partner Onboarding & Analyst Training.
*   **Challenge**: -
*   **Solution**: -

### 🔹 Week 7 (14 May)
*   **Goal**: Field Feedback & Edge-Case Image Collection.
*   **Challenge**: -
*   **Solution**: -

### 🔹 Week 8 (21 May)
*   **Goal**: Accuracy Refinement & Contrast Calibration.
*   **Challenge**: -
*   **Solution**: -

---

## 🧠 PHASE 3: SCALING & INDUSTRIAL FEATURES (JUNE)

### 🔹 Week 9 (28 May)
*   **Goal**: Batch Upload Architecture Design.
*   **Challenge**: -
*   **Solution**: -

### 🔹 Week 10 (4 Jun)
*   **Goal**: Redis/Celery Integration for Background Queueing.
*   **Challenge**: -
*   **Solution**: -

### 🔹 Week 11 (11 Jun)
*   **Goal**: Multi-Plate Detection & Tray Segmentation.
*   **Challenge**: -
*   **Solution**: -

### 🔹 Week 12 (18 Jun)
*   **Goal**: Predictive Contamination Analytics Dashboard.
*   **Challenge**: -
*   **Solution**: -

---

## ⚖️ PHASE 4: ACCREDITATION & LIMS (JULY)

### 🔹 Week 13 (25 Jun)
*   **Goal**: LIMS Bridge (HL7/FHIR) Implementation.
*   **Challenge**: -
*   **Solution**: -

### 🔹 Week 14 (2 Jul)
*   **Goal**: ISO 17025 IQ/OQ/PQ Validation Protocol.
*   **Challenge**: -
*   **Solution**: -

### 🔹 Week 15 (9 Jul)
*   **Goal**: RSA-2048 Digital Signatures for Sign-off.
*   **Challenge**: -
*   **Solution**: -

### 🔹 Week 16 (16 Jul)
*   **Goal**: Measurement Uncertainty (GUM) Final Calibration.
*   **Challenge**: -
*   **Solution**: -

---

## 📱 PHASE 5: ECOSYSTEM EXPANSION (AUGUST)

### 🔹 Week 17 (23 Jul)
*   **Goal**: ColonyAI Mobile App (v1.0) Beta Launch.
*   **Challenge**: -
*   **Solution**: -

### 🔹 Week 18 (30 Jul)
*   **Goal**: Mobile Inference Optimization (INT8 Quantization).
*   **Challenge**: -
*   **Solution**: -

### 🔹 Week 19 (6 Aug)
*   **Goal**: Public Developer API & Documentation Release.
*   **Challenge**: -
*   **Solution**: -

### 🔹 Week 20 (13 Aug)
*   **Goal**: WCAG Lab-Safe Theme & Final UI Polish.
*   **Challenge**: -
*   **Solution**: -

---

## 🏆 PHASE 6: CHAMPION DEFENSE (SEPTEMBER)

### 🔹 Week 21 (20 Aug)
*   **Goal**: Full System Stress Test & Kubernetes HPA Setup.
*   **Challenge**: -
*   **Solution**: -

### 🔹 Week 22 (27 Aug)
*   **Goal**: Final Pitch Rehearsal & Technical Defense Prep.
*   **Challenge**: -
*   **Solution**: -

### 🔹 Week 23 (3 Sep)
*   **Goal**: Grand Final Staging & Demo Reliability Check.
*   **Challenge**: -
*   **Solution**: -

### 🔹 Week 24 (10 Sep)
*   **Goal**: **AI OPEN INNOVATION CHALLENGE GRAND FINAL**.
*   **Challenge**: -
*   **Solution**: -

---
**Prepared By**: ColonyAI Core Team  
**Status**: 100% Planning Accuracy (Weeks 1-4 Validated)
