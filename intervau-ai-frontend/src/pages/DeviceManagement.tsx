import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import {
  LogOut,
  Smartphone,
  Globe,
  Clock,
  Trash2,
  LogOutIcon,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface Session {
  _id: string;
  deviceName: string;
  deviceType: string;
  browser: string;
  operatingSystem: string;
  ipAddress: string;
  lastActivityAt: string;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
  deviceFingerprint?: string;
  isCurrent?: boolean;
}

export const DeviceManagement: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [revoking, setRevoking] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSessions();
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchSessions, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.getActiveSessions();

      // Ensure response has data property
      const sessionData = Array.isArray(response.data)
        ? response.data
        : response.data?.sessions || [];
      setSessions(sessionData);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to load sessions";
      setError(errorMsg);
      console.error("Error fetching sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSessions();
    setRefreshing(false);
    setSuccess("Sessions refreshed successfully!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleRevokeSession = async (sessionId: string) => {
    const session = sessions.find((s) => s._id === sessionId);
    if (session?.isCurrent) {
      if (
        !window.confirm(
          "This is your current device. Signing it out will log you out. Continue?",
        )
      ) {
        return;
      }
    } else {
      if (!window.confirm("Are you sure you want to sign out this device?")) {
        return;
      }
    }

    try {
      setRevoking(sessionId);
      setError("");
      await api.revokeSession(sessionId);
      setSessions(sessions.filter((s) => s._id !== sessionId));
      setSuccess("Device signed out successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || "Failed to revoke session";
      setError(errorMsg);
      console.error("Error revoking session:", err);
    } finally {
      setRevoking(null);
    }
  };

  const handleSignOutAllOthers = async () => {
    if (
      !window.confirm(
        "This will sign out all other devices. You will remain logged in on this device. Continue?",
      )
    ) {
      return;
    }

    try {
      setRevoking("all");
      setError("");
      await api.signOutAllOthers();
      setSuccess("All other devices have been signed out!");
      setTimeout(() => setSuccess(""), 3000);
      // Refresh to show updated list
      await new Promise((resolve) => setTimeout(resolve, 500));
      await fetchSessions();
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || "Failed to sign out other devices";
      setError(errorMsg);
      console.error("Error signing out others:", err);
    } finally {
      setRevoking(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (err) {
      return "Invalid date";
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    if (!deviceType) return "💻";
    switch (deviceType.toLowerCase()) {
      case "mobile":
        return "📱";
      case "tablet":
        return "📱";
      case "desktop":
        return "🖥️";
      default:
        return "💻";
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    try {
      const now = new Date();
      const expiry = new Date(expiresAt);

      if (isNaN(expiry.getTime())) {
        return "Unknown";
      }

      const diffMs = expiry.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return "Expired";
      if (diffDays === 0) return "Expires today";
      if (diffDays === 1) return "Expires tomorrow";
      return `${diffDays} days left`;
    } catch (err) {
      return "Unknown";
    }
  };

  const isExpiringSoon = (expiresAt: string) => {
    try {
      const now = new Date();
      const expiry = new Date(expiresAt);
      const diffMs = expiry.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return diffDays <= 3;
    } catch (err) {
      return false;
    }
  };

  if (loading && sessions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your devices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Smartphone className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                Device Management
              </h1>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          <p className="text-gray-600">
            Manage your devices and active Remember Me sessions. Sign out any
            device at any time.
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Sign Out All Others Button */}
        {sessions.length > 1 && (
          <div className="mb-6">
            <button
              onClick={handleSignOutAllOthers}
              disabled={revoking !== null}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <LogOutIcon className="w-5 h-5" />
              {revoking === "all"
                ? "Signing out..."
                : "Sign Out All Other Devices"}
            </button>
          </div>
        )}

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              No active Remember Me sessions
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Log in with "Remember Me" checked to see your devices here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session._id}
                className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 ${
                  isExpiringSoon(session.expiresAt)
                    ? "border-l-4 border-orange-500"
                    : ""
                } ${session.isCurrent ? "border-l-4 border-green-500" : ""}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-4xl">
                      {getDeviceIcon(session.deviceType)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {session.deviceName || "Unknown Device"}
                        </h3>
                        {session.isCurrent && (
                          <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                            Current
                          </span>
                        )}
                        {isExpiringSoon(session.expiresAt) && (
                          <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-1 rounded">
                            Expiring Soon
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {session.browser || "Unknown Browser"} on{" "}
                        {session.operatingSystem || "Unknown OS"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevokeSession(session._id)}
                    disabled={revoking === session._id}
                    className="bg-red-100 hover:bg-red-200 disabled:bg-gray-200 text-red-700 font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap ml-4"
                  >
                    <Trash2 className="w-4 h-4" />
                    {revoking === session._id ? "Revoking..." : "Revoke"}
                  </button>
                </div>

                {/* Device Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 uppercase font-semibold">
                        IP Address
                      </p>
                      <p className="text-sm font-mono text-gray-700 truncate">
                        {session.ipAddress || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 uppercase font-semibold">
                        Last Activity
                      </p>
                      <p className="text-sm text-gray-700 truncate">
                        {formatDate(session.lastActivityAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Session Timeline */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-4 border-t border-gray-200 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">
                      Session Created
                    </p>
                    <p className="text-sm text-gray-700">
                      {formatDate(session.createdAt)}
                    </p>
                  </div>
                  <div className="md:text-right">
                    <p className="text-xs text-gray-500 uppercase font-semibold">
                      Expires
                    </p>
                    <p
                      className={`text-sm font-semibold ${
                        getTimeRemaining(session.expiresAt).includes("Expired")
                          ? "text-red-600"
                          : getTimeRemaining(session.expiresAt).includes(
                                "Expires today",
                              )
                            ? "text-orange-600"
                            : "text-green-600"
                      }`}
                    >
                      {getTimeRemaining(session.expiresAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="font-semibold text-blue-900 mb-3">
            How Remember Me Works
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>✓ Sessions remain active for 30 days from creation</li>
            <li>✓ You can revoke any device at any time</li>
            <li>✓ Device fingerprint prevents token sharing</li>
            <li>✓ IP address and browser info are tracked for security</li>
            <li>✓ Automatic cleanup happens after expiration</li>
            <li>✓ Sessions are auto-refreshed every 30 seconds</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DeviceManagement;
