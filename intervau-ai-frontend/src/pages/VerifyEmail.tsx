import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { api } from "../services/api";
import { ROUTES } from "../router";
import LogoIcon from "../components/common/LogoIcon";

type VerifyState = "loading" | "success" | "error";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<VerifyState>("loading");
  const [errorMessage, setErrorMessage] = useState(
    "Invalid or expired verification link."
  );
  const [countdown, setCountdown] = useState(4);
  // Prevents the double-invocation in React 18 StrictMode from firing the
  // verify API twice (second call always fails because PendingRegistration
  // is deleted by the first successful call).
  const hasCalledRef = useRef(false);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setState("error");
      setErrorMessage(
        "No verification token found. Please use the link from your email."
      );
      return;
    }

    // Guard: only ever call the verify endpoint once per page load.
    if (hasCalledRef.current) return;
    hasCalledRef.current = true;

    api.verifyEmail(token).then((response) => {
      if (response.success) {
        setState("success");
      } else {
        setState("error");
        setErrorMessage(
          response.error ||
            response.message ||
            "Invalid or expired verification link. Please register again."
        );
      }
    });
  }, [searchParams]);

  // Auto-redirect countdown after success
  useEffect(() => {
    if (state !== "success") return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate(ROUTES.LOGIN);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-cyan-500/5 dark:bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
            <LogoIcon className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            Intervau.AI
          </span>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
          {/* ── Loading ── */}
          {state === "loading" && (
            <div className="flex flex-col items-center space-y-5">
              <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Verifying your email…
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Please wait while we activate your account.
                </p>
              </div>
            </div>
          )}

          {/* ── Success ── */}
          {state === "success" && (
            <div className="flex flex-col items-center space-y-5">
              <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center animate-in zoom-in duration-300">
                <CheckCircle className="w-10 h-10 text-emerald-500 dark:text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Email Verified!
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                  Your account has been created successfully.
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-sm">
                  Redirecting to login in{" "}
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {countdown}s
                  </span>
                  …
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-1000"
                  style={{ width: `${((4 - countdown) / 4) * 100}%` }}
                />
              </div>

              <button
                onClick={() => navigate(ROUTES.LOGIN)}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Go to Login Now
              </button>
            </div>
          )}

          {/* ── Error ── */}
          {state === "error" && (
            <div className="flex flex-col items-center space-y-5">
              <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-950 flex items-center justify-center animate-in zoom-in duration-300">
                <XCircle className="w-10 h-10 text-red-500 dark:text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Verification Failed
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {errorMessage}
                </p>
              </div>

              <div className="w-full space-y-3">
                <button
                  onClick={() => navigate(ROUTES.REGISTER)}
                  className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Register Again
                </button>
                <button
                  onClick={() => navigate(ROUTES.LOGIN)}
                  className="w-full py-3 px-6 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all duration-200"
                >
                  Back to Login
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Help text */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Mail className="w-4 h-4" />
            <span>
              Didn't receive the email?{" "}
              <button
                onClick={() => navigate(ROUTES.REGISTER)}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Try registering again
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
