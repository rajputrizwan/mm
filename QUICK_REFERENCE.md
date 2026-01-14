# Quick Reference - Intervau AI Commands & Setup

## 🚀 Development Startup (Quickest Way)

### Option 1: Docker Compose (Recommended)

```bash
# Start everything in one command
docker-compose up -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down
```

**Access**:

- Frontend: http://localhost:3001
- Backend: http://localhost:3000

### Option 2: Manual Setup

**Terminal 1 - Frontend**:

```bash
cd intervau-ai-frontend
npm install
npm run dev
```

→ http://localhost:5173

**Terminal 2 - Backend**:

```bash
cd intervau-ai-backend
npm install
npm run dev
```

→ http://localhost:3000

**Terminal 3 - Database**:
Use MongoDB Atlas or local MongoDB

---

## ⚙️ Environment Setup

### Frontend (.env)

```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=Intervau AI
VITE_APP_ENV=development
```

### Backend (.env)

```
PORT=3000
NODE_ENV=development
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/intervau-ai
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
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
```

---

## 📦 Build Commands

### Frontend

```bash
npm run build              # Production build
npm run preview            # Preview production build
npm run lint               # Run ESLint
npm run format             # Format with Prettier
npm test                   # Run tests
npm test:coverage          # Coverage report
```

### Backend

```bash
npm run build              # Compile TypeScript to JavaScript
npm start                  # Run compiled JavaScript
npm run dev                # Run with hot reload (ts-node)
npm run lint               # Run ESLint
npm run format             # Format with Prettier
npm test                   # Run Jest tests
npm test:watch             # Watch mode
npm test:coverage          # Coverage report
```

---

## 🐳 Docker Commands

### Build Images

```bash
# Frontend
docker build -t intervau-ai-frontend ./intervau-ai-frontend

# Backend
docker build -t intervau-ai-backend ./intervau-ai-backend

# Both with Docker Compose
docker-compose build
```

### Run Containers

```bash
# Frontend only
docker run -p 80:80 intervau-ai-frontend

# Backend only
docker run -p 3000:3000 intervau-ai-backend

# Everything
docker-compose up -d
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongo

# Live logs
docker-compose logs -f --tail=100
```

### Container Management

```bash
# List running containers
docker-compose ps

# Stop services
docker-compose down

# Remove everything including volumes
docker-compose down -v

# Rebuild images
docker-compose up -d --build

# Execute command in container
docker-compose exec backend npm test
docker-compose exec frontend npm run build
```

---

## 🌐 API Testing

### Using cURL

**Login**:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Get Current User**:

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <token>"
```

**List Interviews**:

```bash
curl -X GET http://localhost:3000/api/interviews \
  -H "Authorization: Bearer <token>"
```

**Create Interview**:

```bash
curl -X POST http://localhost:3000/api/interviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Senior Developer",
    "jobPosition": "pos_1",
    "candidate": "cand_1",
    "scheduledAt": "2024-01-20T14:00:00Z"
  }'
```

### Using Postman

1. Import API collection from API_DOCUMENTATION.md
2. Set variables: `{{token}}`, `{{baseUrl}}`
3. Test endpoints

---

## 🔑 Service Setup (One-Time)

### MongoDB Atlas

```
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create M0 cluster
4. Add your IP address
5. Create database user
6. Copy connection string
7. Add to .env as DATABASE_URL
```

### OpenAI

```
1. Go to https://platform.openai.com/api-keys
2. Create account
3. Generate API key
4. Add to .env as OPENAI_API_KEY
```

### Cloudinary

```
1. Go to https://cloudinary.com
2. Create account
3. Get Cloud Name, API Key, API Secret
4. Add to .env
```

### Gmail (Nodemailer)

```
1. Enable 2-Factor Authentication on Gmail
2. Go to https://myaccount.google.com/apppasswords
3. Generate app password for Mail
4. Add email and app password to .env
```

---

## 🧪 Testing

### Run Tests

```bash
# Frontend
npm test

# Backend
npm test

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Test Commands in Docker

```bash
docker-compose exec backend npm test
docker-compose exec frontend npm test
```

---

## 🚀 Deployment

### Railway.app (Easiest)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy backend
cd intervau-ai-backend
railway up

# Deploy frontend
cd intervau-ai-frontend
railway up
```

### Heroku

```bash
# Install Heroku CLI
brew tap heroku/brew && brew install heroku

# Login
heroku login

# Create app
heroku create intervau-ai-backend

# Deploy
git push heroku main

# View logs
heroku logs -t
```

### Docker Push (AWS ECR)

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com

# Tag images
docker tag intervau-ai-backend:latest \
  <account>.dkr.ecr.us-east-1.amazonaws.com/intervau-ai-backend:latest

# Push
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/intervau-ai-backend:latest
```

---

## 🔧 Troubleshooting Commands

### Clean Everything

```bash
# Frontend
cd intervau-ai-frontend
rm -rf node_modules dist
npm install
npm run build

# Backend
cd intervau-ai-backend
rm -rf node_modules dist
npm install
npm run build

# Docker
docker system prune -a
docker-compose up -d --build
```

### Check Versions

```bash
node --version        # Should be 20+
npm --version         # Should be 10+
docker --version
docker-compose --version
```

### Test Connections

```bash
# MongoDB
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/test"

# API Health
curl http://localhost:3000/api/health

# Frontend
curl http://localhost:5173
curl http://localhost:3001
```

### View System Resources

```bash
docker stats
docker system df
docker ps -a
docker images
```

---

## 📁 Important File Locations

### Frontend

- Pages: `intervau-ai-frontend/src/pages/`
- Components: `intervau-ai-frontend/src/components/`
- API Service: `intervau-ai-frontend/src/services/api.ts`
- Environment: `intervau-ai-frontend/.env`

### Backend

- Controllers: `intervau-ai-backend/src/controllers/`
- Models: `intervau-ai-backend/src/models/`
- Routes: `intervau-ai-backend/src/routes/`
- Services: `intervau-ai-backend/src/services/`
- Environment: `intervau-ai-backend/.env`

### Configuration

- Docker Compose: `docker-compose.yml`
- Backend Docker: `intervau-ai-backend/Dockerfile`
- Frontend Docker: `intervau-ai-frontend/Dockerfile`
- Backend Config: `intervau-ai-backend/tsconfig.json`
- Frontend Config: `intervau-ai-frontend/vite.config.ts`

---

## 📚 Documentation Files

- **README.md** - Project overview
- **API_DOCUMENTATION.md** - Complete API reference
- **DEPLOYMENT.md** - Production deployment guide
- **QUICK_START.md** - Get started fast
- **PROJECT_COMPLETION_SUMMARY.md** - What was built
- **BACKEND_SETUP_GUIDE.md** - Backend setup steps

---

## 🎯 Common Workflows

### Add New API Endpoint

```bash
# 1. Create in controller
intervau-ai-backend/src/controllers/YourController.ts

# 2. Add route
intervau-ai-backend/src/routes/your.ts

# 3. Test
npm run dev
curl http://localhost:3000/api/your-endpoint

# 4. Update API_DOCUMENTATION.md
```

### Add New Page

```bash
# 1. Create page component
intervau-ai-frontend/src/pages/YourPage.tsx

# 2. Add route
intervau-ai-frontend/src/router/index.tsx

# 3. Add navigation
intervau-ai-frontend/src/components/Navbar.tsx

# 4. Test
npm run dev
```

### Deploy Update

```bash
# 1. Test locally
docker-compose up -d

# 2. Commit changes
git add .
git commit -m "Update: description"

# 3. Push to deploy
git push origin main
# (Will auto-deploy if connected to Railway/Vercel)

# 4. Verify in production
curl https://api.your-domain.com/health
```

---

## 🔐 Security Reminders

1. **Never commit .env files** - Use .env.example template
2. **Rotate secrets** - Change JWT_SECRET in production
3. **Use HTTPS** - Enable SSL in production
4. **Whitelist IPs** - MongoDB Atlas security
5. **Environment variables** - Don't hardcode secrets
6. **Validate inputs** - All API inputs validated
7. **Update dependencies** - `npm audit fix`

---

## 📞 Getting Help

### Documentation

- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API reference
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [BACKEND_SETUP_GUIDE.md](./BACKEND_SETUP_GUIDE.md) - Setup steps

### Common Issues

- **Port already in use**: Change PORT in .env
- **Database connection failed**: Check MongoDB URI
- **Build errors**: Clear node_modules and rebuild
- **Docker issues**: Check Docker Desktop is running

### Debug Mode

```bash
# Backend debug logs
NODE_DEBUG=* npm run dev

# Frontend debug
npm run dev -- --host

# Check compilation
npm run build 2>&1 | grep error
```

---

## ⏱️ Estimated Setup Times

| Task                    | Time        |
| ----------------------- | ----------- |
| Clone project           | 2 min       |
| Install dependencies    | 5 min       |
| Setup .env files        | 2 min       |
| Setup external services | 20 min      |
| Docker Compose startup  | 2 min       |
| First test              | 2 min       |
| **Total**               | **~33 min** |

---

## 🎉 You're All Set!

Everything is ready to use. Start with:

```bash
docker-compose up -d
```

Then access:

- **Frontend**: http://localhost:3001
- **Backend**: http://localhost:3000
- **API Docs**: See API_DOCUMENTATION.md

Happy coding! 🚀

---

**Last Updated**: 2024
**Maintained**: Yes
**Production Ready**: ✅
