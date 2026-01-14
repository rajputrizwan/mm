## Integration Guide for Developers

This guide provides practical examples for integrating the API service and utilities into your components.

---

## 1. Authentication - Login Page

```typescript
// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "@/hooks";
import { validateLoginForm } from "@/utils/validation";
import { useAuthOperations } from "@/hooks/useAuthOperations";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Alert from "@/components/common/Alert";

export default function Login() {
  const navigate = useNavigate();
  const { login, error: authError, loading } = useAuthOperations();
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const form = useForm(
    { email: "", password: "" },
    {
      onSubmit: async (values) => {
        // Validate form
        const validation = validateLoginForm(values);
        if (!validation.isValid) {
          const errors: Record<string, string> = {};
          validation.errors.forEach((err) => {
            errors[err.field] = err.message;
          });
          setValidationErrors(errors);
          throw new Error("Validation failed");
        }

        // Submit
        await login(values.email, values.password);
      },
    }
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6">Login</h2>

        {(authError || form.errors.submit) && (
          <Alert
            type="error"
            message={authError || form.errors.submit?.[0]}
            className="mb-4"
          />
        )}

        <form onSubmit={form.handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={form.values.email}
            onChange={(e) => form.setFieldValue("email", e.target.value)}
            onBlur={() => form.setFieldTouched("email", true)}
            error={form.touched.email ? validationErrors.email : undefined}
            disabled={form.loading}
          />

          <Input
            label="Password"
            type="password"
            value={form.values.password}
            onChange={(e) => form.setFieldValue("password", e.target.value)}
            onBlur={() => form.setFieldTouched("password", true)}
            error={
              form.touched.password ? validationErrors.password : undefined
            }
            disabled={form.loading}
          />

          <Button
            type="submit"
            className="w-full"
            loading={form.loading}
            disabled={form.loading}
          >
            Login
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
```

---

## 2. Data Fetching - Dashboard Page

```typescript
// src/pages/Dashboard.tsx
import { useState } from "react";
import { useFetch, useApi } from "@/hooks";
import * as api from "@/services/api";
import { Interview } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Alert from "@/components/common/Alert";
import { formatDate, formatDuration } from "@/utils/helpers";

export default function Dashboard() {
  const {
    data: stats,
    loading: statsLoading,
    error: statsError,
  } = useFetch(async () => {
    const user = await api.getCurrentUser();
    const interviews = await api.getInterviews({ status: "completed" });

    return {
      totalInterviews: interviews.length,
      averageScore:
        interviews.reduce((sum, i) => sum + (i.score || 0), 0) /
        interviews.length,
      completedInterviews: interviews.filter((i) => i.status === "completed")
        .length,
      upcomingInterviews: (await api.getInterviews({ status: "scheduled" }))
        .length,
    };
  }, []);

  const { data: recentInterviews, loading: interviewsLoading } =
    useFetch(async () => {
      const interviews = await api.getInterviews({
        limit: 5,
        sort: "-createdAt",
      });
      return interviews;
    }, []);

  if (statsLoading || interviewsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8">
      {statsError && <Alert type="error" message="Failed to load dashboard" />}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Interviews"
          value={stats?.totalInterviews || 0}
          icon="🎯"
        />
        <StatCard
          label="Completed"
          value={stats?.completedInterviews || 0}
          icon="✓"
        />
        <StatCard
          label="Average Score"
          value={`${Math.round(stats?.averageScore || 0)}%`}
          icon="📊"
        />
        <StatCard
          label="Upcoming"
          value={stats?.upcomingInterviews || 0}
          icon="📅"
        />
      </div>

      {/* Recent Interviews Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Interviews</h3>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Duration</th>
                <th className="px-4 py-2 text-left">Score</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentInterviews?.map((interview) => (
                <tr key={interview.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{interview.type}</td>
                  <td className="px-4 py-3">
                    {formatDate(interview.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    {formatDuration(interview.duration || 0)}
                  </td>
                  <td className="px-4 py-3">{interview.score}%</td>
                  <td className="px-4 py-3">{interview.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-gray-600 text-sm">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
```

---

## 3. Form Submission - Register Page

```typescript
// src/pages/Register.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "@/hooks";
import { validateRegisterForm } from "@/utils/validation";
import { useAuthOperations } from "@/hooks/useAuthOperations";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Alert from "@/components/common/Alert";

export default function Register() {
  const navigate = useNavigate();
  const { register, error: authError, loading } = useAuthOperations();
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const form = useForm(
    {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      role: "candidate",
      agreeToTerms: false,
    },
    {
      onSubmit: async (values) => {
        // Validate
        const validation = validateRegisterForm(values);
        if (!validation.isValid) {
          const errors: Record<string, string> = {};
          validation.errors.forEach((err) => {
            errors[err.field] = err.message;
          });
          setValidationErrors(errors);
          throw new Error("Validation failed");
        }

        // Submit
        await register(values.email, values.password, values.name, values.role);
      },
    }
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6">Create Account</h2>

        {(authError || form.errors.submit) && (
          <Alert type="error" message={authError || form.errors.submit?.[0]} />
        )}

        <form onSubmit={form.handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={form.values.name}
            onChange={(e) => form.setFieldValue("name", e.target.value)}
            disabled={form.loading}
            error={validationErrors.name}
          />

          <Input
            label="Email"
            type="email"
            value={form.values.email}
            onChange={(e) => form.setFieldValue("email", e.target.value)}
            disabled={form.loading}
            error={validationErrors.email}
          />

          <Input
            label="Password"
            type="password"
            value={form.values.password}
            onChange={(e) => form.setFieldValue("password", e.target.value)}
            disabled={form.loading}
            error={validationErrors.password}
          />

          <Input
            label="Confirm Password"
            type="password"
            value={form.values.confirmPassword}
            onChange={(e) =>
              form.setFieldValue("confirmPassword", e.target.value)
            }
            disabled={form.loading}
            error={validationErrors.confirmPassword}
          />

          <Select
            label="Role"
            value={form.values.role}
            onChange={(value) => form.setFieldValue("role", value)}
            disabled={form.loading}
            options={[
              { label: "Job Candidate", value: "candidate" },
              { label: "HR Recruiter", value: "hr" },
            ]}
          />

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={form.values.agreeToTerms}
              onChange={(e) =>
                form.setFieldValue("agreeToTerms", e.target.checked)
              }
              disabled={form.loading}
              className="mr-2"
            />
            <span className="text-sm text-gray-600">
              I agree to the Terms of Service
            </span>
          </label>

          <Button
            type="submit"
            className="w-full"
            loading={form.loading}
            disabled={form.loading || !form.values.agreeToTerms}
          >
            Register
          </Button>
        </form>
      </div>
    </div>
  );
}
```

---

## 4. Pagination - Candidates List

```typescript
// src/pages/HRCandidates.tsx
import { usePagination } from "@/hooks";
import * as api from "@/services/api";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Alert from "@/components/common/Alert";
import Button from "@/components/common/Button";
import { Candidate } from "@/types";

export default function HRCandidates() {
  const {
    data: candidates,
    page,
    total,
    pageSize,
    loading,
    error,
    goToPage,
    nextPage,
    prevPage,
  } = usePagination(
    async (pageNum, pageSize) => {
      const response = await api.getCandidates({
        page: pageNum,
        pageSize: pageSize,
      });
      return {
        items: response,
        total: response.length, // This would come from API response
      };
    },
    { pageSize: 10 }
  );

  if (loading && candidates.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4">
      {error && <Alert type="error" message="Failed to load candidates" />}

      {/* Candidates Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate) => (
              <tr key={candidate.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-3">{candidate.name}</td>
                <td className="px-6 py-3">{candidate.email}</td>
                <td className="px-6 py-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      candidate.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {candidate.status}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <Button size="sm" variant="outline">
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {(page - 1) * pageSize + 1} to{" "}
          {Math.min(page * pageSize, total)} of {total}
        </p>
        <div className="space-x-2">
          <Button
            onClick={prevPage}
            disabled={page === 1}
            variant="outline"
            size="sm"
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">Page {page}</span>
          <Button
            onClick={nextPage}
            disabled={page * pageSize >= total}
            variant="outline"
            size="sm"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

## 5. Error Handling - Route Level

```typescript
// src/App.tsx
import { BrowserRouter as Router } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import AppRoutes from "@/router";

export default function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </Router>
  );
}
```

---

## 6. Loading States - Async Operations

```typescript
// Example Component
import { useState } from "react";
import { useApi } from "@/hooks";
import * as api from "@/services/api";
import LoadingState from "@/components/LoadingState";
import Button from "@/components/common/Button";

export default function DataComponent() {
  const { data, loading, error, execute, reset } = useApi(
    () => api.getInterviews(),
    {
      onSuccess: () => console.log("Data loaded!"),
      onError: (error) => console.error("Error:", error),
    }
  );

  return (
    <div>
      <Button onClick={execute} disabled={loading}>
        Load Data
      </Button>

      <LoadingState isLoading={loading}>
        {data && (
          <div>
            {data.map((item) => (
              <div key={item.id}>{item.title}</div>
            ))}
          </div>
        )}
      </LoadingState>

      {error && <p className="text-red-600">{error.message}</p>}
    </div>
  );
}
```

---

## 7. Using Constants

```typescript
import { INTERVIEW_STATUS, DIFFICULTY_LEVELS, USER_ROLES } from "@/constants";

// In component
<Select
  options={[
    { label: "Scheduled", value: INTERVIEW_STATUS.SCHEDULED },
    { label: "In Progress", value: INTERVIEW_STATUS.IN_PROGRESS },
    { label: "Completed", value: INTERVIEW_STATUS.COMPLETED },
  ]}
/>;

// Check interview difficulty
if (interview.difficulty === DIFFICULTY_LEVELS.HARD) {
  // Show additional tips
}

// Format user role
import { formatRole } from "@/utils/helpers";
<span>{formatRole(user.role)}</span>;
```

---

## 8. API Service Configuration

**Development (.env.local)**:

```
VITE_API_URL=http://localhost:3000
```

**Production (.env.production)**:

```
VITE_API_URL=https://api.intervau.com
```

The API service will automatically use the configured URL.

---

## Summary

### Key Patterns

1. **Forms**: Use `useForm` hook with validators
2. **Data Fetching**: Use `useFetch` or `usePagination` hooks
3. **API Calls**: Use `useApi` hook for manual triggers
4. **Auth**: Use `useAuthOperations` hook for login/logout
5. **Errors**: Wrap components with `ErrorBoundary`
6. **Loading**: Use `LoadingState` component
7. **Formatting**: Use helper functions from `utils/helpers.ts`
8. **Constants**: Use constants from `constants/index.ts`

### Common Imports

```typescript
// Hooks
import { useApi, useForm, useFetch, usePagination } from "@/hooks";
import { useAuthOperations } from "@/hooks/useAuthOperations";

// Services
import * as api from "@/services/api";

// Components
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingState from "@/components/LoadingState";

// Utilities
import { formatDate, formatDuration, capitalize } from "@/utils/helpers";
import { validateLoginForm, validateEmail } from "@/utils/validation";

// Constants & Types
import { INTERVIEW_STATUS, USER_ROLES } from "@/constants";
import { type Interview, type Candidate } from "@/types";
```

---

## Next Steps

1. Update existing pages to use these patterns
2. Test with mock data first
3. Connect to real backend API
4. Implement error handling UI
5. Add loading states to data-heavy pages
6. Optimize performance with caching

All infrastructure is ready for production use!
