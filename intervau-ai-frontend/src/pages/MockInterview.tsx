import { useNavigate } from "react-router-dom";
import { Rocket, Briefcase } from "lucide-react";
import { ROUTES } from "../router";
import InterviewSelectionCard from "../components/interview/InterviewSelectionCard";
import toast from "react-hot-toast";

export default function MockInterview() {
  const navigate = useNavigate();

  const handleMockInterviewClick = () => {
    // Navigate to mock interview session setup
    navigate(ROUTES.MOCK_INTERVIEW_SETUP);
  };

  const handleProfessionalInterviewClick = () => {
    // For now, show a message
    toast("Professional interviews will be available when HR invites you.", {
      icon: "ℹ️",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-500 bg-clip-text text-transparent mb-4 dark:from-blue-400 dark:via-cyan-400 dark:to-blue-300">
            Choose Your Interview Path
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Practice with AI or join professional interviews scheduled by HR teams
          </p>
        </div>

        {/* Interview Cards Grid */}
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto mb-16">
          {/* Mock Interview Card */}
          <InterviewSelectionCard
            title="Mock Interview"
            description="Practice and polish your skills with our AI interviewer. Get instant feedback, work on your confidence, and ace your next real interview."
            icon={Rocket}
            ctaText="Start Practice Session"
            onClick={handleMockInterviewClick}
            variant="practice"
          />

          {/* Professional Interview Card */}
          <InterviewSelectionCard
            title="Professional Interview"
            description="Join formal interviews scheduled by HR teams. This is your opportunity to showcase your skills for real job positions."
            icon={Briefcase}
            ctaText="View Invitations"
            onClick={handleProfessionalInterviewClick}
            locked={true}
            lockMessage="Professional interviews are accessible when you receive an invitation from an HR team."
            variant="professional"
          />
        </div>

        {/* Feature Comparison Section */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-200/50 dark:border-gray-700/50">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              What's the Difference?
            </h3>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Mock Interview Features */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Rocket className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                    Mock Interview
                  </h4>
                </div>
                <ul className="space-y-3">
                  {[
                    "Available anytime, anywhere",
                    "AI-powered questions & feedback",
                    "Practice without pressure",
                    "Improve communication skills",
                    "Track your progress over time",
                    "No approval needed",
                  ].map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Professional Interview Features */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                    Professional Interview
                  </h4>
                </div>
                <ul className="space-y-3">
                  {[
                    "Scheduled by HR teams",
                    "Real job opportunities",
                    "Company-specific questions",
                    "Official evaluation process",
                    "Results shared with employer",
                    "Requires email invitation",
                  ].map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Not sure where to start?
                </p>
                <button
                  onClick={handleMockInterviewClick}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Try a Mock Interview First
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
