import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import {
  Cloud,
  FileText,
  CheckCircle,
  Sparkles,
  Code,
  Award,
  TrendingUp,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import api from "../services/api";
import { useApp } from "../contexts/AppContext";
import { ResumeAnalysisResult } from "../types/resume";
import toast from "react-hot-toast";

export default function Resume() {
  const navigate = useNavigate();
  const { addNotification } = useApp();
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisResult, setAnalysisResult] =
    useState<ResumeAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [targetJobPosition, setTargetJobPosition] = useState("");
  const [targetJobDescription, setTargetJobDescription] = useState("");

  // Load saved analysis: try DB first, fall back to localStorage only on network failure
  useEffect(() => {
    const loadAnalysis = async () => {
      let serverResponded = false;
      try {
        const response = await api.getResumeAnalysis();
        serverResponded = true; // server replied (even with 404)

        if (response.success && response.data) {
          // Server has a resume for this user — load it and sync cache
          setAnalysisResult(response.data as any);
          setTargetJobPosition((response.data as any).targetJobPosition || "");
          setTargetJobDescription(
            (response.data as any).targetJobDescription || "",
          );
          localStorage.setItem("resumeAnalysis", JSON.stringify(response.data));
        } else {
          // Server confirmed this user has NO resume — clear any stale cache
          // from a previous account so it is never shown to the wrong user.
          localStorage.removeItem("resumeAnalysis");
        }
      } catch {
        // Network / CORS failure — server was unreachable.
        // Only use cache as an offline fallback when we couldn't reach the server at all.
        if (!serverResponded) {
          const saved = localStorage.getItem("resumeAnalysis");
          if (saved) {
            try {
              setAnalysisResult(JSON.parse(saved));
            } catch {
              localStorage.removeItem("resumeAnalysis");
            }
          }
        }
      }
    };
    loadAnalysis();
  }, []);

  // Handle file drop/selection
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setError("File size must be less than 10 MB.");
        toast.error("File size must be less than 10 MB.");
        return;
      }

      setError(null);
      setAnalyzing(true);
      setUploadProgress(0);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      try {
        const response = await api.analyzeResume(file, {
          targetJobPosition,
          targetJobDescription,
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (response.success && response.data) {
          setAnalysisResult(response.data);
          // Save to localStorage
          localStorage.setItem("resumeAnalysis", JSON.stringify(response.data));
          toast.success("Resume analyzed successfully.");
          // Persistent bell-panel notification with skill count
          const skillCount = response.data.extractedSkills?.length ?? 0;
          addNotification(
            `Your resume was analysed — ${skillCount} skill${skillCount !== 1 ? "s" : ""} extracted.`,
            "success",
            "Resume analysed",
          );
        } else {
          throw new Error(response.message || "Analysis failed.");
        }
      } catch (err: any) {
        clearInterval(progressInterval);
        setUploadProgress(0);
        console.error("Resume analysis error:", err);

        // Handle 401 Unauthorized - Session Expired
        if (
          err.message?.includes("401") ||
          err.message?.toLowerCase().includes("unauthorized") ||
          err.message?.toLowerCase().includes("session")
        ) {
          setShowSessionExpiredModal(true);
          setError("Your session has expired. Please sign in again.");
          toast.error("Session expired. Please sign in again.");
          return;
        }

        // Handle 500 Server Error - Parsing issues
        if (
          err.message?.includes("500") ||
          err.message?.toLowerCase().includes("parse") ||
          err.message?.toLowerCase().includes("server error")
        ) {
          const userFriendlyMessage =
            "Server error: Unable to parse resume. Please try a different file format.";
          setError(userFriendlyMessage);
          toast.error(userFriendlyMessage);
          return;
        }

        // Handle other errors
        const errorMessage =
          err.message || "Unable to analyze the resume. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setAnalyzing(false);
        setTimeout(() => setUploadProgress(0), 1000);
      }
    },
    [addNotification, targetJobDescription, targetJobPosition],
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: {
        "application/pdf": [".pdf"],
        "application/msword": [".doc"],
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          [".docx"],
      },
      maxFiles: 1,
      maxSize: 10 * 1024 * 1024, // 10MB
    });

  const handleNewUpload = async () => {
    setAnalysisResult(null);
    setError(null);
    setUploadProgress(0);
    setTargetJobPosition("");
    setTargetJobDescription("");
    localStorage.removeItem("resumeAnalysis");
    // Also clear from DB
    try {
      await api.deleteResumeAnalysis();
      addNotification(
        "Your resume and analysis have been cleared.",
        "info",
        "Resume removed",
      );
    } catch {
      // Non-critical — localStorage already cleared
    }
  };

  const handleSessionExpiredClose = () => {
    setShowSessionExpiredModal(false);
    navigate("/login");
  };

  const handleRegenerateInsights = async () => {
    setError(null);
    setRegenerating(true);

    try {
      const response = await api.regenerateResumeAnalysis({
        targetJobPosition,
        targetJobDescription,
      });

      if (!response.success || !response.data) {
        const msg =
          response.message ||
          response.error ||
          "Unable to regenerate insights.";

        if (
          String(msg).includes("401") ||
          String(msg).toLowerCase().includes("unauthorized") ||
          response.statusCode === 401
        ) {
          setShowSessionExpiredModal(true);
          setError("Your session has expired. Please sign in again.");
          toast.error("Session expired. Please sign in again.");
          return;
        }

        setError(msg);
        toast.error(msg);
        return;
      }

      setAnalysisResult(response.data as ResumeAnalysisResult);
      setTargetJobPosition((response.data as any).targetJobPosition || "");
      setTargetJobDescription(
        (response.data as any).targetJobDescription || "",
      );
      localStorage.setItem("resumeAnalysis", JSON.stringify(response.data));
      toast.success("Insights regenerated successfully.");
      addNotification(
        "Resume insights were regenerated.",
        "success",
        "Resume insights updated",
      );
    } catch (err: any) {
      const msg = err?.message || "Unable to regenerate insights.";
      setError(msg);
      toast.error(msg);
    } finally {
      setRegenerating(false);
    }
  };

  // Display file rejection errors
  useEffect(() => {
    if (fileRejections.length > 0) {
      const rejection = fileRejections[0];
      if (rejection.errors[0].code === "file-too-large") {
        setError("File size must be less than 10 MB.");
        toast.error("File size must be less than 10 MB.");
      } else if (rejection.errors[0].code === "file-invalid-type") {
        setError("Only PDF, DOC, and DOCX files are supported.");
        toast.error("Only PDF, DOC, and DOCX files are supported.");
      }
    }
  }, [fileRejections]);

  // Session Expired Modal
  const SessionExpiredModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-md mx-4 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Session expired
          </h2>
          <button
            onClick={handleSessionExpiredClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="mb-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300 text-center">
            Your session has expired. Please sign in again to continue.
          </p>
        </div>
        <button
          onClick={handleSessionExpiredClose}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow"
        >
          Go to sign in
        </button>
      </div>
    </div>
  );

  // Upload view
  if (!analysisResult) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {showSessionExpiredModal && <SessionExpiredModal />}

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-200 dark:border-blue-500/30">
              <Sparkles className="w-4 h-4" />
              <span>AI-powered resume analysis</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Upload your resume
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our AI will extract your skills and experience and provide
              personalized interview preparation insights
            </p>
          </div>

          <div
            {...getRootProps()}
            className={`bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-12 border-2 border-dashed transition-all cursor-pointer ${
              isDragActive
                ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 scale-105"
                : "border-gray-300 dark:border-gray-700 hover:border-blue-400"
            } ${error ? "border-red-500" : ""}`}
          >
            <input {...getInputProps()} />
            <div className="text-center">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                {analyzing ? (
                  <Loader2 className="w-12 h-12 text-white animate-spin" />
                ) : (
                  <Cloud className="w-12 h-12 text-white" />
                )}
              </div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {analyzing
                  ? "Analyzing resume..."
                  : isDragActive
                    ? "Drop your resume here"
                    : "Drag and drop"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                or click to browse (PDF, DOC, DOCX up to 10 MB)
              </p>

              {/* Progress Bar */}
              {analyzing && uploadProgress > 0 && (
                <div className="mb-4">
                  <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {uploadProgress}% complete
                  </p>
                </div>
              )}

              {error && (
                <div className="mb-4 flex items-center justify-center space-x-2 text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {!analyzing && (
                <div className="inline-block">
                  <span className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all">
                    Select file
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Optional role targeting
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Add a target role so scoring aligns with that job instead of
              generic strength.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target job title
                </label>
                <input
                  type="text"
                  value={targetJobPosition}
                  onChange={(e) => setTargetJobPosition(e.target.value)}
                  placeholder="e.g. Senior Full Stack Developer"
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target job description
                </label>
                <textarea
                  value={targetJobDescription}
                  onChange={(e) => setTargetJobDescription(e.target.value)}
                  rows={4}
                  placeholder="Paste role requirements to get role-specific skill percentages and match score"
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-800 hover:border-blue-500/50 transition-all">
                <Code className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Skill extraction
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Identify technical and soft skills automatically
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-800 hover:border-green-500/50 transition-all">
                <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Gap analysis
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Discover areas for improvement
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-800 hover:border-purple-500/50 transition-all">
                <Award className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Interview prep
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Personalized question recommendations
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results view
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {showSessionExpiredModal && <SessionExpiredModal />}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center space-x-2 bg-green-50 text-green-600 dark:bg-green-500/20 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium mb-3 border border-green-200 dark:border-green-500/30">
              <CheckCircle className="w-4 h-4" />
              <span>Analysis complete</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Resume analysis
            </h1>
          </div>
          <button
            onClick={handleNewUpload}
            className="px-6 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:shadow-lg hover:border-blue-500/50 transition-all"
          >
            Upload new resume
          </button>
        </div>

        <div className="mb-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Regenerate insights
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Update target role details and regenerate match score, skill gaps,
            and suggested questions.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target job title
              </label>
              <input
                type="text"
                value={targetJobPosition}
                onChange={(e) => setTargetJobPosition(e.target.value)}
                placeholder="e.g. Frontend Developer"
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target job description
              </label>
              <textarea
                value={targetJobDescription}
                onChange={(e) => setTargetJobDescription(e.target.value)}
                rows={3}
                placeholder="Paste role requirements"
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-4">
            <button
              onClick={handleRegenerateInsights}
              disabled={regenerating}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {regenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {regenerating ? "Regenerating..." : "Re-generate insights"}
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Last updated{" "}
              {new Date(analysisResult.analyzedAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
            <FileText className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Resume file
            </h3>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {analysisResult.fileName}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Analyzed {new Date(analysisResult.analyzedAt).toLocaleString()}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
            <Award className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Skills extracted
            </h3>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {analysisResult.extractedSkills.length} Skills
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Across{" "}
              {
                new Set(analysisResult.extractedSkills.map((s) => s.category))
                  .size
              }{" "}
              categories
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
            <TrendingUp className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Match score
            </h3>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {analysisResult.matchScore}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {analysisResult.targetJobPosition
                ? `For ${analysisResult.targetJobPosition}`
                : "For target positions"}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <Code className="w-6 h-6 text-blue-400" />
                <span>Skills analysis</span>
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {analysisResult.extractedSkills.map((skill) => (
                  <div key={skill.name}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {skill.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          {skill.category}
                        </span>
                      </div>
                      {skill.level && (
                        <span className="text-sm font-bold text-blue-400">
                          {skill.level}%
                        </span>
                      )}
                    </div>
                    {skill.level && (
                      <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded-full"
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <TrendingUp className="w-6 h-6 text-green-400" />
                <span>Skill gaps and recommendations</span>
              </h2>
              <div className="space-y-4">
                {analysisResult.skillGaps.map((gap, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {gap.skill}
                      </h3>
                      <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 rounded-full border border-yellow-500/30">
                        {gap.importance}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {gap.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl shadow-lg p-6 text-white">
              <Sparkles className="w-8 h-8 mb-3" />
              <h2 className="text-xl font-bold mb-4">Interview questions</h2>
              <div className="space-y-3">
                {analysisResult.suggestedQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="bg-white/20 backdrop-blur-sm rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{q.category}</span>
                      <span className="text-xs px-2 py-0.5 bg-white/30 rounded">
                        {q.difficulty}
                      </span>
                    </div>
                    <p className="text-sm">{q.question}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
