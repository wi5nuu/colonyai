<div align="center">

# 🧫 ColonyAI

**Intelligent Automated Plate Count Reader for Microbiology Laboratories**

[![AI Open Innovation Challenge 2026](https://img.shields.io/badge/AI%20Open%20Innovation%20Challenge-2026-orange)](#)
[![Code Quality](https://img.shields.io/badge/Architecture-Production%20Grade-4CAF50)](#)
[![Confidential](https://img.shields.io/badge/Status-Confidential%20%28Competition%20Use%29-red)](#)
[![Model](https://img.shields.io/badge/AI%20Engine-YOLOv8%20%285--Class%29-9C27B0)](#)
[![ISO](https://img.shields.io/badge/Compliance-ISO%2017025%20%2F%20BPOM-blue)](#)

_Modernizing microbiology through high-precision AI computer vision._

</div>

---

## 📑 Executive Summary
ColonyAI is an enterprise-grade intelligent laboratory platform that transforms agar plate images into accurate, standardized CFU/ml reports in **under two minutes**. Built specifically for the **AI Open Innovation Challenge 2026**, the system addresses critical inefficiencies in manual Total Plate Count (TPC) workflows across Indonesian microbiology laboratories. 

By eliminating the 22.7%–80% inter-analyst variability commonly found in manual counting, ColonyAI accelerates throughput, reduces operational costs by up to 40%, and ensures compliance with strict food safety regulations.

---

## 🎯 The Problem & Our Solution

### 🚨 The Bottleneck
In Indonesian laboratories, current **Total Plate Count (TPC)** workflows suffer from critical failures:
1. **High Error Margins:** Inter-analyst variability causes massive discrepancies when two humans count the same plate (ASTM F2944).
2. **Throughput Limitations:** Manual counting restricts an analyst to only 20–40 plates per hour, causing huge inspection backlogs.
3. **Artifact Confusion:** Human analysts constantly struggle to differentiate between valid colonies and debris (bubbles, dust, agar cracks).

### 💡 Our Innovation
We deliver a complete Web-SaaS ecosystem powered by a fine-tuned **YOLOv8 object detection model**. Our core difference lies in our **5-Class Media-Agnostic Intelligence**:
- The model simultaneously classifies `colony_single`, `colony_merged`, `bubble`, `dust_debris`, and `media_crack`.
- Automatically filters out non-colony objects (bubbles & dust), ensuring accuracy that generic AI models cannot achieve.
- Calculates regulatory-compliant CFU/ml taking into account Plated Volume and Dilution Factor (SA-001 calculation logic).

---

## 🧩 System Architecture & UML Documentation

To satisfy the highest standards of software engineering, ColonyAI is architected using distinct modular layers. Below are the extensive UML and Workflow diagrams detailing the system logic.

### 1. High-Level Workflow Architecture
This diagram outlines how data moves from the user's browser, into the API layer, processed by the OpenCV/YOLO pipeline, and stored immutably.

```mermaid
flowchart TD
    A["👤 User (Analyst)"] -->|"Upload Plate Image"| B["💻 Next.js Frontend Dashboard"]
    B -->|"REST API Call (multipart/form-data)"| C["⚙️ FastAPI Backend"]
    C -->|"1. Preprocess (CLAHE, Masking)"| D["👁️ OpenCV Module"]
    D -->|"2. Inference"| E["🧠 YOLOv8 Model (5-Class)"]
    E -->|"3. Output BBoxes & Confidence"| F["📊 Result Processor"]
    F -->|"4. Calculate CFU/ml (SA-001)"| G["🔢 CFU Calculator"]
    G -->|"5. Save Record & Audit"| H["💾 PostgreSQL Database"]
    H -->|"6. Return JSON Annotations"| C
    C -->|"Display Annotated Image"| B
```

### 2. Sequence Diagram: Inference Lifecycle
This sequence tracks the timeline of events from the moment an analyst submits an image until they legally sign off on the results for BPOM/ISO compliance.

```mermaid
sequenceDiagram
    actor Analyst as Lab Analyst
    participant Dashboard as Next.js Dashboard
    participant API as FastAPI Backend
    participant ML as YOLOv8 Engine
    participant DB as PostgreSQL DB
    
    Analyst->>Dashboard: Upload Plate JPEG & Input Dilution
    Dashboard->>API: POST /api/v1/analyze
    API->>ML: Trigger Inference Task
    ML-->>API: Return [Bounding Boxes + Classes]
    API->>API: Calculate total valid CFU/ml
    API->>DB: Save Result & Generate Audit Hash
    DB-->>API: Confirm Database Write
    API-->>Dashboard: Return Annotated JSON
    Dashboard-->>Analyst: Render Visual Results (Color Coded)
    
    Analyst->>Dashboard: Click "Approve & Sign Off"
    Dashboard->>API: POST /api/v1/results/{id}/approve
    API->>DB: Update Status & Lock Record
    DB-->>API: Success
    API-->>Dashboard: Show "Approved" Status
```

### 3. Use Case Diagram
Defining the boundary of actor interactions within the ColonyAI ecosystem.

```mermaid
flowchart LR
    subgraph "ColonyAI System Boundaries"
        direction TB
        UC1([Login / Auth])
        UC2([Upload Agar Image])
        UC3([View Annotated Result])
        UC4([Edit / Override Count])
        UC5([Approve & Sign Off Result])
        UC6([View Analytics Dashboard])
        UC7([Export Compliance PDF/CSV])
    end

    A((Lab Analyst)) --> UC1
    A --> UC2
    A --> UC3
    A --> UC4
    A --> UC5

    M((Lab Manager)) --> UC1
    M --> UC3
    M --> UC5
    M --> UC6
    M --> UC7
```

### 4. Entity Relationship (ER) Diagram
Our database is strictly ACID-compliant. The structure guarantees that every test result is immutable and perfectly aligned with ISO 17025 audit trail standards.

```mermaid
erDiagram
    USERS ||--o{ TEST_RESULTS : "creates"
    TEST_RESULTS ||--o{ DETECTIONS : "contains"
    TEST_RESULTS ||--|| AUDIT_LOGS : "generates"

    USERS {
        uuid id PK
        string role "e.g., Analyst, Manager"
        string username
        string email
    }
    TEST_RESULTS {
        uuid id PK
        uuid user_id FK
        string sample_id
        string media_type
        float dilution_factor
        float plated_volume
        int cfu_ml_calculated
        string status "pending | approved"
    }
    DETECTIONS {
        uuid id PK
        uuid result_id FK
        string class_label "e.g., colony_single"
        float confidence
        json bounding_box
    }
    AUDIT_LOGS {
        uuid id PK
        uuid result_id FK
        timestamp created_at
        string action
        string digital_signature
    }
```

---

## 💻 Tech Stack Highlights
ColonyAI is engineered as a modern, infinitely scalable platform utilizing state-of-the-art libraries:

<div align="center">

| Layer | Technologies | Role / Use Case |
|:---:|:---|:---|
| **Frontend** | `Next.js 14`, `React`, `Tailwind CSS` | High-performance Server-Side Rendered dashboard |
| **Backend & API** | `FastAPI (Python 3.10+)` | Fast async API, strict Pydantic data validation |
| **CV & AI Engine** | `YOLOv8`, `OpenCV` | Inference engine and image pre-normalization |
| **Database** | `PostgreSQL`, `Supabase` | Persistent storage, JWT Auth, Role Based Access |
| **Infrastructure** | `Vercel`, `Railway`, `AWS S3` | Web hosting, container orchestration, encrypted storage |

</div>

---

## 📅 Agile Project Management
We utilize an extremely rigorous Agile workflow. Our development cycle is structured as a **1-Month Intensive Sprint (April 2026)** to meet the competition deadline.

- **Sprint Planning & Backlog:** [View Detailed Plan](project-management/03-sprint-plan.md)
- **Daily Standups:** Continuous daily progress logging in GitHub format.
- **Workflow:** Code merges follow strict branch routing (`feature` -> `develop` -> `main`).

---

## 👥 Meet The Team

| Member | Role | Focus |
|--------|------|-------|
| **Wisnu Alfian Nur Ashar** | Product Owner | **Frontend Lead** & Product Vision |
| **Muhammad Faras** | Scrum Master | **AI/CV Integration** & Agile Lead |
| **Suci** | Developer | **UI/UX Designer** & Frontend Implementation |
| **Steven** | Developer | **Backend Engineer** & QA/Data Analysis |

**Institution:** President University — Bachelor of Information Technology  

---

<div align="center">

## 🔒 Confidentiality Notice
> **Proprietary Software — AI Open Innovation Challenge 2026**  
> *The source code, installation scripts, model weights, and environmental configurations for this repository are strictly confidential. Deployment instructions and training scripts have been intentionally omitted from this public README to protect the intellectual property of the team during the competition and presentation phases.*

<br>
<strong>ColonyAI</strong> — Accurate. Consistent. Reproducible.
<br>
🧫🤖 2026
</div>
