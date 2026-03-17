import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  Clock,
  Target,
  Zap,
  Sparkles,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../services/api";
import { ROUTES } from "../router";
import { getQuestionTypeColor } from "../constants/interviewConstants";
import { useTranslation } from "../hooks/useTranslation";

interface InterviewQuestion {
  text: string;
  type: string;
  expectedAnswer?: string;
}

interface InterviewConfig {
  jobPosition: string;
  jobDescription: string;
  duration: number;
  questionCount: number;
  interviewType: "technical" | "behavioral" | "mixed";
  difficulty: "beginner" | "intermediate" | "advanced";
}

export default function MockInterviewSetup() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Form, Step 2: Questions
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);

  const [config, setConfig] = useState<InterviewConfig>({
    jobPosition: "",
    jobDescription: "",
    duration: 30,
    questionCount: Math.ceil(30 / 5),
    interviewType: "mixed",
    difficulty: "intermediate",
  });

  const durationOptions = [15, 30, 45, 60];
  const questionCountOptions = [3, 5, 8, 10, 12];

  const interviewTypes = [
    {
      value: "technical" as const,
      label: t("mockInterviewSetup.typeTechnical"),
      description: t("mockInterviewSetup.typeTechnicalDesc"),
      icon: "💻",
      color: "from-blue-500 to-cyan-500",
    },
    {
      value: "behavioral" as const,
      label: t("mockInterviewSetup.typeBehavioral"),
      description: t("mockInterviewSetup.typeBehavioralDesc"),
      icon: "💬",
      color: "from-green-500 to-teal-500",
    },
    {
      value: "mixed" as const,
      label: t("mockInterviewSetup.typeMixed"),
      description: t("mockInterviewSetup.typeMixedDesc"),
      icon: "⚡",
      color: "from-purple-500 to-pink-500",
    },
  ];

  const difficultyLevels = [
    {
      value: "beginner" as const,
      label: t("mockInterviewSetup.diffBeginner"),
      description: t("mockInterviewSetup.diffBeginnerDesc"),
    },
    {
      value: "intermediate" as const,
      label: t("mockInterviewSetup.diffIntermediate"),
      description: t("mockInterviewSetup.diffIntermediateDesc"),
    },
    {
      value: "advanced" as const,
      label: t("mockInterviewSetup.diffAdvanced"),
      description: t("mockInterviewSetup.diffAdvancedDesc"),
    },
  ];

  // Map frontend types to backend expected types
  const mapInterviewTypes = (type: string): string[] => {
    switch (type) {
      case "technical":
        return ["technical", "problem_solving"];
      case "behavioral":
        return ["behavioral", "experience"];
      case "mixed":
        return ["technical", "behavioral", "experience"];
      default:
        return ["technical", "behavioral"];
    }
  };

  // Map difficulty to backend format
  const mapDifficulty = (difficulty: string): "junior" | "mid" | "senior" => {
    switch (difficulty) {
      case "beginner":
        return "junior";
      case "advanced":
        return "senior";
      default:
        return "mid";
    }
  };

  // Generate questions using AI
  const handleGenerateQuestions = async () => {
    if (!config.jobPosition.trim()) {
      toast.error(t("mockInterviewSetup.enterJobPosition"));
      return;
    }

    setGenerating(true);
    try {
      const response = await api.generateInterviewQuestions({
        jobPosition: config.jobPosition,
        jobDescription:
          config.jobDescription || `Mock interview for ${config.jobPosition}`,
        interviewModes: mapInterviewTypes(config.interviewType),
        difficultyLevel: mapDifficulty(config.difficulty),
        questionCount: config.questionCount,
        duration: `${config.duration} Min`,
      });

      if (response.success && response.data) {
        setQuestions(response.data);
        setStep(2); // Move to questions step
        toast.success(
          t("mockInterviewSetup.generatedSuccess", {
            count: response.data.length,
          }),
        );
      } else {
        toast.error(response.error || t("mockInterviewSetup.unableToGenerate"));
      }
    } catch (error: unknown) {
      console.error("Error generating questions:", error);
      toast.error(t("mockInterviewSetup.unableToGenerateTryAgain"));
    } finally {
      setGenerating(false);
    }
  };

  // Start interview with generated questions
  const handleStartInterview = async () => {
    if (questions.length === 0) {
      toast.error(t("mockInterviewSetup.generateQuestionsFirst"));
      return;
    }

    try {
      // Generate a unique session ID
      const sessionId = `mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      // Prepare session config with formatted questions
      const sessionConfig = {
        id: sessionId,
        position: config.jobPosition,
        duration: config.duration,
        questionCount: questions.length,
        difficulty: config.difficulty,
        questions: questions.map((q, index) => ({
          id: index + 1,
          category: q.type,
          difficulty: config.difficulty,
          text: q.text,
          duration: Math.floor((config.duration * 60) / questions.length), // seconds per question
        })),
        startedAt: new Date().toISOString(),
      };

      // Store session in localStorage first (ensures we can always navigate)
      localStorage.setItem(
        "currentInterviewSession",
        JSON.stringify(sessionConfig),
      );

      // Try to save session to backend (non-blocking with timeout)
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), 5000),
        );

        const apiPromise = api.createMockInterviewSession({
          sessionId,
          position: config.jobPosition,
          jobDescription: config.jobDescription,
          duration: config.duration,
          questionCount: questions.length,
          difficulty: config.difficulty,
          questions: sessionConfig.questions,
        });

        const response = (await Promise.race([
          apiPromise,
          timeoutPromise,
        ])) as Awaited<ReturnType<typeof api.createMockInterviewSession>>;

        if (!response.success) {
          console.warn("Backend session creation failed:", response.error);
        }
      } catch (error: unknown) {
        console.warn(
          "Backend session creation error (continuing with localStorage):",
          error,
        );
        // Continue anyway - localStorage has the session
      }

      toast.success(t("mockInterviewSetup.preparingInterview"));

      // Navigate to the ready page (system check before session)
      const readyPath = ROUTES.MOCK_INTERVIEW_READY.replace(
        ":sessionId",
        sessionId,
      );
      console.log("Navigating to:", readyPath);
      navigate(readyPath);
    } catch (error: unknown) {
      console.error("Error starting interview:", error);
      toast.error(t("mockInterviewSetup.failedToStart"));
    }
  };

  // Remove a question
  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
    toast.success(t("mockInterviewSetup.questionRemoved"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => {
              if (step === 2) {
                setStep(1); // Go back to form
              } else {
                navigate(-1); // Go back to previous page
              }
            }}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t("mockInterviewSetup.back")}</span>
          </button>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {step === 1
              ? t("mockInterviewSetup.pageTitle")
              : t("mockInterviewSetup.pageTitleStep2")}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {step === 1
              ? t("mockInterviewSetup.pageSubtitle")
              : t("mockInterviewSetup.pageSubtitleStep2", {
                  count: questions.length,
                  position: config.jobPosition,
                })}
          </p>
        </div>

        {/* Step 1: Configuration Form */}
        {step === 1 && (
          <div className="space-y-8">
            {/* Main Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
              {/* Job Position */}
              <div className="mb-8">
                <label className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  {t("mockInterviewSetup.jobPositionLabel")}
                </label>
                <input
                  type="text"
                  value={config.jobPosition}
                  onChange={(e) =>
                    setConfig({ ...config, jobPosition: e.target.value })
                  }
                  placeholder={t("mockInterviewSetup.jobPositionPlaceholder")}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Job Description */}
              <div className="mb-8">
                <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {t("mockInterviewSetup.jobDescriptionLabel")}{" "}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    {t("mockInterviewSetup.optional")}
                  </span>
                </label>
                <textarea
                  value={config.jobDescription}
                  onChange={(e) =>
                    setConfig({ ...config, jobDescription: e.target.value })
                  }
                  placeholder={t(
                    "mockInterviewSetup.jobDescriptionPlaceholder",
                  )}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Duration */}
              <div className="mb-8">
                <label className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  {t("mockInterviewSetup.durationLabel")}
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {durationOptions.map((duration) => (
                    <button
                      key={duration}
                      type="button"
                      onClick={() =>
                        setConfig({
                          ...config,
                          duration,
                          questionCount: Math.ceil(duration / 5),
                        })
                      }
                      className={`py-3 px-4 rounded-xl font-semibold transition-all ${
                        config.duration === duration
                          ? "bg-blue-600 dark:bg-blue-500 text-white shadow-lg scale-105"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {duration} {t("mockInterviewSetup.durationUnit")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of Questions */}
              <div className="mb-8">
                <label className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  {t("mockInterviewSetup.questionsLabel")}
                </label>
                <div className="grid grid-cols-5 gap-3 mb-4">
                  {questionCountOptions.map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() =>
                        setConfig({ ...config, questionCount: count })
                      }
                      className={`py-3 px-4 rounded-xl font-semibold transition-all ${
                        config.questionCount === count
                          ? "bg-blue-600 dark:bg-blue-500 text-white shadow-lg scale-105"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={3}
                    max={20}
                    value={config.questionCount}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      const clamped = Math.min(
                        20,
                        Math.max(3, Number.isNaN(value) ? 3 : value),
                      );
                      setConfig({ ...config, questionCount: clamped });
                    }}
                    className="w-32 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t("mockInterviewSetup.questionsHint")}
                  </span>
                </div>
              </div>

              {/* Interview Type */}
              <div className="mb-8">
                <label className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  {t("mockInterviewSetup.interviewTypeLabel")}
                </label>
                <div className="grid md:grid-cols-3 gap-4">
                  {interviewTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() =>
                        setConfig({ ...config, interviewType: type.value })
                      }
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        config.interviewType === type.value
                          ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-lg scale-105"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      <div className="text-3xl mb-2">{type.icon}</div>
                      <div className="font-semibold text-gray-900 dark:text-white mb-1">
                        {type.label}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {type.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Level */}
              <div>
                <label className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  {t("mockInterviewSetup.difficultyLabel")}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {difficultyLevels.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() =>
                        setConfig({ ...config, difficulty: level.value })
                      }
                      className={`p-4 rounded-xl border-2 transition-all ${
                        config.difficulty === level.value
                          ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-lg scale-105"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      <div className="font-semibold text-gray-900 dark:text-white mb-1">
                        {level.label}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {level.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={handleGenerateQuestions}
                disabled={generating || !config.jobPosition.trim()}
                className="flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {t("mockInterviewSetup.generatingQuestions")}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    {t("mockInterviewSetup.generateButton")}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Generated Questions */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Questions List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {t("mockInterviewSetup.generatedQuestionsTitle", {
                      count: questions.length,
                    })}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateQuestions}
                  disabled={generating}
                  className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-1 ${generating ? "animate-spin" : ""}`}
                  />
                  {t("mockInterviewSetup.regenerate")}
                </button>
              </div>

              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div
                    key={index}
                    className="p-5 bg-white dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Question Header with Type Badge and Number */}
                        <div className="flex items-center mb-3">
                          <span className="text-gray-500 dark:text-gray-400 font-semibold mr-3">
                            {t("mockInterviewSetup.questionLabel", {
                              number: index + 1,
                            })}
                          </span>
                          <span
                            className={`${getQuestionTypeColor(question.type).bg} ${getQuestionTypeColor(question.type).text} text-xs font-semibold px-3 py-1 rounded-full capitalize border ${getQuestionTypeColor(question.type).border}`}
                          >
                            {question.type.replace("_", " ")}
                          </span>
                        </div>

                        {/* Question Text */}
                        <p className="text-gray-900 dark:text-white font-medium text-base mb-3 leading-relaxed">
                          {question.text}
                        </p>

                        {/* Expected Answer in Green */}
                        {question.expectedAnswer && (
                          <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-md border-l-4 border-green-500 dark:border-green-400">
                            <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
                              {t("mockInterviewSetup.expectedAnswer")}
                            </p>
                            <p className="text-sm text-green-600 dark:text-green-300 leading-relaxed whitespace-pre-wrap">
                              {question.expectedAnswer}
                            </p>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="ml-4 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        title={t("mockInterviewSetup.removeQuestion")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Start Interview Button */}
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={handleStartInterview}
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                {t("mockInterviewSetup.startInterview")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
