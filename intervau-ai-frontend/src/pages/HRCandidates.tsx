import { useNavigate } from "react-router-dom";
import { Search, Filter, TrendingUp, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { routeHelpers } from "../router";
import { useCandidateApplications } from "../hooks/useCandidateApplications";
import { formatDate } from "../utils/dateFormatter";

export default function HRCandidates() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("score");

  // Fetch data using custom hook
  const { applications, stats, loading, error } = useCandidateApplications({
    search: searchTerm,
    status: filterStatus,
    sortBy,
  });

  // Map backend status to frontend display values
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Qualified":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
      case "In Interview":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
      case "Under Review":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400";
    }
  };

  const statsCards = [
    {
      label: "Total Candidates",
      value: stats.totalCount,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Qualified",
      value: stats.qualifiedCount,
      color: "from-green-500 to-emerald-500",
    },
    {
      label: "In Interview",
      value: stats.interviewingCount,
      color: "from-purple-500 to-pink-500",
    },
    {
      label: "Avg Score",
      value: `${stats.averageScore}%`,
      color: "from-orange-500 to-amber-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Candidates
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Browse and review all candidates in your pipeline
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
            >
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1 font-medium">
                {stat.label}
              </p>
              <p
                className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="mb-6 flex items-center space-x-4 flex-wrap gap-4">
            <div className="flex-1 min-w-60 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-3">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="Qualified">Qualified</option>
                <option value="In Interview">In Interview</option>
                <option value="Under Review">Under Review</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="score">Sort by Score</option>
                <option value="recent">Most Recent</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Candidate
                      </th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Position
                      </th>
                      <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Score
                      </th>
                      <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Status
                      </th>
                      <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Interviews
                      </th>
                      <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Applied
                      </th>
                      <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((application) => {
                      const candidateName =
                        application.candidateId?.userId?.name || "Unknown";
                      const positionTitle =
                        application.jobPositionId?.title || "No Position";
                      const avatarInitial = candidateName.charAt(0).toUpperCase();

                      return (
                        <tr
                          key={application._id}
                          className="border-b border-gray-100 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-semibold text-sm">
                                  {avatarInitial}
                                </span>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {candidateName}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-700 dark:text-gray-300 text-sm">
                            {positionTitle}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-semibold">
                              <TrendingUp className="w-4 h-4" />
                              <span>{application.ai_score}%</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                application.status
                              )}`}
                            >
                              {application.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center text-gray-700 dark:text-gray-300 font-medium">
                            {application.interviewCount}
                          </td>
                          <td className="py-4 px-4 text-center text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(application.appliedAt)}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() =>
                                navigate(
                                  routeHelpers.candidateReview(
                                    application.candidateId._id
                                  )
                                )
                              }
                              className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm"
                            >
                              <span>View</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {applications.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    No candidates found
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
