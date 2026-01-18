import { useNavigate } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";
import { useDashboardData } from "../hooks/useDashboardData";
import {
  Briefcase,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { ROUTES } from "../router";

export default function HRDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    metrics,
    recentApplications,
    weeklyInterviews,
    departmentAnalytics,
    loading,
    error,
    refetch,
  } = useDashboardData();

  // Helper function to get AI score badge color
  const getScoreBadgeColor = (score: number) => {
    if (score >= 85) {
      return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800";
    }
    if (score >= 70) {
      return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800";
    }
    return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Qualified":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800";
      case "In Interview":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800";
      case "Under Review":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800";
      case "Accepted":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800";
      case "Rejected":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-700";
    }
  };

  // Prepare metrics data for cards
  const metricsData = metrics
    ? [
      {
        label: t("hrDashboard.openPositions"),
        value: metrics.openPositions.count.toString(),
        change: metrics.openPositions.changeLabel,
        icon: Briefcase,
        color: "from-blue-500 to-cyan-500",
      },
      {
        label: t("hrDashboard.activeCandidates"),
        value: metrics.activeCandidates.count.toString(),
        change: metrics.activeCandidates.changeLabel,
        icon: Users,
        color: "from-green-500 to-emerald-500",
      },
      {
        label: t("hrDashboard.interviewsScheduled"),
        value: metrics.interviewsScheduled.count.toString(),
        change: metrics.interviewsScheduled.changeLabel,
        icon: Clock,
        color: "from-orange-500 to-amber-500",
      },
      {
        label: t("hrDashboard.offersExtended"),
        value: metrics.offersExtended.count.toString(),
        change: metrics.offersExtended.changeLabel,
        icon: CheckCircle,
        color: "from-purple-500 to-pink-500",
      },
    ]
    : [];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t("hrDashboard.title")}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {t("hrDashboard.subtitle")}
            </p>
          </div>

          {/* Loading Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-gray-100 dark:border-gray-700 p-6 animate-pulse"
              >
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-red-900 dark:text-red-200">
                    Error Loading Dashboard
                  </h3>
                  <p className="text-red-700 dark:text-red-300 mt-1">{error}</p>
                </div>
              </div>
              <button
                onClick={refetch}
                className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t("hrDashboard.title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t("hrDashboard.subtitle")}
          </p>
        </div>

        {/* KPI Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metricsData.map((metric) => (
            <div
              key={metric.label}
              className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg hover:shadow-xl border-2 border-gray-100 dark:border-gray-700 p-6 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`bg-gradient-to-br ${metric.color} p-3 rounded-xl shadow-md`}
                >
                  <metric.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {metric.value}
              </h3>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {metric.label}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                {metric.change}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Applications */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t("hrDashboard.recentApplications")}
              </h2>
              <button
                onClick={() => navigate(ROUTES.HR_CANDIDATES)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
              >
                {t("hrDashboard.viewAll")}
              </button>
            </div>
            <div className="space-y-3">
              {recentApplications.length > 0 ? (
                recentApplications.map((app) => (
                  <button
                    key={app.id}
                    onClick={() =>
                      navigate(
                        ROUTES.CANDIDATE_REVIEW.replace(
                          ":candidateId",
                          app.candidateId
                        )
                      )
                    }
                    className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-700 transition-all group"
                  >
                    <div className="flex items-start space-x-4 flex-1 text-left">
                      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-white font-semibold text-sm">
                          {app.candidateName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {app.candidateName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {app.positionTitle}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {app.appliedDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(
                          app.status
                        )}`}
                      >
                        {app.status}
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-lg font-bold px-3 py-1 rounded-lg ${getScoreBadgeColor(
                            app.ai_score
                          )}`}
                        >
                          {app.ai_score}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {t("hrDashboard.aiScore")}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No recent applications
                </p>
              )}
            </div>
          </div>

          {/* Interviews This Week */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {t("hrDashboard.interviewsThisWeek")}
            </h2>
            <div className="space-y-4">
              {weeklyInterviews.length > 0 ? (
                weeklyInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="border-l-4 border-blue-500 dark:border-blue-400 pl-4 pb-4 bg-gray-50 dark:bg-gray-700/50 rounded-r-lg pr-4 pt-3"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {interview.candidateName}
                      </h4>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${interview.type === "live"
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                            : "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800"
                          }`}
                      >
                        {interview.type === "live"
                          ? t("hrDashboard.live")
                          : t("hrDashboard.mock")}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                      {interview.positionTitle}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {interview.scheduledDate}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No interviews scheduled this week
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Department Analytics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            {t("hrDashboard.hiringByDepartment")}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {departmentAnalytics.length > 0 ? (
              departmentAnalytics.map((dept) => (
                <div
                  key={dept.department}
                  className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-100 dark:border-blue-800"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    {dept.department}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {t("hrDashboard.openPositions")}
                        </span>
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {dept.openPositions}
                        </span>
                      </div>
                      <div className="w-full bg-white dark:bg-gray-700 rounded-full h-2.5">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 h-2.5 rounded-full"
                          style={{
                            width: `${Math.min(
                              (dept.openPositions / 10) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {t("hrDashboard.qualifiedCandidates")}
                        </span>
                        <span className="text-sm font-bold text-green-600 dark:text-green-400">
                          {dept.qualifiedCandidates}
                        </span>
                      </div>
                      <div className="w-full bg-white dark:bg-gray-700 rounded-full h-2.5">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-400 dark:to-green-500 h-2.5 rounded-full"
                          style={{
                            width: `${Math.min(dept.fillPercentage, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500 dark:text-gray-400 py-8">
                No department data available
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
