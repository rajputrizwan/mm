import {
  CheckCircle,
  Star,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Award,
  Clock,
  ChevronRight,
  Home,
  AlertTriangle,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

interface FeedbackData {
  technical_knowledge: number;
  problem_solving: number;
  communication_skills: number;
  confidence: number;
  clarity: number;
  relevance: number;
  overall_score: number;
  strengths: string[];
  weaknesses: string[];
  observations: string[];
  suggestions: string[];
  recommendation: string;
}

interface LocationState {
  feedback: FeedbackData | null;
  candidateName: string;
  jobPosition: string;
  questionsAnswered: number;
  elapsedTime: string;
}

const SCORE_LABELS: Record<string, string> = {
  technical_knowledge: "Technical Knowledge",
  problem_solving: "Problem Solving",
  communication_skills: "Communication",
  confidence: "Confidence",
  clarity: "Clarity",
  relevance: "Relevance",
};

const SCORE_METRICS: (keyof FeedbackData)[] = [
  "technical_knowledge",
  "problem_solving",
  "communication_skills",
  "confidence",
  "clarity",
  "relevance",
];

const RECOMMENDATION_CONFIG: Record<
  string,
  { color: string; bg: string; border: string; icon: React.ReactNode }
> = {
  "Strong Hire": {
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    icon: <Award className="w-6 h-6 text-emerald-400" />,
  },
  Hire: {
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    icon: <CheckCircle className="w-6 h-6 text-green-400" />,
  },
  Neutral: {
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    icon: <MessageSquare className="w-6 h-6 text-yellow-400" />,
  },
  "No Hire": {
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    icon: <AlertTriangle className="w-6 h-6 text-red-400" />,
  },
};

function ScoreBar({ value }: { value: number }) {
  const clamped = Math.min(10, Math.max(0, value));
  const pct = clamped * 10;
  const color =
    clamped >= 7
      ? "from-cyan-500 to-blue-500"
      : clamped >= 5
        ? "from-yellow-500 to-orange-500"
        : "from-red-500 to-red-400";

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-bold text-white w-8 text-right">
        {clamped}/10
      </span>
    </div>
  );
}

/**
 * PublicInterviewComplete
 *
 * Shown at /interview/:uuid/summary after the Vapi interview ends.
 * Displays the structured Mistral feedback with scores, strengths,
 * weaknesses, and hiring recommendation.
 */
export default function PublicInterviewComplete() {
  const { uuid } = useParams<{ uuid: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const state = (location.state as LocationState) || {};
  const {
    feedback,
    candidateName = "Candidate",
    jobPosition = "the position",
    questionsAnswered = 0,
    elapsedTime = "—",
  } = state;

  const rec = feedback?.recommendation ?? "Neutral";
  const recConfig =
    RECOMMENDATION_CONFIG[rec] ?? RECOMMENDATION_CONFIG["Neutral"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-12">
        {/* ── Header ── */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-cyan-500/25">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Interview Complete!
          </h1>
          <p className="text-slate-400 text-lg max-w-lg mx-auto">
            Thank you{" "}
            <span className="text-white font-medium">{candidateName}</span>.
            Your interview for{" "}
            <span className="text-cyan-400 font-medium">{jobPosition}</span> has
            been recorded and evaluated.
          </p>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            {
              icon: <Star className="w-5 h-5 text-cyan-400" />,
              label: "Overall Score",
              value: feedback ? `${feedback.overall_score}/10` : "—",
            },
            {
              icon: <MessageSquare className="w-5 h-5 text-blue-400" />,
              label: "Questions Answered",
              value: String(questionsAnswered),
            },
            {
              icon: <Clock className="w-5 h-5 text-purple-400" />,
              label: "Duration",
              value: elapsedTime,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-5 text-center"
            >
              <div className="flex justify-center mb-2">{s.icon}</div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {feedback ? (
          <>
            {/* ── Recommendation banner ── */}
            <div
              className={`${recConfig.bg} border ${recConfig.border} rounded-2xl p-5 flex items-center gap-4 mb-8`}
            >
              {recConfig.icon}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                  Hiring Recommendation
                </p>
                <p className={`text-xl font-bold ${recConfig.color}`}>{rec}</p>
              </div>
            </div>

            {/* ── Skill scores ── */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 mb-6">
              <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                <Star className="w-5 h-5 text-cyan-400" />
                Performance Scores
              </h2>
              <div className="space-y-4">
                {SCORE_METRICS.map((key) => (
                  <div key={key}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm text-slate-400">
                        {SCORE_LABELS[key as string]}
                      </span>
                    </div>
                    <ScoreBar value={feedback[key] as number} />
                  </div>
                ))}
              </div>
            </div>

            {/* ── Strengths & Weaknesses ── */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Strengths */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Strengths
                </h2>
                {feedback.strengths.length > 0 ? (
                  <ul className="space-y-2">
                    {feedback.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-slate-300">{s}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">
                    No strengths identified.
                  </p>
                )}
              </div>

              {/* Weaknesses */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-400" />
                  Areas to Improve
                </h2>
                {feedback.weaknesses.length > 0 ? (
                  <ul className="space-y-2">
                    {feedback.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-slate-300">{w}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">
                    No specific weaknesses identified.
                  </p>
                )}
              </div>
            </div>

            {/* ── Observations ── */}
            {feedback.observations.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 mb-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                  Observations
                </h2>
                <ul className="space-y-2">
                  {feedback.observations.map((o, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-300">{o}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Suggestions ── */}
            {feedback.suggestions.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 mb-8">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  Suggestions for Improvement
                </h2>
                <ul className="space-y-2">
                  {feedback.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm text-slate-300">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          /* ── No feedback state ── */
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-10 text-center mb-8">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-white font-semibold text-lg mb-2">
              Feedback Unavailable
            </h3>
            <p className="text-slate-400 text-sm">
              Your interview was recorded but the AI evaluation could not be
              generated. Our team will review your session manually.
            </p>
          </div>
        )}

        {/* ── Next steps ── */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">
            What happens next?
          </h2>
          <ul className="space-y-2 text-sm text-slate-400">
            {[
              "Your interview transcript and evaluation have been saved.",
              "The hiring team will review your evaluation shortly.",
              "You will be contacted via email with the next steps.",
              "Feel free to reach out if you have any questions.",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Action ── */}
        <div className="text-center">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-cyan-500/25 transition-all"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
