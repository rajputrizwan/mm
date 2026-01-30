import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock,
  ChevronRight,
  Sparkles,
  BarChart3,
  FileText,
  AlertCircle,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  MessageSquare,
  Send,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { ROUTES } from "../router";
import toast from "react-hot-toast";
import { useMediaStream } from "../components/interview/MediaStreamHandler";

interface Question {
  id: number;
  category: string;
  difficulty: string;
  text: string;
  duration: number;
}

interface SessionConfig {
  id: string;
  position: string;
  duration: number;
  questionCount: number;
  difficulty: string;
  questions: Question[];
  startedAt: string;
}

interface TranscriptEntry {
  id: string;
  speaker: string;
  text: string;
  time: string;
  isCandidate: boolean;
}

export default function MockInterviewSession() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Session state
  const [sessionConfig, setSessionConfig] = useState<SessionConfig | null>(
    null,
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);

  // Media state
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // AI state
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [userResponse, setUserResponse] = useState("");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);

  // Metrics state (simulated live updates)
  const [liveMetrics, setLiveMetrics] = useState({
    confidence: 75,
    clarity: 72,
    pace: 70,
    eyeContact: 68,
    technicalAccuracy: 80,
    articulation: 76,
  });

  const [speakingPatterns, setSpeakingPatterns] = useState({
    fillerWords: 0,
    avgResponseTime: "0.0s",
    totalWords: 0,
    avgWordsPerMinute: 0,
  });

  // Initialize media stream
  const {
    stream,
    isLoading: streamLoading,
    error: streamError,
    startStream,
  } = useMediaStream({
    audioEnabled: micEnabled,
    videoEnabled: videoEnabled,
    autoStart: true,
    onStreamReady: (s) => {
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    },
    onError: (error) => {
      console.error("Media stream error:", error);
      toast.error("Unable to access the camera or microphone.");
    },
  });

  // Load session from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("currentInterviewSession");
    if (!stored) {
      toast.error("No active interview session found.");
      navigate(ROUTES.MOCK_INTERVIEW);
      return;
    }

    try {
      const session = JSON.parse(stored) as SessionConfig;
      if (session.id !== sessionId) {
        toast.error("Session ID does not match.");
        navigate(ROUTES.MOCK_INTERVIEW);
        return;
      }
      setSessionConfig(session);
      setIsSessionActive(true);

      // Add initial AI greeting to transcript
      addToTranscript(
        "AI Interviewer",
        `Welcome to your mock interview for the ${session.position} role. I will ask you ${session.questions.length} questions. Let's begin.`,
        false,
      );

      // Add first question after a delay
      setTimeout(() => {
        if (session.questions.length > 0) {
          addToTranscript("AI Interviewer", session.questions[0].text, false);
        }
      }, 2000);
    } catch (error) {
      console.error("Failed to parse session:", error);
      toast.error("Invalid session data. Please start a new session.");
      navigate(ROUTES.MOCK_INTERVIEW);
    }
  }, [sessionId, navigate]);

  // Timer effect
  useEffect(() => {
    if (!isSessionActive) return;

    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isSessionActive]);

  // Simulate speaking detection
  useEffect(() => {
    if (!isSessionActive) return;

    const speakingInterval = setInterval(() => {
      setIsSpeaking(Math.random() > 0.7);
    }, 1000);

    return () => clearInterval(speakingInterval);
  }, [isSessionActive]);

  // Simulate live metric updates
  useEffect(() => {
    if (!isSessionActive) return;

    const metricsInterval = setInterval(() => {
      setLiveMetrics((prev) => ({
        confidence: Math.min(
          100,
          Math.max(50, prev.confidence + (Math.random() * 4 - 2)),
        ),
        clarity: Math.min(
          100,
          Math.max(50, prev.clarity + (Math.random() * 4 - 2)),
        ),
        pace: Math.min(100, Math.max(50, prev.pace + (Math.random() * 4 - 2))),
        eyeContact: Math.min(
          100,
          Math.max(50, prev.eyeContact + (Math.random() * 4 - 2)),
        ),
        technicalAccuracy: Math.min(
          100,
          Math.max(50, prev.technicalAccuracy + (Math.random() * 4 - 2)),
        ),
        articulation: Math.min(
          100,
          Math.max(50, prev.articulation + (Math.random() * 4 - 2)),
        ),
      }));
    }, 3000);

    return () => clearInterval(metricsInterval);
  }, [isSessionActive]);

  // Attach stream to video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Add transcript entry
  const addToTranscript = useCallback(
    (speaker: string, text: string, isCandidate: boolean) => {
      const entry: TranscriptEntry = {
        id: Date.now().toString(),
        speaker,
        text,
        time: formatTime(elapsedTime),
        isCandidate,
      };
      setTranscript((prev) => [...prev, entry]);
    },
    [elapsedTime],
  );

  // Handle user response submission
  const handleSubmitResponse = async () => {
    if (!userResponse.trim() || !sessionConfig) return;

    // Add user response to transcript
    addToTranscript("You", userResponse, true);

    // Update speaking patterns
    const words = userResponse.split(" ").length;
    setSpeakingPatterns((prev) => ({
      ...prev,
      totalWords: prev.totalWords + words,
      avgWordsPerMinute: Math.round(
        (prev.totalWords + words) / (elapsedTime / 60) || 0,
      ),
    }));

    setUserResponse("");
    setIsAIProcessing(true);

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // AI feedback
    const feedbackResponses = [
      "That's a good answer. Let me follow up on that...",
      "Excellent explanation! Moving on to the next question.",
      "Thank you for that response. Let's continue.",
      "Good point. Could you elaborate a bit more?",
      "Nice! Your technical knowledge shows through clearly.",
    ];
    const feedback =
      feedbackResponses[Math.floor(Math.random() * feedbackResponses.length)];
    addToTranscript("AI Interviewer", feedback, false);

    setIsAIProcessing(false);
  };

  // Handle next question
  const handleNextQuestion = () => {
    if (!sessionConfig) return;

    if (currentQuestionIndex < sessionConfig.questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);

      // Add next question to transcript
      setTimeout(() => {
        addToTranscript(
          "AI Interviewer",
          sessionConfig.questions[nextIndex].text,
          false,
        );
      }, 1000);
    }
  };

  // Handle end session
  const handleEndSession = () => {
    if (confirm("Are you sure you want to end this interview session?")) {
      setIsSessionActive(false);
      localStorage.removeItem("currentInterviewSession");

      // Save session results
      const results = {
        sessionId,
        position: sessionConfig?.position,
        duration: elapsedTime,
        questionsAnswered: currentQuestionIndex + 1,
        totalQuestions: sessionConfig?.questions.length,
        transcript,
        metrics: liveMetrics,
        speakingPatterns,
        completedAt: new Date().toISOString(),
      };
      localStorage.setItem("lastInterviewResults", JSON.stringify(results));

      toast.success("Interview session completed.");
      navigate(ROUTES.CANDIDATE_DASHBOARD);
    }
  };

  // Toggle mic/video
  const toggleMic = () => {
    setMicEnabled(!micEnabled);
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !micEnabled;
      });
    }
  };

  const toggleVideo = () => {
    setVideoEnabled(!videoEnabled);
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !videoEnabled;
      });
    }
  };

  // Loading state
  if (!sessionConfig) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading interview session...</p>
        </div>
      </div>
    );
  }

  const questions = sessionConfig.questions;
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const maxDuration = sessionConfig.duration * 60; // Convert to seconds

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-red-900/30 text-red-400 px-4 py-2 rounded-lg font-medium">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span>Recording</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-white">
                  {formatTime(elapsedTime)}
                </span>
                <span className="text-gray-500">/</span>
                <span className="text-gray-400">{formatTime(maxDuration)}</span>
              </div>
              {isSpeaking && (
                <div className="flex items-center space-x-2 bg-green-900/30 text-green-400 px-4 py-2 rounded-lg font-medium">
                  <div className="flex space-x-1">
                    <div className="w-1 h-4 bg-green-500 rounded-full animate-pulse" />
                    <div
                      className="w-1 h-4 bg-green-500 rounded-full animate-pulse"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-1 h-4 bg-green-500 rounded-full animate-pulse"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                  <span>Speaking</span>
                </div>
              )}
            </div>
            <div className="text-gray-400 font-medium">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-800 rounded-full h-3 shadow-inner">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500 shadow-lg"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 xl:col-span-3 space-y-6">
            {/* Video Section */}
            <div className="bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-700">
              <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden mb-4">
                {streamLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  </div>
                ) : streamError ? (
                  <div className="absolute inset-0 flex items-center justify-center text-red-400">
                    <p>Camera access denied</p>
                  </div>
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className={`w-full h-full object-cover ${!videoEnabled ? "hidden" : ""}`}
                  />
                )}
                {!videoEnabled && !streamLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-3xl text-white font-bold">You</span>
                    </div>
                  </div>
                )}

                {/* Participant label */}
                <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/60 rounded-lg">
                  <span className="text-white text-sm font-medium">You</span>
                </div>
              </div>

              {/* Control Bar */}
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={toggleMic}
                  className={`p-4 rounded-full transition-all ${
                    micEnabled
                      ? "bg-gray-700 text-white hover:bg-gray-600"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  {micEnabled ? (
                    <Mic className="w-6 h-6" />
                  ) : (
                    <MicOff className="w-6 h-6" />
                  )}
                </button>
                <button
                  onClick={toggleVideo}
                  className={`p-4 rounded-full transition-all ${
                    videoEnabled
                      ? "bg-gray-700 text-white hover:bg-gray-600"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  {videoEnabled ? (
                    <Video className="w-6 h-6" />
                  ) : (
                    <VideoOff className="w-6 h-6" />
                  )}
                </button>
                <button
                  onClick={handleEndSession}
                  className="p-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all"
                >
                  <Phone className="w-6 h-6 rotate-[135deg]" />
                </button>
              </div>
            </div>

            {/* Current Question */}
            <div className="bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-medium text-blue-400">
                    {currentQuestion.category}
                  </span>
                </div>
                <span className="text-sm text-gray-400">
                  ~{currentQuestion.duration} min
                </span>
              </div>
              <p className="text-lg text-white font-medium mb-6">
                {currentQuestion.text}
              </p>

              {/* Response Input */}
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleSubmitResponse()
                  }
                  placeholder="Type your response or speak..."
                  className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isAIProcessing}
                />
                <button
                  onClick={handleSubmitResponse}
                  disabled={!userResponse.trim() || isAIProcessing}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isAIProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Next Question Button */}
            {currentQuestionIndex < questions.length - 1 && (
              <button
                onClick={handleNextQuestion}
                className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-xl transition-all"
              >
                <span>Next Question</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {currentQuestionIndex === questions.length - 1 && (
              <button
                onClick={handleEndSession}
                className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-xl transition-all"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Complete Interview</span>
              </button>
            )}

            {/* Speaking Patterns */}
            <div className="bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-white">Speaking Patterns</h3>
              </div>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-blue-400">
                    {speakingPatterns.fillerWords}
                  </p>
                  <p className="text-xs text-gray-300 mt-1">Filler Words</p>
                </div>
                <div className="text-center p-4 bg-green-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-green-400">
                    {speakingPatterns.avgResponseTime}
                  </p>
                  <p className="text-xs text-gray-300 mt-1">Avg Response</p>
                </div>
                <div className="text-center p-4 bg-orange-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-orange-400">
                    {speakingPatterns.totalWords}
                  </p>
                  <p className="text-xs text-gray-300 mt-1">Total Words</p>
                </div>
                <div className="text-center p-4 bg-cyan-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-cyan-400">
                    {speakingPatterns.avgWordsPerMinute}
                  </p>
                  <p className="text-xs text-gray-300 mt-1">Words/Minute</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Live AI Analysis */}
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-semibold">Live AI Analysis</h3>
              </div>
              <div className="space-y-4">
                {Object.entries(liveMetrics).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                      <span>{Math.round(value)}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div
                        className="bg-white h-2 rounded-full transition-all duration-500"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Real-time Tips */}
            <div className="bg-gray-800 rounded-2xl shadow-lg p-4 border border-gray-700">
              <div className="flex items-center space-x-2 mb-3">
                <AlertCircle className="w-4 h-4 text-orange-400" />
                <h4 className="text-sm font-semibold text-white">
                  Real-time Tips
                </h4>
              </div>
              <div className="space-y-2">
                <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-800">
                  <p className="text-xs text-gray-300">
                    Maintain eye contact with the camera
                  </p>
                </div>
                <div className="p-3 bg-green-900/20 rounded-lg border border-green-800">
                  <p className="text-xs text-gray-300">
                    Great use of technical examples!
                  </p>
                </div>
                <div className="p-3 bg-orange-900/20 rounded-lg border border-orange-800">
                  <p className="text-xs text-gray-300">
                    Try to reduce filler words
                  </p>
                </div>
              </div>
            </div>

            {/* Question List */}
            <div className="bg-gray-800 rounded-2xl shadow-lg p-4 border border-gray-700">
              <div className="flex items-center space-x-2 mb-3">
                <FileText className="w-4 h-4 text-gray-400" />
                <h4 className="text-sm font-semibold text-white">
                  Question List
                </h4>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className={`p-3 rounded-lg border transition-all ${
                      idx === currentQuestionIndex
                        ? "bg-blue-900/30 border-blue-700 ring-2 ring-blue-800"
                        : idx < currentQuestionIndex
                          ? "bg-green-900/20 border-green-800"
                          : "bg-gray-700 border-gray-600"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-white">
                        Q{idx + 1}
                      </span>
                      <span className="text-xs bg-gray-800 px-2 py-0.5 rounded text-gray-400">
                        {q.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 line-clamp-2">
                      {q.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Transcript */}
            <div className="bg-gray-800 rounded-2xl shadow-lg p-4 border border-gray-700">
              <div className="flex items-center space-x-2 mb-3">
                <MessageSquare className="w-4 h-4 text-gray-400" />
                <h4 className="text-sm font-semibold text-white">
                  Live Transcript
                </h4>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {transcript.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4">
                    Transcript will appear here...
                  </p>
                ) : (
                  transcript.map((entry) => (
                    <div
                      key={entry.id}
                      className={`p-3 rounded-lg ${
                        entry.isCandidate
                          ? "bg-blue-900/20 border border-blue-800"
                          : "bg-gray-700 border border-gray-600"
                      }`}
                    >
                      <div className="flex justify-between text-xs mb-1">
                        <span
                          className={`font-semibold ${entry.isCandidate ? "text-blue-400" : "text-gray-300"}`}
                        >
                          {entry.speaker}
                        </span>
                        <span className="text-gray-500">{entry.time}</span>
                      </div>
                      <p className="text-xs text-gray-300">{entry.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
