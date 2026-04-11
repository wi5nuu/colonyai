# ColonyAI Deployment Guide

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ and npm
- Python 3.10+
- PostgreSQL database (or Supabase account)
- AWS account (for S3 storage)
- Vercel account (for frontend hosting)
- Railway account (for backend hosting)

## Environment Setup

### 1. Database Setup (Supabase)

1. Create a new project on [Supabase](https://supabase.com)
2. Get your project URL and anon key from Settings → API
3. Run database migrations:

```bash
cd backend
# Install dependencies
pip install -r requirements.txt

# Create migrations
alembic revision --autogenerate -m "initial migration"

# Apply migrations
alembic upgrade head
```

### 2. AWS S3 Setup

1. Create an S3 bucket: `colonyai-images`
2. Create IAM user with S3 access
3. Set up CORS policy:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "https://your-domain.vercel.app"],
    "ExposeHeaders": ["ETag"]
  }
]
```

4. Update backend `.env` with AWS credentials

### 3. Backend Deployment (Railway)

1. Connect your GitHub repository to Railway
2. Set environment variables from `backend/.env.example`
3. Deploy:

```dockerfile
# backend/Dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```yaml
# railway.toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "backend/Dockerfile"

[deploy]
startCommand = "uvicorn main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
restartPolicyType = "ON_FAILURE"
```

### 4. Frontend Deployment (Vercel)

1. Install Vercel CLI:

```bash
npm i -g vercel
```

2. Deploy:

```bash
cd frontend
vercel --prod
```

3. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_API_URL=https://your-backend.railway.app`

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

## Production Checklist

- [ ] Database migrations applied
- [ ] AWS S3 bucket configured
- [ ] Backend environment variables set
- [ ] Frontend environment variables set
- [ ] SSL/TLS certificates configured
- [ ] CORS policies updated
- [ ] Rate limiting enabled
- [ ] Monitoring and logging configured
- [ ] Backup strategy in place
- [ ] Load testing completed

## Scaling Strategy

### Horizontal Scaling

```yaml
# docker-compose.production.yml
version: '3.8'

services:
  backend:
    build: ./backend
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '2'
          memory: 4G
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=colonyai
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### Auto-scaling on Railway

- Configure min instances: 2
- Configure max instances: 10
- CPU threshold for scaling: 70%
- Memory threshold for scaling: 80%

## Monitoring

### Health Checks

```bash
# Backend health
curl https://your-backend.railway.app/health

# Frontend health
curl https://your-frontend.vercel.app
```

### Logging

- Backend logs: Railway dashboard
- Frontend logs: Vercel dashboard
- Database logs: Supabase dashboard

### Alerts

Set up alerts for:
- API response time > 2s
- Error rate > 1%
- Database connection pool exhausted
- S3 storage > 80% capacity

## Backup Strategy

### Database Backups

- Supabase automatic daily backups
- Point-in-time recovery enabled
- Retention: 30 days

### Image Backups

- S3 versioning enabled
- Lifecycle policy: Move to Glacier after 90 days
- Cross-region replication enabled

## Security Hardening

1. **Network Security**
   - Enable WAF (Web Application Firewall)
   - Configure IP whitelisting for admin access
   - Enable DDoS protection

2. **Application Security**
   - Regular dependency updates
   - Security headers configured
   - CSRF protection enabled
   - Rate limiting enabled

3. **Data Security**
   - Encryption at rest (S3, PostgreSQL)
   - Encryption in transit (TLS 1.3)
   - Signed URLs with expiration
   - Regular security audits

## Rollback Procedure

### Backend Rollback

```bash
# List previous deployments
railway deployments

# Rollback to previous version
railway rollback --deployment-id <previous-id>
```

### Frontend Rollback

```bash
# List deployments
vercel deployments ls

# Rollback
vercel rollback <deployment-url>
```

## Cost Estimation

### Monthly Costs (Small Scale)

| Service | Plan | Cost |
|---------|------|------|
| Vercel (Frontend) | Pro | $20 |
| Railway (Backend) | Hobby | $5 |
| Supabase (Database) | Pro | $25 |
| AWS S3 (Storage) | Pay-as-you-go | ~$10 |
| **Total** | | **~$60/month** |

### Monthly Costs (Medium Scale)

| Service | Plan | Cost |
|---------|------|------|
| Vercel (Frontend) | Pro | $20 |
| Railway (Backend) | Team | $20 |
| Supabase (Database) | Team | $50 |
| AWS S3 (Storage) | Pay-as-you-go | ~$50 |
| **Total** | | **~$140/month** |

## Troubleshooting

### Common Issues

**Issue**: Backend returns 500 errors
- Check database connection
- Verify environment variables
- Check Railway logs for stack traces

**Issue**: Images not uploading
- Verify AWS credentials
- Check S3 bucket permissions
- Verify CORS policy

**Issue**: Slow inference
- Check GPU availability
- Verify model loading
- Monitor memory usage

## Support

For deployment issues:
1. Check logs in respective dashboards
2. Review environment variables
3. Test locally first
4. Contact team lead if issue persists
