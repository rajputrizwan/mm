# Authentication System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Application                        │
│                    (React/Web/Mobile)                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                  HTTP/HTTPS Requests
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼─────┐      ┌────▼─────┐      ┌────▼─────┐
   │ Register │      │  Login   │      │ Protected│
   │  Endpoint│      │ Endpoint │      │ Routes   │
   └─────┬────┘      └────┬─────┘      └────┬─────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                    ┌─────▼──────┐
                    │   Express  │
                    │  Middleware│
                    └─────┬──────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
   ┌────▼─────────┐  ┌───▼────────┐  ┌────▼────────┐
   │   Auth       │  │ Validation │  │    Error    │
   │ Controller   │  │ Middleware │  │  Middleware │
   └────┬─────────┘  └────────────┘  └─────────────┘
        │
        │ Queries/Updates
        │
   ┌────▼────────────────────────────┐
   │      MongoDB Database            │
   ├──────────────────────────────────┤
   │ Collections:                     │
   │ • Users                          │
   │ • Candidates                     │
   │ • HRProfiles                     │
   └──────────────────────────────────┘
```

---

## Authentication Flow Diagram

### Registration Flow

```
┌─────────────┐
│   Client    │
│  Registers  │
└──────┬──────┘
       │ POST /register
       │ {email, password, name, role}
       │
       ▼
┌──────────────────┐
│ Registration     │
│ Validation       │
├──────────────────┤
│ • Email format   │
│ • Password       │
│   strength       │
│ • Name length    │
│ • Role valid     │
└────┬─────────────┘
     │ ✓ Valid
     ▼
┌──────────────────┐
│ Check User       │
│ Exists in DB     │
└────┬─────────────┘
     │ ✗ Not found
     ▼
┌──────────────────┐
│ Hash Password    │
│ (Bcrypt)         │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Create User      │
│ Document         │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Create Role      │
│ Profile          │
├──────────────────┤
│ IF candidate:    │
│  → Candidate     │
│ IF hr:           │
│  → HRProfile     │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Generate         │
│ Access Token     │
│ Refresh Token    │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Return           │
│ Tokens & User    │
└──────────────────┘
```

### Login Flow

```
┌─────────────┐
│   Client    │
│   Logs In   │
└──────┬──────┘
       │ POST /login
       │ {email, password}
       │
       ▼
┌──────────────────┐
│ Find User by     │
│ Email in DB      │
└────┬─────────────┘
     │ Found
     ▼
┌──────────────────┐
│ Check Active     │
│ Status           │
└────┬─────────────┘
     │ ✓ Active
     ▼
┌──────────────────┐
│ Compare          │
│ Password with    │
│ Stored Hash      │
└────┬─────────────┘
     │ ✓ Match
     ▼
┌──────────────────┐
│ Update Last      │
│ Login Time       │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Generate         │
│ Tokens           │
│ • Access (15m)   │
│ • Refresh (7d)   │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Fetch Role       │
│ Profile          │
│ (Candidate/HR)   │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Store Refresh    │
│ Token in         │
│ HTTP-only Cookie │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Return           │
│ Access Token +   │
│ User + Profile   │
└──────────────────┘
```

### Protected Route Flow

```
┌─────────────┐
│   Client    │
│ Requests   │
│ /api/auth/ │
│ me         │
└──────┬──────┘
       │ GET /me
       │ Header: Authorization: Bearer <TOKEN>
       │
       ▼
┌──────────────────┐
│ Auth Middleware  │
│ Extract Token    │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Verify JWT       │
│ Signature        │
└────┬─────────────┘
     │ ✓ Valid
     ▼
┌──────────────────┐
│ Decode Token     │
│ Get User ID      │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Attach User to   │
│ Request Object   │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Route Handler    │
│ Executes         │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Return           │
│ Protected Data   │
└──────────────────┘
```

### Token Refresh Flow

```
┌─────────────┐
│   Client    │
│   Calls     │
│ /refresh    │
└──────┬──────┘
       │ POST /refresh-token
       │ Cookie: refreshToken=<TOKEN>
       │
       ▼
┌──────────────────┐
│ Extract          │
│ Refresh Token    │
│ from Cookie/Body │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Verify Refresh   │
│ Token Signature  │
└────┬─────────────┘
     │ ✓ Valid
     ▼
┌──────────────────┐
│ Find User in DB  │
│ by Token ID      │
└────┬─────────────┘
     │ Found
     ▼
┌──────────────────┐
│ Verify Token in  │
│ User's Token     │
│ Array            │
└────┬─────────────┘
     │ ✓ Found
     ▼
┌──────────────────┐
│ Generate New     │
│ Access Token     │
│ (15 min)         │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Return New       │
│ Access Token     │
└──────────────────┘
```

---

## Data Model Relationships

```
┌────────────────────────────────────────────────────────────┐
│                          User                              │
├────────────────────────────────────────────────────────────┤
│ _id (ObjectId)                                             │
│ email (String, unique)                                     │
│ password (String, hashed)                                  │
│ name (String)                                              │
│ role: 'candidate' | 'hr' | 'admin'                        │
│ avatar (String, URL)                                       │
│ phone (String)                                             │
│ bio (String)                                               │
│ isEmailVerified (Boolean)                                  │
│ lastLogin (Date)                                           │
│ isActive (Boolean)                                         │
│ refreshTokens (Array<String>)                              │
│ createdAt (Date)                                           │
│ updatedAt (Date)                                           │
└────┬──────────────────────────────┬───────────────────────┘
     │                              │
     │ 1-1 Reference               │ 1-1 Reference
     │                              │
     ▼                              ▼
┌─────────────────────┐    ┌──────────────────────┐
│  Candidate (if      │    │  HRProfile (if       │
│   role='candidate') │    │   role='hr')         │
├─────────────────────┤    ├──────────────────────┤
│ _id                 │    │ _id                  │
│ userId (ref: User)  │    │ userId (ref: User)   │
│ resume.url          │    │ companyName          │
│ resume.uploadedAt   │    │ companyWebsite       │
│ skills (Array)      │    │ companyLogo          │
│ experience          │    │ department           │
│ education           │    │ designation          │
│ portfolio           │    │ isVerified           │
│ linkedinUrl         │    │ postedPositions[]    │
│ githubUrl           │    │ totalInterviews      │
│ interviewCount      │    │ averageRating        │
│ averageScore        │    │ createdAt, updatedAt │
│ status              │    └──────────────────────┘
│ appliedPositions[]  │
│ createdAt, updatedAt│
└─────────────────────┘
```

---

## Middleware Stack

```
Request
   │
   ▼
┌──────────────────────────┐
│  helmet()                │ Security headers
└─────────┬────────────────┘
          │
          ▼
┌──────────────────────────┐
│  cors()                  │ CORS handling
└─────────┬────────────────┘
          │
          ▼
┌──────────────────────────┐
│  cookieParser()          │ Parse cookies
└─────────┬────────────────┘
          │
          ▼
┌──────────────────────────┐
│  morgan()                │ Logging
└─────────┬────────────────┘
          │
          ▼
┌──────────────────────────┐
│  express.json()          │ Parse JSON
└─────────┬────────────────┘
          │
          ▼
┌──────────────────────────┐
│  authMiddleware()        │ (if needed)
│                          │ Verify JWT
└─────────┬────────────────┘
          │
          ▼
┌──────────────────────────┐
│  roleMiddleware()        │ (if needed)
│                          │ Check role
└─────────┬────────────────┘
          │
          ▼
┌──────────────────────────┐
│  Route Handler           │ Process request
└─────────┬────────────────┘
          │
          ▼
┌──────────────────────────┐
│  errorHandler()          │ Handle errors
└─────────┬────────────────┘
          │
          ▼
Response
```

---

## Security Layers

```
┌─────────────────────────────────────────────────────┐
│          Input Validation Layer                     │
│  • Email format • Password strength • Field length  │
└─────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────┐
│          Password Hashing Layer                     │
│  • Bcrypt • 12 salt rounds • Secure comparison      │
└─────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────┐
│          JWT Signing Layer                          │
│  • Secret signing key • Expiration • Verification   │
└─────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────┐
│          Cookie Security Layer                      │
│  • HTTP-only • Secure flag • SameSite policy        │
└─────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────┐
│          Role-Based Access Layer                    │
│  • Role verification • Resource ownership • Admin   │
└─────────────────────────────────────────────────────┘
```

---

## Role-Based Access Control Matrix

```
                    │ Candidate │ HR │ Admin │
────────────────────┼───────────┼────┼───────┤
View own profile    │    ✓      │ ✓  │  ✓    │
Edit own profile    │    ✓      │ ✓  │  ✓    │
View other users    │    ✗      │ ✓  │  ✓    │
Create positions    │    ✗      │ ✓  │  ✓    │
View candidates     │    ✗      │ ✓  │  ✓    │
Take interview      │    ✓      │ ✗  │  ✓    │
Conduct interview   │    ✗      │ ✓  │  ✓    │
Manage all users    │    ✗      │ ✗  │  ✓    │
Delete users        │    ✗      │ ✗  │  ✓    │
```

---

## Token Structure

### Access Token

```
Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "id": "65abc123def456",
  "email": "user@example.com",
  "role": "candidate",
  "iat": 1705276800,
  "exp": 1705277900
}

Signature:
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  JWT_SECRET
)
```

### Refresh Token

```
Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "id": "65abc123def456",
  "email": "user@example.com",
  "iat": 1705276800,
  "exp": 1710460800
}

Signature:
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  JWT_REFRESH_SECRET
)
```

---

## File Structure

```
intervau-ai-backend/
├── src/
│   ├── controllers/
│   │   └── AuthController.ts          ← Auth logic
│   ├── models/
│   │   ├── User.ts                    ← User schema
│   │   ├── Candidate.ts               ← Candidate profile
│   │   └── HRProfile.ts               ← HR profile
│   ├── routes/
│   │   └── auth.ts                    ← Auth endpoints
│   ├── middleware/
│   │   └── auth.ts                    ← Auth & role middleware
│   ├── utils/
│   │   ├── auth.ts                    ← Auth utilities
│   │   ├── validators.ts              ← Validation rules
│   │   └── errors.ts                  ← Error handling
│   ├── config/
│   │   ├── environment.ts             ← Config
│   │   └── database.ts                ← DB connection
│   └── index.ts                       ← App entry
├── AUTH_GUIDE.md                      ← Full documentation
├── AUTH_TESTING.md                    ← Testing guide
├── QUICK_AUTH_REFERENCE.md            ← Quick reference
└── AUTHENTICATION_IMPLEMENTATION.md   ← Implementation details
```

---

## Environment Variable Flow

```
.env file
  │
  ├─ JWT_SECRET ────────┐
  ├─ JWT_REFRESH_SECRET ┤
  ├─ JWT_EXPIRES_IN ────┤
  ├─ JWT_REFRESH_EXPIRES─┤
  ├─ BCRYPT_SALT_ROUNDS ┤
  ├─ MONGODB_URI ───────┤
  └─ NODE_ENV ──────────┤
                        │
                        ▼
                 config/environment.ts
                        │
            ┌───────────┴───────────┐
            │                       │
            ▼                       ▼
       AuthController        Middleware
            │                       │
            └───────────┬───────────┘
                        │
                        ▼
                   Application
```

---

This architecture ensures:

- ✅ Secure authentication and authorization
- ✅ Role-based access control
- ✅ Token-based session management
- ✅ MongoDB persistence
- ✅ Scalable design
- ✅ Clear separation of concerns
