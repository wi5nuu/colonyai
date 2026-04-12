# 📋 ColonyAI Product Backlog

## Priority Legend
- 🔴 **P0 (Critical)**: Must-have for MVP / Competition Submission
- 🟡 **P1 (High)**: Should-have, adds significant value
- 🟢 **P2 (Medium)**: Nice-to-have, polish features
- 🔵 **P3 (Low)**: Future enhancement / Post-competition

---

## 🔴 P0 - Critical (MVP Core)

| ID | Feature / Story | Assignee | Status | Notes |
|----|-----------------|----------|--------|-------|
| **PB-01** | **YOLOv8 Model Training**<br>Train model on 5-class dataset (colony_single, merged, bubble, dust, crack) with >90% accuracy. | Faras | 🔄 In Progress | Using AGAR dataset + augmentation |
| **PB-02** | **Backend API Core**<br>Setup FastAPI, PostgreSQL, Auth (JWT), and User Models. | Steven | ✅ Done | Auth and DB ready |
| **PB-03** | **Frontend Dashboard**<br>Develop main dashboard with stats, charts, and recent analyses table. | Wisnu | ✅ Done | Real-time stats implemented |
| **PB-04** | **Image Upload & Inference**<br>Endpoint to upload image, run AI model, and return annotated results. | Faras/Steven | 🔄 In Progress | Pipeline: Upload -> Pre-process -> AI -> Save |
| **PB-05** | **Results Display**<br>Show annotated image with bounding boxes and detection details to user. | Wisnu/Suci | ⏳ Pending | Needs annotated image URL handling |

## 🟡 P1 - High Priority

| ID | Feature / Story | Assignee | Status | Notes |
|----|-----------------|----------|--------|-------|
| **PB-06** | **CFU/ml Calculator**<br>Implement SA-001 logic: `Count / (Volume * Dilution)`. Handle TNTC/TFTC flags. | Faras/Steven | ✅ Done | GUM uncertainty included |
| **PB-07** | **Simulator Module**<br>Allow users to input manual counts and compare with AI results (Accuracy %). | Wisnu | ✅ Done | Backend API ready |
| **PB-08** | **PDF/CSV Export**<br>Generate executive summary report (PDF) and raw data (CSV). | Steven | ⏳ Pending | ReportLab implementation |
| **PB-09** | **RBAC System**<br>Implement 6 roles: Analyst, Senior, Lab Manager, Quality, Admin, Auditor. | Steven | ✅ Done | 6 Roles defined in DB |

## 🟢 P2 - Medium Priority

| ID | Feature / Story | Assignee | Status | Notes |
|----|-----------------|----------|--------|-------|
| **PB-10** | **LIMS Integration**<br>Mock endpoint to sync results to external LIMS (SampleManager). | Steven | ✅ Done | Functional stubs |
| **PB-11** | **Audit Trail**<br>Log all critical actions with hash chaining for integrity. | Steven | ✅ Done | AuditLog model active |
| **PB-12** | **Mobile Responsiveness**<br>Ensure UI works perfectly on mobile devices for field analysts. | Suci | ⏳ Pending | Testing phase |

## 🔵 P3 - Low Priority

| ID | Feature / Story | Assignee | Status | Notes |
|----|-----------------|----------|--------|-------|
| **PB-13** | **Dark Mode**<br>Toggle switch for dark/light theme. | Suci | ❌ To Do | Low impact on core function |
| **PB-14** | **Multi-language**<br>Support English and Indonesian. | Wisnu | ❌ To Do | Nice to have for demo |

---

## 📊 Progress Summary
- **Total Items:** 14
- **Done:** 8
- **In Progress:** 2
- **Pending:** 4
