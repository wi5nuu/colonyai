#!/usr/bin/env python3
"""Generate the updated ColonyAI Proposal"""

content = r"""# ColonyAI — AI Open Innovation Challenge 2026

**AI-Powered Automated Plate Count Reader for Microbiology Laboratories**

---

## TEAM IDENTITY

| Field | Details |
| ----- | --------------------------------------------------------- |
| **Team Name** | ColonyAI |
| **Team Leader** | Wisnu Alfian Nur Ashar |
| **WhatsApp** | +62 813-9488-2490 |
| **Email** | wisnu.ashar@student.president.ac.id |
| **Institution** | President University — Bachelor of Information Technology |
| **Portfolio** | https://github.com/wi5nuu |
| **GitHub Repository** | https://github.com/wi5nuu/colonyai |

### Team Members

| No. | Name | Role |
| --- | ---------------------- | ------------------------------------------------------------------- |
| 1 | Wisnu Alfian Nur Ashar | Product Owner & Software Engineer |
| 2 | Muhammad Faras | Scrum Master & AI/CV Integration + Business Analyst & Documentation |
| 3 | Suci | Developer (UI/UX Designer) |
| 4 | Steven | Developer (Data Analyst & QA Engineer) |

---

## EXECUTIVE SUMMARY

ColonyAI is an AI-powered Automated Plate Count Reader designed to modernize Total Plate Count (TPC) testing in microbiology laboratories. Analysts currently count bacterial colonies manually — a process that is time-consuming, inconsistent, and operator-dependent, with inter-analyst variability reaching 22.7%–80% coefficient of variation (ASTM F2944). Our solution integrates a fine-tuned YOLOv8 computer vision model with a Next.js web dashboard to automate agar plate localization, colony detection, 5-class artifact classification, and CFU/ml calculation with measurement uncertainty in real time. The system addresses lighting variation, overlapping colonies through SA-001 area-based estimation, and artifact interference, while maintaining analyst verification as the final validation layer. By reducing analysis time by up to 85% and delivering consistent, reproducible results with SHA-256 chained audit trails, ColonyAI directly supports laboratory efficiency, food safety compliance, and public health assurance for Indonesia's 500+ accredited microbiology testing facilities.

---

## PROBLEM STATEMENT

### Selected Case Statement

**Case 1 — Microbiology Laboratory: Automated Plate Count Reader**

### Challenge Brief Alignment

| Challenge Requirement | ColonyAI Implementation |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Identify agar plate area from image | OpenCV Hough Circle Transform + perspective correction for robust plate boundary detection |
| Automatic detection and counting of bacterial colonies | YOLOv8 single-pass object detection with >= 92% target accuracy; SA-001 area-based merged colony estimation |
| Differentiate valid colonies vs. artifacts | 5-class taxonomy (colony_single, colony_merged, bubble, dust_debris, media_crack) with > 90% artifact rejection precision |
| Produce consistent CFU/ml values | Automated CFU/ml with TNTC/TFTC flagging + ISO/IEC Guide 98-3:2008 (GUM) measurement uncertainty |
| Save results to laboratory reporting system | BPOM/SNI-compliant PDF/CSV export + LIMS API integration (SampleManager, LabVantage) |

### Scope & Limitations

| Scope / Limitation | ColonyAI Solution |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Variations in lighting and camera quality** | CLAHE adaptive histogram equalization + homography perspective correction |
| **Overlapping and low contrast colonies** | SA-001 area-based merged colony estimation; NMS with IoU 0.45; per-media-type thresholds |
| **Different media types and colors** | Per-media-type confidence thresholds for 8+ agar types (PCA, VRBA, BGBB, TSA, TGEA, MacConkey, R2A, Other) |
| **Limited labeled dataset** | 1,477 images (56,124 bounding boxes) + YOLOv8 augmentation + planned AGAR dataset integration |
| **Results still require analyst verification** | Digital sign-off workflow with per-class confidence transparency; analyst approves before submission |

### Main Objectives

The primary objective of ColonyAI is to eliminate human error and inconsistency from Total Plate Count (TPC) workflows in food safety and environmental microbiology laboratories. Specific targets include:

- Achieve colony detection accuracy of >= 92% across diverse media types and lighting conditions, benchmarked against expert manual counting standards.
- Reduce TPC analysis time from 15-30 minutes per sample to under 2 minutes through an automated image analysis pipeline.
- Classify all detected objects into 5 defined classes (colony_single, colony_merged, bubble, dust_debris, media_crack) with artifact rejection precision > 90%.
- Deliver consistent CFU/ml calculations with automated dilution factor integration, SA-001 area-based merged colony estimation, and ISO/IEC Guide 98-3:2008 (GUM) measurement uncertainty.
- Provide a SHA-256 chained immutable digital audit trail integrated with LIMS, supporting ISO 17025, SNI 2897:2008, and UU PDP Indonesia compliance.
- Deploy a scalable, multi-laboratory SaaS platform accessible via web browser, requiring no special hardware beyond a standard camera or smartphone.
- Implement enterprise-grade security including Argon2 password hashing, JWT blacklisting, anti-phishing engine, magic-bytes file validation, EXIF stripping, ClamAV malware scanning, and 5-role RBAC.

### Expected Output — Deliverable Mapping

| Expected Output | ColonyAI Deliverable | Status |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| **Computer Vision model** | YOLOv8n fine-tuned on 1,477 custom-labeled images (56,124 bounding boxes) with 5-class detection; SA-001 area-based merged estimation; per-media-type thresholds; ONNX export for CPU inference | Implemented |
| **Dashboard** — Colony count results and test history | Next.js 14 web application with color-coded bounding boxes, CFU/ml with GUM uncertainty, searchable history, per-class confidence scores, role-based data scoping (5 roles) | Implemented |
| **Simulator** — Comparison of manual vs AI accuracy | Built-in benchmarking module with side-by-side comparison per class; accuracy percentage, error margin, per-class agreement score; stored in DB for audit trail | Implemented |
| **Executive Summary** — Efficiency and consistency report | Auto-generated BPOM-compliant PDF (A4, Times New Roman 12pt) + multi-sheet Excel; pre/post AI time comparison, inter-analyst variability reduction, monthly throughput trends, cost savings analysis | Implemented |

---

## PROBLEM DEFINITION

### Problem Context

Microbiology laboratories perform Total Plate Count (TPC) tests to determine the number of microorganisms in food and environmental samples. Currently, analysts still count colonies manually, making results dependent on experience, time-consuming, and potentially inconsistent — especially when colonies are stacked or of varying sizes.

### What is the main problem?

In Indonesian microbiology laboratories, Total Plate Count (TPC) remains the gold standard for measuring microbial contamination. However, the current process is entirely manual — an analyst physically counts colonies on an agar plate using a colony counter device or pen-tally under magnification. This creates three critical operational failures: (1) **Inconsistency** — two analysts counting the same plate routinely differ by 10-25%; (2) **Throughput Bottleneck** — a single analyst processes only 20-40 plates/hour, causing backlogs during peak periods; (3) **Skill Dependency** — accurate counting requires significant experience, leaving junior analysts unable to reliably distinguish the 5 object classes present on a plate. This bottleneck directly impacts public health decision-making, food safety enforcement, and laboratory accreditation.

### Who is impacted and at what scale?

- **Food industry manufacturers** (FMCG, dairy, beverage) — depend on rapid and reliable TPC results for production release decisions.
- **Government regulators** (BPOM, Dinas Kesehatan) — require standardized, auditable microbial testing records.
- **Third-party testing laboratories** (KAN-accredited) — face increasing sample volumes with limited analyst resources.
- **Hospitals and clinical labs** — environmental monitoring directly impacts patient safety protocols.

Indonesia alone has over 500 accredited microbiology testing facilities. The Asia-Pacific food testing market is projected to exceed USD 7 billion by 2027.

### Prove the problem

| No. | Source | Key Finding |
| --- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 | ASTM F2944 / Scintica (2024) | Inter-observer coefficient of variation in manual colony counting ranges from 22.7% to 80% |
| 2 | FDA Bacteriological Analytical Manual (2023) | Countable-range plates (25-250 CFU) yield significant analyst variation, particularly for overlapping colonies |
| 3 | BPOM Indonesia (2023) | 18% of food product violations involved microbiological non-conformance |
| 4 | Indonesian Lab Industry Survey (2024, n=12) | Colony counting constitutes 40-60% of analyst working hours in TPC workflows |

---

## PROPOSED SOLUTION

### Main Solution

ColonyAI is a web-based intelligent laboratory platform that transforms agar plate images into accurate, standardized CFU/ml reports in under two minutes. The system integrates three tightly coupled components:

- **AI Vision Engine:** A fine-tuned YOLOv8 object detection model trained on 8+ agar media types. The model simultaneously detects the plate boundary and classifies all detected objects into exactly 5 classes: colony_single, colony_merged, bubble, dust_debris, and media_crack. SA-001 area-based estimation calculates actual colony counts within merged regions. Per-media-type confidence thresholds ensure optimal detection across different agar types.

- **Intelligent Web Dashboard (Next.js):** Analysts upload plate images via browser or mobile camera. The dashboard displays annotated results with color-coded bounding boxes per class, CFU/ml calculations with GUM measurement uncertainty, historical test records, and trend analytics. Results require digital analyst sign-off. Role-based access control (5 roles: Super Admin, Admin, Manager, Analyst, Auditor) ensures data isolation.

- **Simulator & Reporting Module:** A built-in benchmarking tool for comparing AI vs manual counts. Reports exportable in PDF (BPOM-compliant A4 format) and multi-sheet Excel. No specialized hardware required.

### System Architecture

```
CLIENT LAYER          →  Web Browser / Mobile Browser / Smartphone Camera
                              │ HTTPS / REST API
APPLICATION LAYER     →  Next.js 14 Frontend (Vercel CDN)
                              │ Upload | Results | Simulator | Analytics
                        FastAPI Backend (Docker on Railway)
                              │ Image Ingest + Security | OpenCV Pre-proc
                              │ YOLOv8 Inference + NMS | CFU Calculator + GUM
                              │ Argon2 + JWT + RBAC | SHA-256 Audit Chain
                              │
AI MODEL LAYER        →  YOLOv8n/s — 5-Class Object Detection
                              │ colony_single | colony_merged | bubble
                              │ dust_debris | media_crack
                              │ SA-001: Area-based merged colony estimation
                              │
DATA LAYER            →  PostgreSQL: Users, RBAC, Test Results, Audit Logs (SHA-256 chain)
                        AWS S3: Plate Images (encrypted, signed URLs)
                              │
EXPORT & INTEGRATION   →  PDF Report (BPOM) | CSV Export | LIMS API Sync
```

**Data Flow:** `Upload → Security Validation → Pre-process → 5-Class AI Inference → SA-001 Estimation → CFU Calculation + GUM Uncertainty → Analyst Review → Digital Sign-off → Export/LIMS`

### How does the solution work?

| Stage | Component | Action | Output |
| ---------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **INPUT** | Browser / Mobile | Analyst uploads plate photo. Enters: Sample ID, dilution factor, media type. | Raw image + metadata |
| **SECURITY** | File Validator | Magic-bytes MIME validation, UUID rename (anti-path-traversal), EXIF strip, ClamAV malware scan, dimension check (100x100px min) | Sanitized image bytes |
| **PRE-PROCESS** | OpenCV Pipeline | CLAHE normalization, Hough Circle Transform, perspective correction (homography), ROI extraction | Standardized plate image |
| **AI INFERENCE** | YOLOv8 Model | 5-class detection with per-media-type thresholds. NMS IoU 0.45. | Annotated image + 5-class labels + confidence scores |
| **ESTIMATION** | SA-001 Engine | Area-based merged colony estimation: ratio of merged bbox area to median single colony area. Fallback = 2. | Estimated colony count per merged bbox |
| **CALCULATION** | CFU Module | CFU/ml = Sigma(valid colonies) / (Volume x Dilution Factor). TNTC/TFTC per ISO 4833-1:2013. GUM uncertainty (k=2, ~95%). | CFU/ml value with uncertainty + flags |
| **OUTPUT** | Dashboard + LIMS | Analyst reviews color-coded bounding boxes, edits if needed, digitally approves. Report generated. | Verified PDF/CSV + LIMS data export |

---

## IMPACT & OUTCOME

### Key Benefits

- **Efficiency Gains:** Reduces TPC analysis time from 15-30 minutes to under 2 minutes per sample (85-90% reduction), enabling 5-8x more samples per analyst per day.
- **Consistency & Reproducibility:** Eliminates inter-analyst variability (22.7%-80% CV) — every plate processed through the same 5-class YOLOv8 model.
- **Cost Reduction:** Estimated 40% reduction in labor cost per TPC test. A mid-sized lab processing 200 samples/day could save IDR 500 million - 1 billion/year.
- **Regulatory Compliance:** SHA-256 chained immutable audit trail supports BPOM, KAN, ISO 17025, and UU PDP Indonesia accreditation requirements.
- **Error Prevention:** Automated TNTC/TFTC flags per ISO 4833-1:2013. GUM measurement uncertainty provides confidence intervals for every reported value.
- **Security:** Enterprise-grade security with Argon2 hashing, JWT blacklisting, anti-phishing engine, magic-bytes file validation, and 5-role RBAC.
- **Metrological Traceability:** SA-001 area-based merged colony estimation + GUM uncertainty (ISO/IEC Guide 98-3:2008) provides scientifically valid results for ISO 17025 accreditation.

### Short-Term and Mid-Term Outcomes

**Short-Term (0-6 Months):** Pilot deployment in 2-3 partner laboratories; onboarding 10-20 analysts; 1,477-image dataset with 56,124 bounding box annotations.

**Mid-Term (6-24 Months):** Expansion to 20+ laboratories; mobile-native PWA; LIMS integration (SampleManager, LabVantage); SaaS revenue model; peer-reviewed publication.

---

## INNOVATION & DIFFERENTIATION

### What Makes Your Solution Different?

- **5-Class Artifact Intelligence:** Specifically trained to classify all 5 classes (colony_single, colony_merged, bubble, dust_debris, media_crack) with > 90% artifact rejection precision.
- **SA-001 Area-Based Merged Colony Estimation:** Estimates actual colony count within merged regions using area ratio analysis — not just bounding box counting.
- **Per-Media-Type Confidence Thresholds:** 8+ agar media types each have optimized per-class thresholds.
- **GUM Measurement Uncertainty:** Every CFU/ml result includes expanded uncertainty (k=2, ~95% confidence) per ISO/IEC Guide 98-3:2008.
- **SHA-256 Chained Audit Trail:** Immutable, append-only audit logs with cryptographic hash chaining.
- **5-Role RBAC:** Granular role-based access control (Super Admin, Admin, Manager, Analyst, Auditor) with data scoping.
- **Anti-Phishing Engine:** Multi-layer defense against credential stuffing, admin account targeting, and automated enumeration.
- **Indonesia-Contextual Design:** BPOM/SNI reporting formats and Bahasa Indonesia interface.
- **No Hardware Lock-in:** Requires only a standard camera and web browser.

### Positioning Compared to Existing Approaches

| Feature | ColonyAI | Manual | ProtoCOL 3 | SphereFlash | Generic AI |
| ------------------------ | ------------ | -------------- | ----------- | ----------- | ---------- |
| 5-Class Detection | ✓ | ✗ | Partial | Partial | ✗ |
| SA-001 Merged Estimation | ✓ | ✗ | ✗ | ✗ | ✗ |
| Per-Media Thresholds | ✓ (8+ types) | ✗ | ✗ | ✗ | ✗ |
| GUM Uncertainty | ✓ | ✗ | ✗ | ✗ | ✗ |
| SHA-256 Audit Chain | ✓ | ✗ | ✗ | ✗ | ✗ |
| 5-Role RBAC | ✓ | ✗ | ✗ | ✗ | ✗ |
| Anti-Phishing Engine | ✓ | ✗ | ✗ | ✗ | ✗ |
| No Special Hardware | ✓ | ✓ | ✗ | ✗ | ✓ |
| Indonesian Regulatory | ✓ | ✗ | ✗ | ✗ | ✗ |
| LIMS Integration | ✓ | ✗ | Limited | Limited | Custom |
| Cost | IDR 500K+/mo | Analyst salary | >USD 15K HW | >USD 30K HW | Custom dev |

---

## TECHNICAL APPROACH

### Technology Stack

| Layer | Technology | Justification |
| ---------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| AI Model | YOLOv8n / YOLOv8s | Real-time single-pass detection; 5-class classification; ONNX export; < 50ms per image on CPU |
| Backend | FastAPI (Python) | Async REST API; Pydantic validation; Python-native AI/ML ecosystem; auto-generated OpenAPI docs |
| Frontend | Next.js 14 + TypeScript | SSR for fast load; React for rich interactive dashboard; TypeScript for type safety |
| UI | Tailwind CSS + shadcn/ui | Rapid, accessible components; class-level color-coding for 5 detection classes |
| Image Processing | OpenCV + Pillow | CLAHE normalization; Hough Circle Transform; homography perspective correction; ROI extraction |
| Security | Argon2 + JWT + Anti-Phish | Argon2 hashing; JWT blacklisting; anti-phishing engine; magic-bytes validation; EXIF strip; ClamAV scan |
| Database | PostgreSQL + Supabase | ACID-compliant for ISO 17025; RBAC; SHA-256 chained audit logs; real-time sync |
| Deployment | Railway + Vercel + AWS S3 | Auto-scaling Docker; CDN for frontend; encrypted S3 for images |
| Model Training | Google Colab + Roboflow | Free GPU fine-tuning; dataset annotation and augmentation management |

### Technology Selection and Implementation

YOLOv8 was selected for its optimal balance of speed (< 50ms per image on CPU) and accuracy for real-time web deployment, with native multi-class detection essential for our 5-class taxonomy. Unlike two-stage detectors (Faster R-CNN), YOLOv8 processes the entire image in a single forward pass, enabling deployment without GPU hardware. Next.js provides hybrid SSR/CSR for fast dashboard loading. FastAPI delivers auto-documented REST APIs with Pydantic validation. PostgreSQL ensures ACID compliance for audit trails — non-negotiable for ISO 17025. Argon2 was chosen over bcrypt for GPU-attack-resistant password hashing. JWT blacklisting enables secure logout. The anti-phishing engine provides multi-layer defense against credential stuffing and admin account targeting. Magic-bytes file validation prevents MIME spoofing attacks.

### Solution Algorithm

- **Phase 0 - Security Validation:** Magic-bytes MIME type verification (not Content-Type header), UUID filename generation (anti-path-traversal), EXIF metadata stripping (privacy), ClamAV malware scanning (fail-open), minimum dimension check (100x100px).
- **Phase 1 - Plate Localization:** CLAHE adaptive histogram equalization normalizes brightness/contrast. Hough Circle Transform detects the circular plate boundary. Perspective correction via homography transform normalizes elliptical views. ROI extraction isolates the agar area.
- **Phase 2 - 5-Class Detection:** Fine-tuned YOLOv8 with per-media-type confidence thresholds. NMS with IoU 0.45 resolves overlapping boxes. SA-001 area-based estimation calculates actual colony count within merged regions.
- **Phase 3 - CFU Calculation:** Only colony_single and colony_merged contribute. CFU/ml = Sigma(valid colonies) / (plated_volume_ml x dilution_factor). TNTC/TFTC flags per ISO 4833-1:2013. GUM measurement uncertainty (k=2, ~95%) per ISO/IEC Guide 98-3:2008.

### Primary Data or Input Used

- **Custom Labeled Dataset:** 1,477 agar plate images with 56,124 bounding box annotations across 5 classes, manually annotated and validated by domain experts.
- **YOLOv8 Built-in Augmentation:** Mosaic (100%), flip (50%), HSV color jittering, rotation (+/-15 degrees), scaling (+/-50%), expanding dataset 3-5x.
- **AGAR Public Dataset Integration** (Roadmap): 18,000+ additional images from Macquarie University for Phase 2.
- **Partner Laboratory Data** (Pilot): 500-1,000 locally captured images for domain adaptation.

**Data quality controls:** Minimum resolution 800x800px; dual-annotator review; class balance verification; TNTC exclusion from training; full anonymization of partner data.

### Security and Scalability Considerations

- **Data Security:** Encrypted AWS S3 with 1-hour signed URLs. 5-role RBAC with data scoping. JWT authentication with blacklisting. HTTPS via HSTS (1 year, includeSubDomains, preload). Secure headers (CSP, X-Frame-Options: DENY, X-XSS-Protection, Referrer-Policy) via middleware.
- **Authentication Security:** Argon2 password hashing. Account lockout after 5 failed attempts (15-min lock). Admin-mediated password reset with anti-phishing engine (IP throttling, admin targeting detection, auto-block).
- **Compliance:** Immutable SHA-256 chained append-only audit log. Supports ISO 17025, BPOM, KAN, UU PDP Indonesia. 5-year data retention with automated cleanup.
- **Scalability:** FastAPI as containerized Docker on Railway with horizontal auto-scaling. Next.js via Vercel CDN. PgBouncer connection pooling for concurrent multi-laboratory access.
- **Model Versioning:** MLflow tracks all model versions. New deployments require >= 2% mAP improvement across all 5 classes.

---

## IMPLEMENTATION FEASIBILITY

### Invention Status

**Current Stage:** Functional Prototype. The ColonyAI system has been substantially implemented with the following components fully operational:

- **Backend (FastAPI):** Complete REST API with 5-role RBAC, JWT authentication with blacklisting, Argon2 password hashing, anti-phishing engine, file validation pipeline (magic-bytes, UUID rename, EXIF strip, ClamAV scan), YOLOv8 inference with per-media-type thresholds, SA-001 area-based merged colony estimation, CFU/ml calculator with GUM measurement uncertainty, SHA-256 chained immutable audit logs, PDF/CSV report generation, LIMS integration endpoints, simulator module, and multi-tenant organization management.

- **Frontend (Next.js 14):** Complete web dashboard with landing page, login/register, dashboard with analytics, analysis upload and results display with color-coded bounding boxes, simulator module, audit log viewer, user management panel, settings/preferences, and responsive design.

- **Database (PostgreSQL):** Complete schema with 10+ tables (users, organizations, analyses, colony_detections, audit_logs, simulator_comparisons, password_reset_requests, notifications, user_preferences, user_sessions, token_blacklist) with proper foreign keys, indexes, and relationships.

- **Security:** Enterprise-grade security stack including SecureHeadersMiddleware (HSTS, CSP, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy), account lockout, admin-mediated password reset with anti-phishing, and comprehensive audit logging.

### Is the Innovation Realistic to Build?

- **Proven AI Foundation:** YOLOv8 is well-documented, open-source, with extensive community support. Multi-class colony detection using YOLO architectures has been demonstrated in peer-reviewed research.
- **Complete Implementation:** Unlike conceptual proposals, ColonyAI has a functional prototype with 100+ API endpoints, 10+ database tables, and a full frontend dashboard.
- **Team Expertise:** Strong React/Next.js and Python/FastAPI background enables rapid development and iteration.
- **Available Training Data:** Custom dataset of 1,477 images with 56,124 bounding boxes across 5 classes.
- **Low Infrastructure Cost:** Google Colab (free GPU) for training; Railway/Vercel free tiers for deployment.
- **Modular Architecture:** Each component (AI model, FastAPI, Next.js, PostgreSQL) developed and tested independently.

### Development Stages

| Phase | Timeline | Deliverables | Owner |
| ----- | ------------------ | ---------------------------------------------------------------------- | ------------- |
| 1 | Week 1 (Apr 1-7) | Dataset collection & annotation (5 classes), YOLOv8 baseline, DB setup | Wisnu / Faras |
| 2 | Week 2 (Apr 8-14) | FastAPI backend & Next.js dashboard UI, Simulator module development | Full Team |
| 3 | Week 3 (Apr 15-21) | CFU/ml calculation module, PDF/CSV report export, system integration | Full Team |
| 4 | Week 4 (Apr 22-30) | System QA, UI polish, documentation, hackathon demo preparation | Full Team |

### Business Model and Sustainability

| Revenue Streams | Cost Structure | Key Partners |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SaaS Subscription:** Starter IDR 500K/mo (500 analyses), Professional IDR 1.5M/mo (unlimited), Enterprise Custom + LIMS + SLA + training | Cloud hosting (Railway/AWS), Model retraining across 5 classes, Customer support, Compliance audits, Dataset annotation maintenance | KAN-accredited labs (distribution), LIMS vendors (integration), BPOM (regulatory validation), University microbiology departments, Jababeka lab tenants (pilot) |

**Value Proposition:** At IDR 500K/month, a laboratory processing 200 samples/day saves an estimated IDR 15-20 million/month in analyst time — a 30-40x ROI. Free to 3 pilot laboratories during first 6 months in exchange for validation data and testimonials.

---

## AGILE SCRUM DEVELOPMENT PLAN

### 1. Team Roles

| # | Name | Scrum Role | Responsibilities |
| --- | ---------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 | Wisnu Alfian Nur Ashar | Product Owner | Defines product vision and roadmap; owns and prioritizes the Product Backlog; writes and validates User Stories; accepts or rejects completed features; liaises with stakeholders (labs, BPOM, LIMS vendors). |
| 2 | Muhammad Faras | Scrum Master | Facilitates all Scrum ceremonies; removes team impediments; enforces Definition of Done; tracks sprint velocity and burndown. Also handles Business Analysis & Documentation. |
| 3 | Suci | Developer (UI/UX) | Designs and implements the Next.js dashboard interface; creates wireframes and Figma mockups; implements color-coded bounding box display for all 5 detection classes; ensures mobile-responsive layout. |
| 4 | Steven | Developer (QA/Data) | Writes and executes test cases for all 5 detection classes; performs cross-browser and cross-device testing; maintains technical documentation; prepares sprint reports and final proposal documentation. Also handles AI/Backend development. |

### 2. Product Backlog

| ID | Priority | User Story | Acceptance Criteria | Category | Points |
| ----- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------ |
| PB-01 | RED MUST | As an analyst, I want to upload a plate image and have the AI automatically identify the plate boundary so that only the agar area is analyzed. | Given a plate photo, when uploaded, then Hough Circle Transform detects boundary within +/-5px; non-plate area is masked and excluded from inference. | Feature | 8 |
| PB-02 | RED MUST | As an analyst, I want the AI model to classify every detected object into exactly one of 5 classes (colony_single, colony_merged, bubble, dust_debris, media_crack) so that valid colonies are distinguished from artifacts. | Given a standardized plate image, when inference runs, then all detections have exactly one class label from the 5-class taxonomy; per-class confidence scores are returned. | Feature | 13 |
| PB-03 | RED MUST | As an analyst, I want the system to automatically calculate CFU/ml from the colony count and dilution factor I entered so that I receive a standardized result without manual arithmetic. | Given colony_single and colony_merged counts and analyst-entered dilution factor + plated volume, when calculation runs, then CFU/ml = Sigma(valid colonies) / (volume x dilution factor) with +/-0.1% arithmetic precision; TNTC/TFTC flags display when count is outside 25-250 CFU range. | Feature | 5 |
| PB-04 | RED MUST | As a laboratory manager, I want the dashboard to display annotated plate images with color-coded bounding boxes for all 5 classes so that analysts can visually verify AI detections at a glance. | Given inference results, when the result page loads, then bounding boxes are rendered with distinct colors per class (green = colony_single, yellow = colony_merged, red = bubble, orange = dust_debris, purple = media_crack); class label and confidence percentage shown on hover. | Feature | 8 |
| PB-05 | RED MUST | As an analyst, I want to digitally sign off and approve results before submission so that every report in the system has a verified analyst record for ISO 17025 audit compliance. | Given a completed analysis, when the analyst clicks 'Approve', then a timestamped record with analyst name, user ID, and SHA-256 hash of the result is written to the append-only audit log in PostgreSQL; the record cannot be deleted or modified. | Compliance | 5 |
| PB-06 | YELLOW SHOULD | As a laboratory administrator, I want to export test results as PDF and CSV reports so that they can be submitted to BPOM regulators or uploaded to our LIMS system. | Given approved test results, when 'Export PDF' or 'Export CSV' is clicked, then the file includes: sample ID, analyst name, timestamp, all 5-class detection counts, CFU/ml value, confidence summary, and analyst signature field; PDF is A4, Times New Roman 12pt, BPOM-compliant format. | Feature | 5 |
| PB-07 | YELLOW SHOULD | As an analyst, I want to upload images from my smartphone camera so that I can capture plates directly in the laboratory without needing a dedicated scanner. | Given a mobile browser session, when the camera icon is tapped, then the device camera API is invoked; captured image is auto-uploaded; the full 5-class inference pipeline runs identically to desktop uploads; result displays correctly on mobile screen. | Feature | 5 |
| PB-08 | YELLOW SHOULD | As a laboratory manager, I want a Simulator module that lets me compare the AI's 5-class detection output against my analysts' manual counts so that I can build institutional trust in the system before full adoption. | Given a test result, when the Simulator tab is opened, then I can enter manual colony counts; the system displays a side-by-side comparison table showing AI count vs. manual count per class; accuracy percentage and error margin are calculated and displayed. | Feature | 8 |
| PB-09 | GREEN COULD | As a laboratory manager, I want a historical analytics dashboard showing CFU/ml trends over time per media type so that I can identify anomalies and generate monthly compliance reports. | Given at least 30 test records, when the Analytics page is opened, then a time-series chart displays CFU/ml over date range; filter by media type and analyst; monthly summary table exportable as CSV. | Enhancement | 8 |
| PB-10 | GREEN COULD | As a system administrator, I want model version management so that new YOLOv8 models trained on updated 5-class datasets can be deployed with A/B validation without service interruption. | Given a new trained model file, when uploaded via the admin panel, then MLflow logs the model version; A/B test runs for 500 inferences; if new model achieves >= 2% mAP improvement across all 5 classes on the validation set, it is automatically promoted to production. | DevOps | 13 |

### 3. Backlog Priority Summary

| Priority Level | Label | Count | Backlog Items |
| -------------- | ------------ | ------- | --------------------------------- |
| RED MUST HAVE | Critical | 5 items | PB-01, PB-02, PB-03, PB-04, PB-05 |
| YELLOW SHOULD HAVE | Important | 3 items | PB-06, PB-07, PB-08 |
| GREEN COULD HAVE | Nice to have | 2 items | PB-09, PB-10 |

### 4. Sprint Plan (1-Month Intensive - April 2026)

| Sprint | Timeline | Backlog Items | Sprint Goal | Definition of Done |
| ------ | --------- | ------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Week 1 | Apr 1-7 | PB-01, PB-02 | YOLOv8 model classifies 5 classes; core architecture scaffolded. | Baseline model trained; basic DB/Auth running. |
| Week 2 | Apr 8-14 | PB-04, PB-07, PB-08 | Next.js dashboard displays annotated images; Simulator module active. | Dashboard renders all 5 classes visually; Manual vs AI comparison working. |
| Week 3 | Apr 15-21 | PB-03, PB-05, PB-06 | Integrations, CFU/ml calculator, and reporting (PDF/CSV) finalized. | PDF export passes BPOM format; automated math checks verified. |
| Week 4 | Apr 22-30 | PB-09, PB-10 + QA | Full system integration, deployment, and final demo prep. | All critical backlog items accepted by PO; end-to-end test passes; demo video recorded. |

### 5. Daily Sprint (GitHub Repository)

| Item | Details |
| --------------------- | ------------------------------------------------------------------------- |
| **Repository** | https://github.com/wi5nuu/colonyai |
| **Daily Standup** | DONE: [completed yesterday] / TODAY: [working on] / BLOCKER: [impediments] |
| **Issue Labels** | 5-class-model, frontend, backend, bug, documentation, testing, compliance |
| **Branch Strategy** | main -> develop -> feature/PB-XX-short-description |
| **Sprint Board** | GitHub Projects Kanban: To Do -> In Progress -> In Review -> Done |
| **Velocity Tracking** | Story points completed per sprint logged in