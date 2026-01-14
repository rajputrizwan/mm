# API Testing Guide - Authentication Endpoints

This guide provides cURL and Postman examples for testing all authentication endpoints.

## Base URL

```
http://localhost:5000/api/auth
```

---

## 1. Register as Candidate

### cURL

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "candidate@example.com",
    "password": "SecurePass123",
    "name": "John Candidate",
    "role": "candidate"
  }'
```

### Postman

```
POST http://localhost:5000/api/auth/register

Headers:
- Content-Type: application/json

Body (raw JSON):
{
  "email": "candidate@example.com",
  "password": "SecurePass123",
  "name": "John Candidate",
  "role": "candidate"
}
```

### Expected Response

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "65abc123def456",
      "email": "candidate@example.com",
      "name": "John Candidate",
      "role": "candidate"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 2. Register as HR

### cURL

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hr@techcorp.com",
    "password": "SecurePass123",
    "name": "Jane HR Manager",
    "role": "hr",
    "companyName": "Tech Corporation"
  }'
```

### Postman

```
POST http://localhost:5000/api/auth/register

Body:
{
  "email": "hr@techcorp.com",
  "password": "SecurePass123",
  "name": "Jane HR Manager",
  "role": "hr",
  "companyName": "Tech Corporation"
}
```

---

## 3. Login User

### cURL

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "candidate@example.com",
    "password": "SecurePass123"
  }'
```

### Postman

```
POST http://localhost:5000/api/auth/login

Headers:
- Content-Type: application/json

Body:
{
  "email": "candidate@example.com",
  "password": "SecurePass123"
}

Tip: Enable "Automatically follow redirects" and "Store cookies"
```

### Expected Response

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "65abc123def456",
      "email": "candidate@example.com",
      "name": "John Candidate",
      "role": "candidate",
      "candidateProfile": {
        "_id": "65abc456def789",
        "userId": "65abc123def456",
        "skills": [],
        "status": "active",
        "interviewCount": 0
      }
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 4. Get Current User

### cURL

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -b cookies.txt
```

### Postman

```
GET http://localhost:5000/api/auth/me

Headers:
- Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Note:** Replace `YOUR_ACCESS_TOKEN` with the actual token from login response.

---

## 5. Refresh Token

### cURL

```bash
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

Or with token in body:

```bash
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### Postman

```
POST http://localhost:5000/api/auth/refresh-token

Headers:
- Content-Type: application/json

Cookies:
- refreshToken: YOUR_REFRESH_TOKEN
```

### Expected Response

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 6. Update Profile

### cURL

```bash
curl -X PUT http://localhost:5000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "John Updated Name",
    "bio": "Senior Software Engineer",
    "phone": "+1234567890",
    "avatar": "https://example.com/avatar.jpg"
  }'
```

### Postman

```
PUT http://localhost:5000/api/auth/profile

Headers:
- Authorization: Bearer YOUR_ACCESS_TOKEN
- Content-Type: application/json

Body:
{
  "name": "John Updated Name",
  "bio": "Senior Software Engineer",
  "phone": "+1234567890",
  "avatar": "https://example.com/avatar.jpg"
}
```

---

## 7. Change Password

### cURL

```bash
curl -X POST http://localhost:5000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "currentPassword": "SecurePass123",
    "newPassword": "NewSecurePass456",
    "confirmPassword": "NewSecurePass456"
  }'
```

### Postman

```
POST http://localhost:5000/api/auth/change-password

Headers:
- Authorization: Bearer YOUR_ACCESS_TOKEN
- Content-Type: application/json

Body:
{
  "currentPassword": "SecurePass123",
  "newPassword": "NewSecurePass456",
  "confirmPassword": "NewSecurePass456"
}
```

---

## 8. Logout

### cURL

```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -b cookies.txt
```

### Postman

```
POST http://localhost:5000/api/auth/logout

Headers:
- Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Expected Response

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 9. Delete Account

### cURL

```bash
curl -X DELETE http://localhost:5000/api/auth/account \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "password": "SecurePass123"
  }'
```

### Postman

```
DELETE http://localhost:5000/api/auth/account

Headers:
- Authorization: Bearer YOUR_ACCESS_TOKEN
- Content-Type: application/json

Body:
{
  "password": "SecurePass123"
}
```

---

## Postman Collection Setup

1. Create a new Postman Collection named "Intervau Auth"
2. Add these variables to the collection:
   - `base_url` = `http://localhost:5000/api/auth`
   - `access_token` = (automatically set after login)
   - `refresh_token` = (automatically set after login)

3. In login request, add a Test:

```javascript
if (pm.response.code === 200) {
  const responseData = pm.response.json();
  pm.environment.set('access_token', responseData.data.accessToken);
}
```

4. Use `{{base_url}}` and `{{access_token}}` in subsequent requests

---

## Common Errors & Solutions

### Error: "Validation failed"

**Cause:** Invalid input data
**Solution:** Check email format, password strength (min 6 chars, uppercase, lowercase, number)

### Error: "User already exists"

**Cause:** Email already registered
**Solution:** Use a different email or login with existing account

### Error: "Invalid email or password"

**Cause:** Wrong credentials
**Solution:** Verify email and password

### Error: "No authorization token"

**Cause:** Missing Authorization header
**Solution:** Add `Authorization: Bearer TOKEN` header

### Error: "Token expired"

**Cause:** Access token expired
**Solution:** Use refresh token to get new access token

### Error: "Invalid or expired refresh token"

**Cause:** Refresh token invalid or expired
**Solution:** Login again to get new tokens

---

## Test Workflow

### Complete Authentication Flow

1. **Register**

   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "TestPass123",
       "name": "Test User",
       "role": "candidate"
     }'
   ```

   Save the `accessToken` from response

2. **Get Current User**

   ```bash
   curl -X GET http://localhost:5000/api/auth/me \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

3. **Update Profile**

   ```bash
   curl -X PUT http://localhost:5000/api/auth/profile \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "bio": "Updated bio"
     }'
   ```

4. **Change Password**

   ```bash
   curl -X POST http://localhost:5000/api/auth/change-password \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "currentPassword": "TestPass123",
       "newPassword": "NewPass123",
       "confirmPassword": "NewPass123"
     }'
   ```

5. **Login with New Password**

   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "NewPass123"
     }'
   ```

6. **Logout**
   ```bash
   curl -X POST http://localhost:5000/api/auth/logout \
     -H "Authorization: Bearer YOUR_NEW_ACCESS_TOKEN"
   ```

---

## Notes

- Replace `YOUR_ACCESS_TOKEN` with actual token from responses
- Use `-c cookies.txt` to save cookies and `-b cookies.txt` to use them
- For Windows PowerShell, replace `'` with `"`
- All endpoints except register and login require authentication
- Tokens expire after 15 minutes; use refresh token for new one
