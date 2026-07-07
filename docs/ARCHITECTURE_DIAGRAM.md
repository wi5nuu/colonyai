# ColonyAI System Architecture

This diagram illustrates the secure, end-to-end processing pipeline of the ColonyAI platform.

```mermaid
graph TD
    A[Analyst] -->|Upload Image| B(Next.js Web Dashboard)
    B -->|HTTPS API Request| C(FastAPI Backend)
    
    subgraph Security_Layer [Enterprise Security Layer]
        C -->|Validation| D[Magic-Bytes Check]
        C -->|Scanning| E[ClamAV Malware Scan]
        C -->|Privacy| F[EXIF Strip]
    end
    
    D -->|Sanitized Content| G(OpenCV Pre-processing)
    G -->|Normalized Input| H[YOLOv8 Vision Engine]
    H -->|Detection Results| I[SA-001 Merged Estimation]
    I -->|CFU Calculation| J[GUM Uncertainty Engine]
    
    J -->|Store| K[(PostgreSQL Database)]
    K -->|Cryptographic Chain| L[SHA-256 Audit Log]
    
    L -->|Generate| M[BPOM-Compliant PDF Report]
    L -->|Integrate| N[LIMS API Sync]

    style Security_Layer fill:#f9f,stroke:#333,stroke-width:2px
```

## Data Flow Description
1. **Security-First Ingestion:** Every file undergoes multi-layer validation (MIME check, malware scan, metadata removal) before entering the processing pipeline.
2. **AI Inference:** The YOLOv8 model provides real-time detection across 5 object classes, with merged colony estimation for improved accuracy.
3. **Regulatory Integrity:** Results are calculated with metrological uncertainty (GUM) and finalized with a cryptographically secure audit trail, ensuring full compliance with ISO 17025.
