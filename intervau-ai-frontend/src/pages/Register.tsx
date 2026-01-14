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
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
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
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { addNotification } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      addNotification("Passwords do not match", "error");
      return;
    }

    setLoading(true);

    await register(name, email, password, role);

    setTimeout(() => {
      setLoading(false);
      addNotification("Account created successfully!", "success");
      navigate(getDefaultRoute(role));
    }, 800);
  };

  const stats = [
    { icon: Users, value: "10K+", label: "Active Users" },
    { icon: Target, value: "95%", label: "Success Rate" },
    { icon: TrendingUp, value: "45%", label: "Improvement" },
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
            Start your journey to interview success
          </h1>
          <p className="text-blue-50 text-lg mb-8">
            Join thousands of professionals who have improved their interview
            skills with our AI-powered platform.
          </p>

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
                  Personalized AI Feedback
                </div>
                <div className="text-blue-50 text-sm">
                  Get detailed insights on your performance in real-time
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
              <div>
                <div className="font-semibold mb-1">Unlimited Practice</div>
                <div className="text-blue-50 text-sm">
                  Practice as many times as you need to build confidence
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
              <div>
                <div className="font-semibold mb-1">
                  Comprehensive Analytics
                </div>
                <div className="text-blue-50 text-sm">
                  Track your progress and identify areas for improvement
                </div>
              </div>
            </div>
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
              Create an account
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Start your journey to interview excellence.
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
                  <UserIcon className="w-4 h-4" />
                  <span>Candidate</span>
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
                  <UserIcon className="w-4 h-4" />
                  <span>HR Team</span>
                </div>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                label="Full Name"
                icon={UserIcon}
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                type="email"
                label="Email Address"
                icon={Mail}
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                type="password"
                label="Password"
                icon={Lock}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                helperText="Minimum 8 characters"
                required
                minLength={8}
              />

              <Input
                type="password"
                label="Confirm Password"
                icon={Lock}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={
                  password && confirmPassword && password !== confirmPassword
                    ? "Passwords do not match"
                    : undefined
                }
                required
                minLength={8}
              />

              <div className="text-xs text-gray-600 dark:text-gray-400">
                By creating an account, you agree to our{" "}
                <button
                  type="button"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Terms of Service
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Privacy Policy
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                loading={loading}
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <button
                onClick={() => navigate(ROUTES.LOGIN)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
