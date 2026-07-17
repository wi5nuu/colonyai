# ColonyAI API Reference

> Base URL: `http://localhost:8000/api/v1`  
> All endpoints return JSON responses. Authentication uses JWT Bearer tokens.

---

## Table of Contents

- [Authentication](#authentication)
- [Images](#images)
- [Analyses](#analyses)
- [Reports](#reports)
- [Users](#users)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Webhooks](#webhooks)

---

## Authentication

### POST /auth/register

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe",
  "role": "analyst"
}
```

**Response:** `201 Created`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

**Error Response:** `400 Bad Request`
```json
{
  "detail": "Email already registered"
}
```

---

### POST /auth/login

Authenticate user and receive JWT tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

---

### POST /auth/refresh

Refresh an access token using a valid refresh token.

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

---

### POST /auth/logout

Invalidate the current access token (adds JTI to blacklist).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "message": "Successfully logged out"
}
```

---

## Images

### POST /images/upload

Upload a plate image for analysis.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request Body:**
- `file`: Image file (JPEG, PNG, WebP, max 10MB)

**Response:** `200 OK`
```json
{
  "image_id": "550e8400-e29b-41d4-a716-446655440000",
  "original_url": "https://colonyai-images.s3.amazonaws.com/original/uuid.jpg"
}
```

**Error Response:** `400 Bad Request`
```json
{
  "detail": "File type not allowed. Allowed types: image/jpeg, image/png, image/webp"
}
```

---

### GET /images/{image_id}

Get image metadata and URLs.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "image_id": "550e8400-e29b-41d4-a716-446655440000",
  "original_url": "https://colonyai-images.s3.amazonaws.com/original/uuid.jpg",
  "uploaded_at": "2026-04-08T10:30:00Z"
}
```

---

### DELETE /images/{image_id}

Delete an image from storage.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "message": "Image deleted successfully"
}
```

---

## Analyses

### POST /analyses

Create a new plate analysis and trigger AI inference.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "image_id": "550e8400-e29b-41d4-a716-446655440000",
  "sample_id": "FOOD-2026-001",
  "media_type": "Plate Count Agar",
  "dilution_factor": 0.001,
  "plated_volume_ml": 1.0
}
```

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `image_id` | UUID | UUID of previously uploaded image |
| `sample_id` | string | Your laboratory sample identifier |
| `media_type` | string | Type of agar media (PCA, VRBA, R2A, etc.) |
| `dilution_factor` | float | Decimal dilution factor (e.g., 0.001 for 1:1000) |
| `plated_volume_ml` | float | Volume plated in milliliters |

**Response:** `200 OK`
```json
{
  "analysis_id": "660e8400-e29b-41d4-a716-446655440001",
  "colony_count": 156,
  "cfu_per_ml": 156000.0,
  "confidence_score": 0.92,
  "status": "completed",
  "detections": [
    {
      "class_name": "colony_single",
      "confidence": 0.95,
      "bbox": { "x": 100, "y": 150, "width": 20, "height": 20 }
    },
    {
      "class_name": "bubble",
      "confidence": 0.88,
      "bbox": { "x": 200, "y": 180, "width": 15, "height": 15 }
    }
  ],
  "annotated_image_url": "https://colonyai-images.s3.amazonaws.com/annotated/uuid.jpg"
}
```

---

### GET /analyses

List all analyses for the current user (paginated).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type | Default | Max |
|-----------|------|---------|-----|
| `skip` | integer | 0 | - |
| `limit` | integer | 20 | 100 |

**Response:** `200 OK`
```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "sample_id": "FOOD-2026-001",
    "media_type": "Plate Count Agar",
    "colony_count": 156,
    "cfu_per_ml": 156000.0,
    "status": "completed",
    "created_at": "2026-04-08T10:30:00Z"
  }
]
```

---

### GET /analyses/{analysis_id}

Get detailed analysis metadata.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "user_id": "user-uuid",
  "sample_id": "FOOD-2026-001",
  "media_type": "Plate Count Agar",
  "dilution_factor": 0.001,
  "plated_volume_ml": 1.0,
  "colony_count": 156,
  "cfu_per_ml": 156000.0,
  "confidence_score": 0.92,
  "status": "completed",
  "created_at": "2026-04-08T10:30:00Z",
  "updated_at": "2026-04-08T10:31:00Z"
}
```

---

### GET /analyses/{analysis_id}/result

Get detailed analysis results with all detections.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "analysis_id": "660e8400-e29b-41d4-a716-446655440001",
  "colony_count": 156,
  "cfu_per_ml": 156000.0,
  "cfu_formatted": "1.56e+05 CFU/ml",
  "status": "valid",
  "detections": [
    {
      "class_name": "colony_single",
      "confidence": 0.95,
      "bbox": { "x": 100, "y": 150, "width": 20, "height": 20 }
    }
  ],
  "summary": {
    "colony_single": 145,
    "colony_merged": 11,
    "bubble": 5,
    "dust_debris": 2,
    "media_crack": 0
  },
  "annotated_image_url": "https://colonyai-images.s3.amazonaws.com/annotated/uuid.jpg"
}
```

---

## Reports

### POST /reports/pdf/{analysis_id}

Generate a BPOM-compliant PDF report.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "report_id": "rpt-uuid",
  "file_url": "https://colonyai-images.s3.amazonaws.com/reports/rpt-uuid.pdf",
  "expires_at": "2026-04-09T10:30:00Z"
}
```

---

### POST /reports/csv/{analysis_id}

Generate a CSV report for LIMS import.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "report_id": "rpt-uuid",
  "file_url": "https://colonyai-images.s3.amazonaws.com/reports/rpt-uuid.csv",
  "expires_at": "2026-04-09T10:30:00Z"
}
```

---

### GET /reports/{report_id}/download

Download a generated report file.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK` — Binary file download (PDF or CSV)

---

## Model Management (Admin)

> **Base URL**: `/api/v1/admin/models`

### GET /admin/models

List all uploaded model files with metadata.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "models": [
    {
      "filename": "colony_best_new.pt",
      "filesize_bytes": 6251954,
      "uploaded_at": "2026-07-16T10:30:00Z",
      "active": true
    },
    {
      "filename": "colony_v2.onnx",
      "filesize_bytes": 5241004,
      "uploaded_at": "2026-07-16T11:00:00Z",
      "active": false
    }
  ]
}
```

---

### POST /admin/models/upload

Upload a new model file (`.pt`, `.onnx`, `.engine`).

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request Body:**
- `file`: Model file (PyTorch `.pt`, ONNX `.onnx`, or TensorRT `.engine`)

**Response:** `201 Created`
```json
{
  "filename": "colony_v2.pt",
  "filesize_bytes": 5241004,
  "message": "Model uploaded successfully"
}
```

**Error Response:** `400 Bad Request`
```json
{
  "detail": "File type not allowed. Allowed: .pt, .onnx, .engine"
}
```

---

### POST /admin/models/activate

Activate a model by filename (instantly switches detection engine).

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "filename": "colony_v2.pt"
}
```

**Response:** `200 OK`
```json
{
  "message": "Model 'colony_v2.pt' activated successfully (was: colony_best_new.pt)"
}
```

---

### DELETE /admin/models/{filename}

Delete an uploaded model file (cannot delete the currently active model).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "message": "Model 'colony_v2.pt' deleted successfully"
}
```

**Error Response:** `400 Bad Request`
```json
{
  "detail": "Cannot delete the currently active model"
}
```

---

## Users

### GET /users/me

Get the authenticated user's profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "analyst"
}
```

---

### PUT /users/me

Update the authenticated user's profile.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "full_name": "Jane Doe"
}
```

**Response:** `200 OK`
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "full_name": "Jane Doe",
  "role": "analyst"
}
```

---

### GET /users/

List all users (admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type | Default |
|-----------|------|---------|
| `skip` | integer | 0 |
| `limit` | integer | 20 |

**Response:** `200 OK`
```json
[
  {
    "id": "user-uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "analyst",
    "created_at": "2026-01-15T08:00:00Z"
  }
]
```

---

## Error Handling

All API errors follow this standard format:

```json
{
  "detail": "Error message here"
}
```

### HTTP Status Codes

| Code | Description | Common Causes |
|------|-------------|---------------|
| 200 | Success | Request completed successfully |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input data, validation failure |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Insufficient role permissions |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Concurrent modification (optimistic locking) |
| 422 | Validation Error | Request body fails Pydantic validation |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal server error |

### Example Error Responses

**Validation Error (422):**
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error"
    }
  ]
}
```

**Authentication Error (401):**
```json
{
  "detail": "Invalid or expired token"
}
```

**Authorization Error (403):**
```json
{
  "detail": "Insufficient permissions"
}
```

**Conflict Error (409):**
```json
{
  "detail": "Analysis was modified by another user. Please refresh and try again."
}
```

---

## Rate Limiting

API requests are rate-limited per IP address and per authenticated user:

| Scope | Limit | Algorithm |
|-------|-------|-----------|
| Per IP | 100 requests/minute | Token Bucket |
| Per Authenticated User | 1000 requests/hour | Token Bucket |

### Rate Limit Headers

Every response includes:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1617234567
```

When exceeded, a `429 Too Many Requests` response includes:
```
Retry-After: 60
```

---

## Webhooks (Future)

Webhook support for asynchronous analysis completion events is planned:

- **Event**: `analysis.completed`
- **Payload**: Full analysis result
- **Retry**: 3 attempts with exponential backoff

---

## SDKs & Libraries (Coming Soon)

| Language | Status |
|----------|--------|
| Python | Planned |
| JavaScript/TypeScript | Planned |
| Java | Planned |

---

## Interactive API Documentation

When the backend is running, explore and test endpoints at:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## Support

For API support or questions:

**Email**: wisnu.ashar@student.president.ac.id

---

_Last Updated: July 2026 | Version: 2.0.0_
