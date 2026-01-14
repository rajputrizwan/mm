# Quick Reference Guide

## Import Cheat Sheet

### Hooks

```typescript
import { useApi, useForm, useFetch, usePagination } from "@/hooks";
import { useAuthOperations } from "@/hooks/useAuthOperations";
```

### API Service

```typescript
import * as api from "@/services/api";

// Usage
await api.login(email, password);
await api.getCurrentUser();
await api.getCandidates();
```

### Utilities

```typescript
import {
  formatDate,
  formatDuration,
  capitalize,
  isEmpty,
} from "@/utils/helpers";
import {
  validateEmail,
  validateLoginForm,
  getFieldError,
} from "@/utils/validation";
```

### Constants

```typescript
import {
  INTERVIEW_STATUS,
  USER_ROLES,
  ROUTES_PATH,
  VALIDATION_MESSAGES,
} from "@/constants";
```

### Types

```typescript
import { User, Interview, Candidate, AuthResponse } from "@/types";
```

### Components

```typescript
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingState from "@/components/LoadingState";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
```

---

## Common Patterns

### 1. Login Form

```typescript
const { login, loading, error } = useAuthOperations();
const form = useForm(
  { email: "", password: "" },
  { onSubmit: (v) => login(v.email, v.password) }
);
```

### 2. Data Fetch

```typescript
const { data, loading, error, refetch } = useFetch(
  () => api.getInterviews(),
  []
);
```

### 3. Paginated List

```typescript
const { data, page, nextPage, prevPage } = usePagination((p, size) =>
  api.getCandidates({ page: p, pageSize: size })
);
```

### 4. Form with Validation

```typescript
const form = useForm(initialValues, {
  onSubmit: async (values) => {
    const validation = validateLoginForm(values);
    if (!validation.isValid) throw new Error("Invalid");
    await api.login(values.email, values.password);
  },
});
```

### 5. Error Handling

```typescript
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### 6. Loading State

```typescript
<LoadingState isLoading={loading}>
  <DataComponent data={data} />
</LoadingState>
```

---

## API Methods Quick Reference

```typescript
// Auth
api.login(email, password)
api.register(email, password, name, role)
api.logout()
api.getCurrentUser()
api.refreshToken()

// Token
api.getAuthToken()
api.setAuthToken(token)
api.removeAuthToken()

// Candidates
api.getCandidates(filter?)
api.getCandidate(id)

// Interviews
api.getInterviews(filter?)
api.getInterview(id)
api.createInterview(data)
api.updateInterview(id, data)
api.submitInterviewFeedback(id, feedback)

// Positions
api.getPositions(filter?)
api.getPosition(id)
api.createPosition(data)
api.updatePosition(id, data)
api.deletePosition(id)

// Resume
api.uploadResume(file)
api.getResumeAnalysis(resumeId)
```

---

## Validation Quick Reference

```typescript
// Basic
validateEmail(email);
validatePassword(password);
validateName(name);
validateRequired(value);

// Forms
validateLoginForm({ email, password });
validateRegisterForm({
  email,
  password,
  confirmPassword,
  name,
  role,
  agreeToTerms,
});
validateProfileForm({ name, email, phone });

// Get error
getFieldError(errors, "email");
```

---

## Formatting Quick Reference

```typescript
formatDate(new Date()); // 12/25/2024
formatTime(new Date()); // 10:30 AM
formatDuration(3661); // 1:01:01
formatPercentage(85.5); // 85.5%
formatFileSize(1048576); // 1 MB
formatRole("candidate"); // Candidate
capitalize("hello"); // Hello
getInitials("John Doe"); // JD
truncateText("Long text...", 10); // Long tex...
```

---

## Constants Quick Reference

```typescript
// Interview
INTERVIEW_TYPES.MOCK;
INTERVIEW_STATUS.COMPLETED;
DIFFICULTY_LEVELS.HARD;

// Users
USER_ROLES.CANDIDATE;
USER_ROLES.HR;

// Routes
ROUTES_PATH.LOGIN;
ROUTES_PATH.CANDIDATE_DASHBOARD;
ROUTES_PATH.HR_DASHBOARD;

// Storage
STORAGE_KEYS.AUTH_TOKEN;
STORAGE_KEYS.USER_DATA;

// Messages
VALIDATION_MESSAGES.REQUIRED;
API_ERRORS.UNAUTHORIZED;
```

---

## Hook Returns Quick Reference

### useApi

```typescript
const { data, loading, error, execute, reset } = useApi(apiCall);
```

### useForm

```typescript
const {
  values,
  errors,
  touched,
  loading,
  setFieldValue,
  handleSubmit,
  resetForm,
} = useForm(initialValues, { onSubmit: handler });
```

### useFetch

```typescript
const { data, loading, error, refetch } = useFetch(apiCall, dependencies);
```

### usePagination

```typescript
const { data, page, total, goToPage, nextPage, prevPage, loading, error } =
  usePagination(apiCall, { pageSize: 10 });
```

### useAuthOperations

```typescript
const {
  login,
  register,
  logout,
  resetPassword,
  updateProfile,
  error,
  loading,
  isAuthenticated,
  user,
  role,
} = useAuthOperations();
```

---

## Component Props Quick Reference

### ErrorBoundary

```typescript
<ErrorBoundary
  fallback={<CustomError />}
  onError={(error) => console.log(error)}
>
  <YourComponent />
</ErrorBoundary>
```

### LoadingState

```typescript
<LoadingState isLoading={loading} loadingComponent={<CustomSpinner />}>
  <YourComponent />
</LoadingState>
```

---

## Environment Setup

```bash
# Development
VITE_API_URL=http://localhost:3000

# Production
VITE_API_URL=https://api.yourdomain.com

# Testing (uses mock data)
# No VITE_API_URL needed
```

---

## File Organization

```
components/          ← UI Components
├── common/          ← Reusable UI
├── interview/       ← Interview features
├── layout/          ← Layout wrappers
├── ErrorBoundary    ← Error handling
└── LoadingState     ← Loading spinner

pages/               ← Page components
contexts/            ← Global state (AuthContext)
services/            ← API client
hooks/               ← Custom hooks
utils/               ← Helpers & validators
constants/           ← App constants
types/               ← TypeScript types
router/              ← Routing config
```

---

## Type Definitions for Common Scenarios

```typescript
// User login
const user: User = {
  id: '123',
  name: 'John',
  email: 'john@test.com',
  role: 'candidate',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01'
};

// Interview
const interview: Interview = {
  id: '123',
  candidateId: '456',
  hrId: '789',
  jobPositionId: 'pos1',
  type: 'mock',
  status: 'completed',
  scheduledAt: '2024-01-01',
  duration: 3600,
  score: 85,
  questions: [],
  answers: [],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01'
};

// Form values
const loginValues: LoginFormValues = {
  email: 'user@test.com',
  password: 'SecurePass123'
};

// API response
const response: AuthResponse = {
  user: { ... },
  token: 'jwt_token_here'
};
```

---

## Common Errors & Solutions

### Error: API_BASE_URL not set

**Solution**: Set `VITE_API_URL` in `.env.local`

### Error: Token not found

**Solution**: Use `api.getAuthToken()` to check, or user not logged in

### Error: 401 Unauthorized

**Solution**: Token expired, user will be auto-logged out and redirected to login

### Error: Validation failed

**Solution**: Check form validation before submit, use `validateLoginForm()` etc.

### Error: Network error

**Solution**: Check API_BASE_URL, ensure backend is running

---

## Best Practices

1. **Always wrap pages with ErrorBoundary**
2. **Use LoadingState for async operations**
3. **Validate forms before submission**
4. **Use constants instead of magic strings**
5. **Use helpers for formatting**
6. **Import types for type safety**
7. **Handle loading and error states**
8. **Use useAuthOperations for auth**
9. **Use useFetch for initial data load**
10. **Use useApi for manual triggers**

---

## Debugging

```typescript
// Check current user
const { user } = useAuth();
console.log(user);

// Check token
console.log(api.getAuthToken());

// Check form state
console.log(form.values, form.errors, form.touched);

// Check API response
try {
  const data = await api.getCandidates();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

---

## Resources

- [INFRASTRUCTURE_GUIDE.md](./INFRASTRUCTURE_GUIDE.md) - Full documentation
- [INTEGRATION_EXAMPLES.md](./INTEGRATION_EXAMPLES.md) - Code examples
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Project summary
- [INFRASTRUCTURE_INVENTORY.md](./INFRASTRUCTURE_INVENTORY.md) - Complete inventory

---

## Quick Links

| Resource                           | Purpose           |
| ---------------------------------- | ----------------- |
| `src/services/api.ts`              | API client        |
| `src/hooks/`                       | Custom hooks      |
| `src/utils/helpers.ts`             | Utility functions |
| `src/utils/validation.ts`          | Form validators   |
| `src/components/ErrorBoundary.tsx` | Error handling    |
| `src/components/LoadingState.tsx`  | Loading states    |
| `src/constants/index.ts`           | App constants     |
| `src/types/models.ts`              | Type definitions  |

---

**Save this guide for quick reference!** 📚
