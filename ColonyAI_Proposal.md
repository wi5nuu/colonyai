# ColonyAI — AI Open Innovation Challenge 2026

**AI-Powered Automated Plate Count Reader for Microbiology Laboratories**

---

## TEAM IDENTITY

| Field | Details |
|-------|---------|
| **Team Name** | ColonyAI |
| **Team Leader** | Wisnu Alfian Nur Ashar |
| **WhatsApp** | +62 813-9488-2490 |
| **Email** | wisnu.ashar@student.president.ac.id |
| **Institution** | President University — Bachelor of Information Technology |
| **Portfolio** | https://github.com/wi5nuu |
| **GitHub Repository** | https://github.com/wi5nuu/colonyai |

### Team Members

| No. | Name | Role |
|-----|------|------|
| 1 | Wisnu Alfian Nur Ashar | Product Owner & Frontend Lead |
| 2 | Faras | Scrum Master & AI/CV Integration |
| 3 | Suci | Developer (UI/UX Designer) |
| 4 | Steven | Developer (Data Analyst & QA Engineer) |
| 5 | Faras | Developer (Business Analyst & Documentation) |

---

## EXECUTIVE SUMMARY
*(Max. 150 Words)*

ColonyAI is an AI-powered Automated Plate Count Reader that modernizes Total Plate Count (TPC) testing in microbiology laboratories. Analysts currently count bacterial colonies manually — a process that is time-consuming, inconsistent, and operator-dependent, with inter-analyst variability reaching up to 23.4% (AOAC International). Our solution integrates a fine-tuned YOLOv8 computer vision model with a React/Next.js web dashboard to automate colony detection, classification across 5 object classes, and CFU/ml calculation in real time. The system addresses lighting variation, overlapping colonies, and artifact interference, while maintaining analyst verification as the final validation layer. By reducing analysis time by up to 80% and delivering consistent, reproducible results, ColonyAI directly supports laboratory efficiency, food safety compliance, and public health assurance for Indonesia's 500+ accredited microbiology testing facilities and the broader ASEAN market.

---

## PROBLEM STATEMENT

### Selected Case Statement
**Case 1 — Microbiology Laboratory: Automated Plate Count Reader**

### Selected Sub-Case Statement
Automated detection, counting, and CFU/ml reporting of bacterial colonies from agar plate images, with classification across 5 object classes (colony_single, colony_merged, bubble, dust_debris, media_crack) and differentiation between valid colonies and artifacts, integrated into a web-based laboratory dashboard.

### Main Objectives
*(Max. 200 Words)*

The primary objective of ColonyAI is to eliminate human error and inconsistency from Total Plate Count (TPC) workflows in food safety and environmental microbiology laboratories. Specific targets include:

- Achieve colony detection accuracy of ≥ 92% across diverse media types and lighting conditions, benchmarked against expert manual counting standards.
- Reduce TPC analysis time from 15–30 minutes per sample to under 2 minutes through an automated image analysis pipeline.
- Classify all detected objects into 5 defined classes (colony_single, colony_merged, bubble, dust_debris, and media_crack) with artifact rejection precision > 90%.
- Deliver consistent CFU/ml calculations with automated dilution factor integration, removing dependency on analyst experience level.
- Provide a digital audit trail integrated with LIMS, supporting regulatory compliance with ISO 17025 and SNI standards.
- Deploy a scalable, multi-laboratory SaaS platform accessible via web browser, requiring no special hardware beyond a standard camera or smartphone.

---

## PROBLEM DEFINITION

### What is the main problem?
*(Max. 200 Words)*

In Indonesian microbiology laboratories, Total Plate Count (TPC) remains the gold standard for measuring microbial contamination in food, water, and environmental samples. However, the current process is entirely manual — an analyst physically counts colonies on an agar plate using a colony counter device or pen-tally under magnification. This creates three critical operational failures: (1) **Inconsistency** — two analysts counting the same plate routinely differ by 10–25%; (2) **Throughput Bottleneck** — a single analyst processes only 20–40 plates/hour, causing backlogs during peak periods (post-Eid food inspections, outbreak investigations); (3) **Skill Dependency** — accurate counting requires significant experience, leaving junior analysts and under-resourced laboratories unable to reliably distinguish the 5 object classes present on a plate: valid colonies and 3 types of non-colony artifacts. This bottleneck directly impacts public health decision-making, food safety enforcement, and laboratory accreditation.

### Who is impacted and to what scale?
*(Max. 150 Words)*

- **Food industry manufacturers** (FMCG, dairy, beverage) — depend on rapid and reliable TPC results for production release decisions and shelf-life validation. Delayed or inaccurate results risk product recalls worth billions of rupiah.
- **Government regulators** (BPOM, Dinas Kesehatan) — require standardized, auditable microbial testing records for product certification and enforcement actions.
- **Third-party testing laboratories** (KAN-accredited) — face increasing sample volumes with limited analyst resources.
- **Hospitals and clinical labs** — environmental monitoring and food safety testing directly impacts patient safety protocols.

Indonesia alone has over 500 accredited microbiology testing facilities. The Asia-Pacific food testing market is projected to exceed USD 7 billion by 2027, representing an enormous addressable scale for this solution.

### Prove the problem
*(Max. 180 Words)*

| No. | Source | Key Finding |
|-----|--------|-------------|
| 1 | Journal of AOAC International | Inter-analyst variability in manual colony counting reached up to 23.4% for high-density plates (>150 CFU), directly violating ISO 17025 reproducibility requirements. |
| 2 | FDA Bacteriological Analytical Manual (2023) | Countable-range plates (25–250 CFU) yield significant analyst variation, particularly for non-circular or overlapping colonies — identical to the colony_merged class in ColonyAI. |
| 3 | BPOM Indonesia (2023) | 18% of food product violations involved microbiological non-conformance; many cases likely go undetected due to inconsistent testing methodology. |
| 4 | Indonesian Lab Industry Survey (2024, n=12) | Colony counting constitutes 40–60% of analyst working hours in TPC workflows — the single largest labor cost in microbiological analysis. |

---

## PROPOSED SOLUTION

### Main Solution
*(Max. 200 Words)*

ColonyAI is a web-based intelligent laboratory platform that transforms agar plate images into accurate, standardized CFU/ml reports in under two minutes. The system integrates three tightly coupled components:

- **AI Vision Engine:** A fine-tuned YOLOv8 object detection model trained on 8+ agar media types. The model simultaneously detects the plate boundary and classifies all detected objects into exactly 5 classes: colony_single, colony_merged, bubble, dust_debris, and media_crack. Only colony_single and colony_merged are counted toward CFU/ml; the remaining 3 classes (bubble, dust_debris, media_crack) are flagged as artifacts and excluded.
- **Intelligent Web Dashboard (Next.js):** Analysts upload plate images via browser or mobile camera. The dashboard displays annotated results with color-coded bounding boxes per class, CFU/ml calculations, historical test records, and trend analytics. Results require digital analyst sign-off before final submission.
- **Simulator & Reporting Module:** A built-in benchmarking tool allowing labs to compare AI counting accuracy against manual counts. Reports are exportable in PDF and CSV formats compatible with LIMS. No specialized hardware is required.

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
│  │            FastAPI Backend (Railway Docker)                 │   │
│  │  ┌────────────┐ ┌────────────┐ ┌──────────┐ ┌───────────┐  │   │
│  │  │  Image     │ │  OpenCV    │ │  YOLOv8  │ │  CFU/ml   │  │   │
│  │  │  Ingest    │ │  Pre-proc  │ │ Inference│ │ Calculator│  │   │
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
│  │  Input: 800×800px → NMS (IoU 0.45) → Conf. Threshold 0.60  │  │
│  │  Output: BBox + Class Label + Confidence Score per detection │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                    │
│  ┌──────────────────────┐      ┌──────────────────────────────┐   │
│  │  PostgreSQL          │      │  AWS S3 (Encrypted)          │   │
│  │  ┌────────────────┐  │      │  ┌────────────────────────┐  │   │
│  │  │ Users & RBAC   │  │      │  │ Plate Images           │  │   │
│  │  │ Test Results   │  │      │  │ Signed URLs (1hr)      │  │   │
│  │  │ Audit Log      │  │      │  │ Encrypted at Rest      │  │   │
│  │  │ 5-Class Counts │  │      │  └────────────────────────┘  │   │
│  │  │ CFU/ml Records │  │      └──────────────────────────────┘   │
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

**Data Flow:** `Upload → Pre-process → 5-Class AI Inference → CFU Calculation → Analyst Review → Digital Sign-off → Export/LIMS`

### How does the solution work?
*(Max. 200 Words)*

| Stage | Component | Action | Output |
|-------|-----------|--------|--------|
| **INPUT** | Browser / Mobile | Analyst uploads plate photo. Enters: Sample ID, dilution factor, media type. | Raw image + metadata |
| **PRE-PROCESS** | OpenCV Pipeline | Brightness/contrast normalization, perspective correction, Hough Circle Transform for plate boundary extraction. | Standardized plate image |
| **AI INFERENCE** | YOLOv8 Model | Object detection classifies all regions into 5 classes: colony_single, colony_merged, bubble, dust_debris, media_crack. NMS with IoU threshold 0.45. | Annotated image + 5-class labels + confidence scores |
| **CALCULATION** | CFU Module | Sum colony_single + colony_merged detections above confidence threshold 0.60. CFU/ml = Count ÷ (Volume × Dilution Factor). TNTC/TFTC flags if outside 25–250 CFU. | CFU/ml value with flags |
| **OUTPUT** | Dashboard + LIMS | Analyst reviews color-coded bounding boxes, edits if needed, digitally approves. Report generated. | Verified PDF/CSV + LIMS data export |

---

## IMPACT & OUTCOME

### Key Benefits of Adopting the Solution
*(Max. 200 Words)*

- **Efficiency Gains:** Reduces TPC analysis time from 15–30 minutes to under 2 minutes per sample (85–90% reduction), enabling 5–8× more samples per analyst per day without adding headcount.
- **Consistency & Reproducibility:** Eliminates inter-analyst variability — every plate is processed through the same 5-class YOLOv8 model, producing identical results regardless of operator skill, supporting ISO 17025 reproducibility requirements.
- **Cost Reduction:** Estimated 40% reduction in labor cost per TPC test. A mid-sized lab processing 200 samples/day could save IDR 500 million – 1 billion/year in analyst labor hours.
- **Regulatory Compliance:** Digital audit trail with timestamped records and analyst sign-off supports BPOM, KAN, and ISO 17025 accreditation audit requirements.
- **Democratization of Quality:** Junior analysts and smaller regional laboratories gain access to expert-level classification accuracy across all 5 object classes, reducing the quality gap across Indonesia.
- **Error Prevention:** Automated TNTC (Too Numerous To Count) and TFTC (Too Few To Count) flags prevent release of invalid results that might otherwise go unchecked under manual workflows.

### Short and Mid-Term Outcomes
*(Max. 200 Words)*

**Short-Term (0–6 Months Post-Deployment):**
- Pilot deployment in 2–3 partner laboratories validating ≥ 92% detection accuracy across Plate Count Agar (PCA), VRBA, and BGBB media types for all 5 detection classes.
- Onboarding of 10–20 analysts through the web platform with embedded training materials explaining the 5-class classification system.
- Establishment of a labeled agar plate dataset of 5,000+ images with annotations across all 5 classes, shared openly to advance Indonesian AI research in food safety.

**Mid-Term (6–24 Months Post-Deployment):**
- Expansion to 20+ accredited laboratories across Java and Sumatra. Target: 10,000+ TPC analyses processed monthly through the platform.
- Development of a mobile-native PWA capture module enabling field sampling with smartphone cameras.
- Integration with LIMS platforms (SampleManager, LabVantage) for direct result synchronization.
- Revenue generation through SaaS subscription model, achieving operational sustainability within 18 months.
- Publication of validation study results in a peer-reviewed journal documenting model performance across all 5 detection classes.

---

## INNOVATION & DIFFERENTIATION

### What Makes Your Solution Different?
*(Max. 200 Words)*

- **5-Class Artifact Intelligence:** ColonyAI is specifically trained to classify detections into all 5 classes (colony_single, colony_merged, bubble, dust_debris, and media_crack), enabling precise artifact rejection with > 90% precision. Generic computer vision APIs cannot perform this domain-specific classification.
- **Confidence Transparency:** Every detection result includes per-class confidence scores and a plate-level reliability indicator. Analysts see exactly where the model is uncertain, enabling targeted human review.
- **Media-Agnostic Architecture:** Trained across 8+ agar media types with varying colony morphologies and plate colors. Competing solutions typically train on a single media type (PCA white plates), making them unreliable in real laboratory environments.
- **Indonesia-Contextual Design:** Built around BPOM/SNI reporting formats and Bahasa Indonesia interface, addressing a gap where international tools lack local regulatory context.
- **No Hardware Lock-in:** Requires only a standard camera and web browser. Commercial alternatives (ProtoCOL 3, SphereFlash) require proprietary hardware costing USD 15,000–60,000, excluding most Indonesian labs.

### Positioning Compared to Existing Approaches
*(Max. 200 Words)*

| Feature | ColonyAI | Manual | ProtoCOL 3 | SphereFlash | Generic AI |
|---------|----------|--------|------------|-------------|------------|
| 5-Class Detection | ✓ | ✗ | Partial | Partial | ✗ |
| Artifact Differentiation | ✓ | ✗ | Partial | Partial | ✗ |
| No Special Hardware | ✓ | ✓ | ✗ | ✗ | ✓ |
| Indonesian Regulatory | ✓ | ✗ | ✗ | ✗ | ✗ |
| LIMS Integration | ✓ | ✗ | Limited | Limited | Custom |
| SaaS / Cloud Access | ✓ | ✗ | ✗ | ✗ | ✓ |
| Confidence per Class | ✓ | ✗ | ✗ | ✗ | Partial |
| Cost | IDR 500K+/mo | Analyst salary | >USD 15K HW | >USD 30K HW | Custom dev |

---

## TECHNICAL APPROACH

### Main Solution — Technology Stack
*(Max. 150 Words)*

| Layer | Technology | Justification |
|-------|-----------|---------------|
| AI Model | YOLOv8n / YOLOv8s | Real-time single-pass detection; 5-class simultaneous classification; ONNX export for CPU edge inference; < 50ms per image |
| Backend | FastAPI (Python) | Async REST API serving YOLOv8 inference; Pydantic validation; Python-native AI/ML ecosystem; auto-generated OpenAPI docs |
| Frontend | Next.js 14 + TypeScript | SSR for fast initial load; React for rich interactive annotation dashboard; TypeScript for type-safe codebase |
| UI | Tailwind CSS + shadcn/ui | Rapid, accessible component library; class-level color-coding for all 5 detection classes |
| Image Processing | OpenCV + Pillow | Hough Circle Transform for plate boundary; brightness/contrast normalization; perspective correction |
| Database | PostgreSQL + Supabase | ACID-compliant for ISO 17025 audit trails; real-time sync; Role-Based Access Control (RBAC) |
| Deployment | Railway + Vercel + AWS S3 | Auto-scaling Docker containers; CDN for frontend; encrypted S3 for image storage |
| Model Training | Google Colab + Roboflow | Free GPU fine-tuning; dataset annotation and augmentation management for all 5 classes |

### Technology Selection and Implementation
*(Max. 150 Words)*

YOLOv8 was selected because it provides the optimal balance of speed (< 50ms per image on CPU) and accuracy for a real-time web application, while natively supporting multi-class detection — essential for our 5-class taxonomy. Unlike two-stage detectors (e.g., Faster R-CNN), YOLOv8 processes the entire image in a single forward pass, enabling deployment without GPU hardware. Next.js provides hybrid SSR/CSR for fast dashboard loading. FastAPI delivers a clean, auto-documented REST API with Pydantic validation ensuring data integrity. PostgreSQL ensures ACID compliance for audit trail records — a non-negotiable requirement for ISO 17025 accreditation. This modular stack allows each component to be developed and tested independently, enabling parallel workstreams across the 5 team members. All 5 detection class outputs are stored with their bounding box coordinates, confidence scores, and class labels in a structured relational schema.

### Solution Algorithm
*(Max. 150 Words)*

- **Phase 1 — Plate Localization:** Hough Circle Transform (OpenCV) detects the circular agar plate boundary and creates a region-of-interest (ROI) mask, eliminating edge interference regardless of image framing or camera angle.
- **Phase 2 — 5-Class Detection & Classification:** Fine-tuned YOLOv8 performs simultaneous object detection across all 5 classes: colony_single, colony_merged, bubble, dust_debris, and media_crack. Non-Maximum Suppression (NMS) with IoU threshold 0.45 resolves overlapping bounding boxes. colony_merged detections are flagged with a dilution recommendation.
- **Phase 3 — Count Validation & CFU Calculation:** Post-processing applies confidence threshold 0.60 (configurable per lab). Only colony_single and colony_merged classes contribute to the final count. CFU/ml = Σ(valid colonies) ÷ (plated_volume_ml × dilution_factor). Results outside 25–250 CFU trigger TNTC/TFTC flags automatically.

---

## TECHNICAL APPROACH

### Primary Data or Input Used
*(Max. 200 Words)*

- **AGAR Public Dataset** (Macquarie University): 18,000+ annotated colony images across multiple media types — the largest publicly available benchmark for colony counting AI research (DOI: 10.1038/s41598-021-99300-z). Annotations will be re-labeled to match our 5-class taxonomy.
- **Roboflow Universe:** Additional bacterial colony and agar plate datasets for domain diversification and augmentation across all 5 object classes.
- **Synthetic Augmentation:** Roboflow pipeline generates 3× dataset expansion through random brightness/contrast shifts, rotation, horizontal/vertical flip, Gaussian blur, and mosaic augmentation — ensuring all 5 classes are well-represented under varied lighting and camera conditions.
- **Partner Laboratory Data (Pilot Phase):** 500–1,000 locally captured images from Indonesian laboratories, with annotations covering all 5 classes, filling domain-adaptation gaps from international datasets.

**Data quality controls:** minimum resolution 800×800px; annotation review by two independent annotators; class balance verification ensuring all 5 classes are represented; exclusion of plates with ≥ 300 CFU (TNTC) from training; full anonymization of partner laboratory sample IDs before storage.

### Security and Scalability Considerations
*(Max. 150 Words)*

- **Data Security:** All uploaded images stored in encrypted AWS S3 buckets with signed URLs expiring in 1 hour. Role-Based Access Control (RBAC) in Supabase ensures analysts only access their laboratory's data. JWT authentication required on all API endpoints. HTTPS enforced throughout.
- **Compliance:** Immutable, append-only PostgreSQL audit log with timestamps stores every detection event including class labels and confidence scores. Supports ISO 17025, BPOM, and KAN accreditation audit requirements.
- **Scalability:** FastAPI deployed as containerized Docker image on Railway with horizontal auto-scaling. Next.js frontend served via Vercel CDN. PgBouncer connection pooling for concurrent multi-laboratory access.
- **Model Versioning:** MLflow tracks all model versions. New deployments require ≥ 2% improvement on the held-out validation set across all 5 classes before replacing the production model.

---

## IMPLEMENTATION FEASIBILITY

### Invention Status

**Current Stage:** Idea / Conceptual Design. System architecture has been fully defined, technology stack selected, and the 5-class detection taxonomy established. Technical feasibility has been validated through review of existing YOLOv8 colony detection research literature and the AGAR public dataset. Development has not yet commenced.

### Is the Innovation Realistic to Build?
*(Max. 150 Words)*

- **Proven AI Foundation:** YOLOv8 is a well-documented, open-source framework with extensive community support. Multi-class colony detection using YOLO architectures has been demonstrated in peer-reviewed academic papers, confirming technical viability for our 5-class taxonomy.
- **Team Web Expertise:** Strong React/Next.js background enables rapid development of the dashboard frontend, which represents approximately 40% of total development effort.
- **Available Training Data:** The AGAR public dataset and Roboflow Universe provide an immediate starting point covering all 5 detection classes, eliminating the data acquisition bottleneck that stops most AI projects.
- **Low Infrastructure Cost:** Google Colab (free GPU) for training and Railway/Vercel free tiers keep costs near zero during the prototype phase — critical for a student team.
- **Modular Architecture:** Each component (AI model, FastAPI, Next.js frontend, PostgreSQL) can be developed and tested independently, enabling parallel workstreams across all 5 team members.

### Development Stages
*(Max. 180 Words)*

| Phase | Timeline | Deliverables | Owner |
|-------|----------|-------------|-------|
| 1 | Week 1–2 | Dataset collection & annotation for all 5 classes (AGAR + Roboflow + augmentation), environment setup, system architecture finalization | Product Owner + All |
| 2 | Week 3–5 | YOLOv8 model training v1 (5-class), FastAPI backend scaffold, Next.js project setup, PostgreSQL schema with class-level storage | Scrum Master + Devs |
| 3 | Week 6–8 | Model optimization targeting > 90% mAP across all 5 classes, Dashboard UI: upload, result view with class color-codes, test history | All Members |
| 4 | Week 9–11 | Full system integration, CFU/ml calculation module (colony_single + colony_merged), PDF/CSV report export, user authentication | Full Team |
| 5 | Week 12–14 | Internal testing, UI polish, documentation, pilot lab testing, sprint review & hackathon demo preparation | Full Team |

---

## IMPLEMENTATION FEASIBILITY

### Business Model and Sustainability
*(Max. 200 Words)*

| Revenue Streams | Cost Structure | Key Partners |
|----------------|---------------|--------------|
| **SaaS Subscription:**<br>• Starter: IDR 500K/mo (500 analyses)<br>• Professional: IDR 1.5M/mo (unlimited)<br>• Enterprise: Custom + LIMS + SLA + training | • Cloud hosting (Railway/AWS)<br>• Model retraining across 5 classes<br>• Customer support & sales<br>• Compliance & security audits<br>• Dataset annotation maintenance | • KAN-accredited labs (distribution)<br>• LIMS vendors (integration)<br>• BPOM (regulatory validation)<br>• University microbiology depts.<br>• Jababeka lab tenants (pilot) |

**Value Proposition:** At IDR 500K/month, a laboratory processing 200 samples/day saves an estimated IDR 15–20 million/month in analyst time — a 30–40× ROI. The platform will be offered free to 3 pilot laboratories during the first 6 months post-launch in exchange for validation data across all 5 detection classes and testimonials, building the evidence base for commercial scaling.

---

## AGILE SCRUM DEVELOPMENT PLAN

### 1. Team Roles

| # | Name | Scrum Role | Responsibilities |
|---|------|------------|-----------------|
| 1 | Wisnu Alfian Nur Ashar | Product Owner | Defines product vision and roadmap; owns and prioritizes the Product Backlog; writes and validates User Stories; accepts or rejects completed features; liaises with stakeholders (labs, BPOM, LIMS vendors). |
| 2 | Faras | Scrum Master | Facilitates all Scrum ceremonies (Daily Standup, Sprint Planning, Sprint Review, Retrospective); removes team impediments; enforces Definition of Done; tracks sprint velocity and burndown. |
| 3 | Suci | Developer (UI/UX) | Designs and implements the Next.js dashboard interface; creates wireframes and Figma mockups; implements color-coded bounding box display for all 5 detection classes; ensures mobile-responsive layout. |
| 4 | Steven | Developer (QA/Docs) | Writes and executes test cases for all 5 detection classes; performs cross-browser and cross-device testing; maintains technical documentation; prepares sprint reports and final proposal documentation. |
| 5 | Faras | Developer (BA/Docs) | Conducts business analysis; maintains stakeholder documentation; prepares competitive analysis; supports sprint reporting and final proposal documentation. |

### 2. Product Backlog

| ID | Priority | User Story | Acceptance Criteria | Category | Points |
|----|----------|-----------|--------------------|----------|--------|
| PB-01 | 🔴 MUST | As an analyst, I want to upload a plate image and have the AI automatically identify the plate boundary so that only the agar area is analyzed. | Given a plate photo, when uploaded, then Hough Circle Transform detects boundary within ±5px; non-plate area is masked and excluded from inference. | Feature | 8 |
| PB-02 | 🔴 MUST | As an analyst, I want the AI model to classify every detected object into exactly one of 5 classes (colony_single, colony_merged, bubble, dust_debris, media_crack) so that valid colonies are distinguished from artifacts. | Given a standardized plate image, when inference runs, then all detections have exactly one class label from the 5-class taxonomy; no undefined or null class labels exist; per-class confidence scores are returned. | Feature | 13 |
| PB-03 | 🔴 MUST | As an analyst, I want the system to automatically calculate CFU/ml from the colony count and dilution factor I entered so that I receive a standardized result without manual arithmetic. | Given colony_single and colony_merged counts and analyst-entered dilution factor + plated volume, when calculation runs, then CFU/ml = Σ(valid colonies) ÷ (volume × dilution factor) with ±0.1% arithmetic precision; TNTC/TFTC flags display when count is outside 25–250 CFU range. | Feature | 5 |
| PB-04 | 🔴 MUST | As a laboratory manager, I want the dashboard to display annotated plate images with color-coded bounding boxes for all 5 classes so that analysts can visually verify AI detections at a glance. | Given inference results, when the result page loads, then bounding boxes are rendered with distinct colors per class (e.g., green = colony_single, yellow = colony_merged, red = bubble, orange = dust_debris, purple = media_crack); class label and confidence percentage shown on hover. | Feature | 8 |
| PB-05 | 🔴 MUST | As an analyst, I want to digitally sign off and approve results before submission so that every report in the system has a verified analyst record for ISO 17025 audit compliance. | Given a completed analysis, when the analyst clicks 'Approve', then a timestamped record with analyst name, user ID, and cryptographic hash of the result is written to the append-only audit log in PostgreSQL; the record cannot be deleted or modified. | Compliance | 5 |
| PB-06 | 🟡 SHOULD | As a laboratory administrator, I want to export test results as PDF and CSV reports so that they can be submitted to BPOM regulators or uploaded to our LIMS system. | Given approved test results, when 'Export PDF' or 'Export CSV' is clicked, then the file includes: sample ID, analyst name, timestamp, all 5-class detection counts, CFU/ml value, confidence summary, and analyst signature field; PDF is A4, Times New Roman 12pt, BPOM-compliant format. | Feature | 5 |
| PB-07 | 🟡 SHOULD | As an analyst, I want to upload images from my smartphone camera so that I can capture plates directly in the laboratory without needing a dedicated scanner. | Given a mobile browser session, when the camera icon is tapped, then the device camera API is invoked; captured image is auto-uploaded; the full 5-class inference pipeline runs identically to desktop uploads; result displays correctly on mobile screen. | Feature | 5 |
| PB-08 | 🟡 SHOULD | As a laboratory manager, I want a Simulator module that lets me compare the AI's 5-class detection output against my analysts' manual counts so that I can build institutional trust in the system before full adoption. | Given a test result, when the Simulator tab is opened, then I can enter manual colony counts; the system displays a side-by-side comparison table showing AI count vs. manual count per class; accuracy percentage and error margin are calculated and displayed. | Feature | 8 |
| PB-09 | 🟢 COULD | As a laboratory manager, I want a historical analytics dashboard showing CFU/ml trends over time per media type so that I can identify anomalies and generate monthly compliance reports. | Given at least 30 test records, when the Analytics page is opened, then a time-series chart displays CFU/ml over date range; filter by media type and analyst; monthly summary table exportable as CSV. | Enhancement | 8 |
| PB-10 | 🟢 COULD | As a system administrator, I want model version management so that new YOLOv8 models trained on updated 5-class datasets can be deployed with A/B validation without service interruption. | Given a new trained model file, when uploaded via the admin panel, then MLflow logs the model version; A/B test runs for 500 inferences; if new model achieves ≥ 2% mAP improvement across all 5 classes on the validation set, it is automatically promoted to production; otherwise it is rejected with a report. | DevOps | 13 |

### 3. Backlog Priority Summary

| Priority Level | Label | Count | Backlog Items |
|---------------|-------|-------|---------------|
| 🔴 MUST HAVE | Critical | 5 items | PB-01, PB-02, PB-03, PB-04, PB