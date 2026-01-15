# Intervau.AI - Complete Routing Documentation

## Overview

This document describes the complete URL-based routing structure for the Intervau.AI application. The application uses **React Router v6** with `BrowserRouter` for clean, semantic URLs that display in the browser's address bar.

## Base URL

**Development:** `http://localhost:5173/`  
**Production:** `https://Hassan-Raza0.github.io/`

## Route Structure

### 1. Public/Marketing Routes (No Authentication Required)

These routes are accessible to anyone, including users who are not logged in.

| Route           | URL                | Component            | Purpose                                                            |
| --------------- | ------------------ | -------------------- | ------------------------------------------------------------------ |
| Landing         | `/`                | `Landing.tsx`        | Home page with features, pricing, testimonials, job roles, and FAQ |
| Login           | `/login`           | `Login.tsx`          | User login with role selection (Candidate/HR)                      |
| Register        | `/register`        | `Register.tsx`       | New user registration with role selection                          |
| Forgot Password | `/forgot-password` | `ForgotPassword.tsx` | Password reset flow                                                |
| Pricing         | `/pricing`         | `Pricing.tsx`        | Pricing plans and tiers                                            |
| About           | `/about`           | `About.tsx`          | Company/platform information                                       |
| FAQ             | `/faq`             | `FAQ.tsx`            | Frequently asked questions                                         |
| Contact         | `/contact`         | `Contact.tsx`        | Contact form and information                                       |

---

### 2. Candidate Routes (Role-Based: `role='candidate'`)

These routes are protected and only accessible to users logged in with the candidate role.

#### Dashboard & Core Features

| Route                  | URL                                             | Component                  | Purpose                                                                            |
| ---------------------- | ----------------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------- |
| Candidate Dashboard    | `/candidate/dashboard`                          | `Dashboard.tsx`            | Main dashboard with stats, recent interviews, skills profile, quick actions        |
| Resume Management      | `/candidate/resume`                             | `Resume.tsx`               | Resume upload, AI skill extraction, summary, experience parsing                    |
| Mock Interviews        | `/candidate/mock-interviews`                    | `MockInterview.tsx`        | Interview selection/setup with categories (technical, behavioral, problem-solving) |
| Mock Interview Session | `/candidate/mock-interviews/session/:sessionId` | `MockInterviewSession.tsx` | Active mock interview session with live AI analysis                                |
| Interview History      | `/candidate/interview-history`                  | `InterviewHistory.tsx`     | View all past interviews (mock & live), searchable, filterable                     |
| Interview Report       | `/candidate/interview-report/:reportId`         | `InterviewReport.tsx`      | Detailed interview report with metrics, confidence, clarity, transcript, analysis  |
| Profile Settings       | `/candidate/profile-settings`                   | `ProfileSettings.tsx`      | User profile and account settings                                                  |

**Example URLs:**

- `http://localhost:5173/candidate/dashboard`
- `http://localhost:5173/candidate/mock-interviews/session/abc123`
- `http://localhost:5173/candidate/interview-report/xyz789`

---

### 3. HR Routes (Role-Based: `role='hr'`)

These routes are protected and only accessible to users logged in with the HR role.

#### Dashboard & Core Features

| Route            | URL                                 | Component             | Purpose                                                                                             |
| ---------------- | ----------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------- |
| HR Dashboard     | `/hr/dashboard`                     | `HRDashboard.tsx`     | Main dashboard with metrics (positions, candidates, interviews, offers), schedule, department stats |
| Job Positions    | `/hr/job-positions`                 | `JobPositions.tsx`    | Manage and view open job positions, create new postings, track applicants                           |
| Candidates       | `/hr/candidates`                    | `HRCandidates.tsx`    | Browse all candidates with filtering, search, sort, starred/favorites                               |
| Candidate Review | `/hr/candidate-review/:candidateId` | `CandidateReview.tsx` | Detailed candidate profile with scores, skills, experience, interview history, recommendation       |
| Profile Settings | `/hr/profile-settings`              | `ProfileSettings.tsx` | User profile and account settings                                                                   |

**Example URLs:**

- `http://localhost:5173/hr/dashboard`
- `http://localhost:5173/hr/job-positions`
- `http://localhost:5173/hr/candidate-review/candidate-001`

---

### 4. Shared Routes (Both Roles)

These routes are protected and accessible to both candidates and HR users.

| Route             | URL                             | Component              | Purpose                                                                                                                         |
| ----------------- | ------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Live Interview    | `/live-interview/:sessionId`    | `LiveInterview.tsx`    | Live video interview room with role-specific UI (HR as interviewer, candidate as interviewee), video tiles, metrics, transcript |
| Interview Summary | `/interview-summary/:summaryId` | `InterviewSummary.tsx` | Interview summary view with key metrics and insights                                                                            |

**Example URLs:**

- `http://localhost:5173/live-interview/session-2024-001`
- `http://localhost:5173/interview-summary/summary-2024-001`

---

### 5. Error Routes

| Route     | URL    | Component           | Purpose                             |
| --------- | ------ | ------------------- | ----------------------------------- |
| Not Found | `/404` | `NotFound.tsx`      | 404 error page for invalid routes   |
| Catch-All | `/*`   | Redirects to `/404` | Any unmapped route redirects to 404 |

---

## Route Helpers & Navigation

The `router/index.tsx` file exports helper functions for convenient route generation with parameters:

```typescript
import { routeHelpers } from "./router";

// Generate routes with parameters
routeHelpers.candidateReport("report-123"); // '/candidate/interview-report/report-123'
routeHelpers.mockInterviewSession("session-456"); // '/candidate/mock-interviews/session/session-456'
routeHelpers.liveInterview("session-789"); // '/live-interview/session-789'
routeHelpers.interviewSummary("summary-101"); // '/interview-summary/summary-101'
routeHelpers.candidateReview("candidate-202"); // '/hr/candidate-review/candidate-202'
```

## Navigation Methods

### Using `useNavigate` Hook (Recommended)

```typescript
import { useNavigate } from "react-router-dom";
import { ROUTES } from "./router";

export function MyComponent() {
  const navigate = useNavigate();

  return <button onClick={() => navigate(ROUTES.LOGIN)}>Go to Login</button>;
}
```

### Using `routeHelpers` for Dynamic Routes

```typescript
import { routeHelpers } from "./router";
import { useNavigate } from "react-router-dom";

export function CandidateCard({ reportId }) {
  const navigate = useNavigate();

  return (
    <button onClick={() => navigate(routeHelpers.candidateReport(reportId))}>
      View Report
    </button>
  );
}
```

## Route Protection & Access Control

All protected routes use the `<ProtectedRoute>` component which:

1. **Checks Authentication:** Redirects to `/login` if user is not authenticated
2. **Checks Role:** Verifies user has required role for the route
3. **Enforces Redirects:** Redirects unauthorized users to their default dashboard:
   - Candidates → `/candidate/dashboard`
   - HR → `/hr/dashboard`

### Protected Route Example

```typescript
<Route
  path={ROUTES.CANDIDATE_DASHBOARD}
  element={
    <ProtectedRoute roles={["candidate"]}>
      <AuthenticatedLayout>
        <Dashboard />
      </AuthenticatedLayout>
    </ProtectedRoute>
  }
/>
```

## Default Routes

When users log in, they are automatically redirected to their role-appropriate dashboard:

- **Candidate:** `/candidate/dashboard`
- **HR:** `/hr/dashboard`

When users log out, they are redirected to: `/` (Landing Page)

## Layout Wrappers

The application uses two main layout wrappers:

### PublicLayout

- Used for public/marketing pages (Landing, Login, Register, etc.)
- Includes simple Navbar with login/register buttons
- No sidebar

### AuthenticatedLayout

- Used for protected routes (Candidate/HR specific pages)
- Includes full Navbar with role-based navigation
- Includes Sidebar with role-appropriate menu items
- Displays page title and breadcrumbs

## File Structure

```
src/
├── router/
│   └── index.tsx              # Route definitions, helpers, and ProtectedRoute component
├── pages/
│   ├── Landing.tsx            # Landing page
│   ├── Login.tsx              # Login page
│   ├── Register.tsx           # Register page
│   ├── ForgotPassword.tsx     # Password reset
│   ├── Dashboard.tsx          # Candidate dashboard
│   ├── Resume.tsx             # Resume upload
│   ├── MockInterview.tsx      # Mock interview selection
│   ├── MockInterviewSession.tsx # Active mock session
│   ├── InterviewHistory.tsx   # Interview history
│   ├── InterviewReport.tsx    # Interview report
│   ├── HRDashboard.tsx        # HR dashboard
│   ├── JobPositions.tsx       # Job positions management
│   ├── HRCandidates.tsx       # Candidates list
│   ├── CandidateReview.tsx    # Candidate details
│   ├── LiveInterview.tsx      # Live interview room
│   ├── InterviewSummary.tsx   # Interview summary
│   ├── ProfileSettings.tsx    # Profile settings
│   ├── Pricing.tsx            # Pricing page
│   ├── About.tsx              # About page
│   ├── FAQ.tsx                # FAQ page
│   ├── Contact.tsx            # Contact page
│   └── NotFound.tsx           # 404 page
├── components/
│   ├── Navbar.tsx             # Main navbar
│   ├── LandingNavbar.tsx       # Landing page navbar
│   └── layout/
│       └── AppLayout.tsx       # Authenticated layout wrapper
└── App.tsx                    # Main app with Router and route definitions
```

## Authentication Flow

1. User visits `/` → sees Landing page
2. User clicks "Login" → navigates to `/login`
3. User selects role and enters credentials
4. Upon successful login:
   - Candidate: Redirects to `/candidate/dashboard`
   - HR: Redirects to `/hr/dashboard`
5. User can navigate using:
   - Navbar links
   - Sidebar menu (authenticated pages)
   - Direct URL entry (if authenticated)
6. User logout → redirects to `/` (Landing page)

## Browser Address Bar Examples

### Candidate Journey

```
1. Landing page:              http://localhost:5173/
2. Login page:                http://localhost:5173/login
3. After login:               http://localhost:5173/candidate/dashboard
4. View mock interviews:      http://localhost:5173/candidate/mock-interviews
5. Start interview:           http://localhost:5173/candidate/mock-interviews/session/abc123
6. View report:               http://localhost:5173/candidate/interview-report/xyz789
7. Upload resume:             http://localhost:5173/candidate/resume
8. Settings:                  http://localhost:5173/candidate/profile-settings
```

### HR Journey

```
1. Landing page:              http://localhost:5173/
2. Login page:                http://localhost:5173/login
3. After login:               http://localhost:5173/hr/dashboard
4. View candidates:           http://localhost:5173/hr/candidates
5. Review candidate:          http://localhost:5173/hr/candidate-review/candidate-001
6. Manage positions:          http://localhost:5173/hr/job-positions
7. Settings:                  http://localhost:5173/hr/profile-settings
```

## Route Constants

All routes are defined in `src/router/index.tsx` as constants:

```typescript
export const ROUTES = {
  // Public
  LANDING: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  PRICING: "/pricing",
  ABOUT: "/about",
  FAQ: "/faq",
  CONTACT: "/contact",

  // Candidate
  CANDIDATE_DASHBOARD: "/candidate/dashboard",
  RESUME: "/candidate/resume",
  MOCK_INTERVIEW: "/candidate/mock-interviews",
  MOCK_INTERVIEW_SESSION: "/candidate/mock-interviews/session/:sessionId",
  INTERVIEW_HISTORY: "/candidate/interview-history",
  INTERVIEW_REPORT: "/candidate/interview-report/:reportId",
  CANDIDATE_PROFILE_SETTINGS: "/candidate/profile-settings",

  // HR
  HR_DASHBOARD: "/hr/dashboard",
  JOB_POSITIONS: "/hr/job-positions",
  HR_CANDIDATES: "/hr/candidates",
  CANDIDATE_REVIEW: "/hr/candidate-review/:candidateId",
  HR_PROFILE_SETTINGS: "/hr/profile-settings",

  // Shared
  LIVE_INTERVIEW: "/live-interview/:sessionId",
  INTERVIEW_SUMMARY: "/interview-summary/:summaryId",

  // Error
  NOT_FOUND: "/404",
};
```

## Testing Routes

To test the routing:

1. **Start the dev server:**

   ```bash
   npm run dev
   ```

2. **Visit the application:**

   - Public pages: http://localhost:5173/
   - Login: http://localhost:5173/login

3. **Test candidate flow:**

   - Login with a candidate account
   - Navigate through dashboard, resume, mock interviews
   - Verify URLs match the route structure

4. **Test HR flow:**

   - Login with an HR account
   - Navigate through dashboard, candidates, positions
   - Verify URLs match the route structure

5. **Test access control:**
   - Try accessing `/candidate/dashboard` as an HR user → should redirect to `/hr/dashboard`
   - Try accessing a protected route without logging in → should redirect to `/login`

## Future Enhancements

- Add breadcrumb navigation
- Implement nested routing for multi-step flows
- Add route animations/transitions
- Add 404 page with suggested links
- Implement route-based code splitting
- Add analytics tracking for route changes
