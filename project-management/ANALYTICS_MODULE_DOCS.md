# ColonyAI Intelligence - Analytics Module Documentation

## 1. Overview
The **Analytics Module** serves as the primary data intelligence dashboard for ColonyAI. It provides a comprehensive view of laboratory throughput, neural detection query performance, and historical compliance trends. The interface is designed with a Cloudflare-style aesthetic, emphasizing data clarity, precision, and actionable insights.

## 2. Key Features

### 2.1. Query Overview & Protocol Distribution
This section breaks down the total volume of neural analyses categorized by their specific microbiological protocols.
*   **PCA Matrix**: Plate Count Agar queries.
*   **VRBA Matrix**: Violet Red Bile Agar queries.
*   **BGBB Protocol**: Brilliant Green Bile Broth queries.
*   **R2A Analytics**: Reasoner's 2A agar queries.
*   **TSA Diagnostic**: Tryptic Soy Agar queries.

### 2.2. Time-Series Neural Chart
An interactive data visualization (`recharts`) that plots laboratory activity over the selected time horizon (e.g., Last 30 days).
*   **Average CFU (Density)**: Tracks the median Colony Forming Units detected per ml.
*   **Test Count**: Total volume of queries processed per day.
*   **Pass Rate**: Percentage of valid, verified analyses without critical warnings.
*   *Interactive Tooltips*: Hovering over the chart reveals detailed daily metrics, including TNTC/TFTC boundary warnings.

### 2.3. Query Statistics
Global metrics that define system performance and utilization:
*   **Total Queries**: Absolute number of analyses processed in the selected timeframe.
*   **Average Queries Per Second (QPS)**: System load metric (baseline simulated at 0.035).
*   **Average Processing Time**: The latency of the SA-001 neural algorithm (baseline simulated at 2.447ms).

### 2.4. Intelligence Ledger (Monthly Summary)
A tabular aggregation of historical data grouped by month, representing long-term compliance and operational capacity.
*   **Diagnostic Cycle**: The reporting month (e.g., Mar 2026).
*   **Total Sequences**: Total specimens analyzed in that cycle.
*   **Density Median**: The average CFU/ml recorded.
*   **Compliance Integrity**: A progress bar representing the percentage of successful, verified detections versus rejections.
*   **Authorized Personnel**: Analysts active during that cycle.

## 3. Data Integration & Demo Mode
Currently, the Analytics page is powered by the **ColonyAI Demo Engine**. 
*   **Configuration**: `USE_DEMO_DATA = true` is set in `src/app/dashboard/analytics/page.tsx`.
*   **Dataset**: It utilizes `ALL_DEMO_ANALYSES` from `src/lib/demo-data.ts`, providing a rich dataset of 40 simulated specimens with randomized completion statuses, CFU counts, and timestamps spread over the last 30 days.
*   **Export Functionality**: Users can click "Download data" to trigger a CSV export simulation of the current data matrix.

## 4. Operational Guidelines
For live production deployment, the `USE_DEMO_DATA` flag must be set to `false`. The module will automatically revert to querying the `/api/v1/analyses/` backend endpoint, applying the selected date range and media filters to fetch live data batches via pagination.
