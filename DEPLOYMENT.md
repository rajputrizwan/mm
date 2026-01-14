# Intervau AI - Deployment Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development with Docker Compose](#local-development-with-docker-compose)
3. [Production Deployment](#production-deployment)
4. [Cloud Deployment Options](#cloud-deployment-options)
5. [Environment Configuration](#environment-configuration)
6. [Database Setup](#database-setup)
7. [Monitoring & Logging](#monitoring--logging)
8. [Scaling & Performance](#scaling--performance)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Services

- **MongoDB Atlas** (Free tier: https://www.mongodb.com/cloud/atlas)
- **OpenAI API Key** (https://platform.openai.com/api-keys)
- **Cloudinary Account** (https://cloudinary.com/signup)
- **Gmail Account** (for Nodemailer SMTP)
- **Node.js 20+** (https://nodejs.org/)
- **Docker & Docker Compose** (https://www.docker.com/products/docker-desktop)

### Accounts Setup

#### 1. MongoDB Atlas Setup

```
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create new organization and project
4. Create M0 (free) cluster
5. Add IP address to whitelist (use 0.0.0.0/0 for development)
6. Create database user (remember username and password)
7. Copy connection string: mongodb+srv://user:pass@cluster.mongodb.net/dbname
```

#### 2. OpenAI API Key

```
1. Go to https://platform.openai.com/api-keys
2. Log in or create account
3. Click "Create new secret key"
4. Copy and save the key (you won't see it again)
5. Add to .env as OPENAI_API_KEY
```

#### 3. Cloudinary Setup

```
1. Go to https://cloudinary.com/signup
2. Sign up for free account
3. Go to Dashboard
4. Copy these values:
   - Cloud Name
   - API Key
   - API Secret
5. Add to .env as CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
```

#### 4. Gmail Setup for Nodemailer

```
1. Go to https://myaccount.google.com/apppasswords
2. Select Mail and Windows Computer
3. Google will generate 16-character password
4. Copy this password
5. Add to .env as EMAIL_PASSWORD
6. Add Gmail address as EMAIL_USER
```

## Local Development with Docker Compose

### Quickest Setup (Recommended for Development)

```bash
# 1. Clone project
git clone <your-repo-url>
cd FYP-PROJECT-PART-2

# 2. Create environment files
# In intervau-ai-backend/.env
PORT=3000
NODE_ENV=development
DATABASE_URL=mongodb://mongo:27017/intervau-ai
JWT_SECRET=dev-secret-key-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@intervau.com
CLOUDINARY_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
OPENAI_API_KEY=your-openai-key
FRONTEND_URL=http://localhost:3001

# In intervau-ai-frontend/.env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=Intervau AI
VITE_APP_ENV=development

# 3. Start all services
docker-compose up -d

# 4. Check status
docker-compose ps

# 5. View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# 6. Access applications
Frontend: http://localhost:3001
Backend API: http://localhost:3000
API Docs: http://localhost:3000/api/docs
```

### Docker Compose Services

```yaml
services:
  backend:
    - Node.js Express API
    - Port: 3000
    - Hot reload with nodemon
    - Connects to MongoDB

  frontend:
    - React Vite application
    - Port: 3001
    - Served by Nginx
    - Proxied to backend

  mongo:
    - MongoDB 6.0
    - Port: 27017
    - Data persisted in volume
    - Initial data setup
```

### Common Docker Compose Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild images
docker-compose up -d --build

# Run commands in container
docker-compose exec backend npm test
docker-compose exec frontend npm run build

# Remove volumes (WARNING: deletes data)
docker-compose down -v
```

## Production Deployment

### Pre-Deployment Checklist

```bash
# 1. Build backend
cd intervau-ai-backend
npm install
npm run build
npm test

# 2. Build frontend
cd intervau-ai-frontend
npm install
npm run build
npm test

# 3. Verify environment files
cat intervau-ai-backend/.env
cat intervau-ai-frontend/.env

# 4. Check Docker images build successfully
docker build -t intervau-ai-backend ./intervau-ai-backend
docker build -t intervau-ai-frontend ./intervau-ai-frontend

# 5. Test containers locally
docker run -p 3000:3000 intervau-ai-backend
docker run -p 80:80 intervau-ai-frontend
```

### Production Environment Variables

**Backend (.env)**:

```
PORT=3000
NODE_ENV=production
DATABASE_URL=mongodb+srv://user:password@cluster.mongodb.net/intervau-ai-prod
JWT_SECRET=<long-random-string-min-32-chars>
JWT_REFRESH_SECRET=<long-random-string-min-32-chars>
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
EMAIL_USER=<production-email@gmail.com>
EMAIL_PASSWORD=<app-specific-password>
EMAIL_FROM=noreply@intervau.com
CLOUDINARY_NAME=<cloudinary-cloud-name>
CLOUDINARY_API_KEY=<cloudinary-api-key>
CLOUDINARY_API_SECRET=<cloudinary-api-secret>
OPENAI_API_KEY=<openai-api-key>
FRONTEND_URL=https://your-domain.com
LOG_LEVEL=info
ENABLE_METRICS=true
```

**Frontend (.env)**:

```
VITE_API_BASE_URL=https://api.your-domain.com
VITE_APP_NAME=Intervau AI
VITE_APP_ENV=production
VITE_ENABLE_ANALYTICS=true
```

## Cloud Deployment Options

### Option 1: Railway.app (Easiest)

#### Backend Deployment

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Create new project
railway init

# 4. Deploy backend
cd intervau-ai-backend
railway up

# 5. Configure environment variables in Railway dashboard
# Dashboard > Project > Backend > Variables
```

#### Frontend Deployment

```bash
# 1. Deploy frontend to Vercel (easier for React)
npm install -g vercel
cd intervau-ai-frontend
vercel

# 2. Or deploy to Railway
cd intervau-ai-frontend
railway up
```

**Advantages**:

- Easy to use
- Git integration
- Automatic deployments
- Free tier available
- Built-in environment variables

### Option 2: Heroku (Traditional)

#### Backend Deployment

```bash
# 1. Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# 2. Login to Heroku
heroku login

# 3. Create app
heroku create intervau-ai-backend

# 4. Add buildpack
heroku buildpacks:add heroku/nodejs

# 5. Set environment variables
heroku config:set DATABASE_URL=mongodb+srv://...
heroku config:set JWT_SECRET=...
heroku config:set OPENAI_API_KEY=...
# ... set all variables

# 6. Deploy
git push heroku main

# 7. View logs
heroku logs -t
```

#### Frontend Deployment

```bash
# 1. Build frontend
npm run build

# 2. Create Procfile
echo "web: npx serve -s build -l 3000" > Procfile

# 3. Deploy
heroku create intervau-ai-frontend
git push heroku main
```

### Option 3: AWS (ECS + Elastic Beanstalk)

#### Push Docker Images to ECR

```bash
# 1. Create ECR repositories
aws ecr create-repository --repository-name intervau-ai-backend
aws ecr create-repository --repository-name intervau-ai-frontend

# 2. Get login token
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# 3. Tag and push backend
docker tag intervau-ai-backend:latest \
  <account-id>.dkr.ecr.us-east-1.amazonaws.com/intervau-ai-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/intervau-ai-backend:latest

# 4. Tag and push frontend
docker tag intervau-ai-frontend:latest \
  <account-id>.dkr.ecr.us-east-1.amazonaws.com/intervau-ai-frontend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/intervau-ai-frontend:latest
```

#### Deploy on ECS

```bash
# 1. Create ECS cluster
aws ecs create-cluster --cluster-name intervau-ai

# 2. Create task definition (use JSON file)
aws ecs register-task-definition --cli-input-json file://task-definition.json

# 3. Create service
aws ecs create-service --cluster intervau-ai \
  --service-name backend \
  --task-definition intervau-ai-backend \
  --desired-count 2 \
  --load-balancers targetGroupArn=<target-group-arn>,containerName=backend,containerPort=3000
```

### Option 4: DigitalOcean (Droplet + Docker)

```bash
# 1. Create Droplet with Docker
# Choose: One-click Docker image
# Size: $5-12/month

# 2. SSH into droplet
ssh root@your_droplet_ip

# 3. Clone repository
git clone <your-repo-url>
cd FYP-PROJECT-PART-2

# 4. Create .env files with production values

# 5. Start with Docker Compose
docker-compose up -d

# 6. Setup reverse proxy with Nginx
# Edit /etc/nginx/sites-available/default

# 7. Setup SSL with Let's Encrypt
certbot certonly --standalone -d your-domain.com
```

### Option 5: Vercel (Frontend) + Railway (Backend)

**Recommended for optimal experience**

**Frontend (Vercel)**:

```bash
# 1. Connect GitHub repo to Vercel
# https://vercel.com/new

# 2. Select intervau-ai-frontend folder
# 3. Add environment variables
# 4. Deploy (automatic on git push)
```

**Backend (Railway)**:

```bash
# 1. Connect GitHub repo to Railway
# 2. Select intervau-ai-backend folder
# 3. Add environment variables
# 4. Deploy (automatic on git push)
```

## Environment Configuration

### Development vs Production

| Setting          | Development           | Production                  |
| ---------------- | --------------------- | --------------------------- |
| Node Environment | development           | production                  |
| Database         | Local MongoDB         | MongoDB Atlas               |
| API Base URL     | http://localhost:3000 | https://api.your-domain.com |
| CORS             | \* (all origins)      | specific domains            |
| JWT Secret       | dev-secret            | long random string          |
| Logging          | verbose               | minimal                     |
| Cache            | disabled              | enabled                     |

### Generate Secure Secrets

```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate API keys
openssl rand -base64 32

# Generate passwords
openssl rand -base64 16
```

## Database Setup

### MongoDB Atlas

#### Initial Setup

```
1. Create cluster (M0 free tier)
2. Wait for cluster to be created (5-10 minutes)
3. Create database user:
   - Username: intervau_admin
   - Password: <strong-password>
4. Whitelist IP addresses
5. Get connection string
```

#### Backup Strategy

```bash
# Automated backups
- Enable daily automatic backups
- Set retention to 35 days (default)
- Store backup in separate location

# Manual backup
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/intervau-ai"

# Restore
mongorestore dump/
```

#### Database Indexing

```javascript
// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.interviews.createIndex({ jobPosition: 1, status: 1 });
db.candidates.createIndex({ user: 1 }, { unique: true });
db.positions.createIndex({ status: 1 });
```

## Monitoring & Logging

### Application Monitoring

```javascript
// Backend: Add monitoring
import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
});

app.use((req, res, next) => {
  logger.info({ method: req.method, path: req.path });
  next();
});
```

### Error Tracking

```javascript
// Use Sentry for error tracking
import Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Log Aggregation

```bash
# View logs in Docker
docker-compose logs -f backend

# In production, use:
# - AWS CloudWatch
# - Google Cloud Logging
# - DataDog
# - Splunk
```

## Scaling & Performance

### Database Optimization

```javascript
// Add pagination
const interviews = await Interview.find()
  .skip((page - 1) * limit)
  .limit(limit);

// Add caching
const redis = new Redis();
const cached = await redis.get(`interviews:${page}`);

// Add indexes
db.interviews.createIndex({ scheduledAt: 1 });
```

### API Optimization

```javascript
// Implement caching
app.use(express.static("public", { maxAge: "1d" }));

// Use compression
app.use(compression());

// Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);
```

### Load Balancing

```yaml
# Docker Compose with multiple backend instances
services:
  backend-1:
    image: intervau-ai-backend
    ports:
      - "3001:3000"

  backend-2:
    image: intervau-ai-backend
    ports:
      - "3002:3000"

  nginx:
    # Load balance between backend-1 and backend-2
```

## Troubleshooting

### Docker Issues

```bash
# Rebuild without cache
docker-compose build --no-cache

# Remove old images
docker system prune -a

# Check disk space
docker system df

# View container logs
docker-compose logs backend
docker-compose logs frontend
```

### Database Connection Issues

```bash
# Test MongoDB connection
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/test"

# Check network whitelist
# MongoDB Atlas > Security > Network Access

# Verify connection string
# Format: mongodb+srv://username:password@cluster.mongodb.net/database
```

### Build Failures

```bash
# Clean build
rm -rf dist node_modules
npm install
npm run build

# Check Node version
node --version  # Should be 20+

# Check npm version
npm --version   # Should be 10+
```

### Performance Issues

```bash
# Check memory usage
docker stats

# Profile application
# Use Node.js profiler: node --prof app.js

# Database slow queries
# MongoDB Atlas > Performance Advisor
```

## SSL/HTTPS Setup

### Using Let's Encrypt (Free)

```bash
# 1. Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# 2. Get certificate
sudo certbot certonly --standalone \
  -d your-domain.com \
  -d api.your-domain.com

# 3. Update Nginx config
upstream backend {
  server backend:3000;
}

server {
  listen 443 ssl http2;
  server_name api.your-domain.com;

  ssl_certificate /etc/letsencrypt/live/api.your-domain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/api.your-domain.com/privkey.pem;

  location / {
    proxy_pass http://backend;
  }
}

# 4. Auto-renewal
sudo certbot renew --dry-run
```

## Post-Deployment

### Smoke Tests

```bash
# 1. Test API endpoints
curl https://api.your-domain.com/api/health

# 2. Test frontend
curl https://your-domain.com

# 3. Test authentication
curl -X POST https://api.your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'

# 4. Test file upload
# Upload file via Cloudinary endpoint

# 5. Test email
# Check if welcome email is sent on registration
```

### Monitoring Dashboard

Set up monitoring for:

- ✅ Server uptime
- ✅ API response times
- ✅ Database performance
- ✅ Error rates
- ✅ User counts
- ✅ Resource usage

### Backup Plan

- ✅ Database backups: Daily, 35-day retention
- ✅ Code backups: Git repository
- ✅ File backups: Cloudinary with redundancy
- ✅ Configuration backups: Encrypted .env files

---

**Status**: Production Ready ✅
**Last Updated**: 2024
