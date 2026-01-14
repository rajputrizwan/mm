//

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
} from "lucide-react";
import { ROUTES } from "../router";

export default function Dashboard() {
  const navigate = useNavigate();
  const stats = [
    {
      label: "Total Interviews",
      value: "12",
      change: "+3 this week",
      icon: Video,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Average Score",
      value: "78%",
      change: "+5% from last",
      icon: Award,
      color: "from-green-500 to-emerald-500",
    },
    {
      label: "Hours Practiced",
      value: "8.5h",
      change: "2.5h this week",
      icon: Clock,
      color: "from-orange-500 to-amber-500",
    },
    {
      label: "Improvement Rate",
      value: "+12%",
      change: "Last 30 days",
      icon: TrendingUp,
      color: "from-purple-500 to-pink-500",
    },
  ];

  const recentInterviews = [
    {
      id: 1,
      position: "Senior Frontend Developer",
      date: "2 days ago",
      score: 85,
      status: "completed",
    },
    {
      id: 2,
      position: "Full Stack Engineer",
      date: "5 days ago",
      score: 78,
      status: "completed",
    },
    {
      id: 3,
      position: "Product Manager",
      date: "1 week ago",
      score: 72,
      status: "completed",
    },
  ];

  const skills = [
    { name: "React", level: 85 },
    { name: "Communication", level: 78 },
    { name: "Problem Solving", level: 82 },
    { name: "Leadership", level: 70 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome Back!
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Here's your interview performance overview
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                {stat.label}
              </p>
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
                  Extract skills & insights
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
                  Detailed performance analytics
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
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {recentInterviews.map((interview) => (
                <div
                  key={interview.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600 p-3 rounded-lg shadow-sm">
                      <Video className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {interview.position}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {interview.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 px-3 py-1.5 rounded-full text-sm font-semibold">
                      <Award className="w-4 h-4" />
                      <span>{interview.score}%</span>
                    </div>
                  </div>
                </div>
              ))}
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
              {skills.map((skill) => (
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
