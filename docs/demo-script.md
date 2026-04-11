# ColonyAI Hackathon Demo Script

## Demo Overview (10 minutes)

### 1. Introduction (1 minute)
**Speaker**: Wisnu Alfian Nur Ashar

"Good [morning/afternoon], we are Team ColonyAI from President University. Today, we'll demonstrate our AI-powered Automated Plate Count Reader that solves a critical problem in microbiology laboratories."

**Problem Statement**:
- Manual colony counting is time-consuming (15-30 min per sample)
- High inter-analyst variability (10-25% difference)
- Bottleneck in food safety testing
- Skill-dependent expertise

**Our Solution**:
- AI-powered detection with ≥92% accuracy
- Reduce analysis time to under 2 minutes (80-90% reduction)
- Consistent, reproducible results
- No special hardware required

---

### 2. Live Demo (6 minutes)

#### Step 1: Login (30 seconds)
```
URL: http://localhost:3000/login
Demo Credentials:
- Email: demo@colonyai.com
- Password: demo123
```

**Narration**: "Let's start by logging into the ColonyAI dashboard..."

#### Step 2: Dashboard Overview (1 minute)
**Show**:
- Key metrics (Total Analyses, Time Saved, Success Rate)
- Weekly analytics chart
- Recent analyses table
- Quick action buttons

**Narration**: "Here we can see our laboratory's performance metrics. We've processed over 1,200 analyses with a 94% success rate, saving an average of 23 minutes per sample."

#### Step 3: New Analysis (3 minutes)
**Navigate to**: New Analysis

**Upload**: Use a sample agar plate image (prepare beforehand)

**Fill in**:
```
Sample ID: DEMO-2026-001
Media Type: Plate Count Agar
Dilution Factor: 0.001
Plated Volume: 1.0 ml
```

**Narration**: "Now let's perform a real analysis. We'll upload this plate image from a food safety sample. Notice we're using a 1:1000 dilution with 1ml plated volume."

**Click**: Start Analysis

**While processing**: "The AI is now preprocessing the image, detecting the plate boundary, and running colony detection. This typically takes 1-2 minutes."

#### Step 4: Review Results (1.5 minutes)
**Show**:
- Annotated image with bounding boxes
- Green boxes = valid colonies
- Red boxes = artifacts (bubbles, dust)
- Colony count and CFU/ml calculation
- Confidence score

**Narration**: "Here are our results. The AI detected 156 valid colonies with a confidence score of 92%. The calculated CFU/ml is 1.56 × 10^5, which is within the valid countable range. Notice how it correctly identified and excluded air bubbles and debris."

#### Step 5: History & Reports (30 seconds)
**Navigate to**: History

**Show**:
- Filterable analysis history
- Search functionality
- Export options

**Narration**: "All our analyses are stored here with full search and filter capabilities. We can export individual results or generate comprehensive reports."

---

### 3. Technical Architecture (2 minutes)

**Show Architecture Diagram**:

"Let me briefly explain how ColonyAI works under the hood:"

```
User (Browser) 
  ↓
Next.js Frontend (React + TypeScript)
  ↓ HTTPS
FastAPI Backend (Python)
  ↓
┌─────────────────────┐
│ Image Preprocessing │ → OpenCV (CLAHE, Plate Detection)
│ AI Inference        │ → YOLOv8 (5 classes, NMS)
│ CFU Calculation     │ → Automatic with TNTC/TFTC flags
└─────────────────────┘
  ↓
PostgreSQL + AWS S3 Storage
```

**Key Technologies**:
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python, OpenCV
- **AI Model**: YOLOv8 (fine-tuned on 18,000+ images)
- **Database**: PostgreSQL via Supabase
- **Storage**: AWS S3 with encryption

**Performance Metrics**:
- Detection Accuracy: ≥ 92%
- Inference Time: < 2 minutes
- Artifact Rejection: > 90%
- Supports 8+ media types

---

### 4. Impact & Business Model (1 minute)

**Impact**:
```
┌─────────────────────────────────┐
│ 80-90% Time Reduction           │
│ 5-8× Throughput Increase        │
│ 40% Labor Cost Reduction        │
│ Eliminates Inter-analyst Variability │
└─────────────────────────────────┘
```

**Business Model**:
- Starter: IDR 500K/month (500 analyses)
- Professional: IDR 1.5M/month (unlimited)
- Enterprise: Custom + LIMS integration

**Target Market**:
- 500+ accredited microbiology labs in Indonesia
- Asia-Pacific food testing market: USD 7B+ by 2027

---

### 5. Q&A Preparation (Buffer time)

**Anticipated Questions**:

1. **How accurate is the AI compared to expert analysts?**
   - "Our model achieves ≥92% detection accuracy, benchmarked against expert manual counting. We're continuously improving with more training data."

2. **What happens if the AI makes a mistake?**
   - "Every result includes confidence scores and is reviewed by an analyst before approval. The system flags uncertain detections for manual review."

3. **Can it handle overlapping colonies?**
   - "Yes, we specifically train on 'colony_merged' class to handle overlapping colonies. NMS algorithm helps resolve detections."

4. **How do you handle different lighting conditions?**
   - "Our preprocessing pipeline includes CLAHE normalization, and we augment training data with various lighting conditions."

5. **Is this compliant with ISO 17025?**
   - "Yes, we maintain immutable audit logs with timestamps, support analyst sign-off, and provide consistent, reproducible results."

6. **What's your competitive advantage?**
   - "No hardware lock-in, Indonesia-contextual design, artifact intelligence, and media-agnostic architecture at a fraction of competitor costs."

---

### 6. Demo Checklist

**Before Demo**:
- [ ] Backend running on localhost:8000
- [ ] Frontend running on localhost:3000
- [ ] Sample images prepared (at least 3 different media types)
- [ ] Database seeded with demo data
- [ ] All environment variables set
- [ ] Test login credentials working

**Backup Plan**:
- [ ] Pre-recorded demo video (5 minutes)
- [ ] Screenshots of key features
- [ ] Architecture diagrams ready
- [ ] Mock results prepared in case of technical issues

**Demo Environment**:
```bash
# Start backend
cd backend
uvicorn main:app --reload

# Start frontend
cd frontend
npm run dev

# Verify services
curl http://localhost:8000/health
curl http://localhost:3000
```

---

### 7. Closing Statement (30 seconds)

"ColonyAI represents a significant step forward in laboratory automation. By combining cutting-edge AI with practical laboratory workflows, we're making microbiology testing faster, more accurate, and more accessible. We're currently seeking pilot partners and would love to work with your laboratories. Thank you!"

**Contact Information**:
- **Email**: wisnu.ashar@student.president.ac.id
- **GitHub**: https://github.com/wi5nuu
- **WhatsApp**: +62 813-9488-2490

---

## Appendix: Technical Details

### Model Training Summary

**Dataset**:
- AGAR Public Dataset: 18,000+ images
- Augmented: 54,000+ images
- Classes: 5 (colony_single, colony_merged, bubble, dust_debris, media_crack)

**Training Configuration**:
```
Model: YOLOv8n
Epochs: 100
Batch Size: 16
Image Size: 512x512
Optimizer: Adam
Learning Rate: 0.001
```

**Results**:
```
mAP@0.5: 0.924
mAP@0.5:0.95: 0.756
Precision: 0.912
Recall: 0.898
```

### API Endpoints Used in Demo

1. `POST /api/v1/auth/login` - User authentication
2. `POST /api/v1/images/upload` - Image upload
3. `POST /api/v1/analyses` - Create analysis
4. `GET /api/v1/analyses/{id}/result` - Get results
5. `GET /api/v1/analyses` - List history

### Performance Benchmarks

| Operation | Time |
|-----------|------|
| Image Upload | < 2 seconds |
| Preprocessing | < 5 seconds |
| AI Inference | < 30 seconds |
| CFU Calculation | < 1 second |
| **Total** | **< 2 minutes** |

---

**Good luck with your presentation! 🚀**
