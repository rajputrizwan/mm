import { Sparkles, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "../hooks/useTranslation";
import { ROUTES } from "../router";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LANDING);
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button
            onClick={() =>
              navigate(
                user
                  ? user.role === "hr"
                    ? ROUTES.HR_DASHBOARD
                    : ROUTES.CANDIDATE_DASHBOARD
                  : ROUTES.LANDING
              )
            }
            className="flex items-center space-x-2 group"
          >
            <div className="bg-gradient-to-br from-blue-600 to-cyan-500 p-2 rounded-lg group-hover:shadow-lg transition-shadow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Intervau.AI
            </span>
          </button>

          {user && (
            <div className="flex items-center space-x-6">
              {user.role === "candidate" && (
                <>
                  <button
                    onClick={() => navigate(ROUTES.CANDIDATE_DASHBOARD)}
                    className={`text-sm font-medium transition-colors ${
                      location.pathname === ROUTES.CANDIDATE_DASHBOARD
                        ? "text-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {t("navigation.dashboard")}
                  </button>
                  <button
                    onClick={() => navigate(ROUTES.RESUME)}
                    className={`text-sm font-medium transition-colors ${
                      location.pathname === ROUTES.RESUME
                        ? "text-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {t("navigation.resume")}
                  </button>
                  <button
                    onClick={() => navigate(ROUTES.MOCK_INTERVIEW)}
                    className={`text-sm font-medium transition-colors ${
                      location.pathname === ROUTES.MOCK_INTERVIEW
                        ? "text-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {t("navigation.mockInterview")}
                  </button>
                </>
              )}

              {user.role === "hr" && (
                <>
                  <button
                    onClick={() => navigate(ROUTES.HR_DASHBOARD)}
                    className={`text-sm font-medium transition-colors ${
                      location.pathname === ROUTES.HR_DASHBOARD
                        ? "text-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {t("navigation.dashboard")}
                  </button>
                  <button
                    onClick={() => navigate(ROUTES.JOB_POSITIONS)}
                    className={`text-sm font-medium transition-colors ${
                      location.pathname === ROUTES.JOB_POSITIONS
                        ? "text-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {t("navigation.jobPositions")}
                  </button>
                  <button
                    onClick={() => navigate(ROUTES.HR_CANDIDATES)}
                    className={`text-sm font-medium transition-colors ${
                      location.pathname === ROUTES.HR_CANDIDATES
                        ? "text-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {t("navigation.candidates")}
                  </button>
                </>
              )}

              <div className="flex items-center space-x-3 pl-6 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user.role}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title={t("navigation.logout")}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {!user && (
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(ROUTES.LOGIN)}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                {t("navigation.signIn")}
              </button>
              <button
                onClick={() => navigate(ROUTES.REGISTER)}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg hover:shadow-lg transition-shadow"
              >
                {t("navigation.getStarted")}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
