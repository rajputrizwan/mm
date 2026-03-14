import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Video,
  Mic,
  CheckCircle,
  AlertCircle,
  Briefcase,
  Clock,
  Target,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  Volume2,
  Check,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { ROUTES } from "../router";
import { api } from "../services/api";
import { useTranslation } from "../hooks/useTranslation";

interface SessionConfig {
  id: string;
  position: string;
  duration: number;
  questionCount: number;
  difficulty: string;
  questions: Array<{
    id: number;
    category: string;
    difficulty: string;
    text: string;
    duration: number;
  }>;
  startedAt: string;
}

interface CheckStatus {
  camera: "pending" | "checking" | "passed" | "failed";
  microphone: "pending" | "checking" | "passed" | "failed";
  speaker: "pending" | "checking" | "passed" | "failed";
}

/**
 * MockInterviewReady - Pre-session page for mock interviews
 * Displays interview details and requires camera/microphone access before starting
 */
export default function MockInterviewReady() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Session state
  const [sessionConfig, setSessionConfig] = useState<SessionConfig | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  // System check state
  const [status, setStatus] = useState<CheckStatus>({
    camera: "pending",
    microphone: "pending",
    speaker: "pending",
  });
  const [isChecking, setIsChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  // Refs for media
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Load session from localStorage and verify with backend
  useEffect(() => {
    const loadSession = async () => {
      // First try localStorage for fast loading
      const stored = localStorage.getItem("currentInterviewSession");
      if (!stored) {
        setError("noSessionFound");
        return;
      }

      try {
        const localSession = JSON.parse(stored) as SessionConfig;
        if (localSession.id !== sessionId) {
          setError("sessionMismatch");
          return;
        }

        // Set local session immediately for fast UI
        setSessionConfig(localSession);

        // Verify session exists in backend
        const response = await api.getMockInterviewSession(sessionId!);
        if (!response.success) {
          console.warn("Session not found in backend, using local data");
          return;
        }

        // Update with backend data if available
        if (response.data) {
          setSessionConfig({
            id: response.data.sessionId,
            position: response.data.position,
            duration: response.data.duration,
            questionCount: response.data.questionCount,
            difficulty: response.data.difficulty,
            questions: response.data.questions,
            startedAt: response.data.createdAt,
          });
        }
      } catch (err) {
        console.error("Error loading session:", err);
        setError("invalidSessionData");
      }
    };

    loadSession();
  }, [sessionId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Check camera
  const checkCamera = async (): Promise<boolean> => {
    setStatus((prev) => ({ ...prev, camera: "checking" }));
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setStatus((prev) => ({ ...prev, camera: "passed" }));
      return true;
    } catch (err) {
      setStatus((prev) => ({ ...prev, camera: "failed" }));
      setCheckError("cameraAccessDenied");
      return false;
    }
  };

  // Check microphone
  const checkMicrophone = async (): Promise<boolean> => {
    setStatus((prev) => ({ ...prev, microphone: "checking" }));
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Add audio tracks to existing stream
      if (streamRef.current) {
        stream.getAudioTracks().forEach((track) => {
          streamRef.current?.addTrack(track);
        });
      } else {
        streamRef.current = stream;
      }

      // Set up audio level monitoring
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(average / 255);
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();

      setStatus((prev) => ({ ...prev, microphone: "passed" }));
      return true;
    } catch (err) {
      setStatus((prev) => ({ ...prev, microphone: "failed" }));
      setCheckError("microphoneAccessDenied");
      return false;
    }
  };

  // Check speaker
  const checkSpeaker = async (): Promise<boolean> => {
    setStatus((prev) => ({ ...prev, speaker: "checking" }));
    try {
      const testContext = new AudioContext();
      await testContext.close();
      setStatus((prev) => ({ ...prev, speaker: "passed" }));
      return true;
    } catch (err) {
      setStatus((prev) => ({ ...prev, speaker: "failed" }));
      return false;
    }
  };

  // Run all checks
  const runAllChecks = async () => {
    setIsChecking(true);
    setCheckError(null);

    const cameraOk = await checkCamera();
    const micOk = await checkMicrophone();
    const speakerOk = await checkSpeaker();

    setIsChecking(false);

    const allChecksPassed = cameraOk && micOk && speakerOk;

    if (allChecksPassed) {
      // Update backend with system check status
      try {
        await api.updateMockInterviewSystemCheck(sessionId!, true);
        toast.success(t("mockInterviewReady.systemCheckPassed"));
      } catch (err) {
        console.error("Failed to update system check status:", err);
        // Still allow to continue even if backend update fails
        toast.success(t("mockInterviewReady.systemCheckPassed"));
      }
    }
  };

  // Handle start interview
  const handleStartInterview = async () => {
    if (!allPassed) {
      toast.error(t("mockInterviewReady.completeCheckFirst"));
      return;
    }

    setStarting(true);

    try {
      // Start session in backend
      const response = await api.startMockInterviewSession(sessionId!);

      if (!response.success) {
        toast.error(response.error || t("mockInterviewReady.failedToStart"));
        setStarting(false);
        return;
      }

      toast.success(t("mockInterviewReady.startingMockInterview"));

      // Navigate to session page
      const sessionPath = ROUTES.MOCK_INTERVIEW_SESSION.replace(
        ":sessionId",
        sessionId!,
      );
      navigate(sessionPath);
    } catch (err: any) {
      console.error("Error starting interview:", err);
      toast.error(t("mockInterviewReady.failedToStart"));
      setStarting(false);
    }
  };

  // Handle going back
  const handleGoBack = () => {
    navigate(ROUTES.MOCK_INTERVIEW_SETUP);
  };

  // Status helpers
  const getStatusIcon = (
    checkStatus: "pending" | "checking" | "passed" | "failed",
  ) => {
    switch (checkStatus) {
      case "passed":
        return <Check className="w-5 h-5 text-green-500" />;
      case "failed":
        return <X className="w-5 h-5 text-red-500" />;
      case "checking":
        return <RefreshCw className="w-5 h-5 text-cyan-500 animate-spin" />;
      default:
        return (
          <div className="w-5 h-5 rounded-full border-2 border-gray-400 dark:border-slate-600" />
        );
    }
  };

  const getStatusColor = (
    checkStatus: "pending" | "checking" | "passed" | "failed",
  ) => {
    switch (checkStatus) {
      case "passed":
        return "border-green-500/30 bg-green-500/10";
      case "failed":
        return "border-red-500/30 bg-red-500/10";
      case "checking":
        return "border-cyan-500/30 bg-cyan-500/10";
      default:
        return "border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50";
    }
  };

  const getStatusText = (
    checkStatus: "pending" | "checking" | "passed" | "failed",
  ) => {
    switch (checkStatus) {
      case "passed":
        return t("mockInterviewReady.statusReady");
      case "failed":
        return t("mockInterviewReady.statusFailed");
      case "checking":
        return t("mockInterviewReady.statusChecking");
      default:
        return t("mockInterviewReady.statusPending");
    }
  };

  const allPassed =
    status.camera === "passed" &&
    status.microphone === "passed" &&
    status.speaker === "passed";

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {t("mockInterviewReady.sessionNotFound")}
          </h1>
          <p className="text-gray-600 dark:text-slate-400 mb-6">
            {t(`mockInterviewReady.${error}`)}
          </p>
          <button
            onClick={() => navigate(ROUTES.MOCK_INTERVIEW_SETUP)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-xl hover:shadow-lg transition-all"
          >
            {t("mockInterviewReady.createNewMockInterview")}
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (!sessionConfig) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-slate-400">
            {t("mockInterviewReady.loadingSession")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-4xl mx-auto py-6">
        {/* Back Button */}
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t("mockInterviewReady.backToSetup")}</span>
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-cyan-500/20 dark:to-blue-500/20 border border-blue-200 dark:border-cyan-500/30 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            <span className="text-blue-700 dark:text-cyan-300 text-sm font-medium">
              {t("mockInterviewReady.aiPoweredBadge")}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t("mockInterviewReady.pageTitle")}
          </h1>
          <p className="text-gray-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            {t("mockInterviewReady.pageSubtitle")}
          </p>
        </div>

        {/* Interview Details Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-blue-600 dark:text-cyan-400" />
            {t("mockInterviewReady.interviewDetails")}
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Position */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("mockInterviewReady.position")}
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {sessionConfig.position}
                  </p>
                </div>
              </div>
            </div>

            {/* Duration */}
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("mockInterviewReady.duration")}
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {sessionConfig.duration} {t("mockInterviewReady.minutes")}
                  </p>
                </div>
              </div>
            </div>

            {/* Questions */}
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("mockInterviewReady.questions")}
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {sessionConfig.questionCount}{" "}
                    {t("mockInterviewReady.questions")}
                  </p>
                </div>
              </div>
            </div>

            {/* Difficulty */}
            <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl border border-cyan-100 dark:border-cyan-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("mockInterviewReady.difficulty")}
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white capitalize">
                    {sessionConfig.difficulty}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* What to expect */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {t("mockInterviewReady.whatToExpect")}
            </h3>
            <div className="space-y-3">
              {[
                t("mockInterviewReady.expectItem1"),
                t("mockInterviewReady.expectItem2"),
                t("mockInterviewReady.expectItem3"),
                t("mockInterviewReady.expectItem4"),
              ].map((item, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Question Categories */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {t("mockInterviewReady.questionCategories")}
            </p>
            <div className="flex flex-wrap gap-2">
              {Array.from(
                new Set(sessionConfig.questions.map((q) => q.category)),
              ).map((category, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-gray-100 dark:bg-slate-700/50 text-gray-700 dark:text-slate-300 text-sm rounded-full capitalize"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* System Check Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            {allPassed ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <AlertCircle className="w-6 h-6 text-yellow-500" />
            )}
            {t("mockInterviewReady.systemCheck")}
          </h2>

          {/* Camera Preview */}
          <div className="relative aspect-video bg-gray-100 dark:bg-slate-900 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 mb-6">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            {status.camera !== "passed" && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-slate-900/80">
                <Video className="w-12 h-12 text-gray-400 dark:text-slate-600" />
              </div>
            )}
            {status.camera === "passed" && (
              <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" />
                {t("mockInterviewReady.statusLive")}
              </div>
            )}
          </div>

          {/* Check Items */}
          <div className="space-y-3 mb-6">
            {/* Camera */}
            <div
              className={`flex items-center justify-between p-4 rounded-xl border ${getStatusColor(
                status.camera,
              )}`}
            >
              <div className="flex items-center gap-3">
                <Video className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  {t("mockInterviewReady.cameraAccess")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-medium ${
                    status.camera === "passed"
                      ? "text-green-600 dark:text-green-400"
                      : status.camera === "failed"
                        ? "text-red-600 dark:text-red-400"
                        : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {getStatusText(status.camera)}
                </span>
                {getStatusIcon(status.camera)}
              </div>
            </div>

            {/* Microphone */}
            <div
              className={`flex items-center justify-between p-4 rounded-xl border ${getStatusColor(
                status.microphone,
              )}`}
            >
              <div className="flex items-center gap-3 flex-1">
                <Mic className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  {t("mockInterviewReady.microphoneAccess")}
                </span>
                {status.microphone === "passed" && (
                  <div className="flex-1 mx-4 max-w-[150px]">
                    <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-100"
                        style={{ width: `${Math.min(audioLevel * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-medium ${
                    status.microphone === "passed"
                      ? "text-green-600 dark:text-green-400"
                      : status.microphone === "failed"
                        ? "text-red-600 dark:text-red-400"
                        : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {getStatusText(status.microphone)}
                </span>
                {getStatusIcon(status.microphone)}
              </div>
            </div>

            {/* Speaker */}
            <div
              className={`flex items-center justify-between p-4 rounded-xl border ${getStatusColor(
                status.speaker,
              )}`}
            >
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  {t("mockInterviewReady.speakerAccess")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-medium ${
                    status.speaker === "passed"
                      ? "text-green-600 dark:text-green-400"
                      : status.speaker === "failed"
                        ? "text-red-600 dark:text-red-400"
                        : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {getStatusText(status.speaker)}
                </span>
                {getStatusIcon(status.speaker)}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {checkError && (
            <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-sm mb-6">
              {t(`mockInterviewReady.${checkError}`)}
            </div>
          )}

          {/* Run System Check Button */}
          {!allPassed && (
            <button
              onClick={runAllChecks}
              disabled={isChecking}
              className={`w-full py-4 px-6 rounded-xl font-semibold transition-all ${
                isChecking
                  ? "bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400 cursor-wait"
                  : "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg"
              }`}
            >
              {isChecking ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  {t("mockInterviewReady.runningSystemCheck")}
                </span>
              ) : (
                t("mockInterviewReady.runSystemCheck")
              )}
            </button>
          )}

          {/* All Passed Message */}
          {allPassed && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-green-600 dark:text-green-400 font-medium mb-1">
                {t("mockInterviewReady.allSystemsReady")}
              </p>
              <p className="text-gray-500 dark:text-slate-400 text-sm">
                {t("mockInterviewReady.cameraAndMicReady")}
              </p>
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            {t("mockInterviewReady.tipsForSuccess")}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              t("mockInterviewReady.tip1"),
              t("mockInterviewReady.tip2"),
              t("mockInterviewReady.tip3"),
              t("mockInterviewReady.tip4"),
              t("mockInterviewReady.tip5"),
              t("mockInterviewReady.tip6"),
            ].map((tip, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-500 dark:text-cyan-400 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700 dark:text-slate-300">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Start Interview Button */}
        <div className="text-center">
          <button
            onClick={handleStartInterview}
            disabled={!allPassed || starting}
            className={`inline-flex items-center gap-3 px-10 py-5 text-lg font-bold rounded-2xl transition-all ${
              allPassed && !starting
                ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-2xl hover:scale-105"
                : "bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed"
            }`}
          >
            {starting ? (
              <>
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                {t("mockInterviewReady.startingInterview")}
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                {t("mockInterviewReady.startInterview")}
              </>
            )}
          </button>
          {!allPassed && (
            <p className="text-gray-500 dark:text-slate-500 text-sm mt-4">
              {t("mockInterviewReady.completeSystemCheck")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
