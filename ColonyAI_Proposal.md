# ColonyAI — AI Open Innovation Challenge 2026

**AI-Powered Automated Plate Count Reader for Microbiology Laboratories**

---

## TEAM IDENTITY

| Field                 | Details                                                   |
| --------------------- | --------------------------------------------------------- |
| **Team Name**         | ColonyAI                                                  |
| **Team Leader**       | Wisnu Alfian Nur Ashar                                    |
| **WhatsApp**          | +62 813-9488-2490                                         |
| **Email**             | wisnu.ashar@student.president.ac.id                       |
| **Institution**       | President University — Bachelor of Information Technology |
| **Portfolio**         | https://github.com/wi5nuu                                 |
| **GitHub Repository** | https://github.com/wi5nuu/colonyai                        |

### Team Members

| No. | Name                   | Role                                                                |
| --- | ---------------------- | ------------------------------------------------------------------- |
| 1   | Wisnu Alfian Nur Ashar | Product Owner & Software Engineer                                   |
| 2   | Muhammad Faras         | Scrum Master & AI/CV Integration + Business Analyst & Documentation |
| 3   | Suci                   | Developer (UI/UX Designer)                                          |
| 4   | Steven                 | Developer (Data Analyst & QA Engineer)                              |

---

## EXECUTIVE SUMMARY

ColonyAI is an AI-powered Automated Plate Count Reader designed to modernize Total Plate Count (TPC) testing in microbiology laboratories. Analysts currently count bacterial colonies manually — a process that is time-consuming, inconsistent, and operator-dependent, with inter-analyst variability reaching 22.7%–80% coefficient of variation (ASTM F2944). Our solution integrates a fine-tuned YOLOv8 computer vision model with a Next.js web dashboard to automate agar plate localization, colony detection, 5-class artifact classification, and CFU/ml calculation with ISO/IEC Guide 98-3:2008 (GUM) measurement uncertainty in real time. The system addresses lighting variation through CLAHE adaptive histogram equalization, overlapping colonies through SA-001 area-based merged colony estimation, and artifact interference through 5-class classification with per-media-type confidence thresholds, while maintaining analyst verification as the final validation layer. By reducing analysis time by up to 85% and delivering consistent, reproducible results with SHA-256 chained immutable audit trails, ColonyAI directly supports laboratory efficiency, food safety compliance with BPOM/SNI standards, and public health assurance for Indonesia's 500+ accredited microbiology testing facilities.

---

## PROBLEM STATEMENT

### Selected Case Statement

**Case 1 — Microbiology Laboratory: Automated Plate Count Reader**

### Challenge Brief Alignment

| Challenge Requirement                                  | ColonyAI Implementation                                                                                                   |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Identify agar plate area from image                    | OpenCV Hough Circle Transform + homography perspective correction for robust plate boundary detection                     |
| Automatic detection and counting of bacterial colonies | YOLOv8 single-pass object detection with ≥ 92% accuracy; SA-001 area-based merged colony estimation                       |
| Differentiate valid colonies vs. artifacts             | 5-class taxonomy (colony_single, colony_merged, bubble, dust_debris, media_crack) with > 90% artifact rejection precision |
| Produce consistent CFU/ml values                       | Automated CFU/ml with TNTC/TFTC flagging per ISO 4833-1:2013 + GUM measurement uncertainty per ISO/IEC Guide 98-3:2008    |
| Save results to laboratory reporting system            | BPOM/SNI-compliant PDF/CSV export + LIMS API integration (SampleManager, LabVantage)                                      |

### Scope & Limitations — How ColonyAI Addresses Each

| Scope / Limitation                             | ColonyAI Solution                                                                                                                          |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Variations in lighting and camera quality**  | CLAHE-based adaptive histogram equalization + homography perspective correction normalizes any input before inference                      |
| **Overlapping and low contrast colonies**      | YOLOv8 trained on colony_merged class; SA-001 area-based merged colony estimation; NMS with IoU 0.45; per-media-type confidence thresholds |
| **Different media types and colors**           | Per-media-type confidence thresholds for 8+ agar types (PCA, VRBA, BGBB, TSA, TGEA, MacConkey, R2A, Other)                                 |
| **Limited labeled dataset**                    | 1,477 images (56,124 bounding boxes) + YOLOv8 augmentation + planned AGAR dataset integration                                              |
| **Results still require analyst verification** | Digital sign-off workflow with per-class confidence transparency; SHA-256 chained audit trail; analyst approves before submission          |

### Selected Sub-Case Statement

Automated detection, counting, and CFU/ml reporting of bacterial colonies from agar plate images, with classification across 5 object classes (colony_single, colony_merged, bubble, dust_debris, media_crack) and differentiation between valid colonies and artifacts, integrated into a web-based laboratory dashboard with enterprise-grade security and multi-tenant RBAC.

### Main Objectives

The primary objective of ColonyAI is to eliminate human error and inconsistency from Total Plate Count (TPC) workflows in food safety and environmental microbiology laboratories. Specific targets include:

- Achieve colony detection accuracy of ≥ 92% across diverse media types and lighting conditions, benchmarked against expert manual counting standards.
- Reduce TPC analysis time from 15–30 minutes per sample to under 2 minutes through an automated image analysis pipeline.
- Classify all detected objects into 5 defined classes (colony_single, colony_merged, bubble, dust_debris, media_crack) with artifact rejection precision > 90%.
- Deliver consistent CFU/ml calculations with SA-001 area-based merged colony estimation and ISO/IEC Guide 98-3:2008 (GUM) measurement uncertainty — removing dependency on analyst experience level.
- Provide a SHA-256 chained immutable digital audit trail integrated with LIMS, supporting ISO 17025, SNI 2897:2008, and UU PDP Indonesia compliance.
- Deploy a scalable, multi-laboratory SaaS platform accessible via web browser, requiring no special hardware beyond a standard camera or smartphone.
- Implement enterprise-grade security including Argon2 password hashing, JWT blacklisting, anti-phishing engine, magic-bytes file validation, EXIF stripping, ClamAV malware scanning, and 5-role RBAC (Super Admin, Admin, Manager, Analyst, Auditor).

### Expected Output — Deliverable Mapping

| Expected Output                                                                | ColonyAI Deliverable                                                                                                                                                                            | Status      |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| **Computer Vision model** for colony detection & counting                      | YOLOv8n fine-tuned on 1,477 custom-labeled images (56,124 bounding boxes) with 5-class detection; SA-001 area-based merged estimation; per-media-type thresholds; ONNX export for CPU inference | Implemented |
| **Dashboard** — Colony count results and test history                          | Next.js 14 web application with color-coded bounding boxes, CFU/ml with GUM uncertainty, searchable history, per-class confidence scores, role-based data scoping (5 roles)                     | Implemented |
| **Simulator** — Comparison of manual vs AI accuracy                            | Built-in benchmarking: side-by-side per-class comparison; accuracy %, error margin, agreement score; DB-persisted for audit trail                                                               | Implemented |
| **Executive Summary** — Efficiency of analysis time and consistency of results | BPOM-compliant PDF (A4, Times New Roman 12pt) + multi-sheet Excel; pre/post AI time comparison, inter-analyst variability reduction, monthly throughput trends, cost savings analysis           | Implemented |

---

## PROBLEM DEFINITION

### Problem Context

Microbiology laboratories perform Total Plate Count (TPC) tests to determine the number of microorganisms in food and environmental samples. Currently, analysts still count colonies manually, making results dependent on experience, time-consuming, and potentially inconsistent — especially when colonies are stacked or of varying sizes. ColonyAI directly addresses this challenge.

### What is the main problem?

In Indonesian microbiology laboratories, Total Plate Count (TPC) remains the gold standard for measuring microbial contamination in food, water, and environmental samples. However, the current process is entirely manual — an analyst physically counts colonies on an agar plate using a colony counter device or pen-tally under magnification. This creates three critical operational failures: (1) **Inconsistency** — two analysts counting the same plate routinely differ by 10–25%; (2) **Throughput Bottleneck** — a single analyst processes only 20–40 plates/hour, causing backlogs during peak periods (post-Eid food inspections, outbreak investigations); (3) **Skill Dependency** — accurate counting requires significant experience, leaving junior analysts and under-resourced laboratories unable to reliably distinguish the 5 object classes present on a plate: valid colonies and 3 types of non-colony artifacts. This bottleneck directly impacts public health decision-making, food safety enforcement, and laboratory accreditation.

### Who is impacted and at what scale?

- **Food industry manufacturers** (FMCG, dairy, beverage) — depend on rapid and reliable TPC results for production release decisions and shelf-life validation. Delayed or inaccurate results risk product recalls worth billions of rupiah.
- **Government regulators** (BPOM, Dinas Kesehatan) — require standardized, auditable microbial testing records for product certification and enforcement actions.
- **Third-party testing laboratories** (KAN-accredited) — face increasing sample volumes with limited analyst resources.
- **Hospitals and clinical labs** — environmental monitoring and food safety testing directly impacts patient safety protocols.

Indonesia alone has over 500 accredited microbiology testing facilities. The Asia-Pacific food testing market is projected to exceed USD 7 billion by 2027.

### Prove the problem

| No. | Source                                       | Key Finding                                                                                                                                                                        |
| --- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | ASTM F2944 / Scintica (2024)                 | Inter-observer coefficient of variation in manual colony counting ranges from 22.7% to 80%; errors of 100%+ observed when two individuals count the same plate.                    |
| 2   | FDA Bacteriological Analytical Manual (2023) | Countable-range plates (25–250 CFU) yield significant analyst variation, particularly for non-circular or overlapping colonies — identical to the colony_merged class in ColonyAI. |
| 3   | BPOM Indonesia (2023)                        | 18% of food product violations involved microbiological non-conformance; many cases likely go undetected due to inconsistent testing methodology.                                  |
| 4   | Indonesian Lab Industry Survey (2024, n=12)  | Colony counting constitutes 40–60% of analyst working hours in TPC workflows — the single largest labor cost in microbiological analysis.                                          |

---

## PROPOSED SOLUTION

### Main Solution

ColonyAI is a web-based intelligent laboratory platform that transforms agar plate images into accurate, standardized CFU/ml reports in under two minutes. The system integrates three tightly coupled components:

- **AI Vision Engine:** A fine-tuned YOLOv8 object detection model trained on 8+ agar media types. The model simultaneously detects the plate boundary via Hough Circle Transform and classifies all detected objects into exactly 5 classes: colony_single, colony_merged, bubble, dust_debris, and media_crack. Per-media-type confidence thresholds ensure optimal detection across different agar types. SA-001 area-based estimation calculates the actual colony count within merged colony bounding boxes by computing the ratio of merged bbox area to median single colony area. Only colony_single and colony_merged contribute to CFU/ml; the remaining 3 classes are flagged as artifacts and excluded.

- **Intelligent Web Dashboard (Next.js 14):** Analysts upload plate images via browser or mobile camera. The dashboard displays annotated results with color-coded bounding boxes per class (green=single, yellow=merged, red=bubble, orange=dust, purple=crack), CFU/ml calculations with GUM measurement uncertainty, historical test records, and trend analytics. Results require digital analyst sign-off before final submission. Role-based access control with 5 distinct roles (Super Admin, Admin, Manager, Analyst, Auditor) with data scoping ensures appropriate access levels for each laboratory position.

- **Simulator & Reporting Module:** A built-in benchmarking tool allowing labs to compare AI counting accuracy against manual counts with per-class agreement scoring. Reports are exportable in PDF (BPOM-compliant A4, Times New Roman 12pt) and multi-sheet Excel formats compatible with LIMS. SHA-256 chained immutable audit logs provide tamper-evident records for ISO 17025 compliance.

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  Web Browser     │  │  Mobile Browser  │  │  Smartphone      │  │
│  │  (Desktop)       │  │  (Responsive)    │  │  Camera Upload   │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  │
└───────────┼─────────────────────┼─────────────────────┼─────────────┘
            │                     │                     │
            └─────────────────────┼─────────────────────┘
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
│  │  │ Users & 5-Role │  │      │  │ Plate Images           │  │   │
│  │  │ RBAC           │  │      │  │ Signed URLs (1hr)      │  │   │
│  │  │ Test Results   │  │      │  │ Encrypted at Rest      │  │   │
│  │  │ Audit Log      │  │      │  └────────────────────────┘  │   │
│  │  │ (SHA-256 chain)│  │      └──────────────────────────────┘   │
│  │  │ 5-Class Counts │  │                                         │
│  │  │ CFU/ml Records │  │                                         │
│  │  │ Simulator Data │  │                                         │
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

**Data Flow:** Upload → Magic-bytes Validation → CLAHE + Hough Circle + Homography → 5-Class YOLOv8 Inference → SA-001 Merged Estimation → CFU/ml + GUM Uncertainty → Analyst Review → Digital Sign-off → PDF/CSV Export + LIMS Sync

### How does the solution work?

| Stage            | Component        | Action                                                                                                                                                             | Output                                               |
| ---------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| **INPUT**        | Browser / Mobile | Analyst uploads plate photo. Enters: Sample ID, dilution factor, media type, incubation parameters.                                                                | Raw image + metadata                                 |
| **SECURITY**     | File Validator   | Magic-bytes MIME validation (not Content-Type header), UUID filename (anti-path-traversal), EXIF strip (privacy), ClamAV malware scan, dimension check (100×100px) | Sanitized image bytes                                |
| **PRE-PROCESS**  | OpenCV Pipeline  | CLAHE brightness/contrast normalization, Hough Circle Transform for plate boundary, homography perspective correction, ROI extraction                              | Standardized 512×512 plate image                     |
| **AI INFERENCE** | YOLOv8 Model     | 5-class detection with per-media-type confidence thresholds. NMS IoU 0.45. OOM guard (max 1024px).                                                                 | Annotated image + 5-class labels + confidence scores |
| **ESTIMATION**   | SA-001 Engine    | Area-based merged colony estimation: ratio of merged bbox area to median single colony area. Fallback = 2 if no reference. Per-bbox cap = 50 colonies.             | Estimated colony count per merged bbox               |
| **CALCULATION**  | CFU Module       | CFU/ml = Σ(valid colonies) ÷ (Volume × Dilution Factor). TNTC/TFTC per ISO 4833-1:2013. GUM uncertainty (k=2, ~95%) per ISO/IEC Guide 98-3:2008.                   | CFU/ml value with uncertainty + flags                |
| **OUTPUT**       | Dashboard + LIMS | Analyst reviews color-coded bounding boxes, flags for review, digitally approves. PDF/CSV report generated. LIMS sync.                                             | Verified PDF/CSV + LIMS data export                  |

---

## IMPACT & OUTCOME

### Key Benefits of Adopting the Solution

- **Efficiency Gains:** Reduces TPC analysis time from 15–30 minutes to under 2 minutes per sample (85–90% reduction), enabling 5–8× more samples per analyst per day without adding headcount.
- **Consistency & Reproducibility:** Eliminates inter-analyst variability (22.7%–80% CV in manual counting) — every plate is processed through the same 5-class YOLOv8 model with per-media-type thresholds, producing identical results regardless of operator skill, supporting ISO 17025 reproducibility requirements.
- **Cost Reduction:** Estimated 40% reduction in labor cost per TPC test. A mid-sized lab processing 200 samples/day could save IDR 500 million – 1 billion/year in analyst labor hours.
- **Regulatory Compliance:** SHA-256 chained immutable audit trail with timestamped records and analyst sign-off supports BPOM, KAN, ISO 17025, SNI 2897:2008, and UU PDP Indonesia accreditation audit requirements.
- **Metrological Traceability:** SA-001 area-based merged colony estimation and GUM measurement uncertainty (ISO/IEC Guide 98-3:2008) provide scientifically valid results suitable for ISO 17025 accreditation.
- **Democratization of Quality:** Junior analysts and smaller regional laboratories gain access to expert-level classification accuracy across all 5 object classes, reducing the quality gap across Indonesia.
- **Error Prevention:** Automated TNTC/TFTC flags per ISO 4833-1:2013 prevent release of invalid results. GUM measurement uncertainty provides confidence intervals for every reported value.
- **Security:** Enterprise-grade security with Argon2 hashing, JWT blacklisting, anti-phishing engine, magic-bytes file validation, EXIF stripping, ClamAV malware scanning, account lockout, and 5-role RBAC.

### Short-Term and Mid-Term Outcomes

**Short-Term (0–6 Months Post-Deployment):**

- Pilot deployment in 2–3 partner laboratories validating ≥ 92% detection accuracy across PCA, VRBA, and BGBB media types for all 5 detection classes.
- Onboarding of 10–20 analysts through the web platform with embedded training materials explaining the 5-class classification system.
- Establishment of a labeled agar plate dataset of 1,477 images with 56,124 bounding box annotations across 5 classes, shared openly to advance Indonesian AI research in food safety.

**Mid-Term (6–24 Months Post-Deployment):**

- Expansion to 20+ accredited laboratories across Java and Sumatra. Target: 10,000+ TPC analyses processed monthly through the platform.
- Development of a mobile-native PWA capture module enabling field sampling with smartphone cameras.
- Full integration with LIMS platforms (SampleManager, LabVantage) for direct result synchronization.
- Revenue generation through SaaS subscription model, achieving operational sustainability within 18 months.
- Publication of validation study results in a peer-reviewed journal documenting model performance across all 5 detection classes.

---

## INNOVATION & DIFFERENTIATION

### What Makes Your Solution Different?

- **5-Class Artifact Intelligence:** ColonyAI is specifically trained to classify detections into all 5 classes (colony_single, colony_merged, bubble, dust_debris, media_crack), enabling precise artifact rejection with > 90% precision. Generic computer vision APIs cannot perform this domain-specific classification.
- **SA-001 Area-Based Merged Colony Estimation:** Unlike simple bounding box counting, ColonyAI estimates the actual number of colonies within merged colony regions using area ratio analysis against median single colony area — significantly improving accuracy for overlapping colonies.
- **Per-Media-Type Confidence Thresholds:** 8+ agar media types (PCA, VRBA, BGBB, TSA, TGEA, MacConkey, R2A, Other) each have optimized per-class confidence thresholds with alias mapping, ensuring reliable detection across diverse laboratory conditions.
- **GUM Measurement Uncertainty:** Every CFU/ml result includes expanded uncertainty (k=2, ~95% confidence) calculated per ISO/IEC Guide 98-3:2008, providing metrological traceability required for ISO 17025 accreditation.
- **SHA-256 Chained Audit Trail:** Immutable, append-only audit logs with cryptographic hash chaining ensure tamper-evident records. Every log entry includes the previous hash, making undetected modification computationally infeasible.
- **Confidence Transparency:** Every detection result includes per-class confidence scores and a plate-level reliability indicator (high/medium/low). Analysts see exactly where the model is uncertain, enabling targeted human review.
- **5-Role RBAC with Data Scoping:** Granular role-based access control (Super Admin, Admin, Manager, Analyst, Auditor) with query-level data scoping. Analyst sees own data; Manager/Admin see org data; Auditor sees org data read-only; Super Admin sees all data globally.
- **Anti-Phishing Engine:** Multi-layer defense against credential stuffing, admin account targeting, IP throttling, auto-blocking, and enumeration attacks. All blocks are logged to the Audit Ledger.
- **Indonesia-Contextual Design:** Built around BPOM/SNI reporting formats (A4 PDF, Times New Roman 12pt) and Bahasa Indonesia interface, addressing a gap where international tools lack local regulatory context.
- **No Hardware Lock-in:** Requires only a standard camera and web browser. Commercial alternatives (ProtoCOL 3, SphereFlash) require proprietary hardware costing USD 15,000–60,000, excluding most Indonesian labs.
- **Enterprise Security Stack:** Argon2 password hashing, JWT blacklisting, magic-bytes file validation, UUID filename generation, EXIF stripping, ClamAV malware scanning, account lockout, SecureHeadersMiddleware (HSTS, CSP, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy).

### Positioning Compared to Existing Approaches

| Feature                  | ColonyAI     | Manual         | ProtoCOL 3  | SphereFlash | Generic AI |
| ------------------------ | ------------ | -------------- | ----------- | ----------- | ---------- |
| 5-Class Detection        | ✓            | ✗              | Partial     | Partial     | ✗          |
| Artifact Differentiation | ✓            | ✗              | Partial     | Partial     | ✗          |
| SA-001 Merged Estimation | ✓            | ✗              | ✗           | ✗           | ✗          |
| Per-Media Thresholds     | ✓ (8+ types) | ✗              | ✗           | ✗           | ✗          |
| GUM Uncertainty          | ✓            | ✗              | ✗           | ✗           | ✗          |
| SHA-256 Audit Chain      | ✓            | ✗              | ✗           | ✗           | ✗          |
| 5-Role RBAC              | ✓            | ✗              | ✗           | ✗           | ✗          |
| Anti-Phishing Engine     | ✓            | ✗              | ✗           | ✗           | ✗          |
| Magic-bytes Validation   | ✓            | ✗              | ✗           | ✗           | ✗          |
| No Special Hardware      | ✓            | ✓              | ✗           | ✗           | ✓          |
| Indonesian Regulatory    | ✓            | ✗              | ✗           | ✗           | ✗          |
| LIMS Integration         | ✓            | ✗              | Limited     | Limited     | Custom     |
| SaaS / Cloud Access      | ✓            | ✗              | ✗           | ✗           | ✓          |
| Confidence per Class     | ✓            | ✗              | ✗           | ✗           | Partial    |
| Cost                     | IDR 500K+/mo | Analyst salary | >USD 15K HW | >USD 30K HW | Custom dev |

---

## TECHNICAL APPROACH

### Main Solution — Technology Stack

| Layer            | Technology                    | Justification                                                                                                                                                                   |
| ---------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AI Model         | YOLOv8n / YOLOv8s             | Real-time single-pass detection; 5-class simultaneous classification; ONNX export for CPU edge inference; < 50ms per image                                                      |
| Backend          | FastAPI (Python)              | Async REST API serving YOLOv8 inference; Pydantic validation; Python-native AI/ML ecosystem; auto-generated OpenAPI docs                                                        |
| Frontend         | Next.js 14 + TypeScript       | SSR for fast initial load; React for rich interactive annotation dashboard; TypeScript for type-safe codebase                                                                   |
| UI               | Tailwind CSS + shadcn/ui      | Rapid, accessible component library; class-level color-coding for all 5 detection classes                                                                                       |
| Image Processing | OpenCV + Pillow               | Hough Circle Transform for plate boundary; CLAHE normalization; homography perspective correction; ROI extraction; annotated image generation with class-colored bounding boxes |
| File Security    | python-magic + piexif + clamd | Magic-bytes MIME validation (anti-spoofing); UUID filename (anti-path-traversal); EXIF strip (privacy); ClamAV scan (malware detection)                                         |
| Auth Security    | Argon2 + JWT + Anti-Phishing  | Argon2 password hashing (GPU-attack resistant); JWT with JTI blacklisting; anti-phishing engine (IP throttling, admin targeting detection, auto-block)                          |
| Database         | PostgreSQL                    | ACID-compliant for ISO 17025 audit trails; SHA-256 chained audit logs; 5-role RBAC; 10+ tables with proper relationships                                                        |
| Deployment       | Railway + Vercel + AWS S3     | Auto-scaling Docker containers; CDN for frontend; encrypted S3 for image storage; signed URLs (1-hour expiry)                                                                   |
| Middleware       | SecureHeadersMiddleware       | HSTS (1yr, includeSubDomains, preload); CSP; X-Frame-Options: DENY; X-XSS-Protection; Referrer-Policy; Permissions-Policy                                                       |
| Model Training   | Google Colab + Roboflow       | Free GPU fine-tuning; dataset annotation and augmentation management for all 5 classes                                                                                          |

### Technology Selection and Implementation

YOLOv8 was selected because it provides the optimal balance of speed (< 50ms per image on CPU) and accuracy for a real-time web application, while natively supporting multi-class detection — essential for our 5-class taxonomy. Unlike two-stage detectors (e.g., Faster R-CNN), YOLOv8 processes the entire image in a single forward pass, enabling deployment without GPU hardware. Next.js provides hybrid SSR/CSR for fast dashboard loading. FastAPI delivers a clean, auto-documented REST API with Pydantic validation ensuring data integrity. PostgreSQL ensures ACID compliance for audit trail records — a non-negotiable requirement for ISO 17025 accreditation. Argon2 was chosen over bcrypt for password hashing due to its resistance to GPU-based attacks. JWT blacklisting via JTI (JWT ID) tracking enables secure logout. The anti-phishing engine provides multi-layer defense against credential stuffing and admin account targeting. Magic-bytes file validation via python-magic prevents MIME spoofing attacks that Content-Type header checking cannot detect.

### Solution Algorithm

- **Phase 0 — Security Validation:** Magic-bytes MIME type verification via python-magic (not Content-Type header), UUID filename generation (anti-path-traversal), EXIF metadata stripping via piexif (GPS privacy), ClamAV malware scanning (fail-open with warning), minimum dimension check (100×100px), NaN/Inf dilution factor guard.

- **Phase 1 — Plate Localization:** CLAHE (Contrast Limited Adaptive Histogram Equalization) adaptive histogram equalization normalizes brightness/contrast. Hough Circle Transform (OpenCV) detects the circular agar plate boundary and creates a region-of-interest mask. Perspective correction via homography transform normalizes elliptical camera angles. ROI extraction isolates the agar area, with minimum size guard to prevent extreme distortion.

- **Phase 2 — 5-Class Detection & Classification:** Fine-tuned YOLOv8 performs simultaneous object detection across all 5 classes (colony_single, colony_merged, bubble, dust_debris, media_crack) with per-media-type confidence thresholds from alias-mapped configuration. NMS with IoU threshold 0.45 resolves overlapping bounding boxes. SA-001 area-based estimation calculates actual colony count within merged regions: estimated_count = round(area_merged_bbox / median_area_single_bbox), with fallback = 2 and per-bbox cap = 50. OOM guard caps input at 1024px.

- **Phase 3 — Count Validation & CFU Calculation:** Post-processing filters detections by per-class thresholds. Only colony_single and colony_merged contribute to the final count. CFU/ml = Σ(valid colonies) ÷ (plated_volume_ml × dilution_factor). Results outside 25–250 CFU trigger TNTC/TFTC flags per ISO 4833-1:2013 (inclusive boundaries). GUM measurement uncertainty (k=2, ~95% confidence) is calculated per ISO/IEC Guide 98-3:20
