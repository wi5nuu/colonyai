# ColonyAI — Scrum and Agile Development Framework

> **Document Type:** Project Management Reference  
> **Methodology:** Scrum (Agile)  
> **Team Size:** 4 members  
> **Version:** 2.0

---

## Table of Contents

1. [Scrum Team Roles](#1-scrum-team-roles)
2. [Product Backlog](#2-product-backlog)
3. [Sprint Protocol](#3-sprint-protocol)
4. [Definition of Done](#4-definition-of-done)
5. [Tools & Practices](#5-tools--practices)

---

## 1. Scrum Team Roles

| Role | Member | Core Responsibilities |
|------|--------|----------------------|
| **Product Owner** | Wisnu Alfian Nur Ashar | Defines product vision, maintains and prioritizes the Product Backlog, ensures delivered features (ISO 17025, UU PDP compliance) deliver maximum value for clinical laboratory workflows |
| **Scrum Master** | Muhammad Faras | Facilitates team communication, removes blockers, enforces Scrum practices, oversees AI/CV pipeline integration of the YOLOv8 detection system |
| **Developer (Frontend)** | Suci | Designs interactive frontend interface, implements Next.js Dashboard, ensures responsive layout, connects REST API responses to state management |
| **Developer (QA)** | Steven | Designs end-to-end test scenarios, validates CFU calculation accuracy, reviews detection output consistency, maintains data integrity across the test suite |

---

## 2. Product Backlog

### PB-01: AI-Powered 5-Class Detection System

| Attribute | Description |
|-----------|-------------|
| **Type** | Feature / AI |
| **Priority** | High (Core Value) |
| **Story Points** | 13 |
| **User Story** | As a Lab Analyst, I want the system to automatically distinguish between valid colonies (colony_single, colony_merged) and artifacts (bubble, dust_debris, media_crack), so that spurious particles are not counted as colony-forming units. |
| **Acceptance Criterion** | Detection accuracy of at least 90% mAP across eight agar media types using the trained YOLOv8 model. |

### PB-02: Automated CFU/ml Standardized Calculator

| Attribute | Description |
|-----------|-------------|
| **Type** | Feature / Backend |
| **Priority** | High (Core Value) |
| **Story Points** | 8 |
| **User Story** | As a Lab Analyst, I want the system to automatically apply FDA BAM calculation rules (CFU based on volume and dilution factor), so that I do not need to perform manual arithmetic. |
| **Acceptance Criterion** | The system produces CFU/ml values with status flags (Normal, TNTC >250, TFTC <25) and measurement uncertainty (ISO/IEC Guide 98-3 GUM). |

### PB-03: Role-Based Access Control (RBAC) and Authentication

| Attribute | Description |
|-----------|-------------|
| **Type** | Feature / Security |
| **Priority** | High (Security) |
| **Story Points** | 8 |
| **User Story** | As a Product Owner, I want distinct access roles for Admin, Manager, Analyst, and Auditor, so that only authorized personnel can approve analysis results or access system configuration. |
| **Acceptance Criterion** | Every backend endpoint enforces JWT-based authorization with role-specific permission checks. Unauthorized access attempts are logged to the audit trail. |

### PB-04: Immutable Audit Logs for ISO 17025 Compliance

| Attribute | Description |
|-----------|-------------|
| **Type** | Feature / Compliance |
| **Priority** | Medium (Regulatory) |
| **Story Points** | 5 |
| **User Story** | As a Quality Auditor, I need a mathematically verifiable activity log (SHA-256 hash chain), so that any post-hoc modification of sample data in the database is immediately detectable. |
| **Acceptance Criterion** | All audit log entries store a `previous_hash` and `current_hash` column in the PostgreSQL `audit_logs` table. A chain-verification utility confirms integrity on demand. |

### PB-05: Optimistic Locking on Sample Approvals

| Attribute | Description |
|-----------|-------------|
| **Type** | Engineering — Race Condition Fix |
| **Priority** | Medium (System Stability) |
| **Story Points** | 3 |
| **User Story** | As a Lab Manager, I want the system to prevent concurrent approvals of the same analysis record, so that data remains consistent even if two managers submit approvals simultaneously. |
| **Acceptance Criterion** | SQLAlchemy `version_id` column (StaleDataError detection) is applied to the `analyses` table. Concurrent write conflicts return HTTP 409 Conflict with a descriptive error. |

### PB-06: Domain Shift Mitigation (Data Augmentation Pipeline)

| Attribute | Description |
|-----------|-------------|
| **Type** | Feature / AI Robustness |
| **Priority** | Medium (Model Quality) |
| **Story Points** | 5 |
| **User Story** | As a Lab Analyst, I want the AI model to perform accurately regardless of my laboratory's lighting conditions, so that I do not need to precisely calibrate the camera before each capture. |
| **Acceptance Criterion** | CLAHE normalization and color temperature simulation are applied to all images in the preprocessing pipeline. Model mAP degrades by less than 4% under poor lighting. |

### PB-07: Data Retention Policy for UU PDP Compliance

| Attribute | Description |
|-----------|-------------|
| **Type** | Feature / Legal |
| **Priority** | Medium (Compliance) |
| **Story Points** | 3 |
| **User Story** | As a System Admin, I want the system to automatically purge raw image files and associated records older than five years (1,825 days), so that ColonyAI complies with Indonesian Personal Data Protection Law (UU PDP). |
| **Acceptance Criterion** | A maintenance endpoint performs batch deletion of expired records from both object storage and the database. Deletions are recorded in the audit log. |

### PB-08: Interactive Real-Time Analytics Dashboard

| Attribute | Description |
|-----------|-------------|
| **Type** | Feature / UI |
| **Priority** | Low (User Experience) |
| **Story Points** | 8 |
| **User Story** | As a Lab Manager, I want a visual analytics dashboard showing detection pass rates, average CFU values, and TNTC trends per month, so that I can monitor laboratory testing efficiency over time. |
| **Acceptance Criterion** | Bar and line charts (Recharts) are displayed on the Analytics page. Null-status records are excluded from aggregate calculations. |

### PB-09: Simulator — AI vs Manual Count Comparison

| Attribute | Description |
|-----------|-------------|
| **Type** | Feature / UI |
| **Priority** | High (Competition Requirement) |
| **Story Points** | 5 |
| **User Story** | As a Competition Evaluator, I want to compare AI detection results with manual counting side-by-side, so that the accuracy and reliability of the system can be validated. |
| **Acceptance Criterion** | Simulator page at `/dashboard/simulator` allows image upload, AI inference, manual count entry, and displays deviation percentage. |

---

## 3. Sprint Protocol

### Daily Sprint (Repository-Based)

Because the codebase is hosted on GitHub (`https://github.com/wi5nuu/colonyai`), the Daily Sprint is conducted through:

1. **Asynchronous Daily Standup:** Each team member reports planned commit, blockers, and completed work via GitHub Issues or project board.
2. **Feature Branching:** Each backlog item developed on dedicated branch (`feature/audit-log`, `bugfix/optimistic-lock`).
3. **Daily Commit Cadence:** Regular pushes to remote repository to prevent merge conflicts.
4. **Code Review via Pull Request:** Before merging to `main`, Scrum Master or Product Owner reviews for quality and correctness.

### Weekly Sprint (Planning and Review Cycle)

**Sprint Planning (Start of Week):**
- Team capacity evaluated based on velocity from previous sprints
- Product Owner and team select backlog items for the Sprint Backlog
- Acceptance criteria reviewed and clarified

**Sprint Review (End of Week):**
- Team demonstrates working increment of the application
- Demonstration includes both backend (API response) and frontend (UI rendering)
- Stakeholders provide feedback for backlog refinement

**Sprint Retrospective (After Review):**
- Discuss: What went well? What was impeded? What to improve?
- Action items documented in project board
- Process improvements adopted next sprint

### Sprint Cadence

| Activity | When | Duration |
|----------|------|----------|
| Sprint Planning | Monday | 1 hour |
| Daily Standup | Daily (async) | 15 min |
| Sprint Review | Friday | 1 hour |
| Sprint Retrospective | Friday | 30 min |

---

## 4. Definition of Done

A backlog item is considered **Done** when all of the following criteria are met:

### Code Quality
- [ ] Code passes linting (flake8, TypeScript strict)
- [ ] Code is formatted (black, prettier)
- [ ] No hardcoded secrets or credentials
- [ ] Environment variables properly documented

### Testing
- [ ] Unit tests written and passing (pytest, Jest)
- [ ] Test coverage >= 80%
- [ ] Integration tests pass
- [ ] Edge cases handled (empty state, error state)

### Documentation
- [ ] API changes reflected in docs
- [ ] User-facing features documented
- [ ] Configuration changes documented

### Security
- [ ] Input validation implemented (Pydantic)
- [ ] Authentication/authorization enforced
- [ ] No security warnings from Bandit/npm audit
- [ ] Audit log entry generated for the action

### Review
- [ ] Peer code review completed
- [ ] Feature demo-ed in Sprint Review
- [ ] Product Owner acceptance confirmed

---

## 5. Tools & Practices

| Practice | Tool | Purpose |
|----------|------|---------|
| Version Control | GitHub | Source code, issues, PRs |
| Project Board | GitHub Projects | Sprint backlog, task tracking |
| CI/CD | GitHub Actions | Automated testing, deployment |
| Documentation | Markdown (this folder) | Technical and user docs |
| Communication | WhatsApp / Discord | Async standup, blocker reporting |
| Code Quality | flake8, black, TypeScript | Linting, formatting |
| Security Scanning | Bandit, npm audit | Vulnerability detection |
| Testing | pytest, Jest | Unit and integration tests |

### Branching Strategy

```
main              → Production-ready code
├── dev           → Integration branch
├── feature/*     → New features (feature/new-ui)
├── bugfix/*      → Bug fixes (bugfix/login-error)
└── hotfix/*      → Urgent production fixes
```

---

_Last Updated: July 2026 | Version: 2.0.0_
