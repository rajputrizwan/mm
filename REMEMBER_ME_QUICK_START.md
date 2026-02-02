# Remember Me - Quick Start Guide

## What Was Built

A complete "Remember Me" functionality with:

- ✅ 30-day device sessions
- ✅ Device tracking & management
- ✅ User-friendly session UI
- ✅ One-click device revocation
- ✅ "Sign out all other devices" feature

---

## Key Files Created/Modified

### Backend

```
✅ src/models/RememberMeSession.ts          [NEW] Device session storage
✅ src/utils/DeviceUtils.ts                  [NEW] Device detection
✅ src/controllers/DeviceSessionController.ts [NEW] Session management
✅ src/controllers/AuthController.ts         [MODIFIED] Login with Remember Me
✅ src/routes/auth.ts                        [MODIFIED] Device endpoints
```

### Frontend

```
✅ src/pages/DeviceManagement.tsx             [NEW] Full device management page
✅ src/services/api.ts                        [MODIFIED] Device API endpoints
✅ src/router/index.tsx                       [MODIFIED] Device routes
✅ src/App.tsx                                [MODIFIED] Route configuration
✅ src/pages/ProfileSettings.tsx              [MODIFIED] Devices tab
```

---

## How to Use

### For Users

#### 1. Login with Remember Me

- Check "Remember Me" during login
- Device is saved for 30 days
- Browser session persists across closes

#### 2. Manage Devices

- Go to: Profile Settings → Devices tab
- Or: Profile Settings → Manage Devices button
- See all devices where Remember Me is active

#### 3. Revoke a Device

- Find device in Device Management
- Click "Revoke" button
- That device must log in again

#### 4. Sign Out All Others

- From Device Management page
- Click "Sign Out All Others"
- Only current device stays logged in

### For Developers

#### Test Remember Me

```javascript
// Login with Remember Me enabled
fetch("http://localhost:5000/api/auth/login", {
  method: "POST",
  body: JSON.stringify({
    email: "user@test.com",
    password: "Test1234",
    rememberMe: true, // Enable Remember Me
  }),
});
```

#### Get Active Sessions (API)

```javascript
fetch("http://localhost:5000/api/auth/sessions", {
  headers: {
    Authorization: "Bearer YOUR_TOKEN",
  },
});
```

#### Revoke a Session (API)

```javascript
fetch("http://localhost:5000/api/auth/sessions/SESSION_ID/revoke", {
  method: "POST",
  headers: {
    Authorization: "Bearer YOUR_TOKEN",
  },
});
```

---

## Feature Overview

### Device Detection

Automatically detects:

- Browser (Chrome, Firefox, Safari, Edge, Opera)
- Operating System (Windows, macOS, Linux, iOS, Android)
- Device Type (Desktop, Mobile, Tablet)
- IP Address
- Unique Device ID (fingerprint)

### Session Duration

- **With Remember Me:** 30 days
- **Without Remember Me:** Session-only (cleared on browser close)

### Automatic Cleanup

- MongoDB TTL index deletes expired sessions automatically
- No manual cleanup required

### Security

- Device fingerprinting prevents token sharing
- IP tracking logs device location
- Users can revoke anytime
- Refresh tokens are unique per session

---

## Frontend Routes

```
Candidate:
  /candidate/devices              → Device Management

HR:
  /hr/devices                     → Device Management

Quick Access:
  Profile Settings → Devices tab → Click "Manage Devices"
```

---

## API Endpoints

All endpoints require authentication (Bearer token)

```
GET    /api/auth/sessions                      → List all sessions
GET    /api/auth/sessions/:sessionId           → Get session details
POST   /api/auth/sessions/:sessionId/revoke    → Revoke a session
POST   /api/auth/sessions/revoke-all-others    → Sign out all others
PUT    /api/auth/sessions/:sessionId/activity  → Update activity
```

---

## Database Schema

### RememberMeSession

```typescript
{
  _id: ObjectId;
  userId: ObjectId; // User who owns session
  deviceId: String; // Unique device fingerprint
  deviceName: String; // "Chrome on Windows"
  deviceType: String; // mobile | tablet | desktop
  browser: String; // Chrome, Firefox, etc
  operatingSystem: String; // Windows, macOS, etc
  ipAddress: String; // Device IP address
  refreshToken: String; // JWT refresh token
  isActive: Boolean; // Session is active
  lastActivityAt: Date; // When device was last used
  createdAt: Date; // When session started
  expiresAt: Date; // Auto-delete date (30 days)
}
```

---

## Configuration

### Change Remember Me Duration

Edit `AuthController.ts` login method:

```typescript
// Current: 30 days
rememberMeExpiration.setDate(rememberMeExpiration.getDate() + 30);

// Change to: 14 days
rememberMeExpiration.setDate(rememberMeExpiration.getDate() + 14);
```

### Change Token Duration

Edit `AuthController.ts` token generation:

```typescript
// Current: 30 days for Remember Me
const duration = rememberMe ? "30d" : (config.jwtExpiresIn as any);

// Change to: 7 days for Remember Me
const duration = rememberMe ? "7d" : (config.jwtExpiresIn as any);
```

---

## Testing

### Test Scenario 1: Basic Remember Me

1. Log in with Remember Me checked ✓
2. Close browser completely
3. Reopen browser
4. Should be logged in automatically ✓

### Test Scenario 2: Without Remember Me

1. Log in WITHOUT Remember Me ✓
2. Close browser completely
3. Reopen browser
4. Should be logged out (need to login again) ✓

### Test Scenario 3: Revoke Device

1. Log in on Device A with Remember Me
2. Log in on Device B with Remember Me
3. On Device B, revoke Device A
4. Try using Device A → should be logged out ✓

### Test Scenario 4: Sign Out All Others

1. Log in on Device A with Remember Me
2. Log in on Device B with Remember Me
3. On Device B, click "Sign out all others"
4. Device A should be logged out
5. Device B should still be logged in ✓

---

## Common Issues & Solutions

| Issue                  | Solution                                               |
| ---------------------- | ------------------------------------------------------ |
| Sessions not appearing | Check MongoDB connection, verify user is authenticated |
| Device detection wrong | Clear browser cache, check user-agent header           |
| Sessions not expiring  | Verify MongoDB TTL indexes are created                 |
| Can't revoke session   | Ensure session belongs to current user                 |
| Token not refreshing   | Check refresh token in database exists                 |

---

## Files Summary

| File                       | Lines | Type       | Changes                        |
| -------------------------- | ----- | ---------- | ------------------------------ |
| RememberMeSession.ts       | 95    | Model      | Created                        |
| DeviceUtils.ts             | 145   | Utility    | Created                        |
| DeviceSessionController.ts | 200+  | Controller | Created                        |
| DeviceManagement.tsx       | 350+  | Component  | Created                        |
| AuthController.ts          | 732   | Controller | +5 imports, +40 lines in login |
| api.ts                     | 479   | Service    | +1 param login, +5 endpoints   |
| auth.ts                    | 130+  | Routes     | +5 endpoints                   |
| ProfileSettings.tsx        | 1248  | Page       | +1 import, +1 tab, +30 lines   |
| App.tsx                    | 367   | App        | +3 lines imports, +2 routes    |
| router/index.ts            | 107   | Router     | +2 routes                      |

---

## Status: ✅ READY FOR TESTING

All components implemented and integrated. Ready to:

- Test with actual users
- Monitor session creation/deletion
- Handle edge cases
- Fine-tune duration and security settings

---

**Last Updated:** February 2, 2026
**Status:** Complete Implementation
**Next Steps:** Testing & Deployment
