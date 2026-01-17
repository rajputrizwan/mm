import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User as UserIcon,
  Video,
  Target,
  Users,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "../hooks/useTranslation";
import { getDefaultRoute, ROUTES } from "../router";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import { useApp } from "../contexts/AppContext";

export default function Register() {
  const [role, setRole] = useState<"candidate" | "hr">("candidate");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyName, setCompanyName] = useState("Intervau");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { addNotification } = useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/(?=.*[a-z])/.test(pwd)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(pwd)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(pwd)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      addNotification(passwordError, "error");
      return;
    }

    if (password !== confirmPassword) {
      addNotification("Passwords do not match", "error");
      return;
    }

    // Validate HR requires company name
    if (role === "hr" && !companyName.trim()) {
      addNotification("Company name is required for HR registration", "error");
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password, role, companyName);
      addNotification("Account created successfully!", "success");
      setTimeout(() => {
        setLoading(false);
        navigate(getDefaultRoute(role));
      }, 800);
    } catch (error) {
      setLoading(false);
      addNotification("Registration failed. Please try again.", "error");
    }
  };

  // Demo credentials quick-fill function
  const useDemoCredentials = (userType: "candidate" | "hr") => {
    if (userType === "candidate") {
      setName("Test Candidate");
      setEmail("candidate@test.com");
      setPassword("Test1234");
      setConfirmPassword("Test1234");
      setRole("candidate");
      setCompanyName("");
    } else {
      setName("Test HR Manager");
      setEmail("hr@test.com");
      setPassword("Test1234");
      setConfirmPassword("Test1234");
      setRole("hr");
      setCompanyName("Test Company Inc.");
    }
  };

  const stats = [
    { icon: Users, value: "10K+", label: t("auth.activeUsers") },
    { icon: Target, value: "95%", label: t("auth.successRate") },
    { icon: TrendingUp, value: "45%", label: t("auth.improvement") },
  ];

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-cyan-600 p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2djEwaC0xMFYxNmgxMHpNMTQgMTZ2MTBINFYxNmgxMHptNDggMHYxMGgtMTBWMTZoMTB6TTM2IDRRdDBoMTBWNGgtMTB6TTE0IDR2MTBINFY0aDEwem00OCAkaDEwVjRoLTEwek0zNiA0MlQ0MGgtMTBWNDBoMTB6TTE0IDQwdjEwSDRWNDBoMTB6bTQ4IDB2MTBoLTEwVjQwaDEweiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>

        <div className="relative z-10 max-w-md">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Video className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-white">Intervau.AI</span>
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">
            {t("auth.startJourney")}
          </h1>
          <p className="text-blue-50 text-lg mb-8">{t("auth.joinThousands")}</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
              >
                <stat.icon className="w-6 h-6 text-white mb-2" />
                <div className="text-2xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-blue-50 text-xs">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="space-y-4 text-white">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
              <div>
                <div className="font-semibold mb-1">
                  {t("auth.personalizedFeedback")}
                </div>
                <div className="text-blue-50 text-sm">
                  {t("auth.performanceInsights")}
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
              <div>
                <div className="font-semibold mb-1">
                  {t("auth.unlimitedPractice")}
                </div>
                <div className="text-blue-50 text-sm">
                  {t("auth.buildConfidence")}
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
              <div>
                <div className="font-semibold mb-1">
                  {t("auth.comprehensiveAnalytics")}
                </div>
                <div className="text-blue-50 text-sm">
                  {t("auth.trackProgress")}
                </div>
              </div>
            </div>
          </div>

          {/* Demo Data Button */}
          <div className="mt-8 p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <div className="flex items-center space-x-3 mb-3">
              <AlertCircle className="w-5 h-5 text-yellow-300" />
              <span className="text-white font-semibold">Quick Test Registration</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => useDemoCredentials("candidate")}
                className="p-3 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                Candidate Demo
              </button>
              <button
                type="button"
                onClick={() => useDemoCredentials("hr")}
                className="p-3 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                HR Team Demo
              </button>
            </div>
            <p className="text-blue-50 text-xs mt-3">
              Click to auto-fill registration form with test data.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center space-x-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              Intervau.AI
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t("auth.createAccountHeading")}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t("auth.startExcellence")}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8">
            <div className="flex space-x-2 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setRole("candidate")}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${role === "candidate"
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <UserIcon className="w-4 h-4" />
                  <span>{t("auth.candidate")}</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setRole("hr")}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${role === "hr"
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <UserIcon className="w-4 h-4" />
                  <span>{t("auth.hrTeam")}</span>
                </div>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                label={t("auth.fullName")}
                icon={UserIcon}
                placeholder={t("auth.fullNamePlaceholder")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              {role === "hr" && (
                <Input
                  type="text"
                  label="Company Name"
                  icon={UserIcon}
                  placeholder="Enter your company name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  helperText="Company name for HR registration"
                />
              )}

              <Input
                type="email"
                label={t("auth.email")}
                icon={Mail}
                placeholder={t("auth.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                type="password"
                label={t("auth.password")}
                icon={Lock}
                placeholder={t("auth.passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                helperText="Must be 8+ characters with uppercase, lowercase, and number"
                error={
                  password && validatePassword(password)
                    ? validatePassword(password) || undefined
                    : undefined
                }
                required
                minLength={8}
              />

              <Input
                type="password"
                label={t("auth.confirmPassword")}
                icon={Lock}
                placeholder={t("auth.passwordPlaceholder")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={
                  password && confirmPassword && password !== confirmPassword
                    ? t("auth.passwordsDoNotMatch")
                    : undefined
                }
                required
                minLength={8}
              />

              <div className="text-xs text-gray-600 dark:text-gray-400">
                {t("auth.agreeTerms")}{" "}
                <button
                  type="button"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {t("auth.termsOfService")}
                </button>{" "}
                {t("auth.and")}{" "}
                <button
                  type="button"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {t("auth.privacyPolicy")}
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                loading={loading}
              >
                {t("auth.createAccount")}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              {t("auth.alreadyHaveAccount")}{" "}
              <button
                onClick={() => navigate(ROUTES.LOGIN)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
              >
                {t("auth.signInLink")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
