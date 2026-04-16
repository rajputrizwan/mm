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

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Age of session in milliseconds (0 if invalid date). */
function getSessionAgeMs(iso: string | { $date?: string } | undefined): number {
  const str = typeof iso === "string" ? iso : iso?.$date;
  if (!str) return Infinity;
  const created = new Date(str);
  if (Number.isNaN(created.getTime())) return Infinity;
  return new Date().getTime() - created.getTime();
}

function getCreatedCategory(iso: string | { $date?: string } | undefined) {
  const str = typeof iso === "string" ? iso : iso?.$date;
  if (!str) return "Unknown";

  const diffMs = getSessionAgeMs(iso);

  if (diffMs < MS_PER_DAY) return "Today";
  if (diffMs < 7 * MS_PER_DAY) return "This Week";
  if (diffMs < 30 * MS_PER_DAY) return "This Month";
  return "Earlier";
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

  const scored = (session.questions || []).filter(
    (q) => typeof q.aiAnalysis?.score === "number",
  );
  if (!scored.length) return 0;

  return Math.round(
    scored.reduce((sum, q) => sum + (q.aiAnalysis?.score || 0), 0) /
      scored.length,
  );
}

function inferStrengths(session: MockInterviewSessionDetail) {
  if (session.summary?.strengths?.length)
    return session.summary.strengths?.filter((s) => s !== "s:**");

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

function normalizeRecommendationText(input: string) {
  return input
    .replace(/^\s*[-*•]\s*/, "")
    .replace(/^\s*\d+[.)]\s*/, "")
    .trim();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function fileSafeSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function createInterviewReportHtml({
  session,
  overallScore,
  aiAnalysisScore,
  resumeMatchScore,
  rating,
  strengths,
  improvements,
  recommendations,
}: {
  session: MockInterviewSessionDetail;
  overallScore: number;
  aiAnalysisScore: number;
  resumeMatchScore: number;
  rating: string;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
}) {
  const scoreColor =
    overallScore >= 85
      ? "#1f7a3d"
      : overallScore >= 70
        ? "#155e75"
        : overallScore >= 55
          ? "#b45309"
          : "#b91c1c";

  const questionsHtml = session.questions.length
    ? session.questions
        .map((q, idx) => {
          const score = q.aiAnalysis?.score ?? 0;
          const feedback =
            q.aiAnalysis?.feedback || "No AI feedback available.";
          const answer = q.answer || "No answer captured.";
          const strengthsHtml = (q.aiAnalysis?.strengths || [])
            .map((item) => `<li>${escapeHtml(item)}</li>`)
            .join("");
          const improvementsHtml = (q.aiAnalysis?.improvements || [])
            .map((item) => `<li>${escapeHtml(item)}</li>`)
            .join("");

          return `
          <section class="card qa-card">
            <div class="row between center">
              <h3>Question ${idx + 1}</h3>
              <span class="pill">Score: ${score}%</span>
            </div>
            <p class="label">Category: ${escapeHtml(q.category)} • Difficulty: ${escapeHtml(q.difficulty)}</p>
            <div class="block">
              <h4>Question</h4>
              <p>${escapeHtml(q.text)}</p>
            </div>
            <div class="block">
              <h4>Candidate Answer</h4>
              <p>${escapeHtml(answer)}</p>
            </div>
            <div class="block">
              <h4>AI Feedback</h4>
              <p>${escapeHtml(feedback)}</p>
            </div>
            <div class="grid-2">
              <div class="subcard">
                <h4>Strengths</h4>
                <ul>${strengthsHtml || "<li>No strengths captured.</li>"}</ul>
              </div>
              <div class="subcard">
                <h4>Improvements</h4>
                <ul>${improvementsHtml || "<li>No improvements captured.</li>"}</ul>
              </div>
            </div>
          </section>`;
        })
        .join("")
    : '<section class="card"><p>No question-level data available.</p></section>';

  const transcriptHtml = session.transcript?.length
    ? session.transcript
        .map(
          (t) => `
          <div class="transcript-row">
            <div class="row between center">
              <strong>${t.speaker === "ai" ? "Interviewer" : "Candidate"}</strong>
              <span>${escapeHtml(formatTimestamp(t.timestamp))}</span>
            </div>
            <p>${escapeHtml(t.text)}</p>
          </div>`,
        )
        .join("")
    : "<p>No transcript available.</p>";

  const strengthsList = strengths
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
  const improvementsList = improvements
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
  const recommendationsList = recommendations
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Interview Report - ${escapeHtml(session.position)}</title>
  <style>
    :root {
      --bg: #eef5ff;
      --card: #ffffff;
      --text: #0f172a;
      --muted: #475569;
      --line: #dbeafe;
      --primary: #1d4ed8;
      --accent: #0891b2;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Segoe UI", Tahoma, sans-serif;
      background: linear-gradient(120deg, #eff6ff 0%, #ecfeff 100%);
      color: var(--text);
      line-height: 1.45;
      padding: 28px;
    }
    .container { max-width: 1100px; margin: 0 auto; }
    .hero {
      background: linear-gradient(135deg, #1d4ed8, #0891b2);
      color: white;
      border-radius: 18px;
      padding: 24px;
      box-shadow: 0 18px 35px rgba(2, 6, 23, 0.14);
    }
    .hero h1 { margin: 0 0 6px; font-size: 30px; }
    .hero p { margin: 0; color: #dbeafe; }
    .meta { margin-top: 12px; font-size: 14px; color: #e0f2fe; }
    .grid-4 {
      margin-top: 18px;
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
    }
    .stat {
      background: rgba(255, 255, 255, 0.16);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 12px;
      padding: 12px;
    }
    .stat .value { font-size: 24px; font-weight: 700; color: ${scoreColor}; background: #fff; border-radius: 10px; padding: 3px 8px; display: inline-block; }
    .stat .label { color: #e0f2fe; font-size: 13px; margin-top: 8px; }
    .section-title { margin: 26px 0 10px; font-size: 22px; }
    .cards { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
    .card {
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 14px;
      box-shadow: 0 8px 20px rgba(2, 6, 23, 0.06);
    }
    h3, h4 { margin: 0 0 8px; }
    p { margin: 0; color: var(--muted); }
    ul { margin: 0; padding-left: 18px; color: var(--muted); }
    .pill {
      display: inline-flex;
      align-items: center;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 12px;
      background: #dbeafe;
      color: #1e40af;
      border: 1px solid #bfdbfe;
      font-weight: 600;
    }
    .qa-card { margin-top: 12px; }
    .row { display: flex; }
    .between { justify-content: space-between; }
    .center { align-items: center; }
    .label { font-size: 12px; color: #64748b; margin-bottom: 12px; }
    .block { margin-bottom: 12px; }
    .block p { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px; color: #0f172a; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .subcard { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px; }
    .transcript-row { border-bottom: 1px dashed #cbd5e1; padding: 10px 0; }
    .footer { margin-top: 24px; text-align: right; font-size: 12px; color: #64748b; }
    @media (max-width: 920px) {
      .grid-4, .cards, .grid-2 { grid-template-columns: 1fr; }
      body { padding: 16px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="hero">
      <h1>${escapeHtml(session.position)} Interview Report</h1>
      <p>Comprehensive interview summary with analytics, answers, and recommendations</p>
      <div class="meta">
        Session ID: ${escapeHtml(session.sessionId)} • Created: ${escapeHtml(formatDate(session.createdAt, true))} • Completed: ${escapeHtml(formatDate(session.completedAt || session.createdAt, true))}
      </div>
      <div class="grid-4">
        <div class="stat"><div class="value">${overallScore}%</div><div class="label">Overall Score</div></div>
        <div class="stat"><div class="value">${aiAnalysisScore}%</div><div class="label">AI Analysis</div></div>
        <div class="stat"><div class="value">${resumeMatchScore}%</div><div class="label">Resume Match</div></div>
        <div class="stat"><div class="value">${escapeHtml(rating)}</div><div class="label">Rating</div></div>
      </div>
    </header>

    <h2 class="section-title">Summary</h2>
    <div class="cards">
      <section class="card"><h3>Strengths</h3><ul>${strengthsList || "<li>No strengths available.</li>"}</ul></section>
      <section class="card"><h3>Areas for Improvement</h3><ul>${improvementsList || "<li>No improvements available.</li>"}</ul></section>
      <section class="card"><h3>Recommendations</h3><ul>${recommendationsList || "<li>No recommendations available.</li>"}</ul></section>
    </div>

    <h2 class="section-title">Question Analysis</h2>
    ${questionsHtml}

    <h2 class="section-title">Transcript</h2>
    <section class="card">${transcriptHtml}</section>

    <div class="footer">Generated on ${escapeHtml(formatDate(new Date().toISOString(), true))}</div>
  </div>
</body>
</html>`;
}

export default function InterviewHistory() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "mock">("all");
  const [createdFilter, setCreatedFilter] = useState<
    "all" | "today" | "week" | "month"
  >("all");

  const [list, setList] = useState<MockInterviewSessionDetail[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  const [detail, setDetail] = useState<MockInterviewSessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [actionStatus, setActionStatus] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [detailTab, setDetailTab] = useState<
    "overview" | "metrics" | "responses" | "transcript"
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
    api
      .getCompletedMockInterviewHistory({ limit: 20, page: pagination.page })
      .then((res) => {
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
  }, [isDetailView, sessionId, pagination.page]);

  useEffect(() => {
    if (!actionStatus) return;

    const timeout = setTimeout(() => setActionStatus(null), 3500);
    return () => clearTimeout(timeout);
  }, [actionStatus]);

  const filteredSessions = useMemo(() => {
    return list.filter((session) => {
      const matchesType = filterType === "all" || filterType === "mock";

      // Rolling windows (not mutually exclusive labels): week includes today, month includes week + today.
      const ageMs = getSessionAgeMs(session.createdAt);
      const matchesCreated =
        createdFilter === "all" ||
        (createdFilter === "today" && ageMs >= 0 && ageMs < MS_PER_DAY) ||
        (createdFilter === "week" && ageMs >= 0 && ageMs < 7 * MS_PER_DAY) ||
        (createdFilter === "month" && ageMs >= 0 && ageMs < 30 * MS_PER_DAY);

      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        q.length === 0 ||
        session.position.toLowerCase().includes(q) ||
        session.sessionId.toLowerCase().includes(q);

      return matchesType && matchesCreated && matchesSearch;
    });
  }, [list, filterType, createdFilter, searchTerm]);

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
    const shareTitle = `${detail.position} interview report`;
    const shareText = `Interview result for ${detail.position} (${inferOverallScore(detail)}%).`;

    setIsSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url,
        });
        setActionStatus({ type: "success", text: "Share panel opened." });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setActionStatus({
          type: "success",
          text: "Share link copied to clipboard.",
        });
        return;
      }

      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(textarea);

      if (copied) {
        setActionStatus({
          type: "success",
          text: "Share link copied to clipboard.",
        });
      } else {
        setActionStatus({
          type: "error",
          text: "Unable to copy link. Please copy the URL manually.",
        });
      }
    } catch (error: any) {
      if (error?.name === "AbortError") {
        setActionStatus({ type: "info", text: "Share cancelled." });
      } else {
        setActionStatus({
          type: "error",
          text: "Share failed. Please try again.",
        });
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownload = () => {
    if (!detail) return;

    setIsDownloading(true);
    try {
      const m = detail.metrics;
      const overallScore = inferOverallScore(detail);
      const aiAnalysisScore =
        m?.aiAnalysisPercentage ?? Math.min(100, overallScore + 5);
      const resumeMatchScore =
        m?.resumeMatchPercentage ?? Math.max(0, Math.min(100, overallScore));
      const rating =
        m?.overallRating ||
        (overallScore >= 85
          ? "Excellent"
          : overallScore >= 70
            ? "Good"
            : overallScore >= 55
              ? "Average"
              : "Needs Improvement");

      const reportHtml = createInterviewReportHtml({
        session: detail,
        overallScore,
        aiAnalysisScore,
        resumeMatchScore,
        rating,
        strengths: inferStrengths(detail),
        improvements: inferImprovements(detail),
        recommendations: inferRecommendations(detail),
      });

      const fileName = `interview-report-${fileSafeSlug(detail.position || "session")}-${new Date()
        .toISOString()
        .slice(0, 10)}.html`;

      const blob = new Blob([reportHtml], {
        type: "text/html;charset=utf-8",
      });
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);

      setActionStatus({
        type: "success",
        text: "Interview report downloaded successfully.",
      });
    } catch {
      setActionStatus({
        type: "error",
        text: "Download failed. Please try again.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > (pagination.totalPages || 1)) return;
    setPagination((prev) => ({ ...prev, page: nextPage }));
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
                disabled={isSharing}
                className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {isSharing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {isSharing ? "Sharing..." : "Share"}
                </span>
              </button>
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {isDownloading ? "Downloading..." : "Download Report"}
                </span>
              </button>
            </div>
          </div>

          {actionStatus ? (
            <div
              className={`mb-4 rounded-lg border px-4 py-3 text-sm font-medium ${
                actionStatus.type === "success"
                  ? "bg-green-50 border-green-200 text-green-700"
                  : actionStatus.type === "error"
                    ? "bg-red-50 border-red-200 text-red-700"
                    : "bg-blue-50 border-blue-200 text-blue-700"
              }`}
            >
              {actionStatus.text}
            </div>
          ) : null}

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="relative overflow-hidden rounded-2xl border border-blue-200/60 dark:border-blue-900/50 bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 text-white shadow-lg">
                <div className="absolute -top-20 -right-20 h-52 w-52 rounded-full bg-cyan-200/20 blur-3xl" />
                <div className="absolute -bottom-16 -left-8 h-40 w-40 rounded-full bg-blue-300/20 blur-3xl" />

                <div className="relative p-6 md:p-8 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-blue-200 font-semibold mb-2">
                        Interview Feedback Report
                      </p>
                      <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                        {detail.position}
                      </h1>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs md:text-sm text-blue-100">
                        <span className="px-3 py-1 rounded-full border border-white/25 bg-white/10">
                          Mock Interview
                        </span>
                        <span className="px-3 py-1 rounded-full border border-white/25 bg-white/10">
                          {formatDate(detail.completedAt || detail.createdAt)}
                        </span>
                        <span className="px-3 py-1 rounded-full border border-white/25 bg-white/10">
                          {detail.duration} minutes
                        </span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/20 bg-slate-950/65 p-4 min-w-[150px] text-center">
                      <p className="text-xs uppercase tracking-[0.12em] text-slate-300 mb-1">
                        Overall Score
                      </p>
                      <p className="text-4xl font-extrabold leading-none">
                        {overallScore}
                      </p>
                      <p className="text-xs text-slate-300 mt-1">/ 100</p>
                      <span className="inline-flex mt-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/20">
                        {rating}
                      </span>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/20 bg-white/10 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-blue-100">
                          AI Analysis
                        </span>
                        <span className="text-base font-bold">
                          {aiAnalysisScore}%
                        </span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-300 to-cyan-300 h-2.5 rounded-full"
                          style={{ width: `${aiAnalysisScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/20 bg-white/10 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-blue-100">
                          Resume Match
                        </span>
                        <span className="text-base font-bold">
                          {resumeMatchScore}%
                        </span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-cyan-300 to-emerald-300 h-2.5 rounded-full"
                          style={{ width: `${resumeMatchScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="border-b border-gray-200 dark:border-gray-700 p-3 bg-gray-50/70 dark:bg-gray-900/30">
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        "overview",
                        "metrics",
                        "responses",
                        "transcript",
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setDetailTab(tab)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                          detailTab === tab
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
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

                  {detailTab === "responses" && (
                    <div className="space-y-5">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Question-by-Question Analysis
                      </h3>

                      {detail.questions.length ? (
                        detail.questions.map((question, index) => {
                          const questionScore = question.aiAnalysis?.score ?? 0;

                          return (
                            <div
                              key={question.id ?? index}
                              className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                                <h4 className="font-bold text-gray-900 dark:text-white">
                                  Question {index + 1}
                                </h4>
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${scoreBadgeColor(questionScore)}`}
                                >
                                  {questionScore}%
                                </span>
                              </div>

                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                {question.category} • {question.difficulty}
                              </p>

                              <div className="space-y-3">
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                                    Question
                                  </p>
                                  <p className="text-sm text-gray-800 dark:text-gray-200">
                                    {question.text}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                                    Your Answer
                                  </p>
                                  <p className="text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700/60 rounded-lg border border-gray-200 dark:border-gray-600 p-3">
                                    {question.answer ||
                                      "No answer recorded for this question."}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                                    AI Feedback
                                  </p>
                                  <p className="text-sm text-gray-800 dark:text-gray-200">
                                    {question.aiAnalysis?.feedback ||
                                      "No AI feedback available."}
                                  </p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-3">
                                  <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-300 mb-1">
                                      Strengths
                                    </p>
                                    {(question.aiAnalysis?.strengths || [])
                                      .slice(0, 4)
                                      .map((item, i) => (
                                        <p
                                          key={`${question.id}-s-${i}`}
                                          className="text-xs text-green-800 dark:text-green-200"
                                        >
                                          • {item}
                                        </p>
                                      ))}
                                    {!question.aiAnalysis?.strengths?.length ? (
                                      <p className="text-xs text-green-800 dark:text-green-200">
                                        No strengths captured.
                                      </p>
                                    ) : null}
                                  </div>

                                  <div className="rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 p-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-300 mb-1">
                                      Improvements
                                    </p>
                                    {(question.aiAnalysis?.improvements || [])
                                      .slice(0, 4)
                                      .map((item, i) => (
                                        <p
                                          key={`${question.id}-i-${i}`}
                                          className="text-xs text-orange-800 dark:text-orange-200"
                                        >
                                          • {item}
                                        </p>
                                      ))}
                                    {!question.aiAnalysis?.improvements
                                      ?.length ? (
                                      <p className="text-xs text-orange-800 dark:text-orange-200">
                                        No improvement points captured.
                                      </p>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">
                          No question analysis available.
                        </p>
                      )}
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
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Performance Snapshot
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-900/15 p-4 min-h-[96px]">
                    <p className="text-[11px] font-semibold text-emerald-700/90 dark:text-emerald-300/90 uppercase tracking-[0.08em]">
                      Rating
                    </p>
                    <p className="text-base font-bold text-emerald-700 dark:text-emerald-300 mt-2 leading-snug break-words">
                      {rating}
                    </p>
                  </div>
                  <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-900/15 p-4 min-h-[96px]">
                    <p className="text-[11px] font-semibold text-blue-700/90 dark:text-blue-300/90 uppercase tracking-[0.08em]">
                      Recommendation
                    </p>
                    <p className="text-base font-bold text-blue-700 dark:text-blue-300 mt-2 leading-snug break-words">
                      {m?.recommendation ||
                        "Keep practicing and retake a focused mock"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Quick Stats
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Response Time", value: quickStats.responseTime },
                    {
                      label: "Words Spoken",
                      value: String(quickStats.wordsSpoken),
                    },
                    {
                      label: "Filler Words",
                      value: String(quickStats.fillerWords),
                    },
                    { label: "Speaking Pace", value: quickStats.speakingPace },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/40 px-3 py-2"
                    >
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {item.label}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl shadow-lg p-6 text-white bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600">
                <h3 className="text-xl font-bold mb-4">Next Steps</h3>
                <ol className="space-y-3">
                  {recommendations.slice(0, 3).map((step, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <span className="w-6 h-6 min-w-[1.5rem] rounded-full bg-white/30 border border-white/45 flex items-center justify-center text-xs font-bold mt-0.5 shadow-sm shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-sm text-blue-100 leading-relaxed">
                        {normalizeRecommendationText(step)}
                      </span>
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
                {(["all", "mock"] as const).map((type) => (
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

              <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-1 w-full md:w-auto overflow-x-auto">
                {(
                  [
                    { key: "all", label: "Created: All" },
                    { key: "today", label: "Today" },
                    { key: "week", label: "This Week" },
                    { key: "month", label: "This Month" },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setCreatedFilter(item.key)}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                      createdFilter === item.key
                        ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-gray-600"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                    }`}
                  >
                    {item.label}
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
                      <th className="text-left py-2.5 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Name / role
                      </th>
                      <th className="text-left py-2.5 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Type
                      </th>
                      <th className="text-left py-2.5 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        Interview Date
                      </th>
                      <th className="text-left py-2.5 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Duration
                      </th>
                      <th className="text-left py-2.5 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Score
                      </th>
                      <th className="text-left py-2.5 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Status
                      </th>
                      <th className="text-center py-2.5 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
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
                          <td className="py-3 px-3">
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                Interview Candidate
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[220px]">
                                {session.position}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                              <span>MOCK</span>
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="space-y-1.5 min-w-[170px]">
                              <div className="flex items-center space-x-1.5 text-gray-600 dark:text-gray-400">
                                <Calendar className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                  {formatDate(
                                    session.completedAt || session.createdAt,
                                    true,
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                  {getCreatedCategory(session.createdAt)}
                                </span>
                                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                  Created {formatDate(session.createdAt)}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center space-x-1.5 text-gray-600 dark:text-gray-400">
                              <Clock className="w-3.5 h-3.5" />
                              <span className="text-sm">
                                {session.duration} min
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${scoreBadgeColor(score)}`}
                            >
                              {score}%
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge(
                                session.status,
                              )}`}
                            >
                              <div className="w-2 h-2 rounded-full bg-current" />
                              <span>{session.status}</span>
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
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
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500 dark:text-gray-400">
                <p>
                  Page {pagination.page} of {pagination.totalPages} (
                  {pagination.total} total)
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={loading || pagination.page <= 1}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={
                      loading || pagination.page >= pagination.totalPages
                    }
                    className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Next
                  </button>
                </div>
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
              Across mock sessions
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
