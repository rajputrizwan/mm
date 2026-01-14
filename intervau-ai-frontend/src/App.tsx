import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AppProvider } from "./contexts/AppContext";
import { ProtectedRoute, ROUTES } from "./router";

import AppLayout from "./components/layout/AppLayout";
import Navbar from "./components/Navbar";
import NotificationToast from "./components/common/NotificationToast";

// Public Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";

// Candidate Pages
import Dashboard from "./pages/Dashboard";
import Resume from "./pages/Resume";
import MockInterview from "./pages/MockInterview";
import MockInterviewSession from "./pages/MockInterviewSession";
import InterviewHistory from "./pages/InterviewHistory";
import InterviewReport from "./pages/InterviewReport";
import ProfileSettings from "./pages/ProfileSettings";

// HR Pages
import HRDashboard from "./pages/HRDashboard";
import JobPositions from "./pages/JobPositions";
import HRCandidates from "./pages/HRCandidates";
import CandidateReview from "./pages/CandidateReview";

// Shared Pages
import LiveInterview from "./pages/LiveInterview";
import InterviewSummary from "./pages/InterviewSummary";

// Error Pages
import NotFound from "./pages/NotFound";

// Layout wrapper for authenticated pages
function AuthenticatedLayout({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return <AppLayout title={title}>{children}</AppLayout>;
}

// Layout wrapper for public pages
function PublicLayout({
  children,
  showNavbar = true,
}: {
  children: React.ReactNode;
  showNavbar?: boolean;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {showNavbar && <Navbar />}
      {children}
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path={ROUTES.LANDING}
        element={
          <PublicLayout showNavbar={false}>
            <Landing />
          </PublicLayout>
        }
      />
      <Route
        path={ROUTES.LOGIN}
        element={
          <PublicLayout>
            <Login />
          </PublicLayout>
        }
      />
      <Route
        path={ROUTES.REGISTER}
        element={
          <PublicLayout>
            <Register />
          </PublicLayout>
        }
      />
      <Route
        path={ROUTES.FORGOT_PASSWORD}
        element={
          <PublicLayout>
            <ForgotPassword />
          </PublicLayout>
        }
      />
      <Route
        path={ROUTES.PRICING}
        element={
          <PublicLayout>
            <Pricing />
          </PublicLayout>
        }
      />
      <Route
        path={ROUTES.ABOUT}
        element={
          <PublicLayout>
            <About />
          </PublicLayout>
        }
      />
      <Route
        path={ROUTES.FAQ}
        element={
          <PublicLayout>
            <FAQ />
          </PublicLayout>
        }
      />
      <Route
        path={ROUTES.CONTACT}
        element={
          <PublicLayout>
            <Contact />
          </PublicLayout>
        }
      />

      {/* Candidate Routes */}
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
      <Route
        path={ROUTES.RESUME}
        element={
          <ProtectedRoute roles={["candidate"]}>
            <AuthenticatedLayout>
              <Resume />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.MOCK_INTERVIEW}
        element={
          <ProtectedRoute roles={["candidate"]}>
            <AuthenticatedLayout>
              <MockInterview />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.MOCK_INTERVIEW_SESSION}
        element={
          <ProtectedRoute roles={["candidate"]}>
            <AuthenticatedLayout>
              <MockInterviewSession />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.INTERVIEW_HISTORY}
        element={
          <ProtectedRoute roles={["candidate"]}>
            <AuthenticatedLayout>
              <InterviewHistory />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.INTERVIEW_REPORT}
        element={
          <ProtectedRoute roles={["candidate"]}>
            <AuthenticatedLayout>
              <InterviewReport />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.CANDIDATE_PROFILE_SETTINGS}
        element={
          <ProtectedRoute roles={["candidate"]}>
            <AuthenticatedLayout>
              <ProfileSettings />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      {/* HR Routes */}
      <Route
        path={ROUTES.HR_DASHBOARD}
        element={
          <ProtectedRoute roles={["hr"]}>
            <AuthenticatedLayout>
              <HRDashboard />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.JOB_POSITIONS}
        element={
          <ProtectedRoute roles={["hr"]}>
            <AuthenticatedLayout>
              <JobPositions />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.HR_CANDIDATES}
        element={
          <ProtectedRoute roles={["hr"]}>
            <AuthenticatedLayout>
              <HRCandidates />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.CANDIDATE_REVIEW}
        element={
          <ProtectedRoute roles={["hr"]}>
            <AuthenticatedLayout>
              <CandidateReview />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.HR_PROFILE_SETTINGS}
        element={
          <ProtectedRoute roles={["hr"]}>
            <AuthenticatedLayout>
              <ProfileSettings />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      {/* Shared Routes */}
      <Route
        path={ROUTES.LIVE_INTERVIEW}
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <LiveInterview userRole={user?.role} />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.INTERVIEW_SUMMARY}
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <InterviewSummary />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      {/* 404 and Catch-all */}
      <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
      <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <AppProvider>
          <NotificationToast />
          <AppRoutes />
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
