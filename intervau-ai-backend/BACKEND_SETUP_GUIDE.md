# Intervau.AI Backend Setup - Complete Guide

## Current Status

### ✅ Completed

- Backend folder structure created (`intervau-ai-backend/`)
- `.env` file with all configuration variables
- `package.json` with all dependencies
- Configuration module (`src/config/environment.ts`)
- Database models:
  - User model (`src/models/User.ts`)
  - Interview model (`src/models/Interview.ts`)
  - Question model (`src/models/Question.ts`)
  - Answer model (`src/models/Answer.ts`)
- Middleware:
  - Auth middleware (`src/middleware/auth.ts`)
- Utilities:
  - Error handling (`src/utils/errors.ts`)
- Main server file (`src/index.ts`)
- Auth controller (`src/controllers/AuthController.ts`)

### 🔄 Remaining Tasks

1. Create remaining controllers (Interview, Candidate, Position)
2. Create routes for all endpoints
3. Create services for business logic
4. Add validation middleware
5. Set up database connection utility
6. Create TypeScript configuration
7. Add API documentation
8. Setup testing framework
9. Create deployment guide

---

## Step-by-Step Setup Instructions

### Prerequisites

- Node.js 16+ installed
- MongoDB Atlas account or local MongoDB
- npm or yarn

### 1. Install Dependencies

```bash
cd intervau-ai-backend
npm install
```

### 2. Update TypeScript Configuration

Create `tsconfig.json` in `intervau-ai-backend/` root:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 3. Create Interview Controller

Create `src/controllers/InterviewController.ts`:

```typescript
import { Request, Response } from "express";
import { Interview } from "../models/Interview";

export class InterviewController {
  static async create(req: Request, res: Response) {
    try {
      const { candidateId, jobPositionId, type } = req.body;

      const interview = new Interview({
        candidateId,
        jobPositionId,
        type,
        hrId: (req as any).user?.id,
        status: "scheduled",
        scheduledAt: new Date(),
      });

      await interview.save();

      res.status(201).json({
        success: true,
        data: interview,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to create interview",
      });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const interviews = await Interview.find()
        .populate("candidateId", "name email")
        .populate("jobPositionId", "title");

      res.status(200).json({
        success: true,
        data: interviews,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch interviews",
      });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const interview = await Interview.findById(id)
        .populate("candidateId")
        .populate("questions")
        .populate("answers");

      if (!interview) {
        return res.status(404).json({
          success: false,
          message: "Interview not found",
        });
      }

      res.status(200).json({
        success: true,
        data: interview,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch interview",
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const interview = await Interview.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      res.status(200).json({
        success: true,
        data: interview,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update interview",
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await Interview.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: "Interview deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete interview",
      });
    }
  }

  static async submitFeedback(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { feedback, score } = req.body;

      const interview = await Interview.findByIdAndUpdate(
        id,
        {
          feedback,
          score,
          status: "completed",
          endedAt: new Date(),
        },
        { new: true }
      );

      res.status(200).json({
        success: true,
        data: interview,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to submit feedback",
      });
    }
  }
}
```

### 4. Create Routes

Create `src/routes/auth.ts`:

```typescript
import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/me", authMiddleware, AuthController.getCurrentUser);
router.post("/logout", authMiddleware, AuthController.logout);

export default router;
```

Create `src/routes/interviews.ts`:

```typescript
import { Router } from "express";
import { InterviewController } from "../controllers/InterviewController";
import { authMiddleware, roleMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.post("/", roleMiddleware("hr"), InterviewController.create);
router.get("/", InterviewController.getAll);
router.get("/:id", InterviewController.getById);
router.put("/:id", InterviewController.update);
router.delete("/:id", roleMiddleware("hr"), InterviewController.delete);
router.post(
  "/:id/feedback",
  roleMiddleware("hr"),
  InterviewController.submitFeedback
);

export default router;
```

### 5. Update Main Server File

Update `src/index.ts` to include routes:

```typescript
import authRoutes from "./routes/auth";
import interviewRoutes from "./routes/interviews";

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/interviews", interviewRoutes);
```

### 6. Create Database Connection Utility

Create `src/config/database.ts`:

```typescript
import mongoose from "mongoose";
import { config } from "./environment";

export const connectDatabase = async () => {
  try {
    await mongoose.connect(config.mongodbUri, {
      dbName: config.dbName,
      retryWrites: true,
      w: "majority",
    });
    console.log("✓ MongoDB connected");
  } catch (error) {
    console.error("✗ MongoDB connection failed:", error);
    throw error;
  }
};

export const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    console.log("✓ MongoDB disconnected");
  } catch (error) {
    console.error("✗ MongoDB disconnection failed:", error);
    throw error;
  }
};
```

### 7. Create Validation Utilities

Create `src/utils/validators.ts`:

```typescript
import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

export const registerValidation = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("name").notEmpty().withMessage("Name is required"),
  body("role").isIn(["candidate", "hr"]).withMessage("Invalid role"),
];

export const loginValidation = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const createInterviewValidation = [
  body("candidateId").isMongoId().withMessage("Invalid candidate ID"),
  body("type").isIn(["mock", "live"]).withMessage("Invalid interview type"),
];
```

### 8. Create Models for Candidate and Position

Create `src/models/Candidate.ts`:

```typescript
import mongoose, { Schema, Document } from "mongoose";

export interface ICandidate extends Document {
  userId: mongoose.Types.ObjectId;
  resume?: {
    url: string;
    uploadedAt: Date;
  };
  skills: string[];
  experience: string;
  education: string;
  bio?: string;
  interviewCount: number;
  averageScore?: number;
  status: "active" | "rejected" | "accepted" | "pending";
  createdAt: Date;
  updatedAt: Date;
}

const candidateSchema = new Schema<ICandidate>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resume: {
      url: String,
      uploadedAt: Date,
    },
    skills: [String],
    experience: String,
    education: String,
    bio: String,
    interviewCount: {
      type: Number,
      default: 0,
    },
    averageScore: Number,
    status: {
      type: String,
      enum: ["active", "rejected", "accepted", "pending"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

export const Candidate = mongoose.model<ICandidate>(
  "Candidate",
  candidateSchema
);
```

Create `src/models/JobPosition.ts`:

```typescript
import mongoose, { Schema, Document } from "mongoose";

export interface IJobPosition extends Document {
  hrId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  department: string;
  requiredSkills: string[];
  experience: string;
  salary?: string;
  location: string;
  applicants: mongoose.Types.ObjectId[];
  interviews: mongoose.Types.ObjectId[];
  status: "open" | "closed" | "filled";
  createdAt: Date;
  updatedAt: Date;
}

const jobPositionSchema = new Schema<IJobPosition>(
  {
    hrId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    department: String,
    requiredSkills: [String],
    experience: String,
    salary: String,
    location: String,
    applicants: [
      {
        type: Schema.Types.ObjectId,
        ref: "Candidate",
      },
    ],
    interviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Interview",
      },
    ],
    status: {
      type: String,
      enum: ["open", "closed", "filled"],
      default: "open",
    },
  },
  {
    timestamps: true,
  }
);

export const JobPosition = mongoose.model<IJobPosition>(
  "JobPosition",
  jobPositionSchema
);
```

### 9. Create Controllers for Candidates and Positions

Create `src/controllers/CandidateController.ts`:

```typescript
import { Request, Response } from "express";
import { Candidate } from "../models/Candidate";

export class CandidateController {
  static async getAll(req: Request, res: Response) {
    try {
      const candidates = await Candidate.find().populate(
        "userId",
        "name email"
      );
      res.status(200).json({
        success: true,
        data: candidates,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch candidates",
      });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const candidate = await Candidate.findById(id).populate("userId");

      if (!candidate) {
        return res.status(404).json({
          success: false,
          message: "Candidate not found",
        });
      }

      res.status(200).json({
        success: true,
        data: candidate,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch candidate",
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const candidate = await Candidate.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      res.status(200).json({
        success: true,
        data: candidate,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update candidate",
      });
    }
  }
}
```

Create `src/controllers/PositionController.ts`:

```typescript
import { Request, Response } from "express";
import { JobPosition } from "../models/JobPosition";

export class PositionController {
  static async create(req: Request, res: Response) {
    try {
      const position = new JobPosition({
        ...req.body,
        hrId: (req as any).user?.id,
      });

      await position.save();

      res.status(201).json({
        success: true,
        data: position,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to create position",
      });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const positions = await JobPosition.find()
        .populate("hrId", "name email")
        .populate("applicants")
        .populate("interviews");

      res.status(200).json({
        success: true,
        data: positions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch positions",
      });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const position = await JobPosition.findById(id)
        .populate("hrId")
        .populate("applicants")
        .populate("interviews");

      if (!position) {
        return res.status(404).json({
          success: false,
          message: "Position not found",
        });
      }

      res.status(200).json({
        success: true,
        data: position,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch position",
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const position = await JobPosition.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      res.status(200).json({
        success: true,
        data: position,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update position",
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await JobPosition.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: "Position deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete position",
      });
    }
  }
}
```

### 10. Create Route Files for New Controllers

Create `src/routes/candidates.ts`:

```typescript
import { Router } from "express";
import { CandidateController } from "../controllers/CandidateController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.get("/", CandidateController.getAll);
router.get("/:id", CandidateController.getById);
router.put("/:id", CandidateController.update);

export default router;
```

Create `src/routes/positions.ts`:

```typescript
import { Router } from "express";
import { PositionController } from "../controllers/PositionController";
import { authMiddleware, roleMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.post("/", roleMiddleware("hr"), PositionController.create);
router.get("/", PositionController.getAll);
router.get("/:id", PositionController.getById);
router.put("/:id", roleMiddleware("hr"), PositionController.update);
router.delete("/:id", roleMiddleware("hr"), PositionController.delete);

export default router;
```

### 11. Update Main Server with All Routes

Update `src/index.ts`:

```typescript
import authRoutes from "./routes/auth";
import interviewRoutes from "./routes/interviews";
import candidateRoutes from "./routes/candidates";
import positionRoutes from "./routes/positions";

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/positions", positionRoutes);
```

### 12. Build and Test

```bash
# Build TypeScript
npm run build

# Start development server
npm run dev

# Start production server
npm start
```

### 13. Test API Endpoints

Use Postman or curl to test:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "role": "candidate"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Get current user (use token from login)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get all candidates
curl -X GET http://localhost:5000/api/candidates \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Additional Files to Create

### .gitignore

```
node_modules/
dist/
.env
.env.local
.DS_Store
*.log
uploads/
```

### .env.example

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/?appName=app
# ... rest of env variables
```

### README.md

```markdown
# Intervau.AI Backend

Backend API for Intervau.AI - AI-powered interview platform.

## Setup

1. Install dependencies: `npm install`
2. Create `.env` file from `.env.example`
3. Build: `npm run build`
4. Start: `npm start` or `npm run dev`

## API Endpoints

- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user
- POST `/api/interviews` - Create interview
- GET `/api/interviews` - Get all interviews
- GET `/api/candidates` - Get all candidates
- POST `/api/positions` - Create job position

## Documentation

See BACKEND_SETUP_GUIDE.md for complete API documentation.
```

---

## Frontend Integration

### Update Frontend .env

```
VITE_API_URL=http://localhost:5000
```

### Test Connection

The frontend `api.ts` is already set up to work with this backend. Just ensure the `VITE_API_URL` is correctly configured.

---

## Next Steps After Backend Setup

1. **Add Email Service** - Use Nodemailer for email notifications
2. **Add File Upload** - Use Cloudinary for resume/media storage
3. **Add Real-time Features** - Implement WebSocket for live interviews
4. **Add OpenAI Integration** - For AI analysis and feedback
5. **Add Testing** - Jest for unit and integration tests
6. **Add API Documentation** - Swagger/OpenAPI
7. **Deploy** - Deploy to Heroku, Railway, or AWS

---

## Common Issues & Solutions

### MongoDB Connection Error

- Verify MONGODB_URI in .env
- Check network access in MongoDB Atlas
- Ensure IP whitelist includes your machine

### Port Already in Use

- Change PORT in .env
- Or kill process: `lsof -ti:5000 | xargs kill -9`

### CORS Errors

- Ensure FRONTEND_URL matches frontend URL
- Check CORS middleware configuration

### JWT Token Errors

- Verify JWT_SECRET is set
- Check token format (Bearer TOKEN)
- Verify token hasn't expired

---

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [JWT Auth](https://jwt.io/)

---

## Support

For issues, check:

1. Console logs for error messages
2. MongoDB Atlas for connection status
3. Network tab in browser for API calls
4. Environment variables in .env

---

**Good luck with your backend setup! You have all the pieces ready.** 🚀
