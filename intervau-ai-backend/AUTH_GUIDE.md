# Authentication & Authorization Guide

## Overview

The application implements a comprehensive role-based authentication system using JWT tokens with MongoDB. Three user roles are supported: **Candidate**, **HR**, and **Admin**.

## Architecture

### User Roles

1. **Candidate** - Job seekers applying for positions
   - Can apply to job positions
   - Can take interviews
   - Can view interview history and feedback
   - Has associated Candidate profile with resume, skills, etc.

2. **HR** - Hiring managers from companies
   - Can create and manage job positions
   - Can conduct interviews
   - Can view candidates and their profiles
   - Has associated HR profile with company information

3. **Admin** - System administrators
   - Full access to all resources
   - Can manage users, roles, and system settings

### Database Models

#### User Model

- `email` - Unique email address
- `password` - Bcrypt hashed password
- `name` - User's full name
- `role` - User role (candidate, hr, admin)
- `avatar` - Profile picture URL
- `phone` - Contact number
- `bio` - Short biography
- `isEmailVerified` - Email verification status
- `emailVerificationToken` - Token for email verification
- `lastLogin` - Last login timestamp
- `isActive` - Account active/inactive status
- `refreshTokens` - Array of valid refresh tokens

#### Candidate Profile Model

- `userId` - Reference to User
- `resume` - Resume URL and upload date
- `skills` - Array of skills
- `experience` - Work experience details
- `education` - Educational background
- `portfolio` - Portfolio URL
- `linkedinUrl` - LinkedIn profile
- `githubUrl` - GitHub profile
- `interviewCount` - Total interviews taken
- `averageScore` - Average interview score
- `status` - Candidate status (active, rejected, accepted, pending)
- `appliedPositions` - Array of applied job positions

#### HR Profile Model

- `userId` - Reference to User
- `companyName` - Company name
- `companyWebsite` - Company website
- `companyLogo` - Logo URL
- `department` - Department name
- `designation` - Job designation
- `postedPositions` - Array of posted job positions
- `totalInterviewsConducted` - Total interviews conducted
- `averageRating` - Average HR rating
- `isVerified` - HR verification status

## API Endpoints

### Authentication Routes (`/api/auth`)

#### 1. Register User

```
POST /api/auth/register
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe",
  "role": "candidate",
  "companyName": "Tech Corp" // Required only for HR role
}
```

**Response (201 - Created):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "USER_ID",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "candidate"
    },
    "accessToken": "JWT_TOKEN"
  }
}
```

**Validation Rules:**

- Email must be valid and unique
- Password must be ≥6 characters, contain uppercase, lowercase, and number
- Name must be 2-50 characters
- Role must be 'candidate', 'hr', or 'admin'
- Company name required for HR registration

---

#### 2. Login User

```
POST /api/auth/login
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200 - OK):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "USER_ID",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "candidate",
      "candidateProfile": {
        "_id": "CANDIDATE_ID",
        "userId": "USER_ID",
        "skills": [],
        "status": "active",
        ...
      }
    },
    "accessToken": "JWT_TOKEN"
  }
}
```

**Features:**

- Validates credentials securely
- Updates last login timestamp
- Returns role-specific profile data
- Sets HTTP-only refresh token cookie
- Returns access token in response

---

#### 3. Refresh Token

```
POST /api/auth/refresh-token
```

**Request:**

```json
{
  "refreshToken": "REFRESH_TOKEN" // Optional, can also use cookie
}
```

**Response (200 - OK):**

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "NEW_JWT_TOKEN"
  }
}
```

---

#### 4. Get Current User

```
GET /api/auth/me
```

**Headers:**

```
Authorization: Bearer ACCESS_TOKEN
```

**Response (200 - OK):**

```json
{
  "success": true,
  "data": {
    "id": "USER_ID",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "candidate",
    "candidateProfile": {
      "_id": "CANDIDATE_ID",
      "skills": [],
      ...
    }
  }
}
```

---

#### 5. Update Profile

```
PUT /api/auth/profile
```

**Headers:**

```
Authorization: Bearer ACCESS_TOKEN
```

**Request Body:**

```json
{
  "name": "Jane Doe",
  "bio": "Software Engineer",
  "phone": "+1234567890",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Response (200 - OK):**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "USER_ID",
    "email": "user@example.com",
    "name": "Jane Doe",
    ...
  }
}
```

---

#### 6. Change Password

```
POST /api/auth/change-password
```

**Headers:**

```
Authorization: Bearer ACCESS_TOKEN
```

**Request Body:**

```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewSecurePass123",
  "confirmPassword": "NewSecurePass123"
}
```

**Response (200 - OK):**

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

#### 7. Delete Account

```
DELETE /api/auth/account
```

**Headers:**

```
Authorization: Bearer ACCESS_TOKEN
```

**Request Body:**

```json
{
  "password": "CurrentPassword123"
}
```

**Response (200 - OK):**

```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

**Note:** This deletes user account, candidate profile, and HR profile permanently.

---

#### 8. Logout

```
POST /api/auth/logout
```

**Headers:**

```
Authorization: Bearer ACCESS_TOKEN
```

**Request Body:**

```json
{
  "refreshToken": "REFRESH_TOKEN" // Optional
}
```

**Response (200 - OK):**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Token Management

### Access Token

- **Type:** JWT
- **Expiry:** 15 minutes (configurable via `JWT_EXPIRES_IN`)
- **Usage:** Include in Authorization header as `Bearer TOKEN`
- **Contains:** User ID, Email, Role

### Refresh Token

- **Type:** JWT
- **Expiry:** 7 days (configurable via `JWT_REFRESH_EXPIRES_IN`)
- **Storage:** HTTP-only cookie (secure)
- **Usage:** Used to obtain new access tokens
- **Contains:** User ID, Email

### Token Refresh Flow

1. Access token expires after 15 minutes
2. Call `/api/auth/refresh-token` with refresh token
3. Receive new access token
4. Refresh token remains valid for 7 days

---

## Middleware & Access Control

### Auth Middleware

Protects routes and verifies JWT tokens.

```typescript
app.get('/api/protected', authMiddleware, (req, res) => {
  // req.user contains authenticated user info
});
```

### Role Middleware

Restricts access based on user role.

```typescript
// Only HR can access
app.post('/api/positions', authMiddleware, isHRMiddleware, controller);

// Only candidates can access
app.get('/api/interviews', authMiddleware, isCandidateMiddleware, controller);

// Only admins can access
app.delete('/api/users', authMiddleware, isAdminMiddleware, controller);

// Multiple roles
app.get('/api/data', authMiddleware, roleMiddleware('hr', 'admin'), controller);
```

### Ownership Middleware

Verifies user owns the resource.

```typescript
app.put('/api/candidates/:userId', authMiddleware, ownershipMiddleware('userId'), controller);
```

---

## Security Features

### Password Security

- Minimum 6 characters
- Must contain uppercase, lowercase, and numbers
- Bcrypt hashing with 12 salt rounds
- Secure password comparison

### Token Security

- JWT with secret signing
- Token expiration enforcement
- Refresh token rotation
- HTTP-only cookies for refresh tokens

### Input Validation

- Email format validation
- Password strength validation
- Field length constraints
- Enum validation for roles

### Error Handling

- Generic error messages for auth failures
- Specific validation errors
- Token expiration detection
- Account status verification

---

## Environment Variables

```env
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12
```

---

## Usage Examples

### Frontend Integration

```javascript
// Login
const login = async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  localStorage.setItem('accessToken', data.data.accessToken);
  return data;
};

// Protected API call
const getMe = async () => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  });
  return response.json();
};

// Refresh token
const refreshAccessToken = async () => {
  const response = await fetch('/api/auth/refresh-token', {
    method: 'POST',
    credentials: 'include',
  });
  const data = await response.json();
  localStorage.setItem('accessToken', data.data.accessToken);
  return data.data.accessToken;
};
```

---

## Error Codes

| Code | Message                   | Meaning                  |
| ---- | ------------------------- | ------------------------ |
| 400  | Validation failed         | Invalid input data       |
| 401  | Invalid email or password | Authentication failed    |
| 401  | No authorization token    | Missing token            |
| 401  | Token expired             | Access token expired     |
| 403  | Access denied             | Insufficient permissions |
| 404  | User not found            | User doesn't exist       |
| 409  | User already exists       | Email already registered |
| 500  | Server error              | Internal server error    |

---

## Best Practices

1. **Always use HTTPS** in production
2. **Store tokens securely** - Use HTTP-only cookies for refresh tokens
3. **Validate inputs** - Use provided validators
4. **Handle token expiration** - Implement refresh token flow
5. **Protect sensitive routes** - Use appropriate middleware
6. **Log authentication events** - Monitor login attempts
7. **Implement rate limiting** - Prevent brute force attacks
8. **Use strong passwords** - Enforce password requirements
9. **Keep secrets safe** - Never expose JWT secrets
10. **Update regularly** - Keep dependencies current
