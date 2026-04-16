import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Video,
  FileText,
  TrendingUp,
  Clock,
  Award,
  Target,
  Play,
  Upload,
  Loader2,
  AlertCircle,
  Info,
} from "lucide-react";
import { ROUTES } from "../router";
import { useDashboardData } from "../hooks/useDashboardData";
import { formatTimeAgo } from "../utils/dateFormatter";

export default function Dashboard() {
  const navigate = useNavigate();
  const { stats, recentInterviews, topSkills, loading, error } =
    useDashboardData();
  const [openTooltipId, setOpenTooltipId] = useState<string | null>(null);

  const hasImprovementRate =
    typeof stats?.improvementRate === "number" &&
    stats?.improvementLabel !== "Need more interview data";
  const improvementRateValue = hasImprovementRate
    ? stats?.improvementRate
    : null;

  // Helper function to get score badge color
  const getScoreBadgeColor = (score: number) => {
    if (score >= 80)
      return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800";
    if (score >= 60)
      return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800";
    return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800";
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Stats cards with dynamic data
  const statsCards = [
    {
      id: "total-interviews",
      label: "Total Interviews",
      value: stats?.totalInterviews?.toString() || "0",
      change: `+${stats?.weekInterviews || 0} this week`,
      tooltip:
        "Counts all completed interview activity, including completed interview sessions and completed mock interview sessions.",
      icon: Video,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "average-score",
      label: "Average Score",
      value: `${stats?.avgScore || 0}%`,
      change: `${
        stats && stats.avgScore > stats.lastPeriodAvgScore ? "+" : ""
      }${Math.round((stats?.avgScore || 0) - (stats?.lastPeriodAvgScore || 0))}% from last`,
      tooltip:
        "Average score across your completed interviews and mock sessions, rounded to the nearest whole percent.",
      icon: Award,
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "hours-practiced",
      label: "Hours Practiced",
      value: `${stats?.hoursPracticed?.toFixed(1) || "0.0"}h`,
      change: `${stats?.weekHoursPracticed?.toFixed(1) || "0.0"}h this week`,
      tooltip:
        "Total interview duration converted from minutes to hours. The subtitle shows your activity in the last 7 days.",
      icon: Clock,
      color: "from-orange-500 to-amber-500",
    },
    {
      id: "improvement-rate",
      label: "Improvement Rate",
      value:
        hasImprovementRate && improvementRateValue !== null
          ? `${improvementRateValue > 0 ? "+" : ""}${improvementRateValue}%`
          : "N/A",
      change: stats?.improvementLabel || "Need more interview data",
      tooltip:
        stats?.improvementLabel === "Last 30 days"
          ? "Calculated from your average score in the last 30 days compared with the previous 30 days."
          : stats?.improvementLabel === "Recent sessions"
            ? "Not enough 30-day history yet, so this compares your latest 3 sessions against your first 3 sessions."
            : "Complete more interviews to unlock this trend metric.",
      icon: TrendingUp,
      color: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome Back! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Here's your performance overview
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`bg-gradient-to-br ${stat.color} p-3 rounded-lg shadow-sm`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </h3>
              <div className="flex items-center gap-1.5 mb-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {stat.label}
                </p>
                {stat.tooltip ? (
                  <div className="relative group/info">
                    <button
                      type="button"
                      aria-label={`${stat.label} explanation`}
                      aria-describedby={`tooltip-${stat.id}`}
                      onMouseEnter={() => setOpenTooltipId(stat.id)}
                      onMouseLeave={() =>
                        setOpenTooltipId((prev) =>
                          prev === stat.id ? null : prev,
                        )
                      }
                      onFocus={() => setOpenTooltipId(stat.id)}
                      onBlur={() =>
                        setOpenTooltipId((prev) =>
                          prev === stat.id ? null : prev,
                        )
                      }
                      onClick={() =>
                        setOpenTooltipId((prev) =>
                          prev === stat.id ? null : stat.id,
                        )
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Escape") {
                          setOpenTooltipId((prev) =>
                            prev === stat.id ? null : prev,
                          );
                        }
                      }}
                      className="inline-flex items-center justify-center rounded-full text-gray-400 transition-colors hover:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-500 dark:hover:text-gray-300"
                    >
                      <Info className="w-3.5 h-3.5 cursor-help" />
                    </button>
                    <div
                      id={`tooltip-${stat.id}`}
                      role="tooltip"
                      className={`pointer-events-none absolute z-20 left-1/2 top-full mt-2 w-64 -translate-x-1/2 rounded-md bg-gray-900 px-3 py-2 text-[11px] leading-relaxed text-white shadow-lg transition-opacity duration-150 group-hover/info:opacity-100 group-focus-within/info:opacity-100 ${
                        openTooltipId === stat.id ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      {stat.tooltip}
                    </div>
                  </div>
                ) : null}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {stat.change}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => navigate(ROUTES.MOCK_INTERVIEW)}
            className="bg-gradient-to-br from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 text-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all duration-300 group"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-white/20 p-4 rounded-xl group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold mb-1">Start Mock Interview</h3>
                <p className="text-blue-100 dark:text-blue-200 text-sm">
                  Practice with AI interviewer
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate(ROUTES.RESUME)}
            className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600 p-4 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  Upload Resume
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Extract skills with AI
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate(ROUTES.INTERVIEW_HISTORY)}
            className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 p-4 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  View Reports
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Detailed analytics
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Recent Interviews
              </h2>
              <button
                onClick={() => navigate(ROUTES.INTERVIEW_HISTORY)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {recentInterviews.length > 0 ? (
                recentInterviews.map((interview) => (
                  <div
                    key={interview._id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600 p-3 rounded-lg shadow-sm">
                        <Video className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {interview.jobPositionId?.title ||
                            "Interview Session"}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatTimeAgo(interview.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`inline-flex items-center space-x-2 ${getScoreBadgeColor(
                          interview.score,
                        )} border px-3 py-1.5 rounded-full text-sm font-semibold`}
                      >
                        <Award className="w-4 h-4" />
                        <span>{interview.score}%</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    No interviews yet. Start your first mock interview!
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Top Skills
              </h2>
              <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
            <div className="space-y-5">
              {topSkills.map((skill) => (
                <div key={skill.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {skill.name}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {skill.level}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate(ROUTES.RESUME)}
              className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
            >
              Update Skills
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
