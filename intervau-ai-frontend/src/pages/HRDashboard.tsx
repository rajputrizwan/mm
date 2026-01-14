import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { ROUTES } from "../router";

export default function HRDashboard() {
  const navigate = useNavigate();
  const metrics = [
    {
      label: "Open Positions",
      value: "12",
      change: "+2 this week",
      icon: Briefcase,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Active Candidates",
      value: "147",
      change: "+23 this week",
      icon: Users,
      color: "from-green-500 to-emerald-500",
    },
    {
      label: "Interviews Scheduled",
      value: "31",
      change: "18 this week",
      icon: Clock,
      color: "from-orange-500 to-amber-500",
    },
    {
      label: "Offers Extended",
      value: "8",
      change: "+3 this week",
      icon: CheckCircle,
      color: "from-purple-500 to-pink-500",
    },
  ];

  const recentApplications = [
    {
      id: 1,
      name: "Alex Martinez",
      position: "Senior Frontend Developer",
      score: 92,
      status: "qualified",
      appliedDate: "2 hours ago",
    },
    {
      id: 2,
      name: "Jordan Lee",
      position: "Full Stack Engineer",
      score: 85,
      status: "qualified",
      appliedDate: "4 hours ago",
    },
    {
      id: 3,
      name: "Casey Chen",
      position: "Product Manager",
      score: 78,
      status: "interview",
      appliedDate: "1 day ago",
    },
    {
      id: 4,
      name: "Morgan Smith",
      position: "DevOps Engineer",
      score: 68,
      status: "review",
      appliedDate: "2 days ago",
    },
  ];

  const interviewsThisWeek = [
    {
      id: 1,
      candidate: "Alex Martinez",
      position: "Senior Frontend Developer",
      date: "Today at 2:00 PM",
      type: "live",
    },
    {
      id: 2,
      candidate: "Casey Chen",
      position: "Product Manager",
      date: "Tomorrow at 10:00 AM",
      type: "live",
    },
    {
      id: 3,
      candidate: "Jordan Lee",
      position: "Full Stack Engineer",
      date: "Wed at 3:30 PM",
      type: "mock",
    },
  ];

  const departmentStats = [
    { dept: "Engineering", open: 7, qualified: 45, status: "active" },
    { dept: "Product", open: 2, qualified: 28, status: "active" },
    { dept: "Design", open: 1, qualified: 15, status: "active" },
    { dept: "Operations", open: 2, qualified: 59, status: "active" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "qualified":
        return "bg-green-100 text-green-700 border border-green-200";
      case "interview":
        return "bg-blue-100 text-blue-700 border border-blue-200";
      case "review":
        return "bg-yellow-100 text-yellow-700 border border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">HR Dashboard</h1>
        <p className="text-gray-600">
          Overview of hiring activity and candidate pipeline
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg hover:shadow-xl border-2 border-gray-100 p-6 transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`bg-gradient-to-br ${metric.color} p-3 rounded-xl shadow-md`}
              >
                <metric.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {metric.value}
            </h3>
            <p className="text-sm font-semibold text-gray-700 mb-2">
              {metric.label}
            </p>
            <p className="text-xs text-gray-600 font-medium">{metric.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Recent Applications
            </h2>
            <button
              onClick={() => navigate(ROUTES.HR_CANDIDATES)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {recentApplications.map((app) => (
              <button
                key={app.id}
                onClick={() =>
                  navigate(
                    ROUTES.CANDIDATE_REVIEW.replace(
                      ":candidateId",
                      candidate.id
                    )
                  )
                }
                className="w-full flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-all group"
              >
                <div className="flex items-start space-x-4 flex-1 text-left">
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-white font-semibold text-sm">
                      {app.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {app.name}
                    </h3>
                    <p className="text-sm text-gray-600">{app.position}</p>
                    <p className="text-xs text-gray-500 mt-1">
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
                    {getStatusLabel(app.status)}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      {app.score}%
                    </div>
                    <div className="text-xs text-gray-500">AI Score</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Interviews This Week
          </h2>
          <div className="space-y-4">
            {interviewsThisWeek.map((interview) => (
              <div
                key={interview.id}
                className="border-l-4 border-blue-500 pl-4 pb-4 bg-gray-50 rounded-r-lg pr-4 pt-3"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 text-sm">
                    {interview.candidate}
                  </h4>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      interview.type === "live"
                        ? "bg-blue-100 text-blue-700 border-blue-200"
                        : "bg-cyan-100 text-cyan-700 border-cyan-200"
                    }`}
                  >
                    {interview.type === "live" ? "Live" : "Mock"}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-2">
                  {interview.position}
                </p>
                <p className="text-xs text-gray-500">{interview.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Hiring by Department
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {departmentStats.map((dept) => (
            <div
              key={dept.dept}
              className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-100"
            >
              <h3 className="font-semibold text-gray-900 mb-4">{dept.dept}</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700">
                      Open Positions
                    </span>
                    <span className="text-sm font-bold text-blue-600">
                      {dept.open}
                    </span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full"
                      style={{ width: "70%" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700">
                      Qualified Candidates
                    </span>
                    <span className="text-sm font-bold text-green-600">
                      {dept.qualified}
                    </span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full"
                      style={{
                        width: `${Math.min(
                          (dept.qualified / 100) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
