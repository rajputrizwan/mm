// import { useNavigate } from "react-router-dom";
// import { useTranslation } from "../hooks/useTranslation";
// import {
//   Briefcase,
//   Users,
//   TrendingUp,
//   Clock,
//   CheckCircle,
//   AlertCircle,
// } from "lucide-react";
// import { ROUTES } from "../router";

// export default function HRDashboard() {
//   const navigate = useNavigate();
//   const { t } = useTranslation();
//   const metrics = [
//     {
//       label: t("hrDashboard.openPositions"),
//       value: "12",
//       change: `+2 ${t("hrDashboard.thisWeek")}`,
//       icon: Briefcase,
//       color: "from-blue-500 to-cyan-500",
//     },
//     {
//       label: t("hrDashboard.activeCandidates"),
//       value: "147",
//       change: `+23 ${t("hrDashboard.thisWeek")}`,
//       icon: Users,
//       color: "from-green-500 to-emerald-500",
//     },
//     {
//       label: t("hrDashboard.interviewsScheduled"),
//       value: "31",
//       change: `18 ${t("hrDashboard.thisWeek")}`,
//       icon: Clock,
//       color: "from-orange-500 to-amber-500",
//     },
//     {
//       label: t("hrDashboard.offersExtended"),
//       value: "8",
//       change: `+3 ${t("hrDashboard.thisWeek")}`,
//       icon: CheckCircle,
//       color: "from-purple-500 to-pink-500",
//     },
//   ];

//   const recentApplications = [
//     {
//       id: 1,
//       name: "Alex Martinez",
//       position: "Senior Frontend Developer",
//       score: 92,
//       status: "qualified",
//       appliedDate: "2 hours ago",
//     },
//     {
//       id: 2,
//       name: "Jordan Lee",
//       position: "Full Stack Engineer",
//       score: 85,
//       status: "qualified",
//       appliedDate: "4 hours ago",
//     },
//     {
//       id: 3,
//       name: "Casey Chen",
//       position: "Product Manager",
//       score: 78,
//       status: "interview",
//       appliedDate: "1 day ago",
//     },
//     {
//       id: 4,
//       name: "Morgan Smith",
//       position: "DevOps Engineer",
//       score: 68,
//       status: "review",
//       appliedDate: "2 days ago",
//     },
//   ];

//   const interviewsThisWeek = [
//     {
//       id: 1,
//       candidate: "Alex Martinez",
//       position: "Senior Frontend Developer",
//       date: "Today at 2:00 PM",
//       type: "live",
//     },
//     {
//       id: 2,
//       candidate: "Casey Chen",
//       position: "Product Manager",
//       date: "Tomorrow at 10:00 AM",
//       type: "live",
//     },
//     {
//       id: 3,
//       candidate: "Jordan Lee",
//       position: "Full Stack Engineer",
//       date: "Wed at 3:30 PM",
//       type: "mock",
//     },
//   ];

//   const departmentStats = [
//     { dept: "Engineering", open: 7, qualified: 45, status: "active" },
//     { dept: "Product", open: 2, qualified: 28, status: "active" },
//     { dept: "Design", open: 1, qualified: 15, status: "active" },
//     { dept: "Operations", open: 2, qualified: 59, status: "active" },
//   ];

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "qualified":
//         return "bg-green-100 text-green-700 border border-green-200";
//       case "interview":
//         return "bg-blue-100 text-blue-700 border border-blue-200";
//       case "review":
//         return "bg-yellow-100 text-yellow-700 border border-yellow-200";
//       default:
//         return "bg-gray-100 text-gray-700 border border-gray-200";
//     }
//   };

//   const getStatusLabel = (status: string) => {
//     switch (status) {
//       case "qualified":
//         return t("hrDashboard.qualified");
//       case "interview":
//         return t("hrDashboard.inInterview");
//       case "review":
//         return t("hrDashboard.underReview");
//       default:
//         return status;
//     }
//   };

//   return (
//     <div>
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900 mb-2">
//           {t("hrDashboard.title")}
//         </h1>
//         <p className="text-gray-600">{t("hrDashboard.subtitle")}</p>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         {metrics.map((metric) => (
//           <div
//             key={metric.label}
//             className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg hover:shadow-xl border-2 border-gray-100 p-6 transition-all duration-200"
//           >
//             <div className="flex items-start justify-between mb-4">
//               <div
//                 className={`bg-gradient-to-br ${metric.color} p-3 rounded-xl shadow-md`}
//               >
//                 <metric.icon className="w-6 h-6 text-white" />
//               </div>
//             </div>
//             <h3 className="text-3xl font-bold text-gray-900 mb-1">
//               {metric.value}
//             </h3>
//             <p className="text-sm font-semibold text-gray-700 mb-2">
//               {metric.label}
//             </p>
//             <p className="text-xs text-gray-600 font-medium">{metric.change}</p>
//           </div>
//         ))}
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
//         <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 border border-gray-200">
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-xl font-bold text-gray-900">
//               {t("hrDashboard.recentApplications")}
//             </h2>
//             <button
//               onClick={() => navigate(ROUTES.HR_CANDIDATES)}
//               className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
//             >
//               {t("hrDashboard.viewAll")}
//             </button>
//           </div>
//           <div className="space-y-3">
//             {recentApplications.map((app) => (
//               <button
//                 key={app.id}
//                 onClick={() =>
//                   navigate(
//                     ROUTES.CANDIDATE_REVIEW.replace(
//                       ":candidateId",
//                       candidate.id
//                     )
//                   )
//                 }
//                 className="w-full flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-all group"
//               >
//                 <div className="flex items-start space-x-4 flex-1 text-left">
//                   <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
//                     <span className="text-white font-semibold text-sm">
//                       {app.name.charAt(0)}
//                     </span>
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
//                       {app.name}
//                     </h3>
//                     <p className="text-sm text-gray-600">{app.position}</p>
//                     <p className="text-xs text-gray-500 mt-1">
//                       {app.appliedDate}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-center space-x-4">
//                   <div
//                     className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(
//                       app.status
//                     )}`}
//                   >
//                     {getStatusLabel(app.status)}
//                   </div>
//                   <div className="text-right">
//                     <div className="text-lg font-bold text-blue-600">
//                       {app.score}%
//                     </div>
//                     <div className="text-xs text-gray-500">
//                       {t("hrDashboard.aiScore")}
//                     </div>
//                   </div>
//                 </div>
//               </button>
//             ))}
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
//           <h2 className="text-xl font-bold text-gray-900 mb-6">
//             {t("hrDashboard.interviewsThisWeek")}
//           </h2>
//           <div className="space-y-4">
//             {interviewsThisWeek.map((interview) => (
//               <div
//                 key={interview.id}
//                 className="border-l-4 border-blue-500 pl-4 pb-4 bg-gray-50 rounded-r-lg pr-4 pt-3"
//               >
//                 <div className="flex items-start justify-between mb-2">
//                   <h4 className="font-semibold text-gray-900 text-sm">
//                     {interview.candidate}
//                   </h4>
//                   <span
//                     className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
//                       interview.type === "live"
//                         ? "bg-blue-100 text-blue-700 border-blue-200"
//                         : "bg-cyan-100 text-cyan-700 border-cyan-200"
//                     }`}
//                   >
//                     {interview.type === "live"
//                       ? t("hrDashboard.live")
//                       : t("hrDashboard.mock")}
//                   </span>
//                 </div>
//                 <p className="text-xs text-gray-600 mb-2">
//                   {interview.position}
//                 </p>
//                 <p className="text-xs text-gray-500">{interview.date}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
//         <h2 className="text-xl font-bold text-gray-900 mb-6">
//           {t("hrDashboard.hiringByDepartment")}
//         </h2>
//         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
//           {departmentStats.map((dept) => (
//             <div
//               key={dept.dept}
//               className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-100"
//             >
//               <h3 className="font-semibold text-gray-900 mb-4">{dept.dept}</h3>
//               <div className="space-y-4">
//                 <div>
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="text-xs font-medium text-gray-700">
//                       {t("hrDashboard.openPositions")}
//                     </span>
//                     <span className="text-sm font-bold text-blue-600">
//                       {dept.open}
//                     </span>
//                   </div>
//                   <div className="w-full bg-white rounded-full h-2.5">
//                     <div
//                       className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full"
//                       style={{ width: "70%" }}
//                     />
//                   </div>
//                 </div>
//                 <div>
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="text-xs font-medium text-gray-700">
//                       {t("hrDashboard.qualifiedCandidates")}
//                     </span>
//                     <span className="text-sm font-bold text-green-600">
//                       {dept.qualified}
//                     </span>
//                   </div>
//                   <div className="w-full bg-white rounded-full h-2.5">
//                     <div
//                       className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full"
//                       style={{
//                         width: `${Math.min(
//                           (dept.qualified / 100) * 100,
//                           100
//                         )}%`,
//                       }}
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

import { useNavigate } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";
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
  const { t } = useTranslation();
  const metrics = [
    {
      label: t("hrDashboard.openPositions"),
      value: "12",
      change: `+2 ${t("hrDashboard.thisWeek")}`,
      icon: Briefcase,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: t("hrDashboard.activeCandidates"),
      value: "147",
      change: `+23 ${t("hrDashboard.thisWeek")}`,
      icon: Users,
      color: "from-green-500 to-emerald-500",
    },
    {
      label: t("hrDashboard.interviewsScheduled"),
      value: "31",
      change: `18 ${t("hrDashboard.thisWeek")}`,
      icon: Clock,
      color: "from-orange-500 to-amber-500",
    },
    {
      label: t("hrDashboard.offersExtended"),
      value: "8",
      change: `+3 ${t("hrDashboard.thisWeek")}`,
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
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800";
      case "interview":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800";
      case "review":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "qualified":
        return t("hrDashboard.qualified");
      case "interview":
        return t("hrDashboard.inInterview");
      case "review":
        return t("hrDashboard.underReview");
      default:
        return status;
    }
  };

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric) => (
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
              {recentApplications.map((app) => (
                <button
                  key={app.id}
                  onClick={() =>
                    navigate(
                      ROUTES.CANDIDATE_REVIEW.replace(
                        ":candidateId",
                        app.id.toString()
                      )
                    )
                  }
                  className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-700 transition-all group"
                >
                  <div className="flex items-start space-x-4 flex-1 text-left">
                    <div className="bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="text-white font-semibold text-sm">
                        {app.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {app.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {app.position}
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
                      {getStatusLabel(app.status)}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {app.score}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {t("hrDashboard.aiScore")}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {t("hrDashboard.interviewsThisWeek")}
            </h2>
            <div className="space-y-4">
              {interviewsThisWeek.map((interview) => (
                <div
                  key={interview.id}
                  className="border-l-4 border-blue-500 dark:border-blue-400 pl-4 pb-4 bg-gray-50 dark:bg-gray-700/50 rounded-r-lg pr-4 pt-3"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {interview.candidate}
                    </h4>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        interview.type === "live"
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
                    {interview.position}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {interview.date}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            {t("hrDashboard.hiringByDepartment")}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {departmentStats.map((dept) => (
              <div
                key={dept.dept}
                className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-100 dark:border-blue-800"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  {dept.dept}
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {t("hrDashboard.openPositions")}
                      </span>
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {dept.open}
                      </span>
                    </div>
                    <div className="w-full bg-white dark:bg-gray-700 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 h-2.5 rounded-full"
                        style={{ width: "70%" }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {t("hrDashboard.qualifiedCandidates")}
                      </span>
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        {dept.qualified}
                      </span>
                    </div>
                    <div className="w-full bg-white dark:bg-gray-700 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-400 dark:to-green-500 h-2.5 rounded-full"
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
    </div>
  );
}
