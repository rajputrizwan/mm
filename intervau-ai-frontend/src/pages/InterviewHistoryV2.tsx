import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  BarChart3,
  ChevronRight,
  Loader2,
  Award,
  Target,
  ThumbsUp,
  Lightbulb,
} from "lucide-react";
import api, { type MockInterviewSessionDetail } from "../services/api";
import { ROUTES, routeHelpers } from "../router";

function formatDate(iso: string | { $date?: string } | undefined) {
  const str = typeof iso === "string" ? iso : iso?.$date;
  if (!str) return "—";
  const d = new Date(str);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
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

export default function InterviewHistoryV2() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const [list, setList] = useState<MockInterviewSessionDetail[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [detail, setDetail] = useState<MockInterviewSessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailTab, setDetailTab] = useState<"overview" | "questions" | "transcript">("overview");

  const isDetailView = Boolean(sessionId);

  useEffect(() => {
    if (isDetailView && sessionId) {
      setLoading(true);
      api.getMockInterviewSession(sessionId).then((res) => {
        setLoading(false);
        if (res.success && res.data) setDetail(res.data as MockInterviewSessionDetail);
        else setDetail(null);
      });
    } else {
      setLoading(true);
      api.getMockInterviewHistoryV2({ limit: 20, page: 1 }).then((res) => {
        setLoading(false);
        if (res.success && res.data) {
          setList(res.data.sessions || []);
          setPagination(res.data.pagination || { total: 0, page: 1, limit: 20, totalPages: 0 });
        } else {
          setList([]);
        }
      });
    }
  }, [isDetailView, sessionId]);

  const handleBack = () => {
    if (isDetailView) navigate(ROUTES.INTERVIEW_HISTORY_V2);
    else navigate(ROUTES.CANDIDATE_DASHBOARD);
  };

  if (loading && isDetailView && !detail) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (isDetailView && !detail) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Session not found.</p>
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
    const s = detail.summary;

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to history
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{detail.position}</h1>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(detail.completedAt || detail.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {detail.duration} min · {detail.questionCount} questions
                </span>
                {m?.overallScore != null && (
                  <span className={`font-semibold ${scoreColor(m.overallScore)}`}>
                    Score: {m.overallScore}/100
                  </span>
                )}
              </div>
            </div>

            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {(["overview", "questions", "transcript"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDetailTab(tab)}
                  className={`px-6 py-3 text-sm font-medium capitalize ${
                    detailTab === tab
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-6">
              {detailTab === "overview" && (
                <div className="space-y-6">
                  {s?.text && (
                    <section>
                      <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-3">
                        <FileText className="w-5 h-5" /> Summary
                      </h2>
                      <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {s.text}
                      </div>
                    </section>
                  )}

                  {m && (
                    <section>
                      <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-3">
                        <BarChart3 className="w-5 h-5" /> Metrics
                      </h2>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Overall</p>
                          <p className={`text-lg font-bold ${scoreColor(m.overallScore ?? 0)}`}>
                            {m.overallScore ?? "—"}
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Confidence</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {m.confidence ?? "—"}
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Clarity</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {m.clarity ?? "—"}
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Words spoken</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {m.totalWordsSpoken ?? "—"}
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Filler words</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {m.fillerWords ?? "—"}
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Avg response</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {m.averageResponseTime != null ? `${m.averageResponseTime}s` : "—"}
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400">WPM</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {m.speakingPaceWPM ?? "—"}
                          </p>
                        </div>
                        {m.recommendation && (
                          <div className="col-span-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Recommendation</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {m.recommendation}
                            </p>
                          </div>
                        )}
                      </div>
                    </section>
                  )}

                  {((s?.strengths?.length ?? 0) > 0 || (s?.areasForImprovement?.length ?? 0) > 0) && (
                    <section className="grid sm:grid-cols-2 gap-6">
                      {s!.strengths && s!.strengths.length > 0 && (
                        <div>
                          <h3 className="flex items-center gap-2 font-medium text-gray-900 dark:text-white mb-2">
                            <ThumbsUp className="w-4 h-4 text-green-500" /> Strengths
                          </h3>
                          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 text-sm space-y-1">
                            {s!.strengths.map((x, i) => (
                              <li key={i}>{x}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {s!.areasForImprovement && s!.areasForImprovement.length > 0 && (
                        <div>
                          <h3 className="flex items-center gap-2 font-medium text-gray-900 dark:text-white mb-2">
                            <Target className="w-4 h-4 text-orange-500" /> Areas for improvement
                          </h3>
                          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 text-sm space-y-1">
                            {s!.areasForImprovement.map((x, i) => (
                              <li key={i}>{x}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </section>
                  )}

                  {((s?.recommendations?.length ?? 0) > 0 || (s?.keyInsights?.length ?? 0) > 0) && (
                    <section className="grid sm:grid-cols-2 gap-6">
                      {s!.recommendations && s!.recommendations.length > 0 && (
                        <div>
                          <h3 className="flex items-center gap-2 font-medium text-gray-900 dark:text-white mb-2">
                            <Lightbulb className="w-4 h-4 text-amber-500" /> Recommendations
                          </h3>
                          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 text-sm space-y-1">
                            {s!.recommendations.map((x, i) => (
                              <li key={i}>{x}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {s!.keyInsights && s!.keyInsights.length > 0 && (
                        <div>
                          <h3 className="flex items-center gap-2 font-medium text-gray-900 dark:text-white mb-2">
                            Key insights
                          </h3>
                          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 text-sm space-y-1">
                            {s!.keyInsights.map((x, i) => (
                              <li key={i}>{x}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </section>
                  )}
                </div>
              )}

              {detailTab === "questions" && (
                <div className="space-y-6">
                  {detail.questions?.map((q, idx) => (
                    <div
                      key={q.id ?? idx}
                      className="border border-gray-200 dark:border-gray-700 rounded-xl p-4"
                    >
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Question {idx + 1}
                      </p>
                      <p className="text-gray-900 dark:text-white font-medium mb-2">{q.text}</p>
                      {q.answer && (
                        <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                          <span className="text-gray-500 dark:text-gray-400">Your answer: </span>
                          {q.answer}
                        </p>
                      )}
                      {q.aiAnalysis && (
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Score</span>
                            <span className={`font-semibold ${scoreColor(q.aiAnalysis.score)}`}>
                              {q.aiAnalysis.score}/100
                            </span>
                          </div>
                          {q.aiAnalysis.feedback && (
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {q.aiAnalysis.feedback}
                            </p>
                          )}
                          {q.aiAnalysis.strengths?.length > 0 && (
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Strengths: {q.aiAnalysis.strengths.join(", ")}
                            </p>
                          )}
                          {q.aiAnalysis.improvements?.length > 0 && (
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Improvements: {q.aiAnalysis.improvements.join(", ")}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {detailTab === "transcript" && (
                <div className="space-y-2">
                  {detail.transcript?.length ? (
                    detail.transcript.map((entry, i) => (
                      <div
                        key={i}
                        className={`flex gap-3 p-3 rounded-lg ${
                          entry.speaker === "candidate"
                            ? "bg-blue-50 dark:bg-blue-900/20"
                            : "bg-gray-50 dark:bg-gray-700/30"
                        }`}
                      >
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 shrink-0 w-20">
                          {entry.speaker === "ai" ? "Interviewer" : "You"}
                        </span>
                        <span className="text-sm text-gray-800 dark:text-gray-200">{entry.text}</span>
                        {entry.timestamp && (
                          <span className="text-xs text-gray-400 shrink-0 ml-auto">
                            {formatDate(entry.timestamp)}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No transcript available.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Mock interview history
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Completed mock interviews with scores and feedback.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          </div>
        ) : list.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No completed mock interviews yet.</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Complete a mock interview to see it here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {list.map((session) => {
              const score = session.metrics?.overallScore;
              return (
                <button
                  key={session.sessionId}
                  onClick={() =>
                    navigate(routeHelpers.interviewHistoryV2Session(session.sessionId))
                  }
                  className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition text-left"
                >
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-gray-900 dark:text-white truncate">
                      {session.position}
                    </h2>
                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(session.completedAt || session.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {session.duration} min · {session.questionCount} questions
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {score != null && (
                      <span className={`font-bold ${scoreColor(score)}`}>{score}</span>
                    )}
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
