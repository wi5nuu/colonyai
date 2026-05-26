# 🏗️ ColonyAI — System Architecture & UML Models

This document provides a technical visualization of the ColonyAI ecosystem.

---

## 1. Sequence Diagram: Analysis Lifecycle

```mermaid
sequenceDiagram
    participant Analyst
    participant API as FastAPI
    participant YOLO as AI Engine
    participant DB as Database

    Analyst->>API: Upload Image
    API->>YOLO: Detect Colonies
    YOLO-->>API: 5-Class Detections
    API->>DB: Save Results
    API-->>Analyst: Analysis Complete
```

---

## 2. Component Diagram

```mermaid
graph TD
    Client[Web Client] --> API[FastAPI Backend]
    API --> YOLO[YOLOv8 Engine]
    API --> DB[(PostgreSQL)]
    API --> S3[Storage]
```

---

## 3. Entity-Relationship Diagram

```mermaid
erDiagram
    organizations ||--o{ users : "has"
    organizations ||--o{ analyses : "owns"
    users ||--o{ analyses : "creates"
    analyses ||--o{ colony_detections : "contains"
```
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
