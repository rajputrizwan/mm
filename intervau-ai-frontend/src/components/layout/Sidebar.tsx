import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  FileText,
  Video,
  History,
  User,
  Briefcase,
  Users,
  Settings,
  LogOut,
  X,
  Menu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useApp } from "../../contexts/AppContext";
import { ROUTES } from "../../router";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { sidebarOpen, setSidebarOpen } = useApp();

  if (!user) return null;

  const candidateLinks = [
    { icon: Home, label: "Dashboard", path: ROUTES.CANDIDATE_DASHBOARD },
    { icon: FileText, label: "Resume", path: ROUTES.RESUME },
    { icon: Video, label: "Mock Interview", path: ROUTES.MOCK_INTERVIEW },
    { icon: History, label: "History", path: ROUTES.INTERVIEW_HISTORY },
    {
      icon: Settings,
      label: "Profile",
      path: ROUTES.CANDIDATE_PROFILE_SETTINGS,
    },
  ];

  const hrLinks = [
    { icon: Home, label: "Dashboard", path: ROUTES.HR_DASHBOARD },
    { icon: Briefcase, label: "Job Positions", path: ROUTES.JOB_POSITIONS },
    { icon: Users, label: "Candidates", path: ROUTES.HR_CANDIDATES },
    { icon: History, label: "History", path: ROUTES.INTERVIEW_HISTORY },
    { icon: Settings, label: "Profile", path: ROUTES.HR_PROFILE_SETTINGS },
  ];

  const links = user.role === "candidate" ? candidateLinks : hrLinks;

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LANDING);
  };

  return (
    <>
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
      >
        <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
      </button>

      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-40 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${sidebarOpen ? "w-64" : "lg:w-20"}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div
              className={`flex items-center space-x-3 transition-opacity duration-200 ${
                !sidebarOpen && "lg:opacity-0 lg:w-0 lg:overflow-hidden"
              }`}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Video className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white whitespace-nowrap">
                Intervau.AI
              </span>
            </div>
            {!sidebarOpen && (
              <div className="hidden lg:flex w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg items-center justify-center mx-auto">
                <Video className="w-5 h-5 text-white" />
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-md z-50"
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>

          <div className="flex-1 overflow-y-auto py-4">
            <div
              className={`px-3 mb-2 transition-opacity duration-200 ${
                !sidebarOpen && "lg:opacity-0 lg:h-0 lg:overflow-hidden"
              }`}
            >
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Main Menu
              </p>
            </div>
            <nav className="space-y-1 px-2">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <button
                    key={link.path}
                    onClick={() => {
                      navigate(link.path);
                      if (window.innerWidth < 1024) setSidebarOpen(false);
                    }}
                    title={!sidebarOpen ? link.label : undefined}
                    className={`w-full flex items-center ${
                      sidebarOpen ? "space-x-3" : "lg:justify-center"
                    } px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 ${
                        isActive ? "text-blue-600" : ""
                      }`}
                    />
                    <span
                      className={`font-medium transition-opacity duration-200 whitespace-nowrap ${
                        !sidebarOpen && "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                      }`}
                    >
                      {link.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div
              className={`flex items-center mb-3 transition-all duration-200 ${
                sidebarOpen ? "space-x-3" : "lg:justify-center"
              }`}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div
                className={`flex-1 min-w-0 transition-opacity duration-200 ${
                  !sidebarOpen && "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                }`}
              >
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user.role}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title={!sidebarOpen ? "Logout" : undefined}
              className={`w-full flex items-center ${
                sidebarOpen ? "space-x-3" : "lg:justify-center"
              } px-3 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200`}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span
                className={`font-medium transition-opacity duration-200 whitespace-nowrap ${
                  !sidebarOpen && "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                }`}
              >
                Logout
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
