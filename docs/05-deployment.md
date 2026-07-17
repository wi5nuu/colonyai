# ColonyAI Deployment Guide

> Production deployment, scaling, and operations.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Backend Deployment (Railway)](#backend-deployment-railway)
4. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
5. [Docker Compose (Self-Hosted)](#docker-compose-self-hosted)
6. [Production Checklist](#production-checklist)
7. [Scaling Strategy](#scaling-strategy)
8. [Monitoring](#monitoring)
9. [CI/CD Pipeline](#cicd-pipeline)
10. [Backup Strategy](#backup-strategy)
11. [Security Hardening](#security-hardening)
12. [Rollback Procedure](#rollback-procedure)
13. [Cost Estimation](#cost-estimation)
14. [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Docker & Docker Compose | 20+ | Containerized deployment |
| Node.js | 18+ | Frontend build |
| Python | 3.10+ | Backend runtime |
| PostgreSQL | 14+ | Database |
| Git | - | Version control |

**Cloud Accounts Required:**
- Supabase (PostgreSQL database)
- AWS (S3 storage)
- Vercel (Frontend hosting)
- Railway (Backend hosting)

---

## Environment Setup

### 1. Database Setup (Supabase)

1. Create a new project at [Supabase](https://supabase.com)
2. From Settings → API, copy your project URL and anon key
3. Run database migrations:

```bash
cd backend
pip install -r requirements.txt
alembic upgrade head
```

4. Verify tables are created in Supabase SQL Editor

### 2. AWS S3 Setup

1. Create an S3 bucket named `colonyai-images`
2. Create an IAM user with programmatic access and the following policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::colonyai-images/*"
    }
  ]
}
```

3. Configure CORS on the bucket:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://your-domain.vercel.app",
      "https://colonyai.com"
    ],
    "ExposeHeaders": ["ETag"]
  }
]
```

### 3. Environment Variables

**Backend `.env`:**
```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/postgres

# JWT
JWT_SECRET_KEY=your-256-bit-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# S3
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=colonyai-images
AWS_REGION=ap-southeast-1

# Model
MODEL_PATH=./models/colony_best.pt
MODEL_CONFIDENCE_THRESHOLD=0.60
MODEL_IOU_THRESHOLD=0.45

# CORS
CORS_ORIGINS=https://colonyai-eta.vercel.app,https://colonyai.com

# Rate Limiting
RATE_LIMIT_PER_MINUTE=100
RATE_LIMIT_PER_HOUR=1000

# Logging
LOG_LEVEL=INFO
```

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1
```

---

## Backend Deployment (Railway)

### 1. Dockerfile

```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 2. railway.toml

```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "backend/Dockerfile"

[deploy]
startCommand = "uvicorn main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
restartPolicyType = "ON_FAILURE"

[[deploy.healthchecks]]
path = "/health"
interval = 30
timeout = 10
```

### 3. Deploy Steps

1. Push code to GitHub repository
2. Connect Railway to your GitHub repo
3. Railway auto-detects the Dockerfile
4. Set environment variables in Railway dashboard
5. Deploy (automatic on push to main branch)

---

## Frontend Deployment (Vercel)

### 1. vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

### 2. Deploy

```bash
npm i -g vercel
cd frontend
vercel --prod
```

### 3. Environment Variables

Set in Vercel dashboard:
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1
```

---

## Docker Compose (Self-Hosted)

### docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://colonyai:password@postgres:5432/colonyai
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - AWS_S3_BUCKET=${AWS_S3_BUCKET}
      - AWS_REGION=${AWS_REGION}
      - CORS_ORIGINS=http://localhost:3000
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend/models:/app/models
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
    depends_on:
      - backend
    restart: unless-stopped

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_USER=colonyai
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=colonyai
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped

volumes:
  postgres_data:
```

### Run

```bash
docker-compose up -d
```

---

## Production Checklist

- [ ] Database migrations applied successfully
- [ ] AWS S3 bucket created and CORS configured
- [ ] All backend environment variables set
- [ ] All frontend environment variables set
- [ ] SSL/TLS certificates configured (auto via Vercel/Let's Encrypt)
- [ ] CORS policies restrict to known origins
- [ ] Rate limiting enabled
- [ ] Monitoring and logging configured
- [ ] Automated daily backup strategy in place
- [ ] Load testing completed
- [ ] JWT_SECRET_KEY changed from default
- [ ] Database password changed from default
- [ ] Model weights uploaded to production server

---

## Scaling Strategy

### Horizontal Scaling (Docker Compose Production)

```yaml
services:
  backend:
    build: ./backend
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '2'
          memory: 4G
      restart_policy:
        condition: on-failure
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://redis:6379
```

### Auto-scaling on Railway

| Setting | Value |
|---------|-------|
| Min instances | 2 |
| Max instances | 10 |
| CPU threshold | 70% |
| Memory threshold | 80% |

---

## Monitoring

### Health Checks

```bash
# Backend
curl https://your-backend.railway.app/health
# Response: {"status": "healthy", "timestamp": "..."}

# Frontend
curl https://your-frontend.vercel.app
```

### Key Metrics to Monitor

| Metric | Warning | Critical |
|--------|---------|----------|
| API Response Time | >1s | >2s |
| Error Rate | >0.5% | >1% |
| Database Connections | >80% pool | >95% pool |
| S3 Storage | >70% capacity | >80% capacity |
| CPU Usage | >70% | >90% |
| Memory Usage | >75% | >90% |

### Logging

| Source | Location | Retention |
|--------|----------|-----------|
| Backend logs | Railway dashboard | 30 days |
| Frontend logs | Vercel dashboard | 30 days |
| Database logs | Supabase dashboard | 7 days |
| Error tracking | Sentry (optional) | 90 days |

---

## CI/CD Pipeline

The CI/CD pipeline runs on every push to `main`:

```yaml
# .github/workflows/ci-cd.yml
jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run pytest
        run: |
          cd backend
          pip install -r requirements.txt
          pytest tests/ -v --cov=app

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Jest
        run: |
          cd frontend
          npm install
          npm test -- --coverage

  code-quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Lint
        run: |
          cd backend
          pip install flake8 black
          flake8 app/
          black --check app/
          cd ../frontend
          npm run lint

  security-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Security scan
        run: |
          cd backend
          pip install bandit
          bandit -r app/ -ll
          cd ../frontend
          npm audit --production

  deploy:
    needs: [backend-tests, frontend-tests, code-quality, security-audit]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy Backend to Railway
        run: railway up
      - name: Deploy Frontend to Vercel
        run: vercel --prod
```

---

## Backup Strategy

### Database Backups

| Feature | Detail |
|---------|--------|
| Type | Automated daily backups (Supabase) |
| Point-in-time recovery | Enabled |
| Retention | 30 days |
| Download | Manual via Supabase dashboard |

### Image Backups (S3)

| Feature | Detail |
|---------|--------|
| Versioning | Enabled |
| Lifecycle | Move to Glacier after 90 days |
| Cross-region replication | ap-southeast-1 → ap-southeast-2 |
| Delete protection | Enabled |

---

## Security Hardening

### Network Security
- WAF (Web Application Firewall) via Cloudflare
- IP whitelisting for admin dashboard access
- DDoS protection enabled
- API exposed only on necessary ports (80, 443)

### Application Security
- Weekly dependency updates via Dependabot
- Security headers configured (XSS, CSP, HSTS)
- CSRF protection via SameSite cookies
- Rate limiting on all endpoints

### Data Security
- Encryption at rest (S3 SSE-S3, PostgreSQL AES-256)
- Encryption in transit (TLS 1.3 minimum)
- Signed URLs with 1-hour expiration
- Monthly security audits

---

## Rollback Procedure

### Backend Rollback (Railway)

```bash
# List deployments
railway deployments

# Rollback to specific version
railway rollback --deployment-id <previous-deployment-id>
```

### Frontend Rollback (Vercel)

```bash
# List deployments
vercel deployments ls

# Rollback to previous version
vercel rollback <deployment-url>
```

### Database Rollback

```bash
# Revert to specific migration
cd backend
alembic downgrade <revision-id>
```

---

## Cost Estimation

### Small Scale (~100 analyses/month)

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| Vercel (Frontend) | Pro | $20 |
| Railway (Backend) | Hobby | $5 |
| Supabase (Database) | Pro | $25 |
| AWS S3 (Storage) | Pay-as-you-go | ~$10 |
| **Total** | | **~$60** |

### Medium Scale (~500 analyses/month)

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| Vercel (Frontend) | Pro | $20 |
| Railway (Backend) | Team | $20 |
| Supabase (Database) | Team | $50 |
| AWS S3 (Storage) | Pay-as-you-go | ~$50 |
| **Total** | | **~$140** |

---

## Troubleshooting

### Common Issues

**Issue: Backend returns 500 errors**
- Check database connection string
- Verify all environment variables are set
- Review Railway application logs
- Check that model file exists at MODEL_PATH

**Issue: Image upload fails**
- Verify AWS credentials have S3 write permissions
- Check S3 bucket CORS policy
- Ensure file is under 10MB and valid format
- Check network connectivity to AWS

**Issue: Slow inference**
- Verify model is loaded only once (not on every request)
- Check if CPU is overloaded (consider GPU inference)
- Reduce image resolution in preprocessing
- Monitor memory usage for leaks

**Issue: Database connection pool exhausted**
- Increase pool size in connection string
- Reduce max connections per instance
- Add connection pooling middleware (PgBouncer)
- Scale horizontally to distribute load

**Issue: CORS errors on frontend**
- Verify CORS_ORIGINS in backend includes frontend URL
- Check for trailing slashes in origin URLs
- Ensure correct protocol (https vs http)
- Test with curl to verify CORS headers

---

## Support

For deployment issues:
1. Check logs in respective dashboards
2. Review environment variable configuration
3. Test the deployment locally first
4. Check GitHub Actions for CI/CD failures
5. Contact team lead if issue persists

**Team Lead**: Wisnu Alfian Nur Ashar  
**Email**: wisnu.ashar@student.president.ac.id

---

_Last Updated: July 2026 | Version: 2.0.0_
