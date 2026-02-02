# Remember Me - Testing Guide

## Quick Start Testing

### 1. Backend Setup

```bash
cd intervau-ai-backend

# Make sure MongoDB is running
# Add RememberMeSession model to exports if needed
# Run server
npm run dev
```

### 2. Frontend Setup

```bash
cd intervau-ai-frontend

# Run frontend
npm run dev
```

### 3. Test Flow

#### Test 1: Login with Remember Me

1. Go to http://localhost:3000/login
2. Enter test credentials:
   - Email: `candidate@test.com`
   - Password: `Test1234`
3. **CHECK "Remember Me"** ✓
4. Click "Login"
5. Should redirect to dashboard

#### Test 2: Verify Token Storage

1. Open DevTools (F12)
2. Go to Application → Storage → LocalStorage
3. You should see `authToken` in localStorage (persistent)
4. **This proves Remember Me is working!**

#### Test 3: Access Device Management

1. Go to Profile Settings (click user menu → Settings)
2. Click "Devices" tab
3. Click "Manage Devices" button
4. Should load Device Management page with current session
5. See device info: browser, OS, IP, creation date, expiry

#### Test 4: Revoke a Device

1. On Device Management page
2. You should see at least 1 session (your current one)
3. Click "Revoke" button on a session
4. Confirm the dialog
5. Session should disappear from list
6. Success message should appear

#### Test 5: Browser Session Persistence

1. After logging in with Remember Me
2. Close browser completely (Ctrl+Shift+Del to clear only if needed)
3. Reopen browser
4. Go to http://localhost:3000
5. **Should still be logged in!** ✓
6. Token should still be in localStorage

#### Test 6: Without Remember Me

1. Log out first (Profile Settings → Sign Out)
2. Go to login page
3. Enter credentials
4. **DON'T check Remember Me**
5. Click Login
6. Open DevTools → Application → Storage
7. Token should be in **sessionStorage** (not localStorage)
8. Close browser completely
9. Reopen and go to app
10. **Should be logged out** ✓

#### Test 7: Sign Out All Others

1. Log in on Device A with Remember Me
2. Open incognito/private window
3. Log in on Device B with Remember Me
4. Go to Device Management on Device B
5. Should see 2 sessions
6. Click "Sign Out All Other Devices"
7. Only Device B session should remain
8. Try using Device A session
9. **Device A should be logged out** ✓

---

## Database Verification

### MongoDB Check

```javascript
// Connect to MongoDB shell
use intervau_db

// Check RememberMeSession collection exists
db.rememberMesessions.find().pretty()

// Should see documents like:
{
  "_id": ObjectId(...),
  "userId": ObjectId(...),
  "deviceId": "abc123...",
  "deviceName": "Chrome on Windows",
  "deviceType": "desktop",
  "browser": "Chrome",
  "operatingSystem": "Windows",
  "ipAddress": "192.168.1.1",
  "isActive": true,
  "lastActivityAt": ISODate(...),
  "createdAt": ISODate(...),
  "expiresAt": ISODate(...),
  ...
}

// Check indexes
db.rememberMesessions.getIndexes()
```

---

## API Testing with Curl/Postman

### Get Active Sessions

```bash
curl -X GET http://localhost:5000/api/auth/sessions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Revoke a Session

```bash
curl -X POST http://localhost:5000/api/auth/sessions/SESSION_ID/revoke \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Sign Out All Others

```bash
curl -X POST http://localhost:5000/api/auth/sessions/revoke-all-others \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currentSessionId":"CURRENT_SESSION_ID"}'
```

---

## Expected Results

### ✅ Things That Should Work

1. **Login with Remember Me**
   - Token stored in localStorage
   - User stays logged in after browser close

2. **Device Detection**
   - Browser name shows correctly
   - OS shows correctly
   - Device type shows correctly
   - IP address captured

3. **Device Management UI**
   - Sessions display properly
   - Device icons show
   - Dates format correctly
   - Expiry countdown shows

4. **Session Revocation**
   - Can revoke individual sessions
   - Can revoke all others
   - Sessions disappear from list
   - Success messages appear

5. **Auto-Refresh**
   - Sessions refresh every 30 seconds
   - Manual refresh button works
   - New sessions appear automatically

---

## Common Issues & Solutions

### Issue: No sessions showing up

**Solution:**

- Check backend is running
- Check token is valid
- Check MongoDB connection
- Check RememberMeSession collection exists

### Issue: Device info blank

**Solution:**

- Check user-agent header sent correctly
- Check DeviceUtils parsing logic
- Verify browser sends proper headers

### Issue: Sessions not persisting

**Solution:**

- Check localStorage isn't cleared
- Check token expiration isn't too short
- Check TTL index isn't deleting immediately

### Issue: CORS errors

**Solution:**

- Check backend CORS config
- Verify frontend API URL is correct
- Check Authorization header format

---

## Performance Monitoring

### Things to Monitor During Testing

1. **Database Performance**
   - RememberMeSession queries should be fast
   - Indexes helping with lookups

2. **API Response Times**
   - Sessions list: should load in <100ms
   - Revoke: should complete in <200ms

3. **Frontend Rendering**
   - Device Management page should load quickly
   - No memory leaks with auto-refresh
   - Smooth animations

4. **Token Expiration**
   - Tokens should last 30 days with Remember Me
   - Sessions should auto-delete after 30 days

---

## Deployment Testing

Before deploying to production:

- [ ] All tests passing
- [ ] No console errors
- [ ] Database indexes created
- [ ] Environment variables set
- [ ] SSL certificates ready (for secure cookies)
- [ ] Backup of database taken
- [ ] Monitoring configured
- [ ] Error logging enabled

---

## Success Criteria ✅

You'll know the implementation is successful when:

1. ✅ Users can log in with Remember Me
2. ✅ Users stay logged in after browser close
3. ✅ Device Management page loads correctly
4. ✅ All devices visible with correct info
5. ✅ Can revoke devices individually
6. ✅ Can sign out all other devices
7. ✅ Sessions auto-refresh
8. ✅ No errors in console
9. ✅ Database shows sessions
10. ✅ Dates format correctly

---

## Support

If you encounter issues:

1. Check browser console for errors
2. Check backend logs
3. Check MongoDB logs
4. Verify API endpoints in Postman
5. Check network tab in DevTools
