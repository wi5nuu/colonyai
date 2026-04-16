# 📋 ColonyAI Product Backlog

## Priority Legend
- 🔴 **P0 (Critical)**: Must-have for MVP / Competition Submission
- 🟡 **P1 (High)**: Should-have, adds significant value
- 🟢 **P2 (Medium)**: Nice-to-have, polish features
- 🔵 **P3 (Low)**: Future enhancement / Post-competition

---

## 🔴 P0 - Critical (MVP Core)

| ID | Type | Feature / Story / Bug | Goal | Assignee | Status |
|----|------|-----------------------|------|----------|--------|
| **PB-01** | Feature | **YOLOv8 Model Training**<br>Train model on 5-class dataset. | Achieve >90% accuracy for colony detection baseline. | Faras | 🔄 In Progress |
| **PB-02** | Task | **Backend API Core Setup**<br>FastAPI, PostgreSQL, Auth. | Establish stable backend logic and database schema. | Steven | ✅ Done |
| **PB-03** | Feature | **Frontend Dashboard**<br>Main dashboard with stats & charts. | Allow users to view real-time laboratory analytics intuitively. | Wisnu | ✅ Done |
| **PB-04** | Feature | **Image Upload Pipeline**<br>Endpoint to upload & process image. | Enable users to upload petri-dish images for AI analysis. | Faras/Steven | 🔄 In Progress |
| **PB-05** | Feature | **Results Visualization**<br>Show annotated image with bounding boxes. | Provide clear visual feedback of AI detection results. | Wisnu/Suci | ⏳ Pending |

## 🟡 P1 - High Priority

| ID | Type | Feature / Story / Bug | Goal | Assignee | Status |
|----|------|-----------------------|------|----------|--------|
| **PB-06** | Feature | **CFU/ml Calculator**<br>Implement SA-001 calculation logic. | Automatically calculate standard colony forming units per ml. | Faras/Steven | ✅ Done |
| **PB-07** | Feature | **Simulator Module**<br>Manual input vs AI results. | Allow user validation of AI results for accuracy training. | Wisnu | ✅ Done |
| **PB-08** | Task | **PDF/CSV Export**<br>Generate summary reports. | Enable lab analysts to export standard compliant result reports. | Steven | ⏳ Pending |
| **PB-09** | Feature | **RBAC System**<br>6 roles (Analyst, Admin, Quality, etc). | Ensure ISO-compliant data security and access control. | Steven | ✅ Done |

## 🟢 P2 - Medium Priority

| ID | Type | Feature / Story / Bug | Goal | Assignee | Status |
|----|------|-----------------------|------|----------|--------|
| **PB-10** | Feature | **LIMS Integration**<br>Mock endpoint for external LIMS. | Allow seamless data flow into existing lab infrastructure. | Steven | ✅ Done |
| **PB-11** | Feature | **Audit Trail**<br>Log all critical actions. | Maintain compliance by tracking who updated or deleted data. | Steven | ✅ Done |
| **PB-12** | Bug | **Mobile Responsiveness Fixes**<br>Dashboard misaligned on mobile. | Ensure field analysts can read results properly on tablets. | Suci | ⏳ Pending |

## 🔵 P3 - Low Priority

| ID | Type | Feature / Story / Bug | Goal | Assignee | Status |
|----|------|-----------------------|------|----------|--------|
| **PB-13** | Feature | **Dark Mode**<br>Theme switch mechanism. | Reduce eye strain for analysts using dashboard during night shifts. | Suci | ❌ To Do |
| **PB-14** | Feature | **Multi-Language Support**<br>English/Indonesian toggle. | Expand usability to non-English speaking regional labs. | Wisnu | ❌ To Do |

---

## 📊 Progress Summary
- **Total Items:** 14
- **Done:** 8
- **In Progress:** 2
- **Pending:** 4
