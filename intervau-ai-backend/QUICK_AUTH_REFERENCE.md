# Quick Start - Authentication API

## 🚀 Start Server

```bash
cd intervau-ai-backend
npm install          # Install dependencies (first time only)
npm run dev          # Start development server
```

Server runs on: `http://localhost:5000`

---

## 📋 Available Endpoints

### Public Endpoints (No Auth Required)

| Method | Endpoint             | Purpose            |
| ------ | -------------------- | ------------------ |
| POST   | `/api/auth/register` | Create new account |
| POST   | `/api/auth/login`    | Login user         |

### Protected Endpoints (Auth Required)

| Method | Endpoint                    | Purpose              |
| ------ | --------------------------- | -------------------- |
| GET    | `/api/auth/me`              | Get current user     |
| PUT    | `/api/auth/profile`         | Update profile       |
| POST   | `/api/auth/change-password` | Change password      |
| POST   | `/api/auth/refresh-token`   | Get new access token |
| POST   | `/api/auth/logout`          | Logout user          |
| DELETE | `/api/auth/account`         | Delete account       |

---

## ⚡ Quick Examples

### 1️⃣ Register (Candidate)

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "name": "John Doe",
    "role": "candidate"
  }'
```

### 2️⃣ Register (HR)

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hr@company.com",
    "password": "SecurePass123",
    "name": "Jane Manager",
    "role": "hr",
    "companyName": "Tech Corp"
  }'
```

### 3️⃣ Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

**Response contains:** `accessToken` (save this!)

### 4️⃣ Use Access Token

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5️⃣ Refresh Token (when expired)

```bash
curl -X POST http://localhost:5000/api/auth/refresh-token
```

---

## 🔒 Password Requirements

- ✅ Minimum 6 characters
- ✅ At least one uppercase letter
- ✅ At least one lowercase letter
- ✅ At least one number

Example: `MyPass123` ✓

---

## 🎯 User Roles

### Candidate 👤

- Apply to job positions
- Take interviews
- View interview history
- Get feedback on performance

### HR 🏢

- Create job positions
- Conduct interviews
- View and manage candidates
- Track interview statistics

### Admin 🔐

- Full system access
- Manage users and roles
- View all data

---

## 💾 MongoDB Collections Created

1. **Users** - User accounts
2. **Candidates** - Candidate profiles (auto-created for candidate role)
3. **HRProfiles** - HR profiles (auto-created for hr role)

---

## 📊 Response Format

### Success (2xx)

```json
{
  "success": true,
  "message": "Description of success",
  "data": {
    /* response data */
  }
}
```

### Error (4xx/5xx)

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    /* validation errors if any */
  ]
}
```

---

## ⏱️ Token Timing

| Token   | Duration   | Stored           |
| ------- | ---------- | ---------------- |
| Access  | 15 minutes | Response         |
| Refresh | 7 days     | HTTP-only cookie |

---

## 🛡️ Common Headers

```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

---

## ❌ Common Errors

| Error                    | Cause          | Fix                            |
| ------------------------ | -------------- | ------------------------------ |
| "Validation failed"      | Invalid input  | Check email, password strength |
| "User already exists"    | Email taken    | Use different email            |
| "Invalid credentials"    | Wrong password | Verify password                |
| "No authorization token" | Missing header | Add `Authorization` header     |
| "Token expired"          | Token old      | Call refresh-token endpoint    |

---

## 📝 Postman Setup

1. Create collection: "Intervau Auth"
2. Add variable: `token` = (empty)
3. After login, add Test:

```javascript
pm.environment.set('token', pm.response.json().data.accessToken);
```

4. Use `{{token}}` in Authorization header

---

## 🔗 Full Documentation

- **AUTH_GUIDE.md** - Complete API reference
- **AUTH_TESTING.md** - Detailed testing guide
- **AUTHENTICATION_IMPLEMENTATION.md** - Technical details

---

## ✅ Checklist

- [ ] Server running on port 5000
- [ ] MongoDB connection working
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Can access protected routes with token
- [ ] Token refresh working
- [ ] Different roles tested

---

**Ready to test? Start with the curl examples above!** 🚀
