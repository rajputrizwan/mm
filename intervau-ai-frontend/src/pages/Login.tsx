import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Video, Sparkles, CheckCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "../hooks/useTranslation";
import { getDefaultRoute, ROUTES } from "../router";
import Input from "../components/common/Input";
import Button from "../components/common/Button";

export default function Login() {
  const [role, setRole] = useState<"candidate" | "hr">("candidate");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await login(email, password, role);

    setTimeout(() => {
      setLoading(false);
      navigate(getDefaultRoute(role));
    }, 800);
  };

  const features = [
    t("auth.aiPoweredAnalysis"),
    t("auth.realtimeFeedback"),
    t("auth.comprehensiveReports"),
    t("auth.unlimitedMockInterviews"),
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
            {t("auth.welcomeBack")}
          </h1>
          <p className="text-blue-50 text-lg mb-8">
            {t("auth.continueImproving")}
          </p>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-white text-base">{feature}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <div className="flex items-center space-x-3 mb-2">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="text-white font-semibold">
                {t("auth.proTip")}
              </span>
            </div>
            <p className="text-blue-50 text-sm">{t("auth.regularPractice")}</p>
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
              {t("auth.signIn")}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t("auth.welcomeSignIn")}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8">
            <div className="flex space-x-2 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setRole("candidate")}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  role === "candidate"
                    ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>{t("auth.candidate")}</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setRole("hr")}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  role === "hr"
                    ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>{t("auth.hrTeam")}</span>
                </div>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
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
                required
              />

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-gray-600 dark:text-gray-400">
                    {t("auth.rememberMe")}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  {t("auth.forgotPassword")}
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                loading={loading}
              >
                {t("auth.signIn")}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              {t("auth.noAccount")}{" "}
              <button
                onClick={() => navigate(ROUTES.REGISTER)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
              >
                {t("auth.createAccount")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
