# ColonyAI User Manual

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Performing Plate Analysis](#performing-plate-analysis)
4. [Viewing Results](#viewing-results)
5. [Managing Your History](#managing-your-history)
6. [Generating Reports](#generating-reports)
7. [Settings & Configuration](#settings--configuration)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Creating Your Account

1. Navigate to your laboratory's ColonyAI URL
2. Click **Register** on the login page
3. Fill in your details:
   - Full Name
   - Email (must be valid)
   - Password (minimum 8 characters)
   - Role (if applicable)
4. Click **Create Account**
5. You will be automatically logged in

### First Login

After logging in, you'll see the **Dashboard** with:
- Quick statistics
- Recent analyses
- Quick action buttons

---

## Dashboard Overview

The dashboard is your home base. Here's what you'll find:

### Key Metrics

| Metric | Description |
|--------|-------------|
| **Total Analyses** | Total number of analyses you've performed |
| **Avg. Time Saved** | Average time saved per analysis compared to manual counting |
| **Success Rate** | Percentage of analyses completed successfully |
| **Pending Review** | Analyses requiring your attention |

### Weekly Chart

A bar chart showing your analysis volume over the past 7 days.

### Quick Actions

- **New Analysis**: Start a new plate count analysis
- **View History**: Browse your past analyses

### Recent Analyses Table

Shows your 5 most recent analyses with:
- Sample ID
- Media Type
- Colony Count
- CFU/ml result
- Status (Completed/Pending Review)
- Timestamp

---

## Performing Plate Analysis

### Step 1: Upload Plate Image

1. Click **New Analysis** in the sidebar or dashboard
2. You'll see two panels: **Upload Plate Image** and **Sample Information**

#### Upload Options:

**Option A: Drag & Drop**
- Drag your image file directly onto the upload area
- Supported formats: JPEG, PNG, WebP
- Maximum file size: 10MB

**Option B: Click to Upload**
- Click "Upload a file" to open file browser
- Select your plate image

**Option C: Camera Capture**
- On mobile devices, you can use your camera
- Click the camera icon (if available)

### Step 2: Enter Sample Information

Fill in the required fields:

| Field | Description | Example |
|-------|-------------|---------|
| **Sample ID** | Your laboratory's sample identifier | FOOD-2026-001 |
| **Media Type** | Type of agar media used | Plate Count Agar (PCA) |
| **Dilution Factor** | Decimal dilution factor | 0.001 (for 1:1000) |
| **Plated Volume (ml)** | Volume plated in milliliters | 1.0 or 0.1 |

#### Dilution Factor Guide:

| Dilution | Factor |
|----------|--------|
| 1:10 | 0.1 |
| 1:100 | 0.01 |
| 1:1,000 | 0.001 |
| 1:10,000 | 0.0001 |
| 1:100,000 | 0.00001 |

### Step 3: Start Analysis

1. Review your entries
2. Click **Start Analysis**
3. Wait 1-2 minutes for processing
4. You'll be notified when results are ready

---

## Viewing Results

Once analysis is complete, you'll see:

### Results Overview

- **Annotated Image**: Your plate image with detected colonies marked
  - 🟢 **Green boxes**: Valid colonies
  - 🔴 **Red boxes**: Artifacts (bubbles, dust, cracks)

### Detection Summary

| Metric | Description |
|--------|-------------|
| **Total Colonies** | Number of valid bacterial colonies detected |
| **CFU/ml** | Calculated Colony Forming Units per milliliter |
| **Confidence Score** | AI model's average confidence (0-100%) |
| **Status** | Result validity indicator |

### Status Indicators

| Status | Meaning | Action |
|--------|---------|--------|
| ✅ **Valid** | Result is within countable range (25-250) | Ready for reporting |
| ⚠️ **TNTC** | Too Numerous To Count (>250) | Consider higher dilution |
| ⚠️ **TFTC** | Too Few To Count (<25) | Consider lower dilution |

### Colony Classifications

The AI detects 5 types of objects:

1. **colony_single**: Individual, well-separated colonies
2. **colony_merged**: Overlapping or touching colonies
3. **bubble**: Air bubbles (excluded from count)
4. **dust_debris**: Dust particles or debris (excluded)
5. **media_crack**: Cracks in agar media (excluded)

### Reviewing Detections

1. Hover over detection boxes to see details
2. Click on a detection to highlight it
3. Review the confidence score for each detection
4. If needed, flag for manual review

### Approving Results

1. Review the annotated image and counts
2. Verify the CFU/ml calculation
3. Click **Approve & Save** to finalize
4. Or click **Flag for Review** if uncertain

---

## Managing Your History

### Accessing History

Click **History** in the sidebar to view all your analyses.

### Filtering Results

Use the filters at the top:

- **Search Box**: Search by Sample ID or Media Type
- **Status Filter**: Filter by completion status
- **More Filters**: Access advanced filters (date range, media type, etc.)

### Understanding the Table

| Column | Description |
|--------|-------------|
| **Sample ID** | Your sample identifier |
| **Media Type** | Agar media used |
| **Dilution** | Dilution factor applied |
| **Colonies** | Number of colonies detected |
| **CFU/ml** | Calculated result |
| **Date** | When analysis was performed |
| **Status** | Current status |

### Actions

For each analysis, you can:

- 👁️ **View**: See detailed results and annotated image
- ⬇️ **Download**: Export individual report
- 🗑️ **Delete**: Remove analysis (with confirmation)

### Pagination

- Navigate through pages using the pagination controls
- Default: 20 results per page
- Adjust page size in Settings

---

## Generating Reports

### Types of Reports

1. **Daily Summary**: All analyses from a single day
2. **Weekly Report**: Past 7 days summary
3. **Monthly Summary**: Complete month overview
4. **Custom Range**: Select specific date range
5. **Individual Analysis**: Single analysis detailed report

### Generating a Report

1. Click **Reports** in the sidebar
2. Choose report type:
   - Daily Summary
   - Weekly Report
   - Custom Range
3. Select date(s)
4. Choose format:
   - **PDF**: Formatted report with charts and images
   - **CSV**: Raw data for spreadsheet analysis
5. Click **Generate Report**

### Report Contents

**PDF Report includes:**
- Cover page with laboratory name and date range
- Executive summary
- Statistics overview
- Detailed analysis list
- Trend charts
- Annotated sample images
- Digital signature and timestamp

**CSV Report includes:**
- All analysis metadata
- Detection details
- CFU/ml calculations
- Ready for import to LIMS

### Downloading Reports

1. Go to **Reports** page
2. Find your report in the **Recent Reports** list
3. Click **Download**
4. Reports are available for 30 days

### Report Status

| Status | Description |
|--------|-------------|
| **Generating** | Report is being created (usually <30 seconds) |
| **Ready** | Available for download |
| **Expired** | Older than 30 days (needs regeneration) |

---

## Settings & Configuration

### Profile Settings

Update your personal information:
- Full Name
- Email address
- Password

### Notification Preferences

Control what notifications you receive:

| Notification | Description | Default |
|--------------|-------------|---------|
| **Analysis Complete** | When analysis finishes | ✅ Enabled |
| **TNTC/TFTC Alerts** | When results out of range | ✅ Enabled |
| **Weekly Summary** | Weekly analytics summary | ❌ Disabled |

### Security Settings

- Change password
- View active sessions
- Enable two-factor authentication (if available)

### Laboratory Configuration

Set your laboratory defaults:
- Laboratory Name
- Default Media Type
- Default Plated Volume
- Custom dilution factors

### Appearance

- Theme: Light / Dark / System
- Language: English / Bahasa Indonesia

---

## Best Practices

### Image Capture

✅ **DO:**
- Take photos from directly above the plate
- Use even, diffused lighting
- Ensure entire plate is visible
- Use a plain, dark background
- Keep camera steady (use tripod if possible)
- Capture at high resolution (at least 1920x1080)

❌ **DON'T:**
- Take photos at an angle
- Use flash (causes glare)
- Include rulers or labels in frame
- Have shadows across the plate
- Use blurry or out-of-focus images

### Sample Preparation

✅ **DO:**
- Use appropriate dilution to get 25-250 colonies
- Spread sample evenly on plate
- Incubate plates properly
- Label plates clearly on the bottom edge
- Use fresh, uncontaminated media

❌ **DON'T:**
- Overcrowd plates (leads to TNTC)
- Use too low dilution (leads to TFTC)
- Stack plates for photos
- Write on areas that will be photographed

### Data Entry

✅ **DO:**
- Double-check Sample ID format
- Verify dilution factor accuracy
- Use consistent media type naming
- Record plated volume precisely

❌ **DON'T:**
- Leave fields blank
- Guess dilution factors
- Mix up sample IDs
- Use approximate values

### Result Review

✅ **DO:**
- Always review annotated images
- Check for misclassifications
- Verify CFU/ml calculations
- Flag uncertain results for manual verification

❌ **DON'T:**
- Approve without reviewing
- Ignore low-confidence detections
- Skip the review step
- Override without documentation

---

## Troubleshooting

### Common Issues

#### "File type not allowed"

**Problem**: Upload rejected your file

**Solution**:
- Ensure file is JPEG, PNG, or WebP
- Convert other formats using image editor
- Check file extension matches actual format

#### "File size exceeds 10MB"

**Problem**: Image too large

**Solution**:
- Compress image using online tool
- Reduce resolution (minimum 1920x1080 recommended)
- Use JPEG format instead of PNG

#### "Analysis failed"

**Problem**: Analysis didn't complete

**Possible Causes**:
- Poor image quality
- Plate not visible in image
- Server error

**Solutions**:
1. Retake photo with better lighting
2. Ensure plate fills most of frame
3. Check internet connection
4. Try again in a few minutes
5. Contact support if issue persists

#### "TNTC Result"

**Problem**: Too Many To Count (>250 colonies)

**What it means**: Plate is overcrowded, count unreliable

**Solution**:
- Use higher dilution (e.g., 1:10,000 instead of 1:1,000)
- Plate smaller volume
- Spread sample more evenly

#### "TFTC Result"

**Problem**: Too Few To Count (<25 colonies)

**What it means**: Too few colonies for statistical reliability

**Solution**:
- Use lower dilution (e.g., 1:100 instead of 1:1,000)
- Plate larger volume
- Use multiple plates and average

#### "Low confidence score"

**Problem**: AI uncertain about detections

**Possible Causes**:
- Poor lighting
- Overlapping colonies
- Unusual colony morphology
- Artifacts confusing the model

**Solutions**:
1. Improve image quality
2. Flag for manual review
3. Retake photo with better conditions
4. Contact support for model improvement

#### "Cannot login"

**Problem**: Authentication fails

**Solutions**:
1. Verify email and password
2. Check caps lock
3. Reset password if forgotten
4. Clear browser cache
5. Contact administrator if account locked

---

## Getting Help

### Documentation

- This user manual
- [API Documentation](./api.md)
- [System Architecture](./architecture.md)

### Contact Support

**Team Lead**: Wisnu Alfian Nur Ashar  
**Email**: wisnu.ashar@student.president.ac.id  
**WhatsApp**: +62 813-9488-2490

### Reporting Bugs

When reporting issues, include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Screenshots (if applicable)
5. Browser and OS version

---

## Training Resources

### For New Analysts

1. **Watch Tutorial Videos** (coming soon)
2. **Practice with Sample Images** in test environment
3. **Read FDA BAM Chapter 3** for TPC methodology
4. **Complete ISO 17025 Training** for laboratory standards

### Quick Reference Card

**CFU/ml Formula**:
```
CFU/ml = Colony Count / (Plated Volume × Dilution Factor)
```

**Countable Range**: 25-250 colonies per plate

**Typical Analysis Time**: 1-2 minutes

**Support Contact**: wisnu.ashar@student.president.ac.id

---

**Last Updated**: April 8, 2026  
**Version**: 1.0.0
