import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, ArrowLeft, CheckCircle, Video, AlertCircle, Eye, EyeOff } from "lucide-react";
import { ROUTES } from "../router";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import { api } from "../services/api";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [tokenError, setTokenError] = useState(false);
    const navigate = useNavigate();

    const token = searchParams.get("token");

    useEffect(() => {
        if (!token) {
            setTokenError(true);
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Validation
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters long");
            setLoading(false);
            return;
        }

        if (!token) {
            setError("Invalid reset token");
            setLoading(false);
            return;
        }

        try {
            const response = await api.resetPassword(token, newPassword, confirmPassword);

            if (response.success) {
                setSuccess(true);
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate(ROUTES.LOGIN);
                }, 3000);
            } else {
                setError(response.error || "Failed to reset password. Please try again.");
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
            console.error("Reset password error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Success screen
    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950">
                <div className="max-w-md w-full">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Password Reset Successful!
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            Your password has been successfully reset. You can now log in with your new password.
                        </p>

                        <Button
                            variant="primary"
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                            onClick={() => navigate(ROUTES.LOGIN)}
                        >
                            Go to Login
                        </Button>

                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                            Redirecting automatically in 3 seconds...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Token error screen
    if (tokenError) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950">
                <div className="max-w-md w-full">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Invalid Reset Link
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            This password reset link is invalid or has expired. Please request a new one.
                        </p>

                        <Button
                            variant="primary"
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                            onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}
                        >
                            Request New Link
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Reset password form
    return (
        <div className="min-h-screen flex">
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-cyan-600 p-12 items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2djEwaC0xMFYxNmgxMHpNMTQgMTZ2MTBINFYxNmgxMHptNDggMHYxMGgtMTBWMTZoMTB6TTM2IDR2MTBoLTEwVjRoMTB6TTE0IDR2MTBINFY0aDEwem00OCAkdjEwaC0xMFY0aDEwek0zNiA0MlY0MGgtMTBWNDBoMTB6TTE0IDQwdjEwSDRWNDBoMTB6bTQ4IDB2MTBoLTEwVjQwaDEweiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>

                <div className="relative z-10 max-w-md">
                    <div className="flex items-center space-x-3 mb-8">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <Video className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-3xl font-bold text-white">Intervau.AI</span>
                    </div>

                    <h1 className="text-4xl font-bold text-white mb-4">
                        Create a new password
                    </h1>
                    <p className="text-blue-50 text-lg mb-8">
                        Choose a strong password to protect your account and keep your data secure.
                    </p>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                        <h3 className="text-white font-semibold mb-4">Password Requirements:</h3>
                        <ul className="space-y-2 text-blue-50 text-sm">
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>At least 6 characters long</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Include uppercase and lowercase letters (recommended)</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Include numbers and special characters (recommended)</span>
                            </li>
                        </ul>
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

                    <button
                        onClick={() => navigate(ROUTES.LOGIN)}
                        className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to login</span>
                    </button>

                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Set New Password
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Enter your new password below to complete the reset process.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start space-x-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                </div>
                            )}

                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    label="New Password"
                                    icon={Lock}
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            <div className="relative">
                                <Input
                                    type={showConfirmPassword ? "text" : "password"}
                                    label="Confirm New Password"
                                    icon={Lock}
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                                loading={loading}
                            >
                                Reset Password
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
