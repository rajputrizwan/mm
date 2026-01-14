# Intervau AI - Complete API Documentation

## API Overview

**Base URL**: `http://localhost:3000/api` (development)
**Base URL**: `https://api.your-domain.com` (production)

**Authentication**: JWT Bearer Token
**Content-Type**: `application/json`
**Response Format**: JSON

## Authentication

All endpoints (except `/auth/register` and `/auth/login`) require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "..."
  },
  "message": "Operation successful"
}
```

### Error Response (400+)

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

---

# Authentication Endpoints

## Register User

**Endpoint**: `POST /auth/register`
**Auth Required**: No
**Rate Limit**: 5 requests per hour per IP

### Request Body

```json
{
  "email": "user@example.com",
  "password": "StrongPassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "HR"
}
```

### Parameters

- **email** (string, required): Valid email address, must be unique
- **password** (string, required): Minimum 8 characters, must contain uppercase, lowercase, number
- **firstName** (string, required): User's first name
- **lastName** (string, required): User's last name
- **role** (enum, required): One of `HR`, `CANDIDATE`, `ADMIN`

### Success Response (201)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "HR"
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "expiresIn": 900
    }
  },
  "message": "User registered successfully"
}
```

### Error Responses

```json
// 400 - Validation error
{
  "success": false,
  "error": "Email already exists",
  "code": "EMAIL_EXISTS"
}

// 400 - Weak password
{
  "success": false,
  "error": "Password does not meet requirements",
  "code": "WEAK_PASSWORD"
}
```

---

## Login User

**Endpoint**: `POST /auth/login`
**Auth Required**: No
**Rate Limit**: 5 attempts per 15 minutes

### Request Body

```json
{
  "email": "user@example.com",
  "password": "StrongPassword123!"
}
```

### Parameters

- **email** (string, required): User's email
- **password** (string, required): User's password

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "HR"
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "expiresIn": 900
    }
  },
  "message": "Logged in successfully"
}
```

### Error Responses

```json
// 401 - Invalid credentials
{
  "success": false,
  "error": "Invalid email or password",
  "code": "INVALID_CREDENTIALS"
}

// 429 - Too many attempts
{
  "success": false,
  "error": "Too many login attempts. Try again later.",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

---

## Get Current User

**Endpoint**: `GET /auth/me`
**Auth Required**: Yes
**HTTP Method**: GET

### Response (200)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "HR",
      "profilePicture": "https://...",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  },
  "message": "User retrieved successfully"
}
```

---

## Logout User

**Endpoint**: `POST /auth/logout`
**Auth Required**: Yes

### Request Body

```json
{
  "refreshToken": "eyJhbGc..."
}
```

### Response (200)

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Refresh Token

**Endpoint**: `POST /auth/refresh`
**Auth Required**: No

### Request Body

```json
{
  "refreshToken": "eyJhbGc..."
}
```

### Response (200)

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "expiresIn": 900
  },
  "message": "Token refreshed successfully"
}
```

---

# Interview Endpoints

## Get All Interviews

**Endpoint**: `GET /interviews`
**Auth Required**: Yes
**Query Parameters**:

- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Results per page (default: 10, max: 100)
- `status` (string, optional): Filter by status (SCHEDULED, ONGOING, COMPLETED, CANCELLED)
- `sortBy` (string, optional): Sort field (scheduledAt, createdAt)
- `order` (string, optional): asc or desc

### Response (200)

```json
{
  "success": true,
  "data": {
    "interviews": [
      {
        "id": "interview_1",
        "title": "Senior Developer Position",
        "jobPosition": "position_1",
        "interviewer": "user_123",
        "candidate": "candidate_1",
        "status": "COMPLETED",
        "scheduledAt": "2024-01-20T14:00:00Z",
        "startedAt": "2024-01-20T14:05:00Z",
        "endedAt": "2024-01-20T14:45:00Z",
        "transcript": "...",
        "aiAnalysis": {
          "overallScore": 85,
          "sentiment": "POSITIVE"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

---

## Create Interview

**Endpoint**: `POST /interviews`
**Auth Required**: Yes
**Required Role**: HR, ADMIN

### Request Body

```json
{
  "title": "Senior Developer Position",
  "jobPosition": "position_1",
  "candidate": "candidate_1",
  "scheduledAt": "2024-01-20T14:00:00Z"
}
```

### Parameters

- **title** (string, required): Interview title
- **jobPosition** (string, required): Job position ID
- **candidate** (string, required): Candidate ID
- **scheduledAt** (ISO string, required): Scheduled date/time

### Response (201)

```json
{
  "success": true,
  "data": {
    "interview": {
      "id": "interview_1",
      "title": "Senior Developer Position",
      "jobPosition": "position_1",
      "interviewer": "user_123",
      "candidate": "candidate_1",
      "status": "SCHEDULED",
      "scheduledAt": "2024-01-20T14:00:00Z",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

---

## Get Interview Details

**Endpoint**: `GET /interviews/:id`
**Auth Required**: Yes

### Parameters

- **id** (string, required): Interview ID

### Response (200)

```json
{
  "success": true,
  "data": {
    "interview": {
      "id": "interview_1",
      "title": "Senior Developer Position",
      "jobPosition": {
        "id": "position_1",
        "title": "Senior Developer",
        "department": "Engineering"
      },
      "interviewer": {
        "id": "user_123",
        "firstName": "John",
        "lastName": "Doe"
      },
      "candidate": {
        "id": "candidate_1",
        "user": {
          "firstName": "Jane",
          "lastName": "Smith"
        }
      },
      "status": "COMPLETED",
      "scheduledAt": "2024-01-20T14:00:00Z",
      "startedAt": "2024-01-20T14:05:00Z",
      "endedAt": "2024-01-20T14:45:00Z",
      "questions": [
        {
          "id": "q_1",
          "text": "Tell us about your experience",
          "category": "BEHAVIORAL"
        }
      ],
      "transcript": "...",
      "aiAnalysis": {
        "overallScore": 85,
        "sentiment": "POSITIVE",
        "strengths": ["Communication", "Technical knowledge"],
        "weaknesses": ["Time management"]
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

---

## Update Interview

**Endpoint**: `PUT /interviews/:id`
**Auth Required**: Yes
**Required Role**: HR, ADMIN

### Request Body

```json
{
  "title": "Updated Title",
  "status": "ONGOING",
  "scheduledAt": "2024-01-21T14:00:00Z"
}
```

### Parameters

- **title** (string, optional): New interview title
- **status** (enum, optional): SCHEDULED, ONGOING, COMPLETED, CANCELLED
- **scheduledAt** (ISO string, optional): New scheduled date/time

### Response (200)

```json
{
  "success": true,
  "data": {
    "interview": {
      "id": "interview_1",
      "title": "Updated Title",
      "status": "ONGOING",
      "scheduledAt": "2024-01-21T14:00:00Z",
      "updatedAt": "2024-01-15T11:00:00Z"
    }
  }
}
```

---

## Delete Interview

**Endpoint**: `DELETE /interviews/:id`
**Auth Required**: Yes
**Required Role**: HR, ADMIN

### Response (200)

```json
{
  "success": true,
  "message": "Interview deleted successfully"
}
```

---

## Add Question to Interview

**Endpoint**: `POST /interviews/:id/questions`
**Auth Required**: Yes
**Required Role**: HR, ADMIN

### Request Body

```json
{
  "text": "Describe your experience with TypeScript",
  "category": "TECHNICAL",
  "difficulty": "MEDIUM",
  "order": 1
}
```

### Parameters

- **text** (string, required): Question text
- **category** (enum, required): TECHNICAL, BEHAVIORAL, DOMAIN
- **difficulty** (enum, required): EASY, MEDIUM, HARD
- **order** (number, required): Question order in interview

### Response (201)

```json
{
  "success": true,
  "data": {
    "question": {
      "id": "q_123",
      "interview": "interview_1",
      "text": "Describe your experience with TypeScript",
      "category": "TECHNICAL",
      "difficulty": "MEDIUM",
      "order": 1,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

---

## Get Interview Transcript

**Endpoint**: `GET /interviews/:id/transcript`
**Auth Required**: Yes

### Response (200)

```json
{
  "success": true,
  "data": {
    "transcript": {
      "interview": "interview_1",
      "content": "Interviewer: Tell us about your experience\nCandidate: I have 5 years...",
      "duration": 2400,
      "language": "en",
      "sentiment": "POSITIVE"
    }
  }
}
```

---

# Candidate Endpoints

## Get All Candidates

**Endpoint**: `GET /candidates`
**Auth Required**: Yes
**Query Parameters**:

- `page` (number, optional): Page number
- `limit` (number, optional): Results per page
- `status` (string, optional): ACTIVE, REJECTED, SELECTED

### Response (200)

```json
{
  "success": true,
  "data": {
    "candidates": [
      {
        "id": "candidate_1",
        "user": {
          "id": "user_456",
          "firstName": "Jane",
          "lastName": "Smith",
          "email": "jane@example.com"
        },
        "resumeUrl": "https://cloudinary.com/...",
        "portfolio": "https://jane-portfolio.com",
        "skills": ["JavaScript", "React", "TypeScript"],
        "experience": 5,
        "status": "ACTIVE",
        "interviews": ["interview_1", "interview_2"],
        "createdAt": "2024-01-10T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "totalPages": 5
    }
  }
}
```

---

## Create Candidate

**Endpoint**: `POST /candidates`
**Auth Required**: Yes
**Required Role**: HR, ADMIN

### Request Body

```json
{
  "user": "user_456",
  "portfolio": "https://jane-portfolio.com",
  "skills": ["JavaScript", "React", "TypeScript"],
  "experience": 5
}
```

### Parameters

- **user** (string, required): User ID
- **portfolio** (string, optional): Portfolio URL
- **skills** (array, optional): Array of skill strings
- **experience** (number, optional): Years of experience

### Response (201)

```json
{
  "success": true,
  "data": {
    "candidate": {
      "id": "candidate_1",
      "user": "user_456",
      "portfolio": "https://jane-portfolio.com",
      "skills": ["JavaScript", "React", "TypeScript"],
      "experience": 5,
      "status": "ACTIVE",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

---

## Get Candidate Details

**Endpoint**: `GET /candidates/:id`
**Auth Required**: Yes

### Response (200)

```json
{
  "success": true,
  "data": {
    "candidate": {
      "id": "candidate_1",
      "user": {
        "id": "user_456",
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane@example.com",
        "profilePicture": "https://..."
      },
      "resumeUrl": "https://cloudinary.com/...",
      "portfolio": "https://jane-portfolio.com",
      "skills": ["JavaScript", "React", "TypeScript"],
      "experience": 5,
      "status": "ACTIVE",
      "interviews": [
        {
          "id": "interview_1",
          "title": "Senior Developer",
          "status": "COMPLETED",
          "aiAnalysis": {
            "overallScore": 85
          }
        }
      ],
      "createdAt": "2024-01-10T10:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

---

## Update Candidate

**Endpoint**: `PUT /candidates/:id`
**Auth Required**: Yes
**Required Role**: HR, ADMIN

### Request Body

```json
{
  "portfolio": "https://new-portfolio.com",
  "skills": ["JavaScript", "React", "TypeScript", "Node.js"],
  "experience": 6,
  "status": "SELECTED"
}
```

### Response (200)

```json
{
  "success": true,
  "data": {
    "candidate": {
      "id": "candidate_1",
      "portfolio": "https://new-portfolio.com",
      "skills": ["JavaScript", "React", "TypeScript", "Node.js"],
      "experience": 6,
      "status": "SELECTED",
      "updatedAt": "2024-01-15T11:00:00Z"
    }
  }
}
```

---

## Delete Candidate

**Endpoint**: `DELETE /candidates/:id`
**Auth Required**: Yes
**Required Role**: HR, ADMIN

### Response (200)

```json
{
  "success": true,
  "message": "Candidate deleted successfully"
}
```

---

## Upload Resume

**Endpoint**: `POST /candidates/:id/upload-resume`
**Auth Required**: Yes
**Content-Type**: multipart/form-data

### Request

```
POST /candidates/candidate_1/upload-resume
Content-Type: multipart/form-data

[binary file data]
```

### Parameters

- **file** (file, required): PDF or DOC file, max 5MB

### Response (200)

```json
{
  "success": true,
  "data": {
    "candidate": {
      "id": "candidate_1",
      "resumeUrl": "https://cloudinary.com/secure/.../resume.pdf"
    }
  },
  "message": "Resume uploaded successfully"
}
```

---

# Job Position Endpoints

## Get All Positions

**Endpoint**: `GET /positions`
**Auth Required**: Yes
**Query Parameters**:

- `page` (number, optional): Page number
- `limit` (number, optional): Results per page
- `status` (string, optional): OPEN, CLOSED
- `department` (string, optional): Filter by department

### Response (200)

```json
{
  "success": true,
  "data": {
    "positions": [
      {
        "id": "position_1",
        "title": "Senior Developer",
        "description": "We are looking for...",
        "department": "Engineering",
        "status": "OPEN",
        "applicants": ["candidate_1", "candidate_2"],
        "createdAt": "2024-01-10T10:00:00Z",
        "updatedAt": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "totalPages": 2
    }
  }
}
```

---

## Create Position

**Endpoint**: `POST /positions`
**Auth Required**: Yes
**Required Role**: HR, ADMIN

### Request Body

```json
{
  "title": "Senior Developer",
  "description": "We are looking for an experienced developer...",
  "department": "Engineering",
  "status": "OPEN"
}
```

### Parameters

- **title** (string, required): Position title
- **description** (string, required): Position description
- **department** (string, required): Department name
- **status** (enum, required): OPEN or CLOSED

### Response (201)

```json
{
  "success": true,
  "data": {
    "position": {
      "id": "position_1",
      "title": "Senior Developer",
      "description": "We are looking for...",
      "department": "Engineering",
      "status": "OPEN",
      "applicants": [],
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

---

## Get Position Details

**Endpoint**: `GET /positions/:id`
**Auth Required**: Yes

### Response (200)

```json
{
  "success": true,
  "data": {
    "position": {
      "id": "position_1",
      "title": "Senior Developer",
      "description": "We are looking for...",
      "department": "Engineering",
      "status": "OPEN",
      "applicants": [
        {
          "id": "candidate_1",
          "user": {
            "firstName": "Jane",
            "lastName": "Smith"
          },
          "experience": 5,
          "status": "ACTIVE"
        }
      ],
      "createdAt": "2024-01-10T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  }
}
```

---

## Update Position

**Endpoint**: `PUT /positions/:id`
**Auth Required**: Yes
**Required Role**: HR, ADMIN

### Request Body

```json
{
  "title": "Senior Developer (Updated)",
  "description": "Updated description...",
  "status": "CLOSED"
}
```

### Response (200)

```json
{
  "success": true,
  "data": {
    "position": {
      "id": "position_1",
      "title": "Senior Developer (Updated)",
      "status": "CLOSED",
      "updatedAt": "2024-01-15T11:00:00Z"
    }
  }
}
```

---

## Delete Position

**Endpoint**: `DELETE /positions/:id`
**Auth Required**: Yes
**Required Role**: HR, ADMIN

### Response (200)

```json
{
  "success": true,
  "message": "Position deleted successfully"
}
```

---

## Get Position Applicants

**Endpoint**: `GET /positions/:id/applicants`
**Auth Required**: Yes

### Response (200)

```json
{
  "success": true,
  "data": {
    "applicants": [
      {
        "id": "candidate_1",
        "user": {
          "firstName": "Jane",
          "lastName": "Smith",
          "email": "jane@example.com"
        },
        "experience": 5,
        "skills": ["JavaScript", "React"],
        "resumeUrl": "https://...",
        "status": "ACTIVE",
        "appliedAt": "2024-01-12T10:00:00Z"
      }
    ],
    "totalApplicants": 15
  }
}
```

---

# Error Codes

| Code                | Status | Description                         |
| ------------------- | ------ | ----------------------------------- |
| INVALID_INPUT       | 400    | Invalid request parameters          |
| EMAIL_EXISTS        | 400    | Email already registered            |
| WEAK_PASSWORD       | 400    | Password does not meet requirements |
| UNAUTHORIZED        | 401    | Missing or invalid JWT token        |
| INVALID_CREDENTIALS | 401    | Invalid email or password           |
| FORBIDDEN           | 403    | Insufficient permissions            |
| NOT_FOUND           | 404    | Resource not found                  |
| CONFLICT            | 409    | Resource already exists             |
| RATE_LIMITED        | 429    | Too many requests                   |
| SERVER_ERROR        | 500    | Internal server error               |

---

# Rate Limiting

```
- Authentication: 5 attempts per 15 minutes
- API Calls: 100 per minute per user
- File Upload: 10 per hour per user
- Email: 5 per hour per user
```

---

# API Testing with cURL

### Register User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "StrongPassword123!",
    "firstName": "John",
    "lastName": "Doe",
    "role": "HR"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "StrongPassword123!"
  }'
```

### Get Current User

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Create Interview

```bash
curl -X POST http://localhost:3000/api/interviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "title": "Senior Developer Position",
    "jobPosition": "position_1",
    "candidate": "candidate_1",
    "scheduledAt": "2024-01-20T14:00:00Z"
  }'
```

---

**Status**: Complete & Tested ✅
**Last Updated**: 2024
