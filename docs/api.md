# ColonyAI API Documentation

Base URL: `http://localhost:8000/api/v1`

All API endpoints return JSON responses. Authentication is required for most endpoints using JWT Bearer tokens.

## Table of Contents

- [Authentication](#authentication)
- [Images](#images)
- [Analyses](#analyses)
- [Reports](#reports)
- [Users](#users)
- [Error Handling](#error-handling)

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

Authenticate user and receive tokens.

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

**Error Response:** `401 Unauthorized`
```json
{
  "detail": "Incorrect email or password"
}
```

---

### POST /auth/refresh

Refresh an access token using a refresh token.

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

Logout user (client should delete tokens).

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

Get image details.

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

Delete an image.

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

Create a new plate analysis.

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
      "bbox": {
        "x": 100,
        "y": 150,
        "width": 20,
        "height": 20
      }
    },
    {
      "class_name": "bubble",
      "confidence": 0.88,
      "bbox": {
        "x": 200,
        "y": 180,
        "width": 15,
        "height": 15
      }
    }
  ],
  "annotated_image_url": "https://colonyai-images.s3.amazonaws.com/annotated/uuid.jpg"
}
```

**Field Descriptions:**
- `image_id`: UUID of uploaded image
- `sample_id`: Your laboratory sample identifier
- `media_type`: Type of agar media used
- `dilution_factor`: Decimal dilution factor (e.g., 0.001 for 1:1000)
- `plated_volume_ml`: Volume plated in milliliters

---

### GET /analyses

List all analyses for the current user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `skip`: Number of records to skip (default: 0)
- `limit`: Number of records to return (default: 20, max: 100)

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

Get analysis details.

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

Get detailed analysis result with detections.

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
      "bbox": {
        "x": 100,
        "y": 150,
        "width": 20,
        "height": 20
      }
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

Generate a PDF report for an analysis.

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

Generate a CSV report for an analysis.

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

Download a generated report.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** File download (binary)

---

## Users

### GET /users/me

Get current user's profile.

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

Update current user's profile.

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
- `skip`: Number of records to skip (default: 0)
- `limit`: Number of records to return (default: 20)

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

All API errors follow this format:

```json
{
  "detail": "Error message here"
}
```

### Common HTTP Status Codes

| Code | Description | Common Causes |
|------|-------------|---------------|
| 200 | Success | Request completed successfully |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 422 | Validation Error | Request validation failed |
| 500 | Server Error | Internal server error |

### Example Error Responses

**Validation Error:**
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

**Authentication Error:**
```json
{
  "detail": "Invalid or expired token"
}
```

**Permission Error:**
```json
{
  "detail": "Insufficient permissions"
}
```

---

## Rate Limiting

API requests are limited to:
- **100 requests per minute** per IP address
- **1000 requests per hour** per authenticated user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1617234567
```

---

## Webhooks (Future)

Webhook support for analysis completion events coming soon.

---

## SDKs & Libraries

Official SDKs coming soon for:
- Python
- JavaScript/TypeScript
- Java

---

## Support

For API support, contact: wisnu.ashar@student.president.ac.id
