# Remember Me Architecture & Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + TypeScript)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────┐         ┌──────────────────────┐             │
│  │   Login.tsx    │◄────────┤   DeviceManagement   │             │
│  │  Remember Me   │         │      .tsx            │             │
│  │   Checkbox     │         └──────────────────────┘             │
│  └────────┬───────┘                     ▲                        │
│           │                             │                        │
│           │ rememberMe=true             │ calls                  │
│           ▼                             │                        │
│  ┌──────────────────────────────────────┼──┐                    │
│  │          AuthContext.tsx              │  │                    │
│  │  - login(email,pass,rememberMe)      │  │                    │
│  │  - Manages auth state                │  │                    │
│  └──────────────────────┬───────────────┘  │                    │
│                         │                   │                    │
│           ┌─────────────┴───────┬───────────┴────────┐           │
│           │                     │                    │           │
│           ▼                     ▼                    ▼           │
│  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │   api.ts        │  │  getActiveSessions()│  │ revokeSession()│  │
│  │  login()        │  │  signOutAllOthers() │  │              │  │
│  │  Methods        │  │  updateActivity()  │  └──────────────┘  │
│  └────────┬────────┘  └──────────┬─────────┘                    │
│           │                      │                              │
│           └──────────┬───────────┘                              │
│                      │                                          │
│                 HTTP Requests                                   │
│                      │                                          │
│                      ▼                                          │
└──────────────────────┼────────────────────────────────────────┘
                       │
                       │ /api/auth/login
                       │ /api/auth/sessions
                       │ /api/auth/sessions/:id/revoke
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js + Express)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────────────────────────────┐    │
│  │   Routes     │  │   controllers/AuthController.ts       │    │
│  │  auth.ts     │─►│  - login (with Remember Me)           │    │
│  │              │  │  - generateAccessToken                │    │
│  └──────────────┘  │  - generateRefreshToken               │    │
│                    └──────────────────┬─────────────────────┘    │
│                                       │                          │
│                    ┌──────────────────┴─────────────────────┐   │
│                    │                                        │   │
│  ┌──────────────────┐  ┌──────────────────────────────────┐  │
│  │ DeviceSession    │  │  DeviceUtils.ts                   │  │
│  │ Controller.ts    │  │  - generateDeviceId()             │  │
│  │                  │  │  - getDeviceInfo()                │  │
│  │ Methods:         │  │  - parseUserAgent()               │  │
│  │ - getSessions    │  │  - getClientIp()                  │  │
│  │ - revoke         │  └──────────────────────────────────┘  │
│  │ - revokeAllOthers│                                        │
│  └──────────┬───────┘                                        │
│             │                                                │
│             └──────────────────┬────────────────────────────┘
│                                │ Queries/Updates
│                                │
│                                ▼
│                   ┌──────────────────────────┐
│                   │   Middleware/auth.ts     │
│                   │   Verify JWT tokens      │
│                   │   Protect endpoints      │
│                   └──────────────────────────┘
│                                │
└────────────────────────────────┼────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│              DATABASE (MongoDB + Mongoose)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          RememberMeSession Collection                     │  │
│  │  ┌───────────────────────────────────────────────────┐  │  │
│  │  │ {                                                  │  │  │
│  │  │   _id: ObjectId                                   │  │  │
│  │  │   userId: ObjectId(User)                          │  │  │
│  │  │   deviceId: "hash(ua+ip)"                         │  │  │
│  │  │   deviceName: "Chrome on Windows"                 │  │  │
│  │  │   deviceType: "desktop"                           │  │  │
│  │  │   browser: "Chrome"                               │  │  │
│  │  │   operatingSystem: "Windows"                       │  │  │
│  │  │   ipAddress: "192.168.1.1"                        │  │  │
│  │  │   refreshToken: "jwt_token"                       │  │  │
│  │  │   isActive: true                                  │  │  │
│  │  │   lastActivityAt: Date                            │  │  │
│  │  │   createdAt: Date                                 │  │  │
│  │  │   expiresAt: Date (TTL: auto-delete)             │  │  │
│  │  │ }                                                  │  │  │
│  │  └───────────────────────────────────────────────────┘  │  │
│  │                                                           │  │
│  │  Indexes:                                                 │  │
│  │  - userId_1_isActive_1                                   │  │
│  │  - deviceId_1 (unique)                                   │  │
│  │  - refreshToken_1 (unique)                               │  │
│  │  - expiresAt_1 (TTL, auto-delete)                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Login with Remember Me

```
User Input
    │
    ▼
┌─────────────────────────────┐
│ Login Form                  │
│ email, password             │
│ rememberMe: true            │
└────────────────┬────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│ POST /api/auth/login                │
│ { email, password, rememberMe }     │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────┐
│ AuthController.login()      │
│ 1. Validate credentials     │
│ 2. Check rememberMe flag    │
│ 3. Extract device info      │
│ 4. Generate tokens (30d)    │
└────────────────┬────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│ Create RememberMeSession        │
│ - deviceId: hash(ua+ip)         │
│ - deviceName: "Chrome Windows"  │
│ - expiresAt: now + 30 days      │
│ - refreshToken: jwt             │
└────────────────┬────────────────┘
                 │
                 ▼
┌──────────────────────────────────────┐
│ Response with accessToken            │
│ Set 30-day Cookie                    │
└────────────────┬─────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────┐
│ Frontend stores:                     │
│ - accessToken in localStorage        │
│ - rememberMe flag in localStorage    │
└──────────────────────────────────────┘
```

### Device Management Flow

```
User visits /candidate/devices
    │
    ▼
┌──────────────────────────────┐
│ DeviceManagement.tsx         │
│ Component mounts             │
└────────────────┬─────────────┘
                 │
                 ▼
┌────────────────────────────────┐
│ api.getActiveSessions()        │
│ GET /api/auth/sessions         │
└────────────────┬───────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│ Backend:                            │
│ DeviceSessionController              │
│ 1. Extract userId from JWT          │
│ 2. Query RememberMeSession          │
│ 3. Filter isActive=true             │
│ 4. Exclude refreshToken             │
│ 5. Sort by lastActivityAt           │
└────────────────┬────────────────────┘
                 │
                 ▼
┌───────────────────────────────────┐
│ Return sessions array             │
│ [{ device info, expiry, ... }, ]  │
└────────────────┬──────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│ Frontend renders Device Cards          │
│ - Device name & info                   │
│ - Last activity timestamp              │
│ - Days until expiration                │
│ - Revoke button                        │
└────────────────────────────────────────┘
```

### Revoke Session Flow

```
User clicks Revoke on a device
    │
    ▼
┌──────────────────┐
│ Confirmation     │
│ Dialog shows     │
└────────┬─────────┘
         │ User confirms
         ▼
┌────────────────────────────────────┐
│ POST /api/auth/sessions/id/revoke  │
└────────────────┬───────────────────┘
                 │
                 ▼
┌──────────────────────────────────────┐
│ DeviceSessionController.revokeSession│
│ 1. Find session by ID                │
│ 2. Verify userId matches             │
│ 3. Set isActive = false              │
│ 4. Remove refreshToken from User     │
│ 5. Save changes                      │
└────────────────┬─────────────────────┘
                 │
                 ▼
┌──────────────────────────────────┐
│ Response: { success: true }      │
└────────────────┬─────────────────┘
                 │
                 ▼
┌────────────────────────────────────┐
│ Frontend:                          │
│ 1. Remove from sessions array      │
│ 2. Show success message            │
│ 3. Auto-refresh list               │
└────────────────────────────────────┘
```

---

## Token Duration Timeline

```
Regular Login (without Remember Me)
├─ Access Token:  7-14 days
├─ Refresh Token: 7-14 days
└─ Session:       Browser session (clears on close)

Login with Remember Me
├─ Access Token:  30 days
├─ Refresh Token: 30 days
└─ Session:       30 days (persists across browser close)
    └─ Auto-deletes via MongoDB TTL after 30 days
```

---

## Component Hierarchy

```
App.tsx
├── AuthProvider
│   ├── Login.tsx
│   │   └── Remember Me Checkbox
│   │
│   ├── ProfileSettings.tsx
│   │   └── Devices Tab
│   │       └── "Manage Devices" Button
│   │
│   └── DeviceManagement.tsx
│       ├── Refresh Button
│       ├── Sign Out All Others Button
│       └── Session Cards
│           ├── Device Info
│           ├── Expiry Status
│           └── Revoke Button
│
└── Router
    ├── /candidate/devices → DeviceManagement
    └── /hr/devices → DeviceManagement
```

---

## Security Layers

```
Layer 1: Authentication
├─ Email & Password validation
├─ Bcrypt hashing
└─ JWT token generation

Layer 2: Authorization
├─ JWT verification
├─ Role-based access (candidate/hr)
└─ User ownership validation

Layer 3: Device Security
├─ Device fingerprinting
├─ Unique device IDs
├─ IP address tracking
└─ Browser/OS tracking

Layer 4: Session Security
├─ Unique refresh tokens
├─ Token rotation
├─ Activity tracking
└─ Automatic expiration
```

---

## Performance Optimizations

```
Database Indexes
├─ userId_1_isActive_1    (Fast user session queries)
├─ deviceId_1             (Unique device detection)
├─ refreshToken_1         (Token validation)
└─ expiresAt_1 TTL        (Automatic cleanup)

Query Optimization
├─ Select only needed fields (exclude refreshToken)
├─ Sort by lastActivityAt
└─ Filter isActive=true

Frontend Optimization
├─ Auto-refresh every 30 seconds
├─ Lazy loading of sessions
└─ Memoized components
```

---

## Scalability Considerations

```
For 100,000 Users with 3 devices each (300,000 sessions)

Database:
├─ Indexes ensure O(log n) lookups
├─ TTL cleanup removes old sessions automatically
└─ Query performance: <100ms

API:
├─ Get sessions: <100ms
├─ Revoke session: <200ms
└─ Sessions per user: typically 1-5

Frontend:
├─ Loads sessions on demand
├─ Auto-refresh doesn't overload
└─ Pagination possible if >10 devices
```

---

## Error Handling

```
Frontend Error Handling
├─ Failed session load → Show error message
├─ Failed revocation → Show error, keep session
├─ Network error → Retry with exponential backoff
└─ Invalid response → Graceful fallback

Backend Error Handling
├─ Missing userId → Return 401
├─ Session not found → Return 404
├─ Invalid session ID → Return 403
└─ Database error → Return 500 with message
```

---

## Future Enhancement Paths

```
Phase 2: Security Enhancements
├─ Two-Factor Authentication
├─ Suspicious activity alerts
└─ Geolocation tracking

Phase 3: User Features
├─ Device naming/renaming
├─ Trusted device categories
├─ Session usage statistics
└─ Last login timestamps

Phase 4: Admin Features
├─ Admin device management
├─ Session analytics
├─ Bulk device revocation
└─ Compliance reporting
```

This architecture supports:

- ✅ Scalability
- ✅ Security
- ✅ Performance
- ✅ Maintainability
- ✅ Future enhancements
