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
import { ResumeAnalysisResult } from "../types/resume";
import toast from "react-hot-toast";

export default function Resume() {
  const navigate = useNavigate();
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);

  // Load saved analysis from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("resumeAnalysis");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAnalysisResult(parsed);
      } catch (e) {
        localStorage.removeItem("resumeAnalysis");
      }
    }
  }, []);

  // Handle file drop/selection
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File size must be less than 10MB");
      toast.error("File size must be less than 10MB");
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
      const response = await api.analyzeResume(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success && response.data) {
        setAnalysisResult(response.data);
        // Save to localStorage
        localStorage.setItem("resumeAnalysis", JSON.stringify(response.data));
        toast.success("Resume analyzed successfully!");
      } else {
        throw new Error(response.message || "Analysis failed");
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      setUploadProgress(0);
      console.error("Resume analysis error:", err);

      // Handle 401 Unauthorized - Session Expired
      if (err.message?.includes("401") || err.message?.toLowerCase().includes("unauthorized") || err.message?.toLowerCase().includes("session")) {
        setShowSessionExpiredModal(true);
        setError("Your session has expired. Please log in again.");
        toast.error("Session expired. Please log in again.");
        return;
      }

      // Handle 500 Server Error - Parsing issues
      if (err.message?.includes("500") || err.message?.toLowerCase().includes("parse") || err.message?.toLowerCase().includes("server error")) {
        const userFriendlyMessage = "Server error: Unable to parse resume. Please try a different file format.";
        setError(userFriendlyMessage);
        toast.error(userFriendlyMessage);
        return;
      }

      // Handle other errors
      const errorMessage = err.message || "Failed to analyze resume. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setAnalyzing(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleNewUpload = () => {
    setAnalysisResult(null);
    setError(null);
    setUploadProgress(0);
    localStorage.removeItem("resumeAnalysis");
  };

  const handleSessionExpiredClose = () => {
    setShowSessionExpiredModal(false);
    navigate("/login");
  };

  // Display file rejection errors
  useEffect(() => {
    if (fileRejections.length > 0) {
      const rejection = fileRejections[0];
      if (rejection.errors[0].code === "file-too-large") {
        setError("File size must be less than 10MB");
        toast.error("File size must be less than 10MB");
      } else if (rejection.errors[0].code === "file-invalid-type") {
        setError("Only PDF, DOC, and DOCX files are allowed");
        toast.error("Only PDF, DOC, and DOCX files are allowed");
      }
    }
  }, [fileRejections]);

  // Session Expired Modal
  const SessionExpiredModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md mx-4 border border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Session Expired</h2>
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
            Your session has expired. Please log in again to continue.
          </p>
        </div>
        <button
          onClick={handleSessionExpiredClose}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow"
        >
          Go to Login
        </button>
      </div>
    </div>
  );

  // Upload view
  if (!analysisResult) {
    return (
      <div className="min-h-screen bg-slate-900">
        {showSessionExpiredModal && <SessionExpiredModal />}

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-500/30">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Resume Analysis</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Upload Your Resume
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Our AI will extract your skills, experience, and provide personalized interview preparation insights
            </p>
          </div>

          <div
            {...getRootProps()}
            className={`bg-slate-800 rounded-2xl shadow-xl p-12 border-2 border-dashed transition-all cursor-pointer ${isDragActive
              ? "border-blue-500 bg-blue-500/10 scale-105"
              : "border-slate-600 hover:border-blue-400"
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

              <h3 className="text-2xl font-bold text-white mb-2">
                {analyzing
                  ? "Analyzing Resume..."
                  : isDragActive
                    ? "Drop your resume here"
                    : "Drag & Drop"}
              </h3>
              <p className="text-gray-400 mb-6">
                or click to browse (PDF, DOC, DOCX up to 10MB)
              </p>

              {/* Progress Bar */}
              {analyzing && uploadProgress > 0 && (
                <div className="mb-4">
                  <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-400 mt-2">{uploadProgress}% Complete</p>
                </div>
              )}

              {error && (
                <div className="mb-4 flex items-center justify-center space-x-2 text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {!analyzing && (
                <div className="inline-block">
                  <span className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all">
                    Select File
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700 hover:border-blue-500/50 transition-all">
                <Code className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <h4 className="font-semibold text-white mb-2">
                  Skill Extraction
                </h4>
                <p className="text-sm text-gray-400">
                  Identify technical and soft skills automatically
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700 hover:border-green-500/50 transition-all">
                <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <h4 className="font-semibold text-white mb-2">
                  Gap Analysis
                </h4>
                <p className="text-sm text-gray-400">
                  Discover areas for improvement
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700 hover:border-purple-500/50 transition-all">
                <Award className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <h4 className="font-semibold text-white mb-2">
                  Interview Prep
                </h4>
                <p className="text-sm text-gray-400">
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
    <div className="min-h-screen bg-slate-900">
      {showSessionExpiredModal && <SessionExpiredModal />}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center space-x-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium mb-3 border border-green-500/30">
              <CheckCircle className="w-4 h-4" />
              <span>Analysis Complete</span>
            </div>
            <h1 className="text-3xl font-bold text-white">
              Resume Analysis
            </h1>
          </div>
          <button
            onClick={handleNewUpload}
            className="px-6 py-3 bg-slate-800 border border-slate-600 text-gray-300 rounded-xl font-medium hover:shadow-lg hover:border-blue-500/50 transition-all"
          >
            Upload New Resume
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700">
            <FileText className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-sm font-medium text-gray-400 mb-1">
              Resume File
            </h3>
            <p className="text-lg font-semibold text-white">
              {analysisResult.fileName}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Analyzed {new Date(analysisResult.analyzedAt).toLocaleString()}
            </p>
          </div>

          <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700">
            <Award className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="text-sm font-medium text-gray-400 mb-1">
              Skills Extracted
            </h3>
            <p className="text-lg font-semibold text-white">
              {analysisResult.extractedSkills.length} Skills
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Across {new Set(analysisResult.extractedSkills.map(s => s.category)).size} categories
            </p>
          </div>

          <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700">
            <TrendingUp className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-sm font-medium text-gray-400 mb-1">
              Match Score
            </h3>
            <p className="text-lg font-semibold text-white">
              {analysisResult.matchScore}%
            </p>
            <p className="text-sm text-gray-500 mt-1">
              For target positions
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <Code className="w-6 h-6 text-blue-400" />
                <span>Skills Analysis</span>
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {analysisResult.extractedSkills.map((skill) => (
                  <div key={skill.name}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-sm font-semibold text-white">
                          {skill.name}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
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
                      <div className="w-full bg-slate-700 rounded-full h-2">
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

            <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <TrendingUp className="w-6 h-6 text-green-400" />
                <span>Skill Gaps & Recommendations</span>
              </h2>
              <div className="space-y-4">
                {analysisResult.skillGaps.map((gap, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-white">
                        {gap.skill}
                      </h3>
                      <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30">
                        {gap.importance}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">
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
              <h2 className="text-xl font-bold mb-4">Interview Questions</h2>
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
