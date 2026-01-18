import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
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
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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

    try {
      const response = await api.analyzeResume(file);

      if (response.success && response.data) {
        setAnalysisResult(response.data);
        // Save to localStorage
        localStorage.setItem("resumeAnalysis", JSON.stringify(response.data));
        toast.success("Resume analyzed successfully!");
      } else {
        throw new Error(response.message || "Analysis failed");
      }
    } catch (err: any) {
      console.error("Resume analysis error:", err);
      setError(err.message || "Failed to analyze resume");
      toast.error(err.message || "Failed to analyze resume");
    } finally {
      setAnalyzing(false);
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
    localStorage.removeItem("resumeAnalysis");
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

  // Upload view
  if (!analysisResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Resume Analysis</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Upload Your Resume
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our AI will extract your skills, experience, and provide personalized interview preparation insights
            </p>
          </div>

          <div
            {...getRootProps()}
            className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 border-2 border-dashed transition-colors cursor-pointer ${isDragActive
                ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
              } ${error ? "border-red-400" : ""}`}
          >
            <input {...getInputProps()} />
            <div className="text-center">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600 rounded-2xl flex items-center justify-center mb-6">
                {analyzing ? (
                  <Loader2 className="w-12 h-12 text-white animate-spin" />
                ) : (
                  <Upload className="w-12 h-12 text-white" />
                )}
              </div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {analyzing
                  ? "Analyzing Resume..."
                  : isDragActive
                    ? "Drop your resume here"
                    : "Drop your resume here"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                or click to browse (PDF, DOC, DOCX up to 10MB)
              </p>

              {error && (
                <div className="mb-4 flex items-center justify-center space-x-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {!analyzing && (
                <div className="inline-block">
                  <span className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow">
                    Select File
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <Code className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Skill Extraction
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Identify technical and soft skills automatically
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Gap Analysis
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Discover areas for improvement
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <Award className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Interview Prep
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium mb-3">
              <CheckCircle className="w-4 h-4" />
              <span>Analysis Complete</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Resume Analysis
            </h1>
          </div>
          <button
            onClick={handleNewUpload}
            className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:shadow-lg transition-shadow"
          >
            Upload New Resume
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3" />
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Resume File
            </h3>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {analysisResult.fileName}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Analyzed {new Date(analysisResult.analyzedAt).toLocaleString()}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <Award className="w-8 h-8 text-green-600 dark:text-green-400 mb-3" />
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Skills Extracted
            </h3>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {analysisResult.extractedSkills.length} Skills
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Across {new Set(analysisResult.extractedSkills.map(s => s.category)).size} categories
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Match Score
            </h3>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {analysisResult.matchScore}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              For target positions
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <Code className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <span>Skills Analysis</span>
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
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {skill.level}%
                        </span>
                      )}
                    </div>
                    {skill.level && (
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 h-2 rounded-full"
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                <span>Skill Gaps & Recommendations</span>
              </h2>
              <div className="space-y-4">
                {analysisResult.skillGaps.map((gap, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {gap.skill}
                      </h3>
                      <span className="text-xs px-2 py-1 bg-yellow-200 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
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
            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 rounded-xl shadow-lg p-6 text-white">
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
