// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Video, Mic, CheckCircle } from "lucide-react";
// import { ROUTES } from "../router";

// export default function MockInterview() {
//   const navigate = useNavigate();
//   const questions = [
//     {
//       id: 1,
//       category: "Technical",
//       text: "Can you explain the difference between RESTful and GraphQL APIs, and when would you use one over the other?",
//       duration: "5 minutes",
//     },
//     {
//       id: 2,
//       category: "Behavioral",
//       text: "Tell me about a time when you had to deal with a difficult team member. How did you handle the situation?",
//       duration: "5 minutes",
//     },
//     {
//       id: 3,
//       category: "Technical",
//       text: "How would you optimize the performance of a React application that is experiencing slow rendering?",
//       duration: "5 minutes",
//     },
//     {
//       id: 4,
//       category: "Problem Solving",
//       text: "Design a system for a ride-sharing application. What components would you include and how would they interact?",
//       duration: "10 minutes",
//     },
//   ];

//   const handleStartInterview = () => {
//     navigate(ROUTES.MOCK_INTERVIEW_SESSION);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
//       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
//         <div className="text-center mb-12">
//           <h1 className="text-4xl font-bold text-gray-900 mb-4">
//             AI Mock Interview
//           </h1>
//           <p className="text-xl text-gray-600">
//             Practice with our intelligent interviewer and get instant feedback
//           </p>
//         </div>

//         <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
//           <h2 className="text-2xl font-bold text-gray-900 mb-6">
//             Interview Details
//           </h2>

//           <div className="grid md:grid-cols-2 gap-6 mb-8">
//             <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
//               <p className="text-sm text-gray-600 mb-1">Position</p>
//               <p className="font-semibold text-gray-900">
//                 Senior Full Stack Developer
//               </p>
//             </div>
//             <div className="p-4 bg-green-50 rounded-xl border border-green-100">
//               <p className="text-sm text-gray-600 mb-1">Duration</p>
//               <p className="font-semibold text-gray-900">30 minutes</p>
//             </div>
//             <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
//               <p className="text-sm text-gray-600 mb-1">Questions</p>
//               <p className="font-semibold text-gray-900">
//                 {questions.length} Questions
//               </p>
//             </div>
//             <div className="p-4 bg-cyan-50 rounded-xl border border-cyan-100">
//               <p className="text-sm text-gray-600 mb-1">Difficulty</p>
//               <p className="font-semibold text-gray-900">Intermediate</p>
//             </div>
//           </div>

//           <div className="mb-8">
//             <h3 className="font-semibold text-gray-900 mb-4">
//               What to expect:
//             </h3>
//             <div className="space-y-3">
//               {[
//                 "Mix of technical and behavioral questions",
//                 "Real-time AI analysis of your responses",
//                 "Evaluation of communication clarity and confidence",
//                 "Detailed performance report at the end",
//               ].map((item, idx) => (
//                 <div key={idx} className="flex items-start space-x-3">
//                   <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
//                   <span className="text-gray-700">{item}</span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="bg-gray-50 rounded-xl p-6 mb-8">
//             <h3 className="font-semibold text-gray-900 mb-4">System Check</h3>
//             <div className="space-y-3">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-3">
//                   <Video className="w-5 h-5 text-gray-600" />
//                   <span className="text-gray-700">Camera Access</span>
//                 </div>
//                 <span className="text-green-600 font-medium">Ready</span>
//               </div>
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-3">
//                   <Mic className="w-5 h-5 text-gray-600" />
//                   <span className="text-gray-700">Microphone Access</span>
//                 </div>
//                 <span className="text-green-600 font-medium">Ready</span>
//               </div>
//             </div>
//           </div>

//           <button
//             onClick={handleStartInterview}
//             className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300"
//           >
//             Start Interview
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Video, Mic, CheckCircle } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";
import { ROUTES } from "../router";

export default function MockInterview() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const questions = [
    {
      id: 1,
      category: "Technical",
      text: "Can you explain the difference between RESTful and GraphQL APIs, and when would you use one over the other?",
      duration: "5 minutes",
    },
    {
      id: 2,
      category: "Behavioral",
      text: "Tell me about a time when you had to deal with a difficult team member. How did you handle the situation?",
      duration: "5 minutes",
    },
    {
      id: 3,
      category: "Technical",
      text: "How would you optimize the performance of a React application that is experiencing slow rendering?",
      duration: "5 minutes",
    },
    {
      id: 4,
      category: "Problem Solving",
      text: "Design a system for a ride-sharing application. What components would you include and how would they interact?",
      duration: "10 minutes",
    },
  ];

  const handleStartInterview = () => {
    navigate(ROUTES.MOCK_INTERVIEW_SESSION);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t("mockInterview.aiMockInterview")}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {t("mockInterview.practiceWithInterviewer")}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t("mockInterview.interviewDetails")}
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                {t("mockInterview.positionLabel")}
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {t("mockInterview.seniorFullStackDeveloper")}
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                {t("mockInterview.durationLabel")}
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {t("mockInterview.thirtyMinutes")}
              </p>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                {t("mockInterview.questionsLabel")}
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {t("mockInterview.fourQuestions")}
              </p>
            </div>
            <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl border border-cyan-100 dark:border-cyan-800">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                {t("mockInterview.difficultyLabel")}
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {t("mockInterview.intermediate")}
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {t("mockInterview.whatToExpect")}
            </h3>
            <div className="space-y-3">
              {[
                t("mockInterview.technicalBehavioral"),
                t("mockInterview.realtimeAnalysis"),
                t("mockInterview.evaluationCommunication"),
                t("mockInterview.detailedReport"),
              ].map((item, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {t("mockInterview.systemCheck")}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Video className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {t("mockInterview.cameraAccess")}
                  </span>
                </div>
                <span className="text-green-600 dark:text-green-400 font-medium">
                  {t("mockInterview.ready")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mic className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {t("mockInterview.microphoneAccess")}
                  </span>
                </div>
                <span className="text-green-600 dark:text-green-400 font-medium">
                  {t("mockInterview.ready")}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleStartInterview}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300"
          >
            {t("mockInterview.startInterview")}
          </button>
        </div>
      </div>
    </div>
  );
}
