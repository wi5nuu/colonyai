# 📋 ColonyAI: Detailed Product Backlog (Agile / Scrum)

This document contains the prioritized and detailed Product Backlog for the ColonyAI MVP development. Each item is constructed with comprehensive User Stories, feature types, goals, and acceptance criteria to maintain complete transparency and alignment with rigorous software engineering and laboratory standards.

---

## 🔴 Priority 0 (Critical - Core MVP)

### 1. [PB-01] AI Engine: YOLOv8 Training & Taxonomy Logic
- **Type**: 🚀 Feature / Engine
- **Story**: As a System Architect, I want the YOLOv8 model to accurately detect bacterial colonies (AGAR) while actively ignoring artifacts (bubbles, dust, cracks) so that false positives are eliminated.
- **Goal**: Achieve >90% precision and recall for Colony Forming Units (CFU) baseline without misclassifying petri dish imperfections.
- **Acceptance Criteria**:
  - Model trained on 5-class annotated dataset.
  - Exclusions mapped in code (e.g., `bubble`, `dust_debris` class explicitly ignored from final calculation).
  - Inference processing speed under 2 seconds per image.
- **Assignee**: Faras
- **Status**: 🔄 In Progress

### 2. [PB-02] Backend: Secure Authentication & API Setup
- **Type**: 🛠️ Infrastructure
- **Story**: As a Backend Developer, I want to establish a robust FastAPI and PostgreSQL foundation with JWT authentication so that sensitive laboratory data endpoints are heavily protected.
- **Goal**: Establish stable, secure backend routing and strict database schemas.
- **Acceptance Criteria**:
  - PostgreSQL database deployed locally.
  - JWT Auth middleware implemented and tested.
  - API documentation (Swagger/Redoc) fully accessible.
- **Assignee**: Steven
- **Status**: ✅ Done

### 3. [PB-03] Frontend: Laboratory OS Dashboard UI
- **Type**: 🚀 Feature / UI Re-engineering
- **Story**: As a Lab Technician, I want a professional dashboard utilizing standard bio-diagnostic nomenclature so that the interface feels native to daily laboratory operations.
- **Goal**: Completely replace generic templates with high-fidelity, laboratory-standard UI (e.g., "Specimens" instead of "Items").
- **Acceptance Criteria**:
  - Sidebar and top navigation complete and dynamically routed.
  - UI strictly enforces clinical terms: "Specimens", "Analysts", "Bio-metrics".
  - Dashboard responsive and bug-free on Chromium browsers.
- **Assignee**: Wisnu
- **Status**: ✅ Done

### User Role Architecture
### Epic: Security & Compliance
- `[x]` **IAM-01**: Implement Role-Based Access Control (RBAC) for Analyst vs Manager.
- `[x]` **IAM-02**: Advanced login protocol (Laboratory OS branding).
- `[ ]` **IAM-03**: Immutable Audit Trail for result verification.
- `[ ]` **IAM-04**: Session persistence management.

### Epic: Intelligence & Analytics
- `[x]` **ANA-01**: Real-time spectral telemetry dashboard.
- `[/]` **ANA-02**: Managerial Oversight View (Team performance tracking).
- `[ ]` **ANA-03**: Automated PDF report generation with ISO branding.

### 4. [PB-04] Security: Strict Image Upload Pipeline
- **Type**: 🛡️ Security Feature
- **Story**: As a Quality Assurance Lead, I want strict file validations on uploaded petri dish images so that malware payloads and tampered EXIF data cannot penetrate the server system.
- **Goal**: Secure the main data entry point and payload avenue of ColonyAI.
- **Acceptance Criteria**:
  - Implement Magic Bytes detection (strictly allowing only valid JPG/PNG).
  - Strip all EXIF metadata for data sanitization compliance.
  - Store sanitized images asynchronously in the designated storage bucket.
- **Assignee**: Faras / Steven
- **Status**: 🔄 In Progress

### 5. [PB-05] Frontend: AI Result Visualization & Annotations
- **Type**: 🚀 Feature
- **Story**: As a Lab Analyst, I want to visibly see the bounding boxes and confidence scores drawn dynamically on uploaded dish images so that I can manually verify the AI's deductions.
- **Goal**: Provide transparent, visual proof for AI detection results.
- **Acceptance Criteria**:
  - Render bounded boxes seamlessly upon receiving backend JSON payload.
  - Assign distinct colors based on class predictions.
  - Display a dynamic AI Confidence Score percentage gauge next to the image.
- **Assignee**: Wisnu / Suci
- **Status**: ⏳ Pending

---

## 🟡 Priority 1 (High - Functionality Enhancement)

### 6. [PB-06] Core Logic: CFU/ml Area Calculation Engine
- **Type**: 🚀 Feature / Algorithm
- **Story**: As the Principal Investigator, I want the system to calculate the standard CFU/ml automatically utilizing the SA-001 parameter so that manual mathematical errors are eliminated.
- **Goal**: Standardize and automate the final lab count measurements precisely.
- **Acceptance Criteria**:
  - Area surface parameter algorithm mathematically implemented.
  - Ability to multiply by the user's input of dilution factor.
- **Assignee**: Faras / Steven
- **Status**: ✅ Done

### 7. [PB-07] Dashboard: Simulator Module (Manual vs AI)
- **Type**: 🚀 Feature
- **Story**: As an Assessor, I want a simulator feature to pit my manual visual counting capabilities against the AI’s capability so that I can benchmark algorithm accuracy against human performance.
- **Goal**: Create an interactive validation tool within the ColonyAI dashboard.
- **Acceptance Criteria**:
  - Split-screen comparison layout designed and routed.
  - Real-time delta (difference) percentage calculation displayed between inputs.
- **Assignee**: Wisnu
- **Status**: ✅ Done

### 8. [PB-08] Security: Role-Based Access Control (RBAC)
- **Type**: 🐞 Security / Access Feature
- **Story**: As a Lab Administrator, I require 6 distinct permission levels to be strictly recognized by the API so that unauthorized staff cannot approve final bio-results.
- **Goal**: Attain ISO-17025 style digital data security and role segregation.
- **Acceptance Criteria**:
  - Middleware enforces permission requirement tags per endpoint access.
  - Frontend dashboard conditionally hides/shows administrative buttons based on the JWT token's role claim.
- **Assignee**: Steven
- **Status**: ✅ Done

---

## 🟢 Priority 2 (Medium - Compliance & Polish)

### 9. [PB-09] Backend: Audit Trail System
- **Type**: 🚀 Feature / Compliance
- **Story**: As a Compliance Auditor, I want an immutable log of every data modification (CRUD) attached to a timestamp and user ID so we can easily pass ISO laboratory certification audits.
- **Goal**: Maintain 100% indisputable data traceability.
- **Acceptance Criteria**:
  - Backend utility captures all post/put/delete database requests.
  - Read-only table view available in the dashboard history page for managers.
- **Assignee**: Steven
- **Status**: ✅ Done

### 10. [PB-10] Display: Mobile & Tablet Responsiveness Fixes
- **Type**: 🐞 Bug Fix
- **Story**: As a Field Technician, I want the dashboard to perfectly scale on my iPad without clipping the data tables so I can analyze results away from the main laboratory desk.
- **Goal**: Universal responsive CSS execution.
- **Acceptance Criteria**:
  - Tailwind CSS breakpoints actively tested on standard iPad and Mobile dimensions.
  - Navigation bar collapses into side-drawers or hamburger menus seamlessly.
- **Assignee**: Suci
- **Status**: ⏳ Pending
