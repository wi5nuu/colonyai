# 🏗️ ColonyAI — System Architecture & UML Models (100% Integrated)

This document provides a detailed technical visualization of the ColonyAI ecosystem using Mermaid UML standards. These diagrams reflect the actual production-ready architecture of the platform.

---

## 1. Class Diagram
Visualizing the core entity relationships and database schema.

```mermaid
classDiagram
    class User {
        +UUID id
        +String email
        +String role
        +login()
        +logout()
    }
    class Analysis {
        +UUID id
        +String sample_id
        +Float cfu_per_ml
        +Status status
        +process_image()
        +generate_report()
    }
    class ColonyDetection {
        +UUID id
        +String class_name
        +Float confidence
        +JSON bbox
    }
    class AuditLog {
        +UUID id
        +String action
        +String previous_hash
        +String current_hash
        +verify_integrity()
    }

    User "1" --o "*" Analysis : creates
    Analysis "1" --o "*" ColonyDetection : contains
    Analysis "1" --o "1" AuditLog : generates
```

---

## 2. Sequence Diagram: Analysis Lifecycle
The high-precision workflow from upload to sign-off.

```mermaid
sequenceDiagram
    actor Analyst
    participant Dashboard as Next.js UI
    participant API as FastAPI Backend
    participant ML as YOLOv8 Engine
    participant DB as PostgreSQL

    Analyst->>Dashboard: Upload Plate Image
    Dashboard->>API: POST /api/v1/analyses
    API->>API: Validate Magic Bytes & Stripping
    API->>ML: Run 5-Class Inference
    ML-->>API: Detections (JSON)
    API->>API: Calculate CFU/ml (SA-001)
    API->>DB: Save Results & SHA-256 Hash
    API-->>Dashboard: Return Results
    Analyst->>Dashboard: Review & Click Approve
    Dashboard->>API: POST /approve/{id}
    API->>DB: Lock Record (Immutable)
```

---

## 3. Activity Diagram: Image Processing Pipeline
Detailed decision-making flow for file security and validation.

```mermaid
stateDiagram-v2
    [*] --> Upload
    Upload --> MagicByteCheck
    MagicByteCheck --> Rejected : Invalid MIME
    MagicByteCheck --> EXIFStripping : Valid
    EXIFStripping --> CircleDetection : Verify Petri Dish
    CircleDetection --> Rejected : No Plate Detected
    CircleDetection --> YOLOInference : Plate Verified
    YOLOInference --> CFUCalculation
    CFUCalculation --> SaveToDB
    SaveToDB --> [*]
```

---

## 4. Use Case Diagram
Actor-system boundary interactions.

```mermaid
graph LR
    subgraph "ColonyAI Boundaries"
        UC1(Login / Auth)
        UC2(Analyze Specimen)
        UC3(Manual vs AI Comparison)
        UC4(Approve Analysis)
        UC5(Export ISO Reports)
    end

    A((Lab Analyst)) --> UC1
    A --> UC2
    A --> UC3
    
    M((Lab Manager)) --> UC1
    M --> UC4
    M --> UC5

    U((Quality Auditor)) --> UC1
    U --> UC5
```

---

## 5. Component Diagram
Modular decomposition of the software stack.

```mermaid
graph TD
    subgraph "Frontend Layer"
        UI[Next.js 14 App]
        State[Zustand Store]
    end

    subgraph "API Gateway Layer"
        FastAPI[FastAPI Router]
        Auth[JWT Middleware]
    end

    subgraph "Logic & Intelligence"
        Detector[YOLOv8 Engine]
        Calc[CFU Calculator]
        Safe[File Sanitizer]
    end

    subgraph "Data Layer"
        DB[(PostgreSQL)]
        S3[AWS S3 Images]
    end

    UI --> FastAPI
    FastAPI --> Auth
    FastAPI --> Detector
    FastAPI --> Calc
    Detector --> S3
    Calc --> DB
```

---

## 6. Deployment Diagram
Cloud infrastructure orchestration.

```mermaid
graph TB
    subgraph "Public Internet"
        Client[Chrome/Edge Browser]
    end

    subgraph "Vercel Edge"
        FE[Static Frontend Assets]
    end

    subgraph "Railway Platform"
        BE[FastAPI App Container]
        Worker[Celery Worker]
        ML[YOLOv8 Weights]
    end

    subgraph "Managed Services"
        DB[(Supabase/Postgres)]
        Store[AWS S3 Bucket]
    end

    Client --> FE
    Client --> BE
    BE --> DB
    BE --> Store
    BE --> ML
```

---

## 7. Communication Diagram
Interaction between core services during real-time analysis.

```mermaid
graph LR
    UI((UI Dashboard)) -- "1: Trigger Analysis" --> API((FastAPI Engine))
    API -- "2: Sanitize" --> Safe((File Security))
    API -- "3: Detect" --> AI((YOLO Model))
    AI -- "4: Return Boxes" --> API
    API -- "5: Persist" --> DB[(Database)]
    DB -- "6: Success" --> API
    API -- "7: Render" --> UI
```

---

## 8. State Machine Diagram: Analysis Lifecycle
Lifecycle states for ISO 17025 compliance.

```mermaid
stateDiagram-v2
    [*] --> PENDING
    PENDING --> PROCESSING : Upload Success
    PROCESSING --> FAILED : Error / No Plate
    PROCESSING --> COMPLETED : Inference Success
    COMPLETED --> REJECTED : Analyst Disapproval
    COMPLETED --> APPROVED : Manager Sign-off
    APPROVED --> [*] : Record Locked
```

---
**Document Status:** 🟢 **100% Architectural Sync — Champion Final Ready**  
**Updated:** April 28, 2026
