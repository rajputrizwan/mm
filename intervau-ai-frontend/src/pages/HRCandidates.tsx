import { useNavigate } from "react-router-dom";
import { Search, Filter, Star, TrendingUp } from "lucide-react";
import { useState } from "react";
import { ROUTES, routeHelpers } from "../router";

export default function HRCandidates() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("score");

  const candidates = [
    {
      id: 1,
      name: "Alex Martinez",
      position: "Senior Frontend Developer",
      score: 92,
      status: "qualified",
      appliedDate: "March 10, 2024",
      interviews: 2,
      starred: true,
    },
    {
      id: 2,
      name: "Jordan Lee",
      position: "Full Stack Engineer",
      score: 85,
      status: "qualified",
      appliedDate: "March 12, 2024",
      interviews: 1,
      starred: false,
    },
    {
      id: 3,
      name: "Casey Chen",
      position: "Product Manager",
      score: 78,
      status: "interview",
      appliedDate: "March 15, 2024",
      interviews: 1,
      starred: false,
    },
    {
      id: 4,
      name: "Morgan Smith",
      position: "DevOps Engineer",
      score: 68,
      status: "review",
      appliedDate: "March 18, 2024",
      interviews: 0,
      starred: false,
    },
    {
      id: 5,
      name: "Taylor Johnson",
      position: "Senior Full Stack Developer",
      score: 88,
      status: "qualified",
      appliedDate: "March 20, 2024",
      interviews: 1,
      starred: true,
    },
    {
      id: 6,
      name: "Riley Davis",
      position: "Frontend Developer",
      score: 72,
      status: "review",
      appliedDate: "March 22, 2024",
      interviews: 0,
      starred: false,
    },
    {
      id: 7,
      name: "Alex Wong",
      position: "Senior Full Stack Developer",
      score: 81,
      status: "qualified",
      appliedDate: "March 25, 2024",
      interviews: 1,
      starred: false,
    },
    {
      id: 8,
      name: "Jordan Brown",
      position: "Product Manager",
      score: 75,
      status: "interview",
      appliedDate: "March 28, 2024",
      interviews: 1,
      starred: false,
    },
  ];

  const filteredCandidates = candidates
    .filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.position.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || c.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "score") return b.score - a.score;
      if (sortBy === "recent")
        return (
          new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
        );
      return 0;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "qualified":
        return "bg-green-100 text-green-700";
      case "interview":
        return "bg-blue-100 text-blue-700";
      case "review":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "qualified":
        return "Qualified";
      case "interview":
        return "In Interview";
      case "review":
        return "Under Review";
      default:
        return status;
    }
  };

  const stats = [
    {
      label: "Total Candidates",
      value: candidates.length,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Qualified",
      value: candidates.filter((c) => c.status === "qualified").length,
      color: "from-green-500 to-emerald-500",
    },
    {
      label: "In Interview",
      value: candidates.filter((c) => c.status === "interview").length,
      color: "from-purple-500 to-pink-500",
    },
    { label: "Avg Score", value: "80%", color: "from-orange-500 to-amber-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Candidates</h1>
          <p className="text-gray-600">
            Browse and review all candidates in your pipeline
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <p className="text-sm text-gray-600 mb-1 font-medium">
                {stat.label}
              </p>
              <p className="text-3xl font-bold bg-gradient-to-r {stat.color} bg-clip-text text-transparent">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="mb-6 flex items-center space-x-4 flex-wrap gap-4">
            <div className="flex-1 min-w-60 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-3">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg bg-white font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="qualified">Qualified</option>
                <option value="interview">In Interview</option>
                <option value="review">Under Review</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg bg-white font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="score">Sort by Score</option>
                <option value="recent">Most Recent</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">
                    Candidate
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">
                    Position
                  </th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">
                    Score
                  </th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">
                    Interviews
                  </th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">
                    Applied
                  </th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map((candidate) => (
                  <tr
                    key={candidate.id}
                    className="border-b border-gray-100 hover:bg-blue-50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold text-sm">
                            {candidate.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {candidate.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-700 text-sm">
                      {candidate.position}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                        <TrendingUp className="w-4 h-4" />
                        <span>{candidate.score}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          candidate.status
                        )}`}
                      >
                        {getStatusLabel(candidate.status)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-gray-700 font-medium">
                      {candidate.interviews}
                    </td>
                    <td className="py-4 px-4 text-center text-sm text-gray-600">
                      {candidate.appliedDate}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() =>
                          navigate(routeHelpers.candidateReview(candidate.id))
                        }
                        className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCandidates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No candidates found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
