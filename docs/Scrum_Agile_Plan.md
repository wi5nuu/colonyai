# ColonyAI — Scrum and Agile Development Framework

**Document Type:** Project Management Reference  
**Methodology:** Scrum (Agile)  
**Team Size:** 4 members  
**Version:** 1.0

This document defines the Scrum team structure, product backlog, and sprint protocol used during the development of ColonyAI.

---

## 1. Scrum Team Roles

| Role           | Member                  | Responsibilities                                                                                                                                         |
|:---------------|:------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------|
| Product Owner  | Wisnu Alfian Nur Ashar  | Defines product vision, maintains and prioritizes the Product Backlog, and ensures that delivered features (including ISO 17025 and UU PDP compliance) deliver maximum value for clinical laboratory workflows. |
| Scrum Master   | Muhammad Faras          | Facilitates team communication, removes blockers and defects, enforces Scrum practices (Daily Sprint, Weekly Sprint), and oversees AI/CV pipeline integration of the YOLOv8 detection system. |
| Developer      | Suci                    | Designs the interactive frontend interface, implements the Next.js Dashboard metrics, ensures responsive layout, and connects REST API responses to frontend state management. |
| Developer      | Steven                  | Designs end-to-end test scenarios, validates CFU calculation accuracy (Pass Rate), reviews detection output consistency, and maintains data integrity across the test suite. |

---

## 2. Product Backlog

The following eight product backlogs form the core scope of ColonyAI development, derived from Case 1 requirements and engineering quality objectives.

### PB-01: AI-Powered 5-Class Detection System

- **Type:** Feature / AI
- **Priority:** High (Core Value)
- **User Story:** As a Lab Analyst, I want the system to automatically distinguish between valid colonies (`colony_single`, `colony_merged`) and artifacts (`bubble`, `dust_debris`, `media_crack`), so that spurious particles are not counted as colony-forming units.
- **Acceptance Criterion:** Detection accuracy of at least 90% mAP across eight agar media types using the trained YOLOv8 model.

### PB-02: Automated CFU/ml Standardized Calculator

- **Type:** Feature / Backend
- **Priority:** High (Core Value)
- **User Story:** As a Lab Analyst, I want the system to automatically apply FDA BAM calculation rules (CFU based on volume and dilution factor), so that I do not need to perform manual arithmetic.
- **Acceptance Criterion:** The system produces CFU/ml values with status flags (Normal, TNTC > 250, TFTC < 25) and a measurement uncertainty value per ISO/IEC Guide 98-3 (GUM).

### PB-03: Role-Based Access Control (RBAC) and Authentication

- **Type:** Feature / Security
- **Priority:** High (Security)
- **User Story:** As a Product Owner, I want distinct access roles for Admin, Manager, Analyst, and Auditor, so that only authorized personnel can approve analysis results or access system configuration.
- **Acceptance Criterion:** Every backend endpoint enforces JWT-based authorization with role-specific permission checks. Unauthorized access attempts are logged to the audit trail.

### PB-04: Immutable Audit Logs for ISO 17025 Compliance

- **Type:** Feature / Compliance
- **Priority:** Medium (Regulatory)
- **User Story:** As a Quality Auditor, I need a mathematically verifiable activity log (SHA-256 hash chain), so that any post-hoc modification of sample data in the database is immediately detectable.
- **Acceptance Criterion:** All audit log entries store a `previous_hash` and `current_hash` column in the PostgreSQL `audit_logs` table. A chain-verification utility confirms integrity on demand.

### PB-05: Optimistic Locking on Sample Approvals

- **Type:** Engineering — Race Condition Fix
- **Priority:** Medium (System Stability)
- **User Story:** As a Lab Manager, I want the system to prevent concurrent approvals of the same analysis record, so that data remains consistent even if two managers submit approvals simultaneously.
- **Acceptance Criterion:** SQLAlchemy `version_id` column (StaleDataError detection) is applied to the `analyses` table. Concurrent write conflicts return HTTP 409 Conflict with a descriptive error.

### PB-06: Domain Shift Mitigation (Data Augmentation Pipeline)

- **Type:** Feature / AI Robustness
- **Priority:** Medium (Model Quality)
- **User Story:** As a Lab Analyst, I want the AI model to perform accurately regardless of my laboratory's lighting conditions, so that I do not need to precisely calibrate the camera before each capture.
- **Acceptance Criterion:** CLAHE normalization and color temperature simulation are applied to all images in the preprocessing pipeline. Model mAP degrades by less than 4% under poor lighting conditions relative to optimal conditions.

### PB-07: Data Retention Policy for UU PDP Compliance

- **Type:** Feature / Legal
- **Priority:** Low (Compliance Maintenance)
- **User Story:** As a System Admin, I want the system to automatically purge raw image files and associated records older than five years (1,825 days), so that ColonyAI complies with Indonesian Personal Data Protection Law (UU PDP).
- **Acceptance Criterion:** A maintenance endpoint performs batch deletion of expired records from both object storage and the database. Deletions are recorded in the audit log.

### PB-08: Interactive Real-Time Analytics Dashboard

- **Type:** Feature / UI
- **Priority:** Low (User Experience)
- **User Story:** As a Lab Manager, I want a visual analytics dashboard showing detection pass rates, average CFU values, and TNTC trends per month, so that I can monitor laboratory testing efficiency over time.
- **Acceptance Criterion:** Bar and line charts (rendered via Recharts) are displayed on the Analytics page in the Next.js frontend. Null-status records are excluded from aggregate calculations.

---

## 3. Sprint Protocol

### Daily Sprint (Repository-Based)

Because the codebase is hosted on GitHub (`https://github.com/wi5nuu/colonyai`), the Daily Sprint is conducted through the following software engineering practices:

1. **Asynchronous Daily Standup:** Each team member reports their planned commit for the day, blockers currently faced, and work completed the previous day.
2. **Feature Branching:** Each product backlog item is developed on a dedicated feature branch (e.g., `feature/audit-log`, `bugfix/optimistic-lock`) to isolate changes and reduce merge conflicts.
3. **Daily Commit Cadence:** Regular pushes to the remote repository are required to keep branches synchronized and prevent accumulation of merge conflicts.
4. **Code Review via Pull Request:** Before any branch is merged to `main`, the Scrum Master or Product Owner reviews the pull request for code quality and functional correctness.

### Weekly Sprint (Planning and Review Cycle)

1. **Sprint Planning (Start of Week):**
   - Team capacity is evaluated.
   - The Product Owner and team select backlog items from the top of the prioritized backlog to form the Sprint Backlog for that week.

2. **Sprint Review (End of Week):**
   - The team demonstrates a working increment of the application. For example: demonstrating that the YOLOv8 pipeline correctly distinguishes `colony_merged` objects and that the corresponding bounding box UI renders with the correct color in the browser.

3. **Sprint Retrospective (After Review):**
   - The team discusses: what went well (e.g., Docker setup completed without issues), what was impeded (e.g., TypeScript strict-mode type errors), and what process improvements will be adopted in the next sprint (e.g., enforcing strict type checking on all ETL data transformations).
