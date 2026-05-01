# 🏗️ ColonyAI — System Architecture & UML Models (100% Integrated)

This document provides a detailed technical visualization of the ColonyAI ecosystem using Mermaid UML standards. These diagrams reflect the actual production-ready architecture of the platform, incorporating ISO-17025 compliance and cryptographic integrity.

---

## 1. Class Diagram (Laboratory Domain Model)
Visualizing the core entity relationships and database schema with professional precision.

```mermaid
classDiagram
    class User {
        +UUID id
        +String email
        +String role
        +String full_name
        +login()
        +logout()
    }
    class Analysis {
        +UUID id
        +String sample_id
        +Float cfu_per_ml
        +String cfu_status
        +Float uncertainty_u
        +JSON class_breakdown
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
        +String user_agent
        +verify_integrity()
    }

    User "1" --o "*" Analysis : creates
    Analysis "1" --o "*" ColonyDetection : contains
    Analysis "1" --o "1" AuditLog : generates
    User "1" --o "*" AuditLog : performs
```

---

## 2. Sequence Diagram: High-Precision Analysis Lifecycle
The high-precision workflow from upload to cryptographic sign-off.

```mermaid
sequenceDiagram
    actor Analyst
    participant UI as Next.js Dashboard
    participant API as FastAPI Backend
    participant SEC as Security Pipeline (ClamAV)
    participant ML as YOLOv8 Engine
    participant DB as PostgreSQL (SQLAlchemy)

    Analyst->>UI: Upload Specimen Image
    UI->>API: POST /api/v1/analyses/
    API->>SEC: Magic-Byte Check & Malware Scan
    SEC-->>API: Safe (EXIF Stripped)
    API->>ML: Run 5-Class Inference (colony, artifact, etc)
    ML-->>API: Detections + ROI Boxes
    API->>API: Calculate CFU/ml (SA-001) + Uncertainty (GUM)
    API->>DB: Save Results & Generate SHA-256 Hash Chain
    API-->>UI: Return Results (Processing Complete)
    
    actor Manager
    Manager->>UI: Review Result (HitL)
    UI->>API: POST /{id}/approve
    API->>DB: Update Status & Lock Record (Immutable)
    API-->>UI: Report Validated
```

---

## 3. Activity Diagram: Image Processing & Security Pipeline
Detailed decision-making flow for file security and validation.

```mermaid
stateDiagram-v2
    [*] --> Upload
    Upload --> MagicByteValidation
    MagicByteValidation --> MalwareScanning : Valid Header
    MalwareScanning --> EXIFStripping : Safe
    EXIFStripping --> HoughCircleDetection : ROI Extraction
    HoughCircleDetection --> Rejected : No Plate Found
    HoughCircleDetection --> YOLOInference : Plate Verified
    YOLOInference --> CFU_Calculation : Boxes Detected
    CFU_Calculation --> UncertaintyEstimation : ISO-Compliance
    UncertaintyEstimation --> CryptographicLogging : SHA-256
    CryptographicLogging --> [*]
    
    MagicByteValidation --> Rejected : Invalid MIME
    MalwareScanning --> Quarantine : Infection Detected
```

---

## 4. Use Case Diagram (Separation of Duties)
Actor-system boundary interactions for 4-Role RBAC.

```mermaid
graph LR
    subgraph "ColonyAI Boundaries"
        UC1(Auth & Session Mgmt)
        UC2(Analyze Specimen)
        UC3(Manual vs AI Comparison)
        UC4(Approve Results)
        UC5(Verify Audit Integrity Chain)
        UC6(Monitor Kernel Vitals)
    end

    A((Lab Analyst)) --> UC1
    A --> UC2
    A --> UC3
    
    M((Lab Manager)) --> UC1
    M --> UC4
    
    U((Quality Auditor)) --> UC1
    U --> UC5
    
    AD((System Admin)) --> UC1
    AD --> UC6
```

---

## 5. Component Diagram (Modern Tech Stack)
Modular decomposition of the professional software stack.

```mermaid
graph TD
    subgraph "Client Layer"
        UI[Next.js 14 App]
        Zustand[State Management]
    end

    subgraph "Security & Gateway"
        Nginx[Reverse Proxy]
        Auth[JWT Otorisasi]
        ClamAV[Malware Scanner]
    end

    subgraph "Service Intelligence"
        API[FastAPI Engine]
        YOLO[YOLOv8 Inference]
        Calculator[CFU/Uncertainty Service]
    end

    subgraph "Data Persistence"
        DB[(PostgreSQL)]
        S3[AWS S3 Object Store]
    end

    UI --> Nginx
    Nginx --> Auth
    Auth --> API
    API --> ClamAV
    API --> YOLO
    API --> Calculator
    YOLO --> S3
    Calculator --> DB
```

---

## 6. State Machine Diagram: Specimen Lifecycle
Lifecycle states for ISO 17025 compliance.

```mermaid
stateDiagram-v2
    [*] --> PENDING
    PENDING --> PROCESSING : File Validated
    PROCESSING --> FAILED : Malware / Circle Fail
    PROCESSING --> COMPLETED : Inference Success
    COMPLETED --> REJECTED : Analyst Disapproval
    COMPLETED --> APPROVED : Manager Sign-off
    APPROVED --> LOCKED : Cryptographic Seal
    LOCKED --> [*]
```

---
**Document Status:** 🟢 **100% Architectural Sync — Champion Final Ready**  
**Methodology:** Clean OOP & Async Orchestration  
**Updated:** April 28, 2026
