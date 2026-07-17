# ColonyAI User Manual

> Version 2.0 | July 2026

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Performing Plate Analysis](#performing-plate-analysis)
4. [Viewing Results](#viewing-results)
5. [Managing Your History](#managing-your-history)
6. [Simulator: AI vs Manual Comparison](#simulator-ai-vs-manual-comparison)
7. [Generating Reports](#generating-reports)
8. [Settings & Configuration](#settings--configuration)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)
11. [FAQ](#faq)

---

## Getting Started

### Creating Your Account

1. Navigate to your laboratory's ColonyAI URL
2. Click **Register** on the login page
3. Fill in your details:
   - **Full Name** — your complete name
   - **Email** — must be a valid email address
   - **Password** — minimum 8 characters with mixed case
   - **Role** — assigned by your laboratory admin (Analyst, Manager, etc.)
4. Click **Create Account**
5. You will be automatically logged in and redirected to the Dashboard

### First Login

After logging in, you'll see the **Dashboard** with:
- Quick statistics cards (Total Analyses, Avg. Time Saved, Success Rate)
- Recent analyses table
- Quick action buttons (New Analysis, View History)

---

## Dashboard Overview

The dashboard is your central hub. Here's what you'll find:

### Key Metrics Cards

| Metric | Description |
|--------|-------------|
| **Total Analyses** | Cumulative count of all analyses you've performed |
| **Avg. Time Saved** | Average time saved vs manual counting (typically 10-15 min per plate) |
| **Success Rate** | Percentage of analyses completed without errors |
| **Pending Review** | Analyses flagged for your attention |

### Weekly Activity Chart

A bar chart (powered by Recharts) showing your analysis volume over the past 7 days. Hover over bars for exact counts.

### Quick Actions

- **New Analysis** — Start a new plate count analysis
- **View History** — Browse and search past analyses

### Recent Analyses Table

Shows your 5 most recent analyses with:

| Column | Description |
|--------|-------------|
| Sample ID | Your laboratory sample identifier |
| Media Type | Type of agar media used |
| Colony Count | Number of valid colonies detected |
| CFU/ml | Calculated result with scientific notation |
| Status | Completed, Pending Review, or Failed |
| Timestamp | Date and time of analysis |

---

## Performing Plate Analysis

### Step 1: Upload Plate Image

Click **New Analysis** in the sidebar or use the quick action on the dashboard.

#### Three Upload Methods:

**A. Drag & Drop**
- Drag your image file directly onto the upload zone
- Supported: JPEG, PNG, WebP (max 10MB)

**B. Click to Upload**
- Click "Upload a file" to open your file browser
- Select your plate image

**C. Camera Capture**
- Available on mobile devices
- Click the camera icon
- Ensure even lighting and top-down angle

### Step 2: Enter Sample Information

Complete the required metadata fields:

| Field | Description | Example |
|-------|-------------|---------|
| **Sample ID** | Your laboratory's unique sample identifier | FOOD-2026-001 |
| **Media Type** | Type of agar media used | Plate Count Agar (PCA), VRBA, BGBB, R2A, MacConkey |
| **Dilution Factor** | Decimal dilution factor | 0.001 (for 1:1000) |
| **Plated Volume (ml)** | Volume plated in milliliters | 1.0 or 0.1 |

#### Dilution Factor Quick Reference:

| Dilution | Factor | Common Use |
|----------|--------|------------|
| 1:10 | 0.1 | High-concentration samples |
| 1:100 | 0.01 | Moderate samples |
| 1:1,000 | 0.001 | Standard food testing |
| 1:10,000 | 0.0001 | Environmental samples |
| 1:100,000 | 0.00001 | Highly contaminated samples |

### Step 3: Start Analysis

1. Review your sample information
2. Click **Start Analysis**
3. Processing takes approximately 1-2 minutes
4. You will be notified when results are ready (notification bell in header)

---

## Viewing Results

### Results Overview

Your analysis results include:

**Annotated Image:**
- Green bounding boxes: Valid colonies (colony_single, colony_merged)
- Red bounding boxes: Artifacts (bubble, dust_debris, media_crack)
- Hover over any box to see class name and confidence score

### Detection Summary

| Metric | Description |
|--------|-------------|
| **Total Colonies** | Sum of valid bacterial colonies detected |
| **CFU/ml** | Calculated Colony Forming Units per milliliter (scientific notation) |
| **Confidence Score** | AI model's aggregate confidence (0-100%) |
| **Status** | Indicator of result validity |

### Status Indicators

| Status | Meaning | Recommended Action |
|--------|---------|--------------------|
| **Valid** | Colony count within countable range (25-250) | Ready for reporting and sign-off |
| **TNTC** | Too Numerous To Count (>250 colonies) | Re-test with higher dilution |
| **TFTC** | Too Few To Count (<25 colonies) | Re-test with lower dilution or plate larger volume |

### Detection Details Table

The Neural Object Registry table lists every detected object:

| Column | Description |
|--------|-------------|
| # | Sequential index |
| Class | Object class (colony_single, bubble, etc.) |
| Confidence | AI confidence percentage |
| BBox | Bounding box coordinates (x, y, w, h) |

### Reviewing and Approving

1. Review the annotated image and detection table
2. Verify the CFU/ml calculation
3. Click **Approve & Save** to finalize the record
4. Or click **Flag for Review** if you need a second opinion
5. Click **Re-analyze** if the image quality was poor

---

## Managing Your History

### Accessing History

Click **History** in the sidebar to view all your analyses.

### Filtering & Search

| Filter | Description |
|--------|-------------|
| **Search Box** | Free-text search by Sample ID or Media Type |
| **Status Filter** | Completed, Pending Review, Failed |
| **Date Range** | Select start and end dates |
| **Media Type** | Filter by specific agar media |

### Column Definitions

| Column | Description |
|--------|-------------|
| Sample ID | Your sample identifier |
| Media Type | Agar media used |
| Dilution | Dilution factor applied |
| Colonies | Number of colonies detected |
| CFU/ml | Calculated result |
| Date | When analysis was performed |
| Status | Current status indicator |

### Available Actions

For each analysis entry:

- **View** (eye icon) — See detailed results and annotated image
- **Download** (arrow icon) — Export individual PDF or CSV report
- **Delete** (trash icon) — Remove analysis (requires confirmation)

### Pagination

- Navigate using page controls at the bottom
- Default: 20 records per page
- Adjust page size in **Settings**

---

## Simulator: AI vs Manual Comparison

The **Simulator** page (`/dashboard/simulator`) allows direct comparison between AI inference and manual counting — a key feature for competition validation.

### How to Use

1. Click **Simulator** in the sidebar
2. Upload a plate image
3. AI processes the image and shows detection results
4. Enter your manual count in the provided field
5. View the side-by-side comparison

### Results Display

| Metric | AI | Manual | Difference |
|--------|-----|--------|------------|
| Colony Count | 156 | 148 | 8 (5.4%) |
| Accuracy | 94.1% | Reference | - |

### Export Comparison

- Export the comparison as a PDF report for validation purposes
- Comparison data is stored in the audit log

---

## Generating Reports

### Types of Reports

| Report Type | Description | Best For |
|-------------|-------------|----------|
| **Individual Analysis** | Single analysis with full details | Case documentation |
| **Daily Summary** | All analyses from one day | Daily lab logs |
| **Weekly Report** | Past 7 days summary | Management reporting |
| **Custom Range** | Specific date range | Investigation |

### How to Generate

1. Click **Reports** in the sidebar
2. Choose report type
3. Select date range (for summary reports)
4. Choose format:
   - **PDF** — Formatted report with logo, charts, and images
   - **CSV** — Raw data for spreadsheet analysis
5. Click **Generate Report**

### PDF Report Contents

- **Cover Page**: Laboratory name, date range, report ID
- **Executive Summary**: Key metrics and statistics
- **Detailed Analysis List**: Each analysis with full results
- **Charts**: Trend visualization
- **Annotated Images**: Sample images with detection overlays
- **Digital Signature**: Timestamp and auditor information

### CSV Report Contents

- All analysis metadata
- Detection details per analysis
- CFU/ml calculations
- Ready for import to LIMS or Excel

### Report Availability

- Reports are stored for **30 days**
- Expired reports must be regenerated
- Download from the Reports page

---

## Settings & Configuration

### Profile Settings

- **Full Name** — Update your display name
- **Email** — Change your email address
- **Password** — Update your password (requires current password)

### Notification Preferences

| Notification | Description | Default |
|--------------|-------------|---------|
| Analysis Complete | Notify when analysis finishes | ON |
| TNTC/TFTC Alerts | Alert when results out of range | ON |
| Weekly Summary | Weekly analytics email | OFF |

### Security

- **Change Password** — Standard password update
- **Active Sessions** — View and revoke active login sessions
- **Two-Factor Authentication** — Available if configured by admin

### Laboratory Configuration

- **Laboratory Name** — Displayed on report headers
- **Default Media Type** — Pre-selected for new analyses
- **Default Plated Volume** — Pre-filled volume
- **Custom Dilution Factors** — Add frequently used dilutions

### Appearance

- **Theme**: Light / Dark / System default
- **Language**: English / Bahasa Indonesia

---

## Best Practices

### Image Capture Guide

#### DO:
- Take photos from directly above the plate (90° angle)
- Use even, diffused lighting (avoid direct flash)
- Ensure entire plate is visible within the frame
- Use a plain, dark, non-reflective background
- Keep the camera steady (use a tripod or copy stand)
- Capture at high resolution (minimum 1920x1080)
- Clean the plate lid if foggy or smudged

#### DON'T:
- Take photos at an angle (causes perspective distortion)
- Use flash (creates glare and hotspots)
- Include rulers, labels, or markers in the frame
- Allow shadows to fall across the plate surface
- Upload blurry or out-of-focus images

### Sample Preparation

#### DO:
- Use appropriate dilution to achieve 25-250 colonies per plate
- Spread inoculum evenly across the agar surface
- Incubate plates for the proper duration and temperature
- Label plates clearly on the bottom edge (not the lid)
- Use fresh, uncontaminated media

#### DON'T:
- Overcrowd plates (results in TNTC with unreliable counts)
- Use insufficient dilution (leads to TFTC)
- Stack plates for photography
- Place labels on surfaces that will be photographed

### Data Entry

#### DO:
- Double-check Sample ID format for consistency
- Verify dilution factor accuracy before submitting
- Use consistent media type naming conventions
- Record plated volume precisely

#### DON'T:
- Leave metadata fields blank
- Guess dilution factors
- Mix up sample IDs between different plates
- Use approximate values when exact values are known

### Result Review

#### DO:
- Always review the annotated image before approving
- Check for obvious misclassifications
- Verify CFU/ml calculation manually for critical samples
- Flag uncertain results for peer review

#### DON'T:
- Approve results without reviewing the annotated image
- Ignore low-confidence detections (below 70%)
- Skip the review step to save time
- Override results without documentation

---

## Troubleshooting

### "File type not allowed"

**Cause:** File format is not JPEG, PNG, or WebP.

**Solution:**
- Convert the file using image editing software
- Check that the file extension matches the actual format
- Take a screenshot and save as PNG if needed

### "File size exceeds 10MB"

**Cause:** Image file too large.

**Solution:**
- Compress using image editing tools (aim for <5MB)
- Reduce resolution to 1920x1080 (sufficient for accurate detection)
- Use JPEG format (smaller than PNG for photos)

### "Analysis failed"

**Possible Causes:**
- Poor image quality (blurry, dark, or angled)
- Plate not visible or too small in the frame
- Server error or timeout

**Solutions:**
1. Retake the photo with better lighting and framing
2. Ensure the plate fills at least 70% of the frame
3. Check your internet connection
4. Wait a few minutes and try again
5. Contact support if the problem persists

### TNTC Result (Too Numerous To Count)

**Meaning:** Plate contains more than 250 colonies. Count may be unreliable.

**Solution:**
- Prepare a higher dilution (e.g., 1:10,000 instead of 1:1,000)
- Plate a smaller volume
- Ensure even spreading of the sample

### TFTC Result (Too Few To Count)

**Meaning:** Plate contains fewer than 25 colonies. Statistically unreliable.

**Solution:**
- Use a lower dilution (e.g., 1:100 instead of 1:1,000)
- Plate a larger volume
- Consider using multiple plates and averaging

### Low Confidence Score

**Possible Causes:**
- Poor lighting or glare on the plate
- Overlapping colonies
- Unusual colony morphology
- Artifacts that confuse the model

**Solutions:**
1. Improve image quality and lighting
2. Flag for manual review by a senior analyst
3. Retake the photo under better conditions
4. Report unusual colony types for model improvement

### Cannot Login

**Solutions:**
1. Verify email and password are correct
2. Check that Caps Lock is not enabled
3. Use **Forgot Password** to reset
4. Clear browser cache and cookies
5. Contact your laboratory administrator if the account is locked

---

## FAQ

**Q: How accurate is ColonyAI compared to manual counting?**
A: ColonyAI achieves 94.1% mAP@0.5 accuracy, exceeding the average senior analyst (91.2%) with 92.5% less variability.

**Q: What image resolution is recommended?**
A: Minimum 1920x1080 pixels. Higher resolution allows detection of very small colonies.

**Q: Can I use ColonyAI with any type of agar?**
A: Yes. The model performs well across 8+ media types including PCA, VRBA, BGBG, R2A, and MacConkey.

**Q: How long does analysis take?**
A: Typically 1-2 minutes. CPU inference averages 42ms per image; GPU inference averages 8ms.

**Q: Is my data secure?**
A: Yes. All data is encrypted at rest (AES-256) and in transit (TLS 1.3). Audit logs use SHA-256 hash chaining for tamper evidence.

**Q: Can I export results to my LIMS?**
A: Yes. CSV and PDF export formats are available, and the REST API supports programmatic integration.

---

## Support

### Documentation

- [Getting Started](./01-getting-started.md)
- [API Reference](./03-api-reference.md)
- [System Architecture](./04-architecture.md)

### Contact

**Team Lead:** Wisnu Alfian Nur Ashar  
**Email:** wisnu.ashar@student.president.ac.id  
**WhatsApp:** +62 813-9488-2490

### Reporting Bugs

When reporting issues, include:
1. Steps to reproduce the problem
2. Expected vs actual behavior
3. Screenshots (if applicable)
4. Browser and OS version
5. Network console errors (if any)

---

## Quick Reference

**CFU/ml Formula:**
```
CFU/ml = Colony Count / (Plated Volume × Dilution Factor)
```

**Countable Range:** 25-250 colonies per plate

**Typical Analysis Time:** 1-2 minutes (including upload and review)

---

_Last Updated: July 2026 | Version: 2.0.0_
