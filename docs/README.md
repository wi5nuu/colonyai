# ColonyAI Documentation

> **AI-Powered Automated Colony Counting for Microbiology Laboratories**
>
> _Competition: AI Open 2026 | Open Source Project_

ColonyAI is an end-to-end platform that automates bacterial colony counting on agar plates using a custom-trained YOLOv8 deep learning model. It replaces manual counting with faster, more consistent, and auditable results.

## Documentation Structure

| # | Document | Description |
|---|----------|-------------|
| 01 | [Getting Started](./01-getting-started.md) | Quick start guide — install, configure, and run ColonyAI |
| 02 | [User Manual](./02-user-manual.md) | Complete user guide for lab analysts |
| 03 | [API Reference](./03-api-reference.md) | Full REST API documentation |
| 04 | [System Architecture](./04-architecture.md) | Architecture, data flow, and component design |
| 05 | [Deployment Guide](./05-deployment.md) | Production deployment and scaling |
| 06 | [Model Training](./06-model-training.md) | Training YOLOv8 colony detection model |
| 07 | [Model Validation Report](./07-model-validation-report.md) | Performance benchmarks and validation |
| 08 | [Security Architecture](./08-security-architecture.md) | Security controls and compliance |
| 09 | [Scrum & Agile Plan](./09-scrum-agile-plan.md) | Project management framework |
| 10 | [Competition Compliance](./10-competition-compliance.md) | Case mapping and evidence |

## Quick Links

- **Frontend**: Next.js 14 (App Router) + shadcn/ui
- **Backend**: FastAPI (Python 3.10+)
- **AI Model**: YOLOv8n/s (Ultralytics)
- **Database**: PostgreSQL via Supabase
- **Storage**: AWS S3 (image & report storage)

## Key Features

- **5-Class Detection**: colony_single, colony_merged, bubble, dust_debris, media_crack
- **CFU/ml Calculation**: Automatic with dilution factor and plated volume
- **PDF/CSV Reports**: BPOM-compliant formatted reports
- **Immutable Audit Log**: SHA-256 hash chain for ISO 17025 compliance
- **Multi-Tenant**: Role-based access (Admin, Manager, Analyst, Auditor)
- **Real-time Dashboard**: Analytics with Recharts visualization
- **Model Swap API**: Upload and activate new models without restarting the server
- **Auto-Threshold Calibration**: Per-class confidence optimization for new datasets

## Workshop References

ColonyAI integrates concepts and technologies from the AI Open 2026 workshop:

| Technology | Usage | Workshop Context |
|------------|-------|-----------------|
| **CNN Architecture** | YOLOv8 CSPDarknet backbone | Padding (same/valid), stride (1/2), kernel (3×3), pooling, ReLU → SiLU |
| **GPU Acceleration** | CUDA inference at ~30ms/image | CPU vs GPU benchmark; Deka Notebook GPU for Grand Final |
| **Continuous Learning** | Model swap + threshold calibration | Preventing model "expiry" as new datasets arrive |
| **NVIDIA AI Enterprise** | Model optimization pipeline | Enterprise-grade AI deployment reference architecture |
| **MLOps as a Service** | `ml-training/` pipeline scripts | Automated retraining, evaluation, and deployment lifecycle |
| **Deka LLM Ecosystem** | Target GPU platform for competition | Future integration for natural language query of results |

## Repository

```
https://github.com/wi5nuu/colonyai
```

## Contact

**Team Lead**: Wisnu Alfian Nur Ashar  
**Email**: wisnu.ashar@student.president.ac.id

---

_Last Updated: July 2026 | Version: 2.0.0_
