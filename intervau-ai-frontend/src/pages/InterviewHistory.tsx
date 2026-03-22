import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Award,
  BarChart3,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  Download,
  Loader2,
  MessageSquare,
  Search,
  Share2,
  TrendingUp,
} from "lucide-react";
import api, { type MockInterviewSessionDetail } from "../services/api";
import { ROUTES, routeHelpers } from "../router";

function formatDate(
  iso: string | { $date?: string } | undefined,
  includeTime = false,
) {
  const str = typeof iso === "string" ? iso : iso?.$date;
  if (!str) return "-";

  const d = new Date(str);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

function formatTimestamp(iso: string | undefined) {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function scoreColor(score: number) {
  if (score >= 85) return "text-green-600 dark:text-green-400";
  if (score >= 70) return "text-blue-600 dark:text-blue-400";
  if (score >= 55) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

function scoreBadgeColor(score: number) {
  if (score >= 85) {
    return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800";
  }
  if (score >= 70) {
    return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800";
  }
  return "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800";
}

function scoreBackground(score: number) {
  if (score >= 85) {
    return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
  }
  if (score >= 70) {
    return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
  }
  if (score >= 55) {
    return "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800";
  }
  return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
}

function statusBadge(status: string) {
  if (status === "completed") {
    return "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800";
  }
  if (status === "in_progress") {
    return "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800";
  }
  return "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700";
}

function inferOverallScore(session: MockInterviewSessionDetail) {
  if (typeof session.metrics?.overallScore === "number") {
    return session.metrics.overallScore;
  }

  const scored = session.questions.filter(
    (q) => typeof q.aiAnalysis?.score === "number",
  );
  if (!scored.length) return 0;

  return Math.round(
    scored.reduce((sum, q) => sum + (q.aiAnalysis?.score || 0), 0) /
      scored.length,
  );
}

function inferStrengths(session: MockInterviewSessionDetail) {
  if (session.summary?.strengths?.length) return session.summary.strengths;

  const all = session.questions.flatMap((q) => q.aiAnalysis?.strengths || []);
  return Array.from(new Set(all.map((x) => x.trim()).filter(Boolean))).slice(
    0,
    5,
  );
}

function inferImprovements(session: MockInterviewSessionDetail) {
  if (session.summary?.areasForImprovement?.length) {
    return session.summary.areasForImprovement;
  }

  const all = session.questions.flatMap(
    (q) => q.aiAnalysis?.improvements || [],
  );
  return Array.from(new Set(all.map((x) => x.trim()).filter(Boolean))).slice(
    0,
    5,
  );
}

function inferRecommendations(session: MockInterviewSessionDetail) {
  if (session.summary?.recommendations?.length)
    return session.summary.recommendations;
  if (session.metrics?.recommendation) return [session.metrics.recommendation];

  return [
    "Review feedback and focus on the lowest-scoring areas.",
    "Practice timed answers to improve pacing and clarity.",
    "Do another mock session this week to track improvement.",
  ];
}

export default function InterviewHistory() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "mock" | "live">("all");

  const [list, setList] = useState<MockInterviewSessionDetail[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  const [detail, setDetail] = useState<MockInterviewSessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailTab, setDetailTab] = useState<
    "overview" | "metrics" | "transcript"
  >("overview");

  const isDetailView = Boolean(sessionId);

  useEffect(() => {
    if (isDetailView && sessionId) {
      setLoading(true);
      api.getMockInterviewSession(sessionId).then((res) => {
        setLoading(false);
        if (res.success && res.data)
          setDetail(res.data as MockInterviewSessionDetail);
        else setDetail(null);
      });
      return;
    }

    setLoading(true);
    api.getCompletedMockInterviewHistory({ limit: 20, page: 1 }).then((res) => {
      setLoading(false);
      if (res.success && res.data) {
        setList(res.data.sessions || []);
        setPagination(
          res.data.pagination || {
            total: 0,
            page: 1,
            limit: 20,
            totalPages: 0,
          },
        );
      } else {
        setList([]);
      }
    });
  }, [isDetailView, sessionId]);

  const filteredSessions = useMemo(() => {
    return list.filter((session) => {
      const matchesType =
        filterType === "all" || (filterType === "mock" ? true : false);

      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        q.length === 0 ||
        session.position.toLowerCase().includes(q) ||
        session.sessionId.toLowerCase().includes(q);

      return matchesType && matchesSearch;
    });
  }, [list, filterType, searchTerm]);

  const totalDuration = useMemo(
    () =>
      filteredSessions.reduce((sum, s) => sum + (Number(s.duration) || 0), 0),
    [filteredSessions],
  );

  const averageScore = useMemo(() => {
    if (!filteredSessions.length) return 0;
    const total = filteredSessions.reduce(
      (sum, s) => sum + inferOverallScore(s),
      0,
    );
    return Math.round(total / filteredSessions.length);
  }, [filteredSessions]);

  const handleBack = () => {
    if (isDetailView) navigate(ROUTES.INTERVIEW_HISTORY);
    else navigate(ROUTES.CANDIDATE_DASHBOARD);
  };

  const handleShare = async () => {
    if (!isDetailView || !detail) return;

    const url = `${window.location.origin}${routeHelpers.interviewHistorySession(detail.sessionId)}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Intentionally silent fallback for browsers without clipboard support.
    }
  };

  const handleDownload = () => {
    window.print();
  };

  if (loading && isDetailView && !detail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (isDetailView && !detail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Session not found.
          </p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to history
          </button>
        </div>
      </div>
    );
  }

  if (isDetailView && detail) {
    const m = detail.metrics;
    const overallScore = inferOverallScore(detail);
    const aiAnalysisScore =
      m?.aiAnalysisPercentage ?? Math.min(100, overallScore + 5);
    const resumeMatchScore =
      m?.resumeMatchPercentage ?? Math.max(0, Math.min(100, overallScore));

    const strengths = inferStrengths(detail);
    const improvements = inferImprovements(detail);
    const recommendations = inferRecommendations(detail);

    const rating =
      m?.overallRating ||
      (overallScore >= 85
        ? "Excellent"
        : overallScore >= 70
          ? "Good"
          : overallScore >= 55
            ? "Average"
            : "Needs Improvement");

    const quickStats = {
      responseTime:
        m?.averageResponseTime != null ? `${m.averageResponseTime}s avg` : "-",
      wordsSpoken: m?.totalWordsSpoken ?? 0,
      fillerWords: m?.fillerWords ?? 0,
      speakingPace:
        m?.speakingPaceWPM != null ? `${m.speakingPaceWPM} WPM` : "-",
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to History</span>
            </button>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span className="text-sm font-medium">Share</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Download</span>
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {detail.position}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                      Mock Interview Session
                    </p>
                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                      <span>Mock Interview</span>
                      <span>•</span>
                      <span>
                        {formatDate(detail.completedAt || detail.createdAt)}
                      </span>
                      <span>•</span>
                      <span>{detail.duration} minutes</span>
                    </div>
                  </div>
                  <div
                    className={`w-28 h-28 rounded-3xl flex items-center justify-center border-4 ${scoreBackground(overallScore)}`}
                  >
                    <div className="text-center">
                      <div
                        className={`text-5xl font-bold ${scoreColor(overallScore)}`}
                      >
                        {overallScore}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">
                        Score
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        AI Analysis
                      </span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {aiAnalysisScore}%
                      </span>
                    </div>
                    <div className="w-full bg-blue-200/30 dark:bg-blue-900/30 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 h-3 rounded-full"
                        style={{ width: `${aiAnalysisScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Resume Match
                      </span>
                      <span className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                        {resumeMatchScore}%
                      </span>
                    </div>
                    <div className="w-full bg-cyan-200/30 dark:bg-cyan-900/30 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-cyan-600 dark:from-cyan-400 dark:to-cyan-500 h-3 rounded-full"
                        style={{ width: `${resumeMatchScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                  {(["overview", "metrics", "transcript"] as const).map(
                    (tab) => (
                      <button
                        key={tab}
                        onClick={() => setDetailTab(tab)}
                        className={`px-6 py-4 font-medium transition-colors capitalize ${
                          detailTab === tab
                            ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                        }`}
                      >
                        {tab}
                      </button>
                    ),
                  )}
                </div>

                <div className="p-8">
                  {detailTab === "overview" && (
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                          <span>Strengths</span>
                        </h3>
                        <div className="space-y-3">
                          {strengths.length > 0 ? (
                            strengths.map((strength, idx) => (
                              <div
                                key={idx}
                                className="flex items-start space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800"
                              >
                                <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full mt-2 flex-shrink-0" />
                                <p className="text-gray-700 dark:text-gray-300">
                                  {strength}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 dark:text-gray-400">
                              No strengths available.
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                          <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                          <span>Areas for Improvement</span>
                        </h3>
                        <div className="space-y-3">
                          {improvements.length > 0 ? (
                            improvements.map((improvement, idx) => (
                              <div
                                key={idx}
                                className="flex items-start space-x-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-800"
                              >
                                <div className="w-2 h-2 bg-orange-600 dark:bg-orange-400 rounded-full mt-2 flex-shrink-0" />
                                <p className="text-gray-700 dark:text-gray-300">
                                  {improvement}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 dark:text-gray-400">
                              No improvement areas available.
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                          <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          <span>Recommendations</span>
                        </h3>
                        <div className="space-y-3">
                          {recommendations.map((rec, idx) => (
                            <div
                              key={idx}
                              className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800"
                            >
                              <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                              <p className="text-gray-700 dark:text-gray-300">
                                {rec}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {detailTab === "metrics" && (
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
                          <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          <span>Performance Metrics</span>
                        </h3>

                        <div className="grid md:grid-cols-2 gap-6">
                          {[
                            { label: "Overall Score", value: overallScore },
                            { label: "Confidence", value: m?.confidence ?? 0 },
                            { label: "Clarity", value: m?.clarity ?? 0 },
                            {
                              label: "Technical Accuracy",
                              value: m?.technicalAccuracy ?? 0,
                            },
                            {
                              label: "Communication",
                              value: m?.communicationSkills ?? 0,
                            },
                            { label: "AI Analysis", value: aiAnalysisScore },
                          ].map((metric) => (
                            <div key={metric.label} className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                  {metric.label}
                                </span>
                                <span
                                  className={`font-bold ${scoreColor(metric.value)}`}
                                >
                                  {metric.value}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                <div
                                  className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2.5 rounded-full"
                                  style={{
                                    width: `${Math.max(0, Math.min(100, metric.value))}%`,
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {detail.summary?.keyInsights?.length ? (
                        <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                            Key Insights
                          </h4>
                          <ul className="space-y-3">
                            {detail.summary.keyInsights.map((insight, idx) => (
                              <li
                                key={idx}
                                className="flex items-start space-x-3"
                              >
                                <Award className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700 dark:text-gray-300">
                                  {insight}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {detailTab === "transcript" && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                        <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        <span>Interview Transcript</span>
                      </h3>

                      {detail.transcript?.length ? (
                        <div className="space-y-4">
                          {detail.transcript.map((entry, i) => (
                            <div key={i}>
                              <div className="flex items-center justify-between mb-1">
                                <span
                                  className={`text-sm font-semibold ${
                                    entry.speaker === "ai"
                                      ? "text-gray-700 dark:text-gray-300"
                                      : "text-blue-600 dark:text-blue-400"
                                  }`}
                                >
                                  {entry.speaker === "ai"
                                    ? "Interviewer"
                                    : "Candidate"}
                                </span>
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                  {formatTimestamp(entry.timestamp)}
                                </span>
                              </div>
                              <div className="p-4 bg-gray-50 dark:bg-gray-700/40 rounded-lg border border-gray-100 dark:border-gray-700">
                                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                  {entry.text}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">
                          No transcript available.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Performance Summary
                </h3>
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Overall Rating
                    </p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {rating}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Recommendation
                    </p>
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      {m?.recommendation ||
                        "Keep practicing and retake a focused mock"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Quick Stats
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Response Time
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {quickStats.responseTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Words Spoken
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {quickStats.wordsSpoken}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Filler Words
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {quickStats.fillerWords}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Speaking Pace
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {quickStats.speakingPace}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-lg p-6 text-white">
                <h3 className="text-2xl font-bold mb-4">Next Steps</h3>
                <ol className="space-y-3">
                  {recommendations.slice(0, 3).map((step, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-sm text-blue-100">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Interview history
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            View and analyze your past interview sessions
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 mb-6">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1 relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, role, or interview..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-1">
                {(["all", "mock", "live"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors capitalize ${
                      filterType === type
                        ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-gray-600"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              </div>
            ) : filteredSessions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Name / role
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Type
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Duration
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Score
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Status
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSessions.map((session) => {
                      const score = inferOverallScore(session);

                      return (
                        <tr
                          key={session.sessionId}
                          className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                Interview Candidate
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[220px]">
                                {session.position}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                              <span>MOCK</span>
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {formatDate(
                                  session.completedAt || session.createdAt,
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                              <Clock className="w-4 h-4" />
                              <span>{session.duration} min</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${scoreBadgeColor(score)}`}
                            >
                              {score}%
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge(
                                session.status,
                              )}`}
                            >
                              <div className="w-2 h-2 rounded-full bg-current" />
                              <span>{session.status}</span>
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() =>
                                navigate(
                                  routeHelpers.interviewHistorySession(
                                    session.sessionId,
                                  ),
                                )
                              }
                              className="inline-flex items-center justify-center w-8 h-8 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  No interviews found.
                </p>
              </div>
            )}

            {pagination.totalPages > 1 && (
              <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                Page {pagination.page} of {pagination.totalPages} (
                {pagination.total} total)
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Total interviews
              </h3>
              <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {filteredSessions.length}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Across all types
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Average score
              </h3>
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {averageScore}%
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Performance average
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Total duration
              </h3>
              <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {totalDuration} min
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Total interview time
            </p>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" /> Back to dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
