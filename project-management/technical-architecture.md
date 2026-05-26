# 🏗️ ColonyAI — System Architecture & UML Models (Production-Ready)

This document provides a detailed technical visualization of the ColonyAI ecosystem using Mermaid UML standards. These diagrams reflect the **actual production-ready architecture** of the platform, incorporating ISO-17025 compliance, cryptographic audit integrity, multi-tenant RBAC, and enterprise-grade security.

---

## 1. Class Diagram (Laboratory Domain Model)

Core entity relationships and database schema. ColonyAI has **11 database tables** with proper foreign keys, indexes, and cascade relationships.

```mermaid
classDiagram
    class Organization {
        +UUID id
        +String name
        +String slug
        +String location
        +String license_key
        +DateTime license_expires_at
        +String is_active
        +String institution_type
        +String compliance_standard
        +JSON infra_config
        +Integer max_users
        +DateTime created_at
        +DateTime updated_at
    }

    class User {
        +UUID id
        +UUID organization_id
        +String email
        +String password_hash
        +String full_name
        +UserRole role
        +UUID laboratory_id
        +String reset_token
        +DateTime reset_token_expires
        +String recovery_password
        +Integer failed_login_attempts
        +DateTime last_failed_login
        +String is_locked_out
        +Boolean is_active
        +DateTime created_at
        +DateTime updated_at
        +login()
        +logout()
        +change_password()
        +lock_account()
    }

    class UserPreference {
        +UUID id
        +UUID user_id
        +Boolean notify_analysis_complete
        +Boolean notify_boundary_alerts
        +Boolean notify_weekly_summary
        +String default_lab_name
        +String default_media_type
        +Float default_volume_ml
        +String theme_preference
        +String language_preference
    }

    class UserSession {
        +UUID id
        +UUID user_id
        +String token_hash
        +String device_info
        +String ip_address
        +String user_agent
        +Boolean is_active
        +DateTime expires_at
        +DateTime last_accessed
    }

    class Analysis {
        +UUID id
        +UUID organization_id
        +UUID user_id
        +Integer version_id
        +String sample_id
        +String media_type
        +Float dilution_factor
        +Float plated_volume_ml
        +String original_image_url
        +String annotated_image_url
        +Integer colony_count
        +Float cfu_per_ml
        +Float confidence_score
        +String reliability
        +AnalysisStatus status
        +String error_message
        +JSON warnings
        +JSON class_breakdown
        +String cfu_status
        +String cfu_message
        +Float uncertainty_u
        +String merged_estimation_method
        +Float incubation_temp
        +Integer incubation_time_hours
        +String method_standard
        +String media_batch_number
        +String incubator_id
        +DateTime created_at
        +DateTime updated_at
        +process_image()
        +calculate_cfu()
        +approve()
        +flag_for_review()
    }

    class ColonyDetection {
        +UUID id
        +UUID analysis_id
        +String class_name
        +Float confidence
        +Integer bbox_x
        +Integer bbox_y
        +Integer bbox_width
        +Integer bbox_height
        +DateTime created_at
    }

    class AuditLog {
        +UUID id
        +UUID organization_id
        +UUID user_id
        +String action
        +String resource_type
        +UUID resource_id
        +JSON details
        +DateTime timestamp
        +String ip_address
        +String user_agent
        +String previous_hash
        +String current_hash
        +verify_integrity()
    }

    class SimulatorComparison {
        +UUID id
        +UUID organization_id
        +UUID user_id
        +UUID analysis_id
        +JSON ai_class_breakdown
        +Integer ai_total_valid
        +Integer manual_colony_single
        +Integer manual_colony_merged
        +Integer manual_bubble
        +Integer manual_dust_debris
        +Integer manual_media_crack
        +Integer manual_total_valid
        +Float agreement_single
        +Float agreement_merged
        +Float agreement_bubble
        +Float agreement_dust_debris
        +Float agreement_media_crack
        +Float overall_accuracy
        +String notes
        +DateTime created_at
    }

    class TokenBlacklist {
        +UUID id
        +String jti
        +DateTime expires_at
        +DateTime created_at
    }

    class Notification {
        +UUID id
        +UUID user_id
        +UUID organization_id
        +String title
        +String message
        +String notification_type
        +Boolean is_read
        +String link
        +DateTime created_at
    }

    class PasswordResetRequest {
        +UUID id
        +UUID user_id
        +UUID organization_id
        +String requester_ip
        +String requester_ua
        +String status
        +DateTime requested_at
        +DateTime expires_at
        +DateTime reviewed_at
        +UUID reviewed_by
        +String reset_token
        +DateTime token_expires_at
        +approve()
        +reject()
    }

    Organization "1" --o "*" User : contains
    Organization "1" --o "*" Analysis : owns
    Organization "1" --o "*" AuditLog : logs
    Organization "1" --o "*" SimulatorComparison : stores
    Organization "1" --o "*" Notification : sends
    Organization "1" --o "*" PasswordResetRequest : manages
    User "1" --o "*" Analysis : creates
    User "1" --o "1" UserPreference : has
    User "1" --o "*" UserSession : maintains
    User "1" --o "*" AuditLog : performs
    User "1" --o "*" Notification : receives
    User "1" --o "*" SimulatorComparison : submits
    Analysis "1" --o "*" ColonyDetection : contains
    Analysis "1" --o "*" SimulatorComparison : compared_via
    PasswordResetRequest "*" --o "1" User : requests_from
    PasswordResetRequest "*" --o "1" User : reviewed_by
```

---

## 2. Sequence Diagram: High-Precision Analysis Lifecycle

The complete workflow from upload to cryptographic sign-off, including all security checks and role-based interactions.

```mermaid
sequenceDiagram
    actor Analyst
    actor Manager
    participant UI as Next.js 14 Dashboard
    participant API as FastAPI Backend
    participant Auth as Auth Middleware (Argon2 + JWT)
    participant FileVal as File Validator (Magic Bytes + ClamAV)
    participant OpenCV as OpenCV Pipeline (CLAHE + Hough + Homography)
    participant YOLO as YOLOv8 Engine (5-Class + NMS)
    participant CFU as CFU Calculator (SA-001 + GUM)
    participant DB as PostgreSQL (SQLAlchemy)
    participant S3 as AWS S3 (Encrypted)

    Analyst->>UI: Upload Plate Image + Metadata
    UI->>API: POST /api/v1/images/upload
    API->>Auth: Verify JWT + Role (analyst/manager/admin)
    Auth-->>API: Authenticated
    API->>FileVal: Validate (magic-bytes, UUID rename, EXIF strip, ClamAV)
    FileVal-->>API: Sanitized Image Bytes
    API->>S3: Store Original Image (encrypted, signed URL)
    S3-->>API: original_url

    Analyst->>UI: Submit Analysis (sample_id, dilution, media_type)
    UI->>API: POST /api/v1/analyses/
    API->>DB: Create Analysis Record (status=PROCESSING)
    API->>OpenCV: preprocess() → CLAHE → Hough Circle → Homography → ROI
    OpenCV-->>API: Standardized 512×512 Image
    API->>YOLO: detect() → Per-media thresholds → NMS IoU 0.45
    YOLO-->>API: 5-Class Detections (colony_single, colony_merged, bubble, dust_debris, media_crack)
    API->>CFU: calculate() → SA-001 area estimation → CFU/ml → GUM uncertainty
    CFU-->>API: CFUResult (value, status, uncertainty, warnings)
    API->>OpenCV: save_annotated_image() → Color-coded boxes + watermark
    API->>S3: Store Annotated Image
    API->>DB: Save Detections + Update Analysis (status=COMPLETED)
    API->>DB: Write Audit Log (SHA-256 chained)
    API-->>UI: Return Full Analysis Result

    Manager->>UI: Review Annotated Result
    UI->>API: GET /api/v1/analyses/{id}
    API->>DB: Fetch Analysis (org-scoped)
    API-->>UI: Annotated Image + Class Breakdown + Confidence Scores
    Manager->>UI: Click "Approve"
    UI->>API: POST /api/v1/analyses/{id}/approve
    API->>DB: Update Status + Optimistic Lock Check
    API->>DB: Write Audit Log (approval action)
    API-->>UI: Approved + Immutable Record

    Analyst->>UI: Export Report
    UI->>API: POST /api/v1/reports/pdf
    API->>DB: Query Analyses (user-scoped)
    API->>API: Generate BPOM-compliant PDF (A4, Times New Roman 12pt)
    API-->>UI: Download PDF Report
```

---

## 3. Activity Diagram: Image Processing & Security Pipeline

Detailed decision-making flow for file security, validation, and AI inference.

```mermaid
stateDiagram-v2
    [*] --> UploadReceived

    state "Security Validation" as SEC {
        UploadReceived --> MagicByteCheck
        MagicByteCheck --> FileSizeCheck : Valid MIME (JPEG/PNG/WEBP)
        FileSizeCheck --> DimensionCheck : 0 < size ≤ 15MB
        DimensionCheck --> EXIFStrip : ≥ 100×100px, ≤ 15000px
        EXIFStrip --> MalwareScan : EXIF removed
        MalwareScan --> UUIDRename : Clean (or fail-open)
        UUIDRename --> Sanitized : Safe filename
    }

    state "Image Preprocessing" as PREPROC {
        Sanitized --> CLAHENormalization
        CLAHENormalization --> HoughCircleDetection
        HoughCircleDetection --> PerspectiveCorrection : Circle found
        PerspectiveCorrection --> ROIExtraction
        ROIExtraction --> Resize512
        Resize512 --> PreprocessedImage
        HoughCircleDetection --> FullImageFallback : No circle found
        FullImageFallback --> CLAHENormalization
    }

    state "AI Inference" as AI {
        PreprocessedImage --> YOLOv8Detection
        YOLOv8Detection --> NMSFiltering : Raw detections
        NMSFiltering --> PerClassThreshold : IoU 0.45
        PerClassThreshold --> FiveClassOutput : Per-media thresholds
    }

    state "CFU Calculation" as CALC {
        FiveClassOutput --> SA001Estimation
        SA001Estimation --> CFUFormula : Merged colony estimate
        CFUFormula --> TNTCTFTCCheck : CFU/ml computed
        TNTCTFTCCheck --> GUMUncertainty : 25 ≤ count ≤ 250
        TNTCTFTCCheck --> TNTCFlag : count > 250
        TNTCTFTCCheck --> TFTCFlag : count < 25
        GUMUncertainty --> ValidResult
    }

    state "Output Generation" as OUT {
        ValidResult --> AnnotatedImage : Color-coded boxes
        AnnotatedImage --> S3Storage : Watermarked
        S3Storage --> DBRecord : Original + annotated URLs
        DBRecord --> AuditLog : SHA-256 chained
        AuditLog --> Completed
    }

    SEC --> Rejected : Invalid MIME / Malware / 0-byte
    PREPROC --> FailedState : Processing error
    AI --> FailedState : Inference error
    CALC --> Completed : TNTC/TFTC still saved
    OUT --> Completed
    Completed --> [*]
    Rejected --> [*]
    FailedState --> [*]
```

---

## 4. Use Case Diagram (5-Role RBAC Separation of Duties)

Actor-system boundary interactions for ColonyAI's 5-role RBAC with precise data scoping.

```mermaid
graph LR
    subgraph "ColonyAI System Boundary"
        UC1(Auth: Login/Logout/Register)
        UC2(Upload & Analyze Plate Image)
        UC3(View Annotated Results + Class Breakdown)
        UC4(Manual vs AI Simulator)
        UC5(Approve / Flag for Review)
        UC6(Export PDF/CSV Reports)
        UC7(View Audit Logs)
        UC8(User Management)
        UC9(Org Management & Provisioning)
        UC10(LIMS Sync & Config)
        UC11(Data Retention Policy)
        UC12(System Monitoring & Stats)
    end

    SA((Super Admin)) --> UC1
    SA --> UC9
    SA --> UC12

    AD((Admin)) --> UC1
    AD --> UC2
    AD --> UC3
    AD --> UC4
    AD --> UC5
    AD --> UC6
    AD --> UC7
    AD --> UC8
    AD --> UC10
    AD --> UC11

    M((Manager)) --> UC1
    M --> UC2
    M --> UC3
    M --> UC4
    M --> UC5
    M --> UC6
    M --> UC7
    M --> UC8
    M --> UC10

    A((Analyst)) --> UC1
    A --> UC2
    A --> UC3
    A --> UC4
    A --> UC5
    A --> UC6
    A --> UC7

    AU((Auditor)) --> UC1
    AU --> UC3
    AU --> UC4
    AU --> UC6
    AU --> UC7
```

**Data Scoping per Role:**
| Role | Analysis Data | User Data | Audit Data | Config |
|------|--------------|-----------|------------|--------|
| Analyst | Own only | Own profile | Own logs | None |
| Manager | Org-wide | Org users (read) | Org logs | LIMS config |
| Admin | Org-wide | Org users (full) | Org logs | Org + LIMS |
| Auditor | Org-wide (read) | None | Org logs (read) | None |
| Super Admin | All orgs | All users | All logs | Global |

---

## 5. Component Diagram (Modern Tech Stack)

Modular decomposition of the production-ready software stack with all layers.

```mermaid
graph TD
    subgraph "Client Layer (Browser/Mobile)"
        FE["Next.js 14 + TypeScript\n(React SSR/CSR)"]
        UI["Tailwind CSS + shadcn/ui\n(Color-coded 5-class display)"]
        FE --> UI
    end

    subgraph "Security & Gateway Layer"
        CORS["CORS Middleware\n(Origin whitelist)"]
        HSTS["SecureHeadersMiddleware\n(HSTS, CSP, X-Frame-Deny)"]
        RATE["Rate Limiter\n(Throttle protection)"]
        CORS --> HSTS --> RATE
    end

    subgraph "Authentication Layer"
        ARGON2["Argon2 Password Hashing\n(GPU-attack resistant)"]
        JWT["JWT Auth + JTI Blacklist\n(15-min access / 7-day refresh)"]
        ANTI["Anti-Phishing Engine\n(IP throttle, admin targeting)"]
        LOCK["Account Lockout\n(5 fails → 15-min lock)"]
        ARGON2 --> JWT --> ANTI --> LOCK
    end

    subgraph "API Layer (FastAPI)"
        ROUTER["API Router\n(11 endpoint modules)"]
        VALID["Pydantic Validation\n(Input sanitization)"]
        RBAC["5-Role RBAC\n(Data scoping per endpoint)"]
        ROUTER --> VALID --> RBAC
    end

    subgraph "Service Layer"
        FILEVAL["File Validator\n(Magic bytes, UUID, EXIF, ClamAV)"]
        OPENCV["Image Processor\n(CLAHE, Hough, Homography, ROI)"]
        YOLO["YOLOv8 Detector\n(5-class, NMS 0.45, per-media thresholds)"]
        CFU["CFU Calculator\n(SA-001 area estimation + GUM uncertainty)"]
        REPORT["Report Generator\n(PDF BPOM A4 + multi-sheet Excel)"]
        AUDIT["Audit Logger\n(SHA-256 hash chain)"]
        NOTIF["Notification Service\n(In-app real-time alerts)"]
    end

    subgraph "Data Layer"
        PG[("PostgreSQL\n(11 tables, FK indexes, cascade)"]
        S3[("AWS S3 (Encrypted)\nOriginal + Annotated images)"]
        BLACKLIST[("Token Blacklist\n(JTI revocation table)"]
    end

    subgraph "External Integrations"
        LIMS["LIMS API\n(SampleManager, LabVantage)"]
    end

    UI --> CORS
    RATE --> ARGON2
    RBAC --> FILEVAL
    FILEVAL --> OPENCV --> YOLO --> CFU --> REPORT
    CFU --> AUDIT
    AUDIT --> PG
    FILEVAL --> S3
    REPORT --> PG
    JWT --> BLACKLIST
    ROUTER --> LIMS
    NOTIF --> PG
```

---

## 6. State Machine Diagram: Analysis Lifecycle

Complete lifecycle states for ISO 17025 compliance with optimistic locking.

```mermaid
stateDiagram-v2
    [*] --> PENDING : Image uploaded, metadata entered

    PENDING --> PROCESSING : File validated, record created
    PROCESSING --> FAILED : Malware detected / Circle not found / Inference error
    PROCESSING --> COMPLETED : YOLOv8 inference + CFU calculation success

    state "Analyst Review" as REVIEW {
        COMPLETED --> SELF_REVIEW : Analyst views annotated image
        SELF_REVIEW --> FLAGGED_FOR_REVIEW : Analyst flags (reason required)
        SELF_REVIEW --> ANALYST_APPROVED : Analyst self-approves own result
    }

    state "Manager Review" as MREVIEW {
        FLAGGED_FOR_REVIEW --> MANAGER_REVIEW : Manager notified
        MANAGER_REVIEW --> APPROVED : Manager approves
        MANAGER_REVIEW --> REJECTED : Manager rejects (reason required)
        ANALYST_APPROVED --> APPROVED : Auto-approved (no flag)
    }

    APPROVED --> LOCKED : Cryptographic seal (SHA-256 hash written)
    REJECTED --> PENDING : Re-process with new parameters

    LOCKED --> EXPORTED : PDF/CSV generated
    LOCKED --> LIMS_SYNCED : Pushed to LIMS
    EXPORTED --> ARCHIVED : After retention period
    LIMS_SYNCED --> ARCHIVED
    ARCHIVED --> PURGED : Data retention policy (5 years, UU PDP)

    FAILED --> PENDING : Retry with new image
    PURGED --> [*]
    LOCKED --> [*] : Final state (immutable)
```

---

## 7. Entity-Relationship Diagram (Database Schema)

Complete 11-table PostgreSQL schema with all columns, types, and relationships.

```mermaid
erDiagram
    organizations {
        uuid id PK
        string name
        string slug UK
        string location
        string license_key
        datetime license_expires_at
        enum is_active
        string institution_type
        string compliance_standard
        json infra_config
        int max_users
        datetime created_at
        datetime updated_at
    }
    users {
        uuid id PK
        uuid organization_id FK
        string email UK
        string password_hash
        string full_name
        enum role "super_admin|admin|manager|auditor|analyst"
        uuid laboratory_id
        string reset_token
        datetime reset_token_expires
        string recovery_password
        int failed_login_attempts
        datetime last_failed_login
        enum is_locked_out
        boolean is_active
        datetime created_at
        datetime updated_at
    }
    user_preferences {
        uuid id PK
        uuid user_id FK UK
        boolean notify_analysis_complete
        boolean notify_boundary_alerts
        boolean notify_weekly_summary
        string default_lab_name
        string default_media_type
        float default_volume_ml
        string theme_preference
        string language_preference
        datetime updated_at
    }
    user_sessions {
        uuid id PK
        uuid user_id FK
        string token_hash UK
        string device_info
        string ip_address
        text user_agent
        boolean is_active
        datetime expires_at
        datetime last_accessed
    }
    analyses {
        uuid id PK
        uuid organization_id FK
        uuid user_id FK
        int version_id
        string sample_id
        string media_type
        float dilution_factor
        float plated_volume_ml
        text original_image_url
        text annotated_image_url
        int colony_count
        float cfu_per_ml
        float confidence_score
        string reliability
        enum status "pending|processing|completed|failed"
        text error_message
        json warnings
        json class_breakdown
        string cfu_status
        text cfu_message
        float uncertainty_u
        string merged_estimation_method
        float incubation_temp
        int incubation_time_hours
        string method_standard
        string media_batch_number
        string incubator_id
        datetime created_at
        datetime updated_at
    }
    colony_detections {
        uuid id PK
        uuid analysis_id FK
        string class_name
        float confidence
        int bbox_x
        int bbox_y
        int bbox_width
        int bbox_height
        datetime created_at
    }
    audit_logs {
        uuid id PK
        uuid organization_id FK
        uuid user_id FK
        string action
        string resource_type
        uuid resource_id
        json details
        datetime timestamp
        string ip_address
        text user_agent
        string previous_hash
        string current_hash
    }
    simulator_comparisons {
        uuid id PK
        uuid organization_id FK
        uuid user_id FK
        uuid analysis_id FK
        json ai_class_breakdown
        int ai_total_valid
        int manual_colony_single
        int manual_colony_merged
        int manual_bubble
        int manual_dust_debris
        int manual_media_crack
        int manual_total_valid
        float overall_accuracy
        text notes
        datetime created_at
    }
    token_blacklist {
        uuid id PK
        string jti UK
        datetime expires_at
    }
    notifications {
        uuid id PK
        uuid user_id FK
        uuid organization_id FK
        string title
        text message
        string notification_type
        boolean is_read
        string link
        datetime created_at
    }
    password_reset_requests {
        uuid id PK
        uuid user_id FK
        uuid organization_id FK
        string requester_ip
        string requester_ua
        enum status "pending|approved|rejected|expired"
        datetime requested_at
        datetime expires_at
        datetime reviewed_at
        uuid reviewed_by FK
        string reset_token UK
        datetime token_expires_at
    }

    organizations ||--o{ users : "has many"
    organizations ||--o{ analyses : "owns"
    organizations ||--o{ audit_logs : "logs"
    organizations ||--o{ simulator_comparisons : "stores"
    organizations ||--o{ notifications : "sends"
    organizations ||--o{ password_reset_requests : "manages"
    users ||--o{ analyses : "creates"
    users ||--|| user_preferences : "has one"
    users ||--o{ user_sessions : "maintains"
    users ||--o{ audit_logs : "performs"
    users ||--o{ notifications : "receives"
    users ||--o{ simulator_comparisons : "submits"
    analyses ||--o{ colony_detections : "contains"
    analyses ||--o{ simulator_comparisons : "compared via"
    users ||--o{ password_reset_requests : "requests"
    users ||--o{ password_reset_requests : "reviews"
```

---

## 8. Deployment Architecture (Multi-Tenant SaaS)

Production deployment topology with Docker containers and cloud services.

```mermaid
graph TB
    subgraph "Client Devices"
        WEB["Web Browser\n(Desktop/Mobile/Tablet)"]
    end

    subgraph "CDN Layer"
        VERCEL["Vercel CDN\n(Next.js Frontend)"]
    end

    subgraph "Cloud Platform (Railway)"
        subgraph "Backend Container"
            FASTAPI["FastAPI Application\n(Docker Container)"]
            WORKER["Background Workers\n(Async tasks)"]
        end
        subgraph "Storage"
            S3[(AWS S3 Bucket\nEncrypted at Rest\nSigned URLs 1hr)]
        end
    end

    subgraph "Database"
        PG[(PostgreSQL\nMulti-tenant\n11 Tables)]
    end

    subgraph "External Services"
        LIMS["LIMS Systems\n(SampleManager\nLabVantage)"]
        SMTP["Email/WhatsApp\n(Notifications)"]
    end

    WEB --> VERCEL
    PHONE --> VERCEL
    VERCEL --> FASTAPI
    FASTAPI --> PG
    FASTAPI --> S3
    FASTAPI --> LIMS
    FASTAPI --> SMTP
    WORKER --> PG
    WORKER --> S3
```

---

**Document Status:** 🟢 **100% Architectural Sync — Production-Ready**
**Methodology:** Clean OOP, Async Orchestration, Multi-Tenant RBAC, SHA-256 Audit Chain
**Database:** 11 tables, full FK relationships, cascade deletes, indexed queries
**Security:** Argon2 + JWT blacklist + Anti-Phishing + Magic-bytes + EXIF strip + ClamAV + SecureHeaders
**Updated:** May 4, 2026
