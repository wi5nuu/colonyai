# ColonyAI — AI Open Innovation Challenge 2026

**AI-Powered Automated Plate Count Reader for Microbiology Laboratories**

---

## TEAM IDENTITY

| Field                    | Details                                                   |
| ------------------------ | --------------------------------------------------------- |
| **Team Name**            | ColonyAI                                                  |
| **Team Leader Name**     | Wisnu Alfian Nur Ashar                                    |
| **Participant Category** | University Student                                        |
| **WhatsApp No.**         | +62 813-9488-2490                                         |
| **Email**                | wisnu.ashar@student.president.ac.id                       |
| **Institution**          | President University — Bachelor of Information Technology |
| **Link Portfolio**       | https://github.com/wi5nuu                                 |
| **GitHub Repository**    | https://github.com/wi5nuu/colonyai                        |

### Members Name and Roles

| No. | Name                   | Role                                                                |
| --- | ---------------------- | ------------------------------------------------------------------- |
| 1   | Wisnu Alfian Nur Ashar | Product Owner & Software Engineer                                   |
| 2   | Muhammad Faras         | Scrum Master & AI/CV Integration + Business Analyst & Documentation |
| 3   | Suci                   | Developer (UI/UX Designer)                                          |
| 4   | Steven                 | Developer (Data Analyst & QA Engineer)                              |

---

## Executive Summary Project

ColonyAI is an AI-powered Automated Plate Count Reader designed to modernize Total Plate Count (TPC) testing in microbiology laboratories. Analysts currently count bacterial colonies manually — a process that is time-consuming, inconsistent, and operator-dependent, with inter-analyst variability reaching 22.7%–80% coefficient of variation (ASTM F2944). Our solution integrates a fine-tuned YOLOv8 computer vision model with a Next.js web dashboard to automate agar plate localization, colony detection, 5-class artifact classification, and CFU/ml calculation with ISO/IEC Guide 98-3:2008 (GUM) measurement uncertainty in real time. By reducing analysis time by up to 85% and delivering consistent, reproducible results with SHA-256 chained immutable audit trails, ColonyAI directly supports laboratory efficiency, food safety compliance with BPOM/SNI standards, and public health assurance for Indonesia's 500+ accredited microbiology testing facilities.

_(149 words)_

---

## Problem Statement

### Selected Case Statement

**Case 1 — Microbiology Laboratory: Automated Plate Count Reader**

### Selected Sub-Case Statement

Automated detection, counting, and CFU/ml reporting of bacterial colonies from agar plate images, with classification across 5 object classes (colony_single, colony_merged, bubble, dust_debris, media_crack) and differentiation between valid colonies and artifacts, integrated into a web-based laboratory dashboard with enterprise-grade security and multi-tenant RBAC.

### Main Objectives

The primary objective of ColonyAI is to eliminate human error and inconsistency from Total Plate Count (TPC) workflows in food safety and environmental microbiology laboratories. Specific targets include:

- Achieve colony detection accuracy of ≥ 92% across diverse media types and lighting conditions, benchmarked against expert manual counting standards.
- Reduce TPC analysis time from 15–30 minutes per sample to under 2 minutes through an automated image analysis pipeline.
- Classify all detected objects into 5 defined classes (colony_single, colony_merged, bubble, dust_debris, media_crack) with artifact rejection precision > 90%.
- Deliver consistent CFU/ml calculations with SA-001 area-based merged colony estimation and ISO/IEC Guide 98-3:2008 (GUM) measurement uncertainty — removing dependency on analyst experience level.
- Provide a SHA-256 chained immutable digital audit trail integrated with LIMS, supporting ISO 17025, SNI 2897:2008, and UU PDP Indonesia compliance.
- Deploy a scalable, multi-laboratory SaaS platform accessible via web browser on any device.
- Implement enterprise-grade security including Argon2 password hashing, JWT blacklisting, anti-phishing engine, magic-bytes file validation, EXIF stripping, ClamAV malware scanning, and 5-role RBAC (Super Admin, Admin, Manager, Analyst, Auditor).

_(199 words)_

---

## Problem Definition

### 1.1 What is the main problem?

In Indonesian microbiology laboratories, Total Plate Count (TPC) remains the gold standard for measuring microbial contamination in food, water, and environmental samples. However, the current process is entirely manual — an analyst physically counts colonies on an agar plate using a colony counter device or pen-tally under magnification. This creates three critical operational failures: (1) **Inconsistency** — two analysts counting the same plate routinely differ by 10–25%, with inter-observer coefficient of variation reaching 22.7%–80% (ASTM F2944); (2) **Throughput Bottleneck** — a single analyst processes only 20–40 plates/hour, causing backlogs during peak periods such as post-Eid food inspections and outbreak investigations; (3) **Skill Dependency** — accurate counting requires significant experience, leaving junior analysts and under-resourced laboratories unable to reliably distinguish valid colonies from artifacts such as bubbles, dust debris, and media cracks. This bottleneck directly impacts public health decision-making, food safety enforcement, and laboratory accreditation across Indonesia's 500+ accredited microbiology testing facilities.

_(172 words)_

### 1.2 Who is impacted and to what scale?

- **Food industry manufacturers** (FMCG, dairy, beverage) — depend on rapid and reliable TPC results for production release decisions and shelf-life validation. Delayed or inaccurate results risk product recalls worth billions of rupiah.
- **Government regulators** (BPOM, Dinas Kesehatan) — require standardized, auditable microbial testing records for product certification and enforcement actions.
- **Third-party testing laboratories** (KAN-accredited) — face increasing sample volumes with limited analyst resources, directly impacting turnaround time and service quality.
- **Hospitals and clinical labs** — environmental monitoring and food safety testing directly impacts patient safety protocols.
- **Consumers** — ultimately bear the risk of foodborne illness when contaminated products reach the market due to inconsistent testing.

Indonesia alone has over 500 accredited microbiology testing facilities. The Asia-Pacific food testing market is projected to exceed USD 7 billion by 2027, indicating the massive scale of impact.

_(148 words)_

### 1.3 Prove the problem

| No. | Source                                       | Key Finding                                                                                                                                                                        |
| --- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | ASTM F2944 / Scintica (2024)                 | Inter-observer coefficient of variation in manual colony counting ranges from 22.7% to 80%; errors of 100%+ observed when two individuals count the same plate.                    |
| 2   | FDA Bacteriological Analytical Manual (2023) | Countable-range plates (25–250 CFU) yield significant analyst variation, particularly for non-circular or overlapping colonies — identical to the colony_merged class in ColonyAI. |
| 3   | BPOM Indonesia (2023)                        | 18% of food product violations involved microbiological non-conformance; many cases likely go undetected due to inconsistent testing methodology.                                  |
| 4   | Indonesian Lab Industry Survey (2024, n=12)  | Colony counting constitutes 40–60% of analyst working hours in TPC workflows — the single largest labor cost in microbiological analysis.                                          |

These data points confirm that manual colony counting is not merely inconvenient — it is a systemic quality and public health risk that scales with Indonesia's growing food safety testing demands.

_(150 words)_

---

## Problem Solution

### 2.1 Main Solution

ColonyAI is a web-based intelligent laboratory platform that transforms agar plate images into accurate, standardized CFU/ml reports in under two minutes. The system integrates three tightly coupled components:

- **AI Vision Engine:** A fine-tuned YOLOv8 object detection model trained on 8+ agar media types. The model simultaneously detects the plate boundary via Hough Circle Transform and classifies all detected objects into exactly 5 classes: colony_single, colony_merged, bubble, dust_debris, and media_crack. Per-media-type confidence thresholds ensure optimal detection across different agar types. SA-001 area-based estimation calculates the actual colony count within merged colony bounding boxes. Only colony_single and colony_merged contribute to CFU/ml; the remaining 3 classes are flagged as artifacts and excluded.

- **Intelligent Web Dashboard (Next.js 14):** Analysts upload plate images via browser. The dashboard displays annotated results with color-coded bounding boxes per class, CFU/ml calculations with GUM measurement uncertainty, historical test records, and trend analytics. Results require digital analyst sign-off before final submission. Role-based access control with 5 distinct roles ensures appropriate access levels.

- **Simulator & Reporting Module:** A built-in benchmarking tool allowing labs to compare AI counting accuracy against manual counts with per-class agreement scoring. Reports are exportable in PDF (BPOM-compliant A4, Times New Roman 12pt) and multi-sheet Excel formats compatible with LIMS. SHA-256 chained immutable audit logs provide tamper-evident records for ISO 17025 compliance.

_(200 words)_

### 2.2 Attachment Image / Illustration / Diagram

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

**Figure 1 — ColonyAI System Architecture Diagram**

**Data Flow:** Upload → Magic-bytes Validation → CLAHE + Hough Circle + Homography → 5-Class YOLOv8 Inference → SA-001 Merged Estimation → CFU/ml + GUM Uncertainty → Analyst Review → Digital Sign-off → PDF/CSV Export + LIMS Sync

### 2.3 How does the solution work?

| Stage            | Component        | Action                                                                                                                                                             | Output                                               |
| ---------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| **INPUT**        | Browser / Mobile | Analyst uploads plate photo. Enters: Sample ID, dilution factor, media type, incubation parameters.                                                                | Raw image + metadata                                 |
| **SECURITY**     | File Validator   | Magic-bytes MIME validation (not Content-Type header), UUID filename (anti-path-traversal), EXIF strip (privacy), ClamAV malware scan, dimension check (100×100px) | Sanitized image bytes                                |
| **PRE-PROCESS**  | OpenCV Pipeline  | CLAHE brightness/contrast normalization, Hough Circle Transform for plate boundary, homography perspective correction, ROI extraction                              | Standardized 512×512 plate image                     |
| **AI INFERENCE** | YOLOv8 Model     | 5-class detection with per-media-type confidence thresholds. NMS IoU 0.45. OOM guard (max 1024px).                                                                 | Annotated image + 5-class labels + confidence scores |
| **ESTIMATION**   | SA-001 Engine    | Area-based merged colony estimation: ratio of merged bbox area to median single colony area. Fallback = 2 if no reference. Per-bbox cap = 50 colonies.             | Estimated colony count per merged bbox               |
| **CALCULATION**  | CFU Module       | CFU/ml = Σ(valid colonies) ÷ (Volume × Dilution Factor). TNTC/TFTC per ISO 4833-1:2013. GUM uncertainty (k=2, ~95%) per ISO/IEC Guide 98-3:2008.                   | CFU/ml value with uncertainty + flags                |
| **OUTPUT**       | Dashboard + LIMS | Analyst reviews color-coded bounding boxes, flags for review, digitally approves. PDF/CSV report generated. LIMS sync.                                             | Verified PDF/CSV + LIMS data export                  |

_(196 words including table content)_

---

## Impact & Outcome

### 3.1 Key Benefits of Adopting the Solution

- **Efficiency Gains:** Reduces TPC analysis time from 15–30 minutes to under 2 minutes per sample (85–90% reduction), enabling 5–8× more samples per analyst per day without adding headcount.
- **Consistency & Reproducibility:** Eliminates inter-analyst variability (22.7%–80% CV in manual counting) — every plate is processed through the same 5-class YOLOv8 model with per-media-type thresholds, producing identical results regardless of operator skill, supporting ISO 17025 reproducibility requirements.
- **Cost Reduction:** Estimated 40% reduction in labor cost per TPC test. A mid-sized lab processing 200 samples/day could save IDR 500 million – 1 billion/year in analyst labor hours.
- **Regulatory Compliance:** SHA-256 chained immutable audit trail with timestamped records and analyst sign-off supports BPOM, KAN, ISO 17025, SNI 2897:2008, and UU PDP Indonesia accreditation audit requirements.
- **Metrological Traceability:** SA-001 area-based merged colony estimation and GUM measurement uncertainty (ISO/IEC Guide 98-3:2008) provide scientifically valid results suitable for ISO 17025 accreditation.
- **Democratization of Quality:** Junior analysts and smaller regional laboratories gain access to expert-level classification accuracy across all 5 object classes, reducing the quality gap across Indonesia.
- **Error Prevention:** Automated TNTC/TFTC flags per ISO 4833-1:2013 prevent release of invalid results. GUM measurement uncertainty provides confidence intervals for every reported value.
- **Security:** Enterprise-grade security with Argon2 hashing, JWT blacklisting, anti-phishing engine, magic-bytes file validation, EXIF stripping, ClamAV malware scanning, account lockout, and 5-role RBAC.

_(198 words)_

### 3.2 Shorts and Mid-Term Outcomes

**Short-Term (0–6 Months Post-Deployment):**

- Pilot deployment in 2–3 partner laboratories validating ≥ 92% detection accuracy across PCA, VRBA, and BGBB media types for all 5 detection classes.
- Onboarding of 10–20 analysts through the web platform with embedded training materials explaining the 5-class classification system.
- Establishment of a labeled agar plate dataset of 1,477 images with 56,124 bounding box annotations across 5 classes, shared openly to advance Indonesian AI research in food safety.

**Mid-Term (6–24 Months Post-Deployment):**

- Expansion to 20+ accredited laboratories across Java and Sumatra. Target: 10,000+ TPC analyses processed monthly through the platform.
- Development of a mobile-native PWA for field data entry and result viewing.
- Full integration with LIMS platforms (SampleManager, LabVantage) for direct result synchronization.
- Revenue generation through SaaS subscription model, achieving operational sustainability within 18 months.
- Publication of validation study results in a peer-reviewed journal documenting model performance across all 5 detection classes.

_(163 words)_

---

## Innovation & Differentiation

### 4.1 What Makes Your Solution Different?

- **5-Class Artifact Intelligence:** ColonyAI is specifically trained to classify detections into all 5 classes (colony_single, colony_merged, bubble, dust_debris, media_crack), enabling precise artifact rejection with > 90% precision. Generic computer vision APIs cannot perform this domain-specific classification.
- **SA-001 Area-Based Merged Colony Estimation:** Unlike simple bounding box counting, ColonyAI estimates the actual number of colonies within merged colony regions using area ratio analysis against median single colony area — significantly improving accuracy for overlapping colonies.
- **Per-Media-Type Confidence Thresholds:** 8+ agar media types (PCA, VRBA, BGBB, TSA, TGEA, MacConkey, R2A, Other) each have optimized per-class confidence thresholds with alias mapping, ensuring reliable detection across diverse laboratory conditions.
- **GUM Measurement Uncertainty:** Every CFU/ml result includes expanded uncertainty (k=2, ~95% confidence) calculated per ISO/IEC Guide 98-3:2008, providing metrological traceability required for ISO 17025 accreditation.
- **SHA-256 Chained Audit Trail:** Immutable, append-only audit logs with cryptographic hash chaining ensure tamper-evident records. Every log entry includes the previous hash, making undetected modification computationally infeasible.
- **5-Role RBAC with Data Scoping:** Granular role-based access control (Super Admin, Admin, Manager, Analyst, Auditor) with query-level data scoping ensures appropriate access for each laboratory position.
- **Enterprise Security Stack:** Argon2 password hashing, JWT blacklisting, anti-phishing engine, magic-bytes file validation, UUID filename generation, EXIF stripping, ClamAV malware scanning, account lockout, and SecureHeadersMiddleware (HSTS, CSP, X-Frame-Options).
- **Indonesia-Contextual Design:** Built around BPOM/SNI reporting formats (A4 PDF, Times New Roman 12pt) and Bahasa Indonesia interface, addressing a gap where international tools lack local regulatory context.
- **No Hardware Lock-in:** Requires only a web browser. Commercial alternatives require proprietary hardware costing USD 15,000–60,000, excluding most Indonesian labs.

_(199 words)_

### 4.2 Positioning of the Solution Compared to Existing Approaches or Products

| Feature                         | ColonyAI     | Manual Counting | ProtoCOL 3  | SphereFlash | Generic AI API |
| ------------------------------- | ------------ | --------------- | ----------- | ----------- | -------------- |
| 5-Class Detection               | ✓            | ✗               | Partial     | Partial     | ✗              |
| Artifact Differentiation        | ✓            | ✗               | Partial     | Partial     | ✗              |
| SA-001 Merged Estimation        | ✓            | ✗               | ✗           | ✗           | ✗              |
| Per-Media Thresholds (8+ types) | ✓            | ✗               | ✗           | ✗           | ✗              |
| GUM Uncertainty                 | ✓            | ✗               | ✗           | ✗           | ✗              |
| SHA-256 Audit Chain             | ✓            | ✗               | ✗           | ✗           | ✗              |
| 5-Role RBAC                     | ✓            | ✗               | ✗           | ✗           | ✗              |
| Anti-Phishing Engine            | ✓            | ✗               | ✗           | ✗           | ✗              |
| Magic-bytes Validation          | ✓            | ✗               | ✗           | ✗           | ✗              |
| No Special Hardware             | ✓            | ✓               | ✗           | ✗           | ✓              |
| Indonesian Regulatory Format    | ✓            | ✗               | ✗           | ✗           | ✗              |
| LIMS Integration                | ✓            | ✗               | Limited     | Limited     | Custom         |
| SaaS / Cloud Access             | ✓            | ✗               | ✗           | ✗           | ✓              |
| Per-Class Confidence Scores     | ✓            | ✗               | ✗           | ✗           | Partial        |
| Cost                            | IDR 500K+/mo | Analyst salary  | >USD 15K HW | >USD 30K HW | Custom dev     |

ColonyAI is the only solution that combines all critical capabilities — 5-class detection, artifact rejection, merged colony estimation, metrological uncertainty, enterprise security, and Indonesian regulatory compliance — in a single, affordable, hardware-free SaaS platform.

_(148 words)_

---

## Technical Approach

### 5.1 Main Solution

| Layer            | Technology                    | Justification                                                                                                              |
| ---------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| AI Model         | YOLOv8n / YOLOv8s             | Real-time single-pass detection; 5-class simultaneous classification; ONNX export for CPU edge inference; < 50ms per image |
| Backend          | FastAPI (Python)              | Async REST API serving YOLOv8 inference; Pydantic validation; Python-native AI/ML ecosystem; auto-generated OpenAPI docs   |
| Frontend         | Next.js 14 + TypeScript       | SSR for fast initial load; React for rich interactive annotation dashboard; TypeScript for type-safe codebase              |
| UI               | Tailwind CSS + shadcn/ui      | Rapid, accessible component library; class-level color-coding for all 5 detection classes                                  |
| Image Processing | OpenCV + Pillow               | Hough Circle Transform for plate boundary; CLAHE normalization; homography perspective correction; ROI extraction          |
| File Security    | python-magic + piexif + clamd | Magic-bytes MIME validation; UUID filename; EXIF strip; ClamAV malware scan                                                |
| Auth Security    | Argon2 + JWT + Anti-Phishing  | Argon2 password hashing; JWT with JTI blacklisting; anti-phishing engine                                                   |
| Database         | PostgreSQL                    | ACID-compliant for ISO 17025 audit trails; SHA-256 chained audit logs; 5-role RBAC                                         |
| Deployment       | Railway + Vercel + AWS S3     | Auto-scaling Docker containers; CDN for frontend; encrypted S3 for image storage                                           |
| Middleware       | SecureHeadersMiddleware       | HSTS (1yr, includeSubDomains, preload); CSP; X-Frame-Options: DENY; X-XSS-Protection                                       |
| Model Training   | Google Colab + Roboflow       | Free GPU fine-tuning; dataset annotation and augmentation management                                                       |

_(149 words)_

### 5.2 Technology Selection and Implementation

YOLOv8 was selected because it provides the optimal balance of speed (< 50ms per image on CPU) and accuracy for a real-time web application, while natively supporting multi-class detection — essential for our 5-class taxonomy. Unlike two-stage detectors (e.g., Faster R-CNN), YOLOv8 processes the entire image in a single forward pass, enabling deployment without GPU hardware. Next.js provides hybrid SSR/CSR for fast dashboard loading. FastAPI delivers a clean, auto-documented REST API with Pydantic validation ensuring data integrity. PostgreSQL ensures ACID compliance for audit trail records — a non-negotiable requirement for ISO 17025 accreditation. Argon2 was chosen over bcrypt for password hashing due to its resistance to GPU-based attacks. JWT blacklisting via JTI (JWT ID) tracking enables secure logout. The anti-phishing engine provides multi-layer defense against credential stuffing and admin account targeting. Magic-bytes file validation via python-magic prevents MIME spoofing attacks that Content-Type header checking cannot detect.

_(148 words)_

### 5.3 Solution Algorithm

- **Phase 0 — Security Validation:** Magic-bytes MIME type verification via python-magic (not Content-Type header), UUID filename generation (anti-path-traversal), EXIF metadata stripping via piexif (GPS privacy), ClamAV malware scanning (fail-open with warning), minimum dimension check (100×100px), NaN/Inf dilution factor guard.

- **Phase 1 — Plate Localization:** CLAHE (Contrast Limited Adaptive Histogram Equalization) adaptive histogram equalization normalizes brightness/contrast. Hough Circle Transform (OpenCV) detects the circular agar plate boundary and creates a region-of-interest mask. Perspective correction via homography transform normalizes elliptical plate views. ROI extraction isolates the agar area, with minimum size guard to prevent extreme distortion.

- **Phase 2 — 5-Class Detection & Classification:** Fine-tuned YOLOv8 performs simultaneous object detection across all 5 classes (colony_single, colony_merged, bubble, dust_debris, media_crack) with per-media-type confidence thresholds from alias-mapped configuration. NMS with IoU threshold 0.45 resolves overlapping bounding boxes. SA-001 area-based estimation calculates actual colony count within merged regions: estimated_count = round(area_merged_bbox / median_area_single_bbox), with fallback = 2 and per-bbox cap = 50. OOM guard caps input at 1024px.

- **Phase 3 — Count Validation & CFU Calculation:** Post-processing filters detections by per-class thresholds. Only colony_single and colony_merged contribute to the final count. CFU/ml = Σ(valid colonies) ÷ (plated_volume_ml × dilution_factor). Results outside 25–250 CFU trigger TNTC/TFTC flags per ISO 4833-1:2013. GUM measurement uncertainty (k=2, ~95% confidence) is calculated per ISO/IEC Guide 98-3:2008.

_(149 words)_

### 5.4 Primary Data or Input Used

- **Custom Labeled Dataset:** 1,477 agar plate images with 56,124 bounding box annotations across 5 classes (colony_single, colony_merged, bubble, dust_debris, media_crack), manually annotated and validated by domain experts. This is the primary training and validation dataset.

- **YOLOv8 Built-in Augmentation:** During training, the pipeline applies mosaic (100%), flip (50%), HSV color jittering, rotation (±15°), and scaling (±50%), effectively expanding the dataset 3–5× to ~5,000+ augmented samples per epoch, improving model generalization across all 5 classes.

- **AGAR Public Dataset Integration (Roadmap):** 18,000+ additional images from Macquarie University (DOI: 10.1038/s41598-021-99300-z) planned for Phase 2 to further improve mAP on rare classes (media_crack, dust_debris).

- **Partner Laboratory Data (Pilot Phase):** 500–1,000 locally captured images from Indonesian laboratories to fill domain-adaptation gaps and ensure local relevance for BPOM compliance.

**Data quality controls:** Minimum resolution 800×800px; annotation review by two independent annotators; class balance verification ensuring all 5 classes are represented; exclusion of plates with ≥ 300 CFU (TNTC) from training; full anonymization of partner laboratory sample IDs before storage.

_(172 words)_

### 5.5 Security and Scalability Considerations

- **Data Security:** All uploaded images stored in encrypted AWS S3 buckets with signed URLs expiring in 1 hour. Role-Based Access Control (RBAC) ensures analysts only access their laboratory's data. JWT authentication with JTI blacklisting required on all API endpoints. HTTPS enforced throughout. Argon2 password hashing resists GPU-based brute-force attacks.

- **Compliance:** Immutable, append-only PostgreSQL audit log with SHA-256 hash chaining stores every detection event including class labels and confidence scores. Supports ISO 17025, BPOM, KAN, and UU PDP Indonesia accreditation audit requirements.

- **Scalability:** FastAPI deployed as containerized Docker image on Railway with horizontal auto-scaling. Next.js frontend served via Vercel CDN. PgBouncer connection pooling for concurrent multi-laboratory access. ONNX export enables CPU-only inference, eliminating GPU dependency for deployment.

- **Model Versioning:** MLflow tracks all model versions. New deployments require ≥ 2% improvement on the held-out validation set across all 5 classes before replacing the production model, ensuring continuous quality improvement without regression.

_(148 words)_

---

## Implementation Feasibility

### 6.1 Invention Status

**Current Stage:** Prototype / Proof of Concept (POC)

The ColonyAI system has been partially implemented with the following components in working state:

- **AI Model:** YOLOv8 fine-tuned on 1,477 custom-labeled images with 5-class detection capability. Model training pipeline, ONNX export, and inference engine are functional.
- **Backend API:** FastAPI backend with image upload, security validation (magic-bytes, UUID filename, EXIF strip, ClamAV), OpenCV preprocessing (CLAHE, Hough Circle, homography), YOLOv8 inference, SA-001 merged estimation, CFU/ml calculation with GUM uncertainty, and SHA-256 chained audit logging.
- **Frontend Dashboard:** Next.js 14 web application with image upload interface, annotated result display with color-coded bounding boxes for all 5 classes, CFU/ml results with uncertainty, and test history.
- **Database:** PostgreSQL schema with 10+ tables supporting users, 5-role RBAC, test results, 5-class detection counts, audit logs, and simulator data.
- **Security:** Argon2 password hashing, JWT authentication with blacklisting, anti-phishing engine, SecureHeadersMiddleware, account lockout, and role-based data scoping — all implemented.

### 6.2 Is the Innovation Realistic to Build?

- **Proven AI Foundation:** YOLOv8 is a well-documented, open-source framework with extensive community support. Multi-class colony detection using YOLO architectures has been demonstrated in peer-reviewed academic papers, confirming technical viability for our 5-class taxonomy.
- **Team Expertise:** Our team combines strong React/Next.js frontend experience, Python/FastAPI backend skills, and computer vision knowledge — covering all required technical domains.
- **Available Training Data:** 1,477 custom-labeled images with 56,124 bounding boxes are already prepared. The AGAR public dataset provides an additional 18,000+ images for Phase 2 expansion.
- **Low Infrastructure Cost:** Google Colab (free GPU) for training and Railway/Vercel free tiers keep costs near zero during the prototype phase — critical for a student team.
- **Modular Architecture:** Each component (AI model, FastAPI, Next.js frontend, PostgreSQL) can be developed and tested independently, enabling parallel workstreams across all team members.

_(148 words)_

### 6.3 Development Stages

| Phase             | Timeline | Deliverables                                                                                                           | Owner         |
| ----------------- | -------- | ---------------------------------------------------------------------------------------------------------------------- | ------------- |
| 1 — Foundation    | Week 1   | Dataset finalization & annotation QA (5 classes), YOLOv8 fine-tuning, PostgreSQL schema setup, FastAPI scaffold        | Wisnu / Faras |
| 2 — Core Platform | Week 2   | FastAPI backend with full inference pipeline, Next.js dashboard with annotated image display, Simulator module         | Full Team     |
| 3 — Integration   | Week 3   | CFU/ml calculator with GUM uncertainty, PDF/CSV report export (BPOM format), LIMS API integration, SHA-256 audit chain | Full Team     |
| 4 — QA & Launch   | Week 4   | System-wide testing across all 5 classes, UI polish, security audit, documentation, demo preparation                   | Full Team     |

**Sprint Methodology:** Agile Scrum with 1-week sprints. Daily standups track progress via GitHub Projects Kanban board. Definition of done includes: feature passes acceptance criteria, code reviewed, tests written, and PO sign-off. Each sprint ends with a review and retrospective.

_(172 words)_

### 6.4 Business Model and Sustainability

**Business Model Canvas:**

| Component             | Details                                                                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Customer Segments** | KAN-accredited testing labs, food manufacturers (QC departments), hospital labs, government regulators (BPOM)                                                      |
| **Value Proposition** | 85% faster TPC analysis, ≥ 92% detection accuracy, ISO 17025-compliant audit trails, no special hardware required — at 1/100th the cost of commercial alternatives |
| **Channels**          | Direct sales to laboratories, partnerships with LIMS vendors, university research collaborations                                                                   |
| **Revenue Streams**   | SaaS subscription: Starter (IDR 500K/mo, 500 analyses), Professional (IDR 1.5M/mo, unlimited), Enterprise (custom pricing with LIMS integration, SLA, training)    |
| **Key Resources**     | YOLOv8 model, custom labeled dataset, cloud infrastructure, domain expertise in food safety microbiology                                                           |
| **Key Activities**    | Model retraining & improvement, customer onboarding, regulatory compliance maintenance, LIMS integration development                                               |
| **Key Partners**      | KAN-accredited labs (distribution & validation), LIMS vendors (integration), BPOM (regulatory validation), university microbiology departments (R&D)               |
| **Cost Structure**    | Cloud hosting (Railway/AWS), model retraining, customer support, compliance & security audits, dataset annotation                                                  |

**Sustainability:** At IDR 500K/month, a lab processing 200 samples/day saves an estimated IDR 15–20 million/month in analyst time — a 30–40× ROI. Free pilot deployment in 3 laboratories for the first 6 months builds validation data and testimonials for commercial scaling. Revenue from Professional and Enterprise tiers funds ongoing model improvement and infrastructure costs.

_(198 words)_

---

## Attachment & Reference

### Attachments

**UI Wireframe — ColonyAI Dashboard (Upload Page)**

```
┌─────────────────────────────────────────────────────┐
│  ColonyAI 🧫                    [User] [Settings]   │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌──────────────────────────┐ │
│  │   Drop zone or  │  │  Sample Information      │ │
│  │   camera icon   │  │  Sample ID: [________]   │ │
│  │   📷            │  │  Media Type: [PCA ▼]     │ │
│  │                 │  │  Dilution Factor: [10⁻²] │ │
│  │ "Upload plate   │  │  Plated Volume: [1.0 ml] │ │
│  │  image"         │  │  [🔍 Analyze Plate]      │ │
│  └─────────────────┘  └──────────────────────────┘ │
│  Recent Tests: [table with Date, Sample, CFU/ml]   │
└─────────────────────────────────────────────────────┘
```

**UI Wireframe — Results Dashboard (5-Class Annotated View)**

```
┌────────────────────────────────────────────────────────────┐
│  ColonyAI 🧫  →  Result: SMP-2026-0042    [Export] [Back] │
├────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────┐  ┌────────────────────────┐ │
│  │  [Annotated Plate Image] │  │  Detection Summary     │ │
│  │  Color-coded boxes:      │  │  🟢 colony_single:  87 │ │
│  │  🟢 Green = single      │  │  🟡 colony_merged:  12 │ │
│  │  🟡 Yellow = merged     │  │  🔴 Bubble:          3 │ │
│  │  🔴 Red = bubble        │  │  🟠 Dust/Debris:     1 │ │
│  │  🟠 Orange = dust       │  │  🟣 Media Crack:      0 │ │
│  │  🟣 Purple = crack      │  │  Total Valid:       99 │ │
│  │                          │  │  CFU/ml:     9,900    │ │
│  └──────────────────────────┘  │  Reliability:   94.2% │ │
│   Hover: "colony_single 96.3%" │  Status: ✅ Normal    │ │
│                                │  [✏️ Edit] [✓ Approve]│ │
│                                └────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

**UI Wireframe — Simulator (AI vs Manual Comparison)**

```
┌──────────────────────────────────────────────────────────┐
│  ColonyAI 🧫  →  Simulator              [Dashboard]      │
├──────────────────────────────────────────────────────────┤
│  Sample: SMP-2026-0042  |  Media: PCA  |  Dilution: 10⁻²│
│  ┌────────────────────────────────────────────────────┐ │
│  │  Class           │ AI Count │ Manual │ Agreement  │ │
│  │  🟢 colony_single│    87    │ [__]  │   --%      │ │
│  │  🟡 colony_merged│    12    │ [__]  │   --%      │ │
│  │  🔴 Bubble       │     3    │ [__]  │   --%      │ │
│  │  🟠 Dust/Debris  │     1    │ [__]  │   --%      │ │
│  │  🟣 Media Crack  │     0    │ [__]  │   --%      │ │
│  │  ──────────────────────────────────────────────    │ │
│  │  Overall Accuracy: --%  │  Error Margin: ±--       │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### References

1. ASTM F2944 — Standard Test Method for Automated Colony Forming Unit (CFU) Assays. ASTM International, 2024.
2. FDA Bacteriological Analytical Manual (BAM), Chapter 3: Aerobic Plate Count. U.S. Food and Drug Administration, 2023.
3. BPOM Indonesia. Annual Report on Food Product Surveillance and Microbiological Non-Conformance. Badan Pengawas Obat dan Makanan Republik Indonesia, 2023.
4. ISO 4833-1:2013 — Microbiology of the food chain — Horizontal method for the enumeration of microorganisms — Part 1: Colony count at 30 °C by the pour plate technique.
5. ISO/IEC Guide 98-3:2008 (GUM) — Guide to the Expression of Uncertainty in Measurement.
6. ISO 17025:2017 — General requirements for the competence of testing and calibration laboratories.
7. SNI 2897:2008 — Cara uji cemaran mikroba dalam daging, telur, dan susu, serta hasil olahannya.
8. Jocher, G., Chaurasia, A., & Qiu, J. (2023). YOLOv8 — Ultralytics. GitHub Repository. https://github.com/ultralytics/ultralytics
9. Ferrari, A., et al. (2021). AGAR: A dataset of microbial colony images. Scientific Reports, 11, 18312. DOI: 10.1038/s41598-021-99300-z.
10. UU PDP Indonesia — Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi.
