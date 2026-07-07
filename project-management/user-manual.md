# ColonyAI - User Manual & Quick Start Guide

Welcome to **ColonyAI**, your AI-Powered Automated Plate Count Reader. This guide provides a brief overview of how to operate the system for daily laboratory workflows.

## 1. Access & Authentication
1. **Login:** Access the ColonyAI Web Dashboard. Enter your registered email and password.
2. **MFA Verification:** If you are logging in from a new device, a 6-digit Phase II Authorization Token will be sent to your email. Enter this code to proceed.
3. **Roles:** Your access is restricted based on your role (`analyst`, `manager`, `auditor`, `admin`, or `super_admin`). Analysts handle daily tests, while managers review results.

## 2. Running an Analysis (Analyst Workflow)
1. **Navigate to Upload:** Click **"New Analysis"** or navigate to the Upload section.
2. **Enter Metadata:**
   - **Sample ID:** Enter your laboratory sample identifier.
   - **Media Type:** Select the agar media (e.g., PCA, VRBA, BGBB).
   - **Dilution Factor & Volume:** Enter the exact dilution and plated volume (mL) for accurate CFU calculation.
3. **Upload Image:** Upload the agar plate image. The system validates the file security (checking for malware and stripping metadata) before accepting it.
4. **Process:** Click **"Analyze"**. The AI will process the image in under 2 seconds.

## 3. Interpreting Results
Once analysis is complete, the dashboard will display the annotated image:
- **Green Boxes:** `colony_single` (Individual valid colonies)
- **Orange Boxes:** `colony_merged` (Clusters, counted via SA-001 area estimation)
- **Red/Blue/Purple Boxes:** Artifacts like `dust_debris`, `bubble`, and `media_crack` (Ignored in final count).

**CFU/mL & Status:**
- The system automatically calculates the CFU/mL with GUM-compliant measurement uncertainty (k=2).
- **VALID:** 25 - 250 colonies.
- **TNTC / TFTC:** Flags are automatically applied per ISO 4833-1:2013 standards if counts fall outside the valid range.

## 4. Generating Reports
1. **Digital Sign-off:** After reviewing the annotated image and counts, analysts must digitally sign off on the result.
2. **Export:** Click **"Export PDF"** to generate a BPOM-compliant A4 PDF report, complete with analysis metrics, class breakdowns, and timestamped signatures.

## 5. Audit Trails (Manager/Auditor Workflow)
- Every action (upload, analysis, report generation) is immutably logged using SHA-256 cryptographic hashing.
- Auditors can navigate to the **"Audit Trail"** tab to verify the complete history of a sample without the possibility of data tampering.
