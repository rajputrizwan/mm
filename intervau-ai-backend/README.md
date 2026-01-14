# Intervau.AI Backend

Backend API for **Intervau.AI** - AI-powered interview platform for smart candidate assessment.

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Installation

```bash
# Navigate to backend directory
cd intervau-ai-backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Start development server
npm run dev
```

### Build & Deploy

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

---

## 📁 Project Structure

```
src/
├── config/
│   ├── environment.ts    # Environment configuration
│   └── database.ts       # Database connection utilities
├── controllers/
│   ├── AuthController.ts
│   ├── InterviewController.ts
│   ├── CandidateController.ts
│   └── PositionController.ts
├── middleware/
│   └── auth.ts           # JWT and role-based authentication
├── models/
│   ├── User.ts
│   ├── Interview.ts
│   ├── Question.ts
│   ├── Answer.ts
│   ├── Candidate.ts
│   └── JobPosition.ts
├── routes/
│   ├── auth.ts
│   ├── interviews.ts
│   ├── candidates.ts
│   └── positions.ts
├── utils/
│   ├── errors.ts         # Error handling
│   └── validators.ts     # Request validation
└── index.ts              # Server entry point
```

---

## 🔌 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint    | Description       | Auth |
| ------ | ----------- | ----------------- | ---- |
| POST   | `/register` | Register new user | No   |
| POST   | `/login`    | Login user        | No   |
| GET    | `/me`       | Get current user  | Yes  |
| POST   | `/logout`   | Logout user       | Yes  |

### Interviews (`/api/interviews`)

| Method | Endpoint        | Description         | Auth | Role |
| ------ | --------------- | ------------------- | ---- | ---- |
| POST   | `/`             | Create interview    | Yes  | HR   |
| GET    | `/`             | Get all interviews  | Yes  | -    |
| GET    | `/:id`          | Get interview by ID | Yes  | -    |
| PUT    | `/:id`          | Update interview    | Yes  | HR   |
| DELETE | `/:id`          | Delete interview    | Yes  | HR   |
| POST   | `/:id/start`    | Start interview     | Yes  | HR   |
| POST   | `/:id/feedback` | Submit feedback     | Yes  | HR   |

### Candidates (`/api/candidates`)

| Method | Endpoint      | Description         | Auth |
| ------ | ------------- | ------------------- | ---- |
| POST   | `/`           | Create candidate    | Yes  |
| GET    | `/`           | Get all candidates  | Yes  |
| GET    | `/:id`        | Get candidate by ID | Yes  |
| PUT    | `/:id`        | Update candidate    | Yes  |
| DELETE | `/:id`        | Delete candidate    | Yes  |
| PUT    | `/:id/resume` | Upload resume       | Yes  |

### Positions (`/api/positions`)

| Method | Endpoint         | Description        | Auth | Role |
| ------ | ---------------- | ------------------ | ---- | ---- |
| POST   | `/`              | Create position    | Yes  | HR   |
| GET    | `/`              | Get all positions  | Yes  | -    |
| GET    | `/:id`           | Get position by ID | Yes  | -    |
| PUT    | `/:id`           | Update position    | Yes  | HR   |
| DELETE | `/:id`           | Delete position    | Yes  | HR   |
| POST   | `/:id/applicant` | Add applicant      | Yes  | -    |

---

## 🔐 Authentication

### Bearer Token Format

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### User Roles

- `candidate` - Interview candidate
- `hr` - HR personnel (can create positions, conduct interviews)
- `admin` - System administrator

### Token Configuration

- **Access Token**: Valid for 15 minutes
- **Refresh Token**: Valid for 7 days

---

## 📊 Database Models

### User

```typescript
{
  email: string (unique)
  password: string (hashed)
  name: string
  role: 'candidate' | 'hr' | 'admin'
  avatar?: string
  phone?: string
  bio?: string
  isEmailVerified: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}
```

### Interview

```typescript
{
  candidateId: ObjectId (ref: User)
  hrId: ObjectId (ref: User)
  jobPositionId: ObjectId (ref: JobPosition)
  type: 'mock' | 'live'
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  questions: ObjectId[]
  answers: ObjectId[]
  score?: number
  feedback?: string
  transcript?: string
  recordingUrl?: string
  createdAt: Date
  updatedAt: Date
}
```

### Question

```typescript
{
  interviewId: ObjectId (ref: Interview)
  text: string
  type: 'technical' | 'behavioral' | 'situational' | 'coding'
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  expectedAnswer: string
  order: number
  createdAt: Date
  updatedAt: Date
}
```

### Answer

```typescript
{
  questionId: ObjectId (ref: Question)
  interviewId: ObjectId (ref: Interview)
  candidateId: ObjectId (ref: User)
  text: string
  audioUrl?: string
  videoUrl?: string
  duration: number
  score?: number
  feedback?: string
  aiAnalysis: {
    sentiment: string
    confidence: number
    keywords: string[]
    summary: string
  }
  createdAt: Date
  updatedAt: Date
}
```

### Candidate

```typescript
{
  userId: ObjectId (ref: User)
  resume?: { url: string, uploadedAt: Date }
  skills: string[]
  experience: string
  education: string
  bio?: string
  interviewCount: number
  averageScore?: number
  status: 'active' | 'rejected' | 'accepted' | 'pending'
  createdAt: Date
  updatedAt: Date
}
```

### JobPosition

```typescript
{
  hrId: ObjectId (ref: User)
  title: string
  description: string
  department: string
  requiredSkills: string[]
  experience: string
  salary?: string
  location: string
  applicants: ObjectId[]
  interviews: ObjectId[]
  status: 'open' | 'closed' | 'filled'
  createdAt: Date
  updatedAt: Date
}
```

---

## 🛠️ Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/?appName=app

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key

# Frontend URLs (CORS)
FRONTEND_URL=http://localhost:5173
FRONTEND_PROD_URL=https://yourdomain.com

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_email_password

# OpenAI (Optional)
OPENAI_API_KEY=sk-your_api_key

# Cloudinary (Optional)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Redis (Optional)
REDIS_URL=redis://localhost:6379
```

---

## 📝 Example Requests

### Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "candidate@example.com",
    "password": "password123",
    "name": "John Doe",
    "role": "candidate"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "candidate@example.com",
    "password": "password123"
  }'
```

### Get Current User

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Interview

```bash
curl -X POST http://localhost:5000/api/interviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "candidateId": "user_id",
    "jobPositionId": "position_id",
    "type": "mock"
  }'
```

---

## 🧪 Testing

### Using Postman

1. Import the environment variables
2. Set `{{token}}` in pre-request script after login
3. Use token in Authorization header

### Using cURL

```bash
# Get all candidates
curl -X GET http://localhost:5000/api/candidates \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🚨 Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": []
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT Authentication](https://jwt.io/)

---

## 🤝 Support

For issues or questions:

1. Check the logs in console
2. Verify MongoDB connection
3. Ensure all environment variables are set
4. Check network connectivity

---

**Built with Node.js, Express.js, and MongoDB** 🚀
