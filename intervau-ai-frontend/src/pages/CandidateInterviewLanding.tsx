import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Briefcase,
  Clock,
  FileText,
  ArrowRight,
  Sparkles,
  CheckCircle,
  User,
  Mail,
  Shield,
  Play,
} from "lucide-react";
import toast from "react-hot-toast";
import SystemCheckModule from "../components/interview/SystemCheckModule";
import {
  saveSession,
  hasActiveSession,
  loadSession,
} from "../components/interview/InterviewSessionStorage";

interface InterviewDetails {
  id: string;
  jobPosition: string;
  jobDescription: string;
  interviewType: "mock" | "live";
  duration: number;
  questionCount: number;
  aiSettings: {
    difficultyLevel: string;
    autoScore: boolean;
    enableAiFeedback: boolean;
  };
}

/**
 * CandidateInterviewLanding - Dark-themed landing page for candidates
 * Includes name/email entry, interview details, and system check
 */
export default function CandidateInterviewLanding() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [interview, setInterview] = useState<InterviewDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [systemCheckPassed, setSystemCheckPassed] = useState(false);
  const [showSystemCheck, setShowSystemCheck] = useState(false);
  const [starting, setStarting] = useState(false);

  // Fetch interview details
  useEffect(() => {
    const fetchInterview = async () => {
      if (!uuid) {
        setError("Invalid interview link");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/interview-session/public/${uuid}`,
        );
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Interview not found.");
        }

        setInterview(data.data);

        // Check for existing session
        if (hasActiveSession(uuid)) {
          const existingSession = loadSession();
          if (existingSession) {
            setCandidateName(existingSession.candidateName);
            setCandidateEmail(existingSession.candidateEmail);
            toast.success("Previous session restored.");
          }
        }
      } catch (err: any) {
        setError(err.message || "Unable to load the interview.");
      } finally {
        setLoading(false);
      }
    };

    fetchInterview();
  }, [uuid]);

  // Handle start interview
  const handleStartInterview = async () => {
    if (!candidateName.trim() || !candidateEmail.trim()) {
      toast.error("Please enter your name and email.");
      return;
    }

    if (!systemCheckPassed) {
      toast.error("Please complete the system check first.");
      setShowSystemCheck(true);
      return;
    }

    setStarting(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/interview-session/start`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            shareableLink: uuid,
            candidateName,
            candidateEmail,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to start the interview.");
      }

      // Save session
      saveSession({
        sessionId: data.data.sessionId,
        candidateName,
        candidateEmail,
        jobPosition: data.data.jobPosition,
        shareableLink: uuid!,
        currentQuestionIndex: 0,
        totalQuestions: data.data.totalQuestions,
        transcript: [],
        startedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      });

      // Navigate to interview session
      navigate(`/interview/${uuid}/session`, {
        state: {
          sessionId: data.data.sessionId,
          candidateName,
          ...data.data,
        },
      });
    } catch (err: any) {
      toast.error(err.message || "Unable to start the interview.");
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading interview...</p>
        </div>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">
            Interview not found
          </h1>
          <p className="text-slate-400 mb-6">
            {error || "This interview link is invalid or has expired."}
          </p>
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-xl hover:shadow-lg transition-all"
          >
            Go home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-400">
              AI-powered interview
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome to your interview
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Get ready for an AI-powered interview. Make sure your camera and
            microphone are working.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Interview Details */}
          <div className="space-y-6">
            {/* Position Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">
                    {interview.jobPosition}
                  </h2>
                  <span className="inline-flex items-center px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-xs font-medium text-cyan-400 capitalize">
                    {interview.interviewType} interview
                  </span>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">
                {interview.jobDescription}
              </p>
            </div>

            {/* Interview Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  <span className="text-sm text-slate-400">Duration</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {interview.duration} min
                </p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-slate-400">Questions</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {interview.questionCount}
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                What to expect
              </h3>
              <ul className="space-y-3">
                {[
                  "An AI interviewer will guide you through the questions.",
                  "Speak naturally—the AI can understand you.",
                  interview.aiSettings.autoScore &&
                    "Real-time scoring of your responses.",
                  interview.aiSettings.enableAiFeedback &&
                    "Detailed feedback after completion.",
                ]
                  .filter(Boolean)
                  .map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-300">{item}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>

          {/* Right: Form and System Check */}
          <div className="space-y-6">
            {/* Candidate Info Form */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-cyan-400" />
                Your information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Full name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="email"
                      value={candidateEmail}
                      onChange={(e) => setCandidateEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* System Check */}
            {showSystemCheck ? (
              <SystemCheckModule
                onCheckComplete={(passed) => {
                  setSystemCheckPassed(passed);
                  if (passed) {
                    toast.success(
                      "System check passed. You can start the interview.",
                    );
                  }
                }}
              />
            ) : (
              <button
                onClick={() => setShowSystemCheck(true)}
                className="w-full bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 text-left hover:border-cyan-500/50 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        systemCheckPassed
                          ? "bg-green-500/20"
                          : "bg-slate-700/50 group-hover:bg-cyan-500/20"
                      }`}
                    >
                      <Shield
                        className={`w-6 h-6 ${
                          systemCheckPassed
                            ? "text-green-500"
                            : "text-slate-400 group-hover:text-cyan-400"
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">System check</h3>
                      <p className="text-sm text-slate-400">
                        {systemCheckPassed
                          ? "All systems are ready."
                          : "Verify your camera and microphone."}
                      </p>
                    </div>
                  </div>
                  {systemCheckPassed ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                  )}
                </div>
              </button>
            )}

            {/* Start Button */}
            <button
              onClick={handleStartInterview}
              disabled={
                !candidateName ||
                !candidateEmail ||
                !systemCheckPassed ||
                starting
              }
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3 ${
                candidateName &&
                candidateEmail &&
                systemCheckPassed &&
                !starting
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-xl hover:shadow-cyan-500/25"
                  : "bg-slate-700 text-slate-400 cursor-not-allowed"
              }`}
            >
              {starting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Start interview
                </>
              )}
            </button>

            {/* Privacy Notice */}
            <p className="text-xs text-slate-500 text-center">
              By starting, you agree to have your interview recorded for
              evaluation. Your data is handled securely in accordance with our
              privacy policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
