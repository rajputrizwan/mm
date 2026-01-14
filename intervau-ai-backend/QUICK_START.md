# 🚀 Backend Quick Start Guide

## Installation & Setup (2 minutes)

### Step 1: Install Dependencies

```bash
cd intervau-ai-backend
npm install
```

### Step 2: Start Development Server

```bash
npm run dev
```

Server will start on `http://localhost:5000`

You'll see:

```
✓ Database connected successfully
🚀 Server running on http://localhost:5000
```

---

## Testing API (5 minutes)

### Using Postman

1. **Register a new user**

```
POST http://localhost:5000/api/auth/register

Body (JSON):
{
  "email": "candidate@test.com",
  "password": "password123",
  "name": "Test Candidate",
  "role": "candidate"
}
```

2. **Login to get JWT token**

```
POST http://localhost:5000/api/auth/login

Body (JSON):
{
  "email": "candidate@test.com",
  "password": "password123"
}

Response will include:
{
  "success": true,
  "data": {
    "token": "eyJhbGc..." (copy this token)
  }
}
```

3. **Use token to access protected endpoints**

```
GET http://localhost:5000/api/auth/me

Headers:
Authorization: Bearer eyJhbGc...
```

---

## Using cURL

### Register

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "role": "candidate"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Current User

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Frontend Integration

Update your frontend `.env`:

```
VITE_API_URL=http://localhost:5000
```

The frontend API service is already configured to work with this backend!

---

## Production Deployment

```bash
# Build TypeScript (if needed)
npm run build

# Start production server
npm start
```

---

## Troubleshooting

| Issue                    | Solution                                                  |
| ------------------------ | --------------------------------------------------------- |
| MongoDB connection error | Check `.env` MONGODB_URI and MongoDB Atlas network access |
| Port 5000 in use         | Change PORT in `.env` or kill process on port 5000        |
| CORS errors              | Verify FRONTEND_URL in `.env` matches frontend address    |
| Invalid token            | Ensure JWT_SECRET in `.env` is set correctly              |
| 404 endpoints            | Verify routes are mounted in `src/index.ts`               |

---

## Useful Commands

```bash
# Development with auto-reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests (setup required)
npm test

# Format code
npm run format

# Lint code
npm run lint
```

---

## API Endpoints Quick Reference

| Method | Endpoint           | Auth | Role |
| ------ | ------------------ | ---- | ---- |
| POST   | /api/auth/register | ❌   | -    |
| POST   | /api/auth/login    | ❌   | -    |
| GET    | /api/auth/me       | ✅   | -    |
| POST   | /api/interviews    | ✅   | HR   |
| GET    | /api/interviews    | ✅   | -    |
| GET    | /api/candidates    | ✅   | -    |
| GET    | /api/positions     | ✅   | -    |

---

## Next Steps

1. ✅ Start the backend server
2. ✅ Test endpoints with Postman
3. ✅ Verify frontend integration
4. ✅ Deploy to production
5. ✅ Set up monitoring

---

**Need help?** Check README.md for full documentation.
