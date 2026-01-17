# Quick Reference: Authentication Troubleshooting

## ✅ **STATUS: ALL AUTHENTICATION ISSUES FIXED**

Test Results: **6/6 tests passed** ✅

---

## Quick Test

Run this command to verify everything is working:
```bash
node test-auth.js
```

All tests should pass (6/6). If they don't, see troubleshooting below.

---

## Common Issues & Solutions

### Issue: "Company name is required" for Candidate
**Status:** ✅ FIXED  
**Solution:** Backend validation now correctly only requires company name when `role === 'hr'`

### Issue: "User already exists" showing generic error
**Status:** ✅ FIXED  
**Solution:** Frontend now displays the actual backend error message

### Issue: Can't login after registration
**Status:** ✅ FIXED  
**Solution:** Email normalization is now consistent (lowercase & trimmed) across registration and login

### Issue: Email case sensitivity problems  
**Status:** ✅ FIXED  
**Solution:** All emails are normalized to lowercase before database operations

### Issue: Password validation mismatch
**Status:** ✅ FIXED  
**Solution:** Both frontend and backend now require 8+ characters with uppercase, lowercase, and number

---

## Password Requirements

**MUST HAVE ALL OF THE FOLLOWING:**
- ✅ Minimum 8 characters
- ✅ At least one uppercase letter (A-Z)
- ✅ At least one lowercase letter (a-z)
- ✅ At least one number (0-9)

**Example valid passwords:**
- `Password1`
- `Test1234`
- `MyP@ssw0rd`

---

## Registration Requirements

### Candidate Registration
- ✅ Full Name
- ✅ Email (valid format)
- ✅ Password (meets requirements above)
- ✅ Role: "candidate"

### HR Registration  
- ✅ Full Name
- ✅ Email (valid format)
- ✅ Password (meets requirements above)
- ✅ Role: "hr"
- ✅ Company Name (required for HR)

---

## API Endpoints

### Register
```
POST /api/auth/register
Body: { name, email, password, role, companyName? }
Success: 201 { success: true, data: { user, accessToken } }
Duplicate: 409 { success: false, message: "User with this email already exists" }
```

### Login
```
POST /api/auth/login
Body: { email, password }
Success: 200 { success: true, data: { user, accessToken } }
Invalid: 401 { success: false, message: "Invalid email or password" }
```

---

## Testing Checklist

Use these test credentials:

**Candidate:**
- Email: `testcandidate@example.com`
- Password: `Test1234`

**HR:**
- Email: `testhr@example.com`
- Password: `Test1234`
- Company: `Test Company Inc.`

**Test Steps:**
1. [ ] Register as Candidate → Should succeed
2. [ ] Login as Candidate → Should succeed
3. [ ] Register as HR with company → Should succeed
4. [ ] Login as HR → Should succeed
5. [ ] Try to register duplicate email → Should show "User with this email already exists"
6. [ ] Login with UPPERCASE EMAIL → Should succeed (case insensitive)

---

## Error Messages

| Frontend Display | Status | Backend Response |
|-----------------|--------|------------------|
| "User with this email already exists" | ✅ Working | 409 Conflict |
| "Invalid email or password" | ✅ Working | 401 Unauthorized |
| "Password must be at least 8 characters" | ✅ Working | 400 Bad Request |
| "Company name is required for HR registration" | ✅ Working | 400 Bad Request |
| "Passwords do not match" | ✅ Working | Frontend validation |
| "Password must contain uppercase, lowercase, and number" | ✅ Working | 400 Bad Request |

---

## Files Changed

**Backend:**
- `src/controllers/AuthController.ts` - Email normalization, password length
- `src/utils/validators.ts` - Password validation, company name validation

**Frontend:**
- `src/services/api.ts` - Error message handling  
- `src/pages/Register.tsx` - Error display

**Testing:**
- `test-auth.js` - Automated test suite
- `AUTH_FIX_COMPLETE.md` - Detailed documentation
- `AUTH_FIX_SUMMARY.md` - Technical summary

---

## Manual Testing

### Test Candidate Flow
1. Open browser to `http://localhost:5173/register`
2. Select "Candidate"
3. Fill form:
   - Name: Your Name
   - Email: your@email.com  
   - Password: Test1234
   - Confirm Password: Test1234
4. Click "Create Account"
5. Should redirect to `/candidate/dashboard`
6. Logout and try to login with same credentials
7. Should successfully login

### Test HR Flow
1. Open browser to `http://localhost:5173/register`
2. Select "HR Team"
3. Fill form:
   - Name: Your Name
   - Email: hr@company.com
   - Company: Your Company
   - Password: Test1234
   - Confirm Password: Test1234
4. Click "Create Account"
5. Should redirect to `/hr/dashboard`
6. Logout and try to login with same credentials
7. Should successfully login

### Test Duplicate Registration
1. Try to register with an email that's already used
2. Should see notification: "User with this email already exists"
3. Error should be clear and specific (not generic)

---

## Troubleshooting

### Backend not responding
```bash
# Check if backend is running
# Should see server running on port 5000

# If not running, start it:
cd intervau-ai-backend
npm run dev
```

### Frontend not updating errors
```bash
# Clear browser cache and reload
# Or hard refresh: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)

# Check if frontend is running
# Should see app running on port 5173

# If not running, start it:
cd intervau-ai-frontend  
npm run dev
```

### Tests failing
```bash
# Make sure both frontend and backend are running
# Wait a few seconds after making changes for backend to reload
# Then run tests:
node test-auth.js
```

### Email validation failing
- Make sure email is in valid format: `name@domain.com`
- Spaces will be trimmed automatically
- Case doesn't matter: `TEST@EMAIL.COM` = `test@email.com`

---

## Success Indicators

✅ **All working correctly when:**
1. You can register as Candidate without providing company name
2. You can register as HR when you provide company name
3. Duplicate registration shows specific "User already exists" message
4. Login works with any email case (uppercase/lowercase)
5. All 6 automated tests pass

---

## Need Help?

1. Check `AUTH_FIX_COMPLETE.md` for detailed documentation
2. Check `AUTH_FIX_SUMMARY.md` for technical details
3. Run `node test-auth.js` to verify system status
4. Check browser console (F12) for frontend errors
5. Check backend terminal for server errors

**Test Suite:** All tests passing ✅  
**Status:** Ready for use ✅
