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
  Volume2,
  VolumeX,
} from "lucide-react";
import { ROUTES } from "../router";
import toast from "react-hot-toast";
import { useMediaStream } from "../components/interview/MediaStreamHandler";
import { useTranslation } from "../hooks/useTranslation";
import api from "../services/api";

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
  const { t } = useTranslation();

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
  const [isLoading, setIsLoading] = useState(true);

  // Voice recognition state
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const responseStartTimeRef = useRef<number>(0);

  // Text-to-Speech state
  const [isTTSEnabled, setIsTTSEnabled] = useState(true);
  const [isSpeakingTTS, setIsSpeakingTTS] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Real-time tips from AI
  const [realTimeTips, setRealTimeTips] = useState<
    Array<{ type: "success" | "warning" | "info"; message: string }>
  >([
    { type: "info", message: "Maintain eye contact with the camera" },
    { type: "success", message: "Great use of technical examples!" },
    { type: "warning", message: "Try to reduce filler words" },
  ]);

  // Ref for elapsedTime to avoid re-creating addToTranscript on every tick
  const elapsedTimeRef = useRef(elapsedTime);
  elapsedTimeRef.current = elapsedTime;

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
      toast.error(t("mockInterviewSession.cameraOrMicError"));
    },
  });

  // Load session from localStorage or fetch from backend
  useEffect(() => {
    const loadSession = async () => {
      setIsLoading(true);
      let session: SessionConfig | null = null;

      // Try localStorage first
      const stored = localStorage.getItem("currentInterviewSession");
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as SessionConfig;
          if (parsed.id === sessionId) {
            session = parsed;
          }
        } catch (error) {
          console.error("Failed to parse localStorage session:", error);
        }
      }

      // If localStorage doesn't have valid session, try fetching from backend
      if (!session && sessionId) {
        try {
          const response = await api.getMockInterviewSession(sessionId);
          if (response.success && response.data) {
            const data = response.data;
            session = {
              id: data.sessionId || sessionId,
              position: data.position || "Unknown Position",
              duration: data.duration || 30,
              questionCount: data.questions?.length || 0,
              difficulty: data.difficulty || "medium",
              questions: data.questions || [],
              startedAt: data.startedAt || new Date().toISOString(),
            };
            // Store in localStorage for future use
            localStorage.setItem(
              "currentInterviewSession",
              JSON.stringify(session),
            );
          }
        } catch (error) {
          console.error("Failed to fetch session from backend:", error);
        }
      }

      if (!session) {
        toast.error(t("mockInterviewSession.noActiveSession"));
        navigate(ROUTES.MOCK_INTERVIEW);
        setIsLoading(false);
        return;
      }

      setSessionConfig(session);
      setIsSessionActive(true);
      setIsLoading(false);

      // Add initial AI greeting to transcript
      const greeting: TranscriptEntry = {
        id: Date.now().toString(),
        speaker: t("mockInterviewSession.aiInterviewer"),
        text: t("mockInterviewSession.welcomeMessage", {
          position: session.position,
          count: session.questions.length,
        }),
        time: "00:00",
        isCandidate: false,
      };
      setTranscript([greeting]);

      // Add first question after a delay
      setTimeout(() => {
        if (session && session.questions.length > 0) {
          const firstQuestion: TranscriptEntry = {
            id: (Date.now() + 1).toString(),
            speaker: t("mockInterviewSession.aiInterviewer"),
            text: session.questions[0].text,
            time: "00:02",
            isCandidate: false,
          };
          setTranscript((prev) => [...prev, firstQuestion]);
        }
      }, 2000);
    };

    loadSession();
  }, [sessionId, navigate, t]);

  // Timer effect
  useEffect(() => {
    if (!isSessionActive) return;

    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isSessionActive]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }

        if (final) {
          setUserResponse((prev) => prev + " " + final);
          setInterimTranscript("");
        } else {
          setInterimTranscript(interim);
        }

        // Update speaking state based on audio activity
        setIsSpeaking(true);
      };

      recognition.onspeechend = () => {
        setIsSpeaking(false);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        if (event.error !== "no-speech") {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        // Restart if still supposed to be listening
        if (isListening && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            // Ignore errors when restarting
          }
        }
      };

      recognitionRef.current = recognition;
    }

    // Initialize Speech Synthesis
    if (window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [isListening]);

  // Speaking detection based on real audio analysis
  useEffect(() => {
    if (!isSessionActive || !stream) return;

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    microphone.connect(analyser);
    analyser.fftSize = 256;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const checkAudio = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      setIsSpeaking(average > 20);
    };

    const interval = setInterval(checkAudio, 100);

    return () => {
      clearInterval(interval);
      audioContext.close();
    };
  }, [isSessionActive, stream]);

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

  // Add transcript entry - uses ref for elapsedTime to keep callback stable
  const addToTranscript = useCallback(
    (speaker: string, text: string, isCandidate: boolean) => {
      const entry: TranscriptEntry = {
        id: Date.now().toString(),
        speaker,
        text,
        time: formatTime(elapsedTimeRef.current),
        isCandidate,
      };
      setTranscript((prev) => [...prev, entry]);
    },
    [], // Empty deps - uses ref for elapsedTime
  );

  // Text-to-Speech function
  const speakText = useCallback(
    (text: string) => {
      if (!isTTSEnabled || !synthRef.current) return;

      // Cancel any ongoing speech
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      // Try to use a professional-sounding voice
      const voices = synthRef.current.getVoices();
      const preferredVoice = voices.find(
        (v) =>
          v.name.includes("Google") ||
          v.name.includes("Microsoft") ||
          v.name.includes("Samantha"),
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => setIsSpeakingTTS(true);
      utterance.onend = () => setIsSpeakingTTS(false);
      utterance.onerror = () => setIsSpeakingTTS(false);

      synthRef.current.speak(utterance);
    },
    [isTTSEnabled],
  );

  // Start/Stop voice recognition
  const toggleVoiceRecognition = useCallback(() => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition not supported in this browser");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        responseStartTimeRef.current = Date.now();
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("Failed to start speech recognition:", error);
      }
    }
  }, [isListening]);

  // Handle user response submission with real API
  const handleSubmitResponse = async () => {
    const responseText = (userResponse + " " + interimTranscript).trim();
    if (!responseText || !sessionConfig || !sessionId) return;

    // Stop listening if active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    // Calculate response time
    const responseTime = responseStartTimeRef.current
      ? (Date.now() - responseStartTimeRef.current) / 1000
      : 0;

    // Add user response to transcript
    addToTranscript(t("mockInterviewSession.you"), responseText, true);

    // Update speaking patterns
    const words = responseText.split(" ").length;
    setSpeakingPatterns((prev) => ({
      ...prev,
      totalWords: prev.totalWords + words,
      avgWordsPerMinute: Math.round(
        (prev.totalWords + words) / (elapsedTime / 60) || 0,
      ),
    }));

    setUserResponse("");
    setInterimTranscript("");
    setIsAIProcessing(true);

    try {
      // Call real API for response processing
      const response = await api.submitMockInterviewResponse(sessionId, {
        questionIndex: currentQuestionIndex,
        response: responseText,
        responseTime,
      });

      if (response.success && response.data) {
        const { aiResponse, aiAnalysis, tips, shouldMoveToNext, nextQuestion } =
          response.data;

        // Update live metrics from AI analysis
        if (aiAnalysis?.metrics) {
          setLiveMetrics((prev) => ({
            confidence: aiAnalysis.metrics.confidence || prev.confidence,
            clarity: aiAnalysis.metrics.clarity || prev.clarity,
            pace: aiAnalysis.metrics.pace || prev.pace,
            eyeContact: prev.eyeContact, // Keep simulated for now
            technicalAccuracy:
              aiAnalysis.metrics.technicalAccuracy || prev.technicalAccuracy,
            articulation: prev.articulation, // Keep simulated for now
          }));

          // Update speaking patterns from analysis
          setSpeakingPatterns((prev) => ({
            ...prev,
            fillerWords:
              prev.fillerWords + (aiAnalysis.metrics.fillerWords || 0),
            avgResponseTime: `${responseTime.toFixed(1)}s`,
          }));
        }

        // Update real-time tips
        if (tips && tips.length > 0) {
          setRealTimeTips(tips);
        }

        // Add AI feedback to transcript
        addToTranscript(
          t("mockInterviewSession.aiInterviewer"),
          aiResponse,
          false,
        );

        // Speak the AI response
        speakText(aiResponse);

        // Auto-advance to next question if indicated
        if (shouldMoveToNext && nextQuestion) {
          setCurrentQuestionIndex((prev) => prev + 1);

          // Add and speak next question after a delay
          setTimeout(() => {
            addToTranscript(
              t("mockInterviewSession.aiInterviewer"),
              nextQuestion.text,
              false,
            );
            speakText(nextQuestion.text);
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Failed to process response:", error);
      // Fallback to local feedback
      const fallbackFeedback = t("mockInterviewSession.aiFeedback1");
      addToTranscript(
        t("mockInterviewSession.aiInterviewer"),
        fallbackFeedback,
        false,
      );
    }

    setIsAIProcessing(false);
    responseStartTimeRef.current = Date.now(); // Reset for next response
  };

  // Handle next question
  const handleNextQuestion = () => {
    if (!sessionConfig) return;

    if (currentQuestionIndex < sessionConfig.questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);

      // Add next question to transcript and speak it
      setTimeout(() => {
        const questionText = sessionConfig.questions[nextIndex].text;
        addToTranscript(
          t("mockInterviewSession.aiInterviewer"),
          questionText,
          false,
        );
        speakText(questionText);
      }, 1000);
    }
  };

  // Handle end session with API completion
  const handleEndSession = async () => {
    if (!confirm(t("mockInterviewSession.confirmEndSession"))) return;

    setIsSessionActive(false);
    setIsAIProcessing(true);

    // Stop any ongoing speech
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    try {
      // Complete session via API
      if (sessionId) {
        const response = await api.completeMockInterviewSession(sessionId);

        if (response.success && response.data) {
          // Store complete results
          const results = {
            sessionId,
            position: sessionConfig?.position,
            duration: elapsedTime,
            questionsAnswered: response.data.questionsAnswered,
            totalQuestions: response.data.totalQuestions,
            transcript,
            metrics: response.data.metrics,
            summary: response.data.summary,
            speakingPatterns,
            completedAt: response.data.completedAt,
          };
          localStorage.setItem("lastInterviewResults", JSON.stringify(results));
        }
      }
    } catch (error) {
      console.error("Failed to complete session:", error);
      // Save local results as fallback
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
    }

    localStorage.removeItem("currentInterviewSession");
    setIsAIProcessing(false);
    toast.success(t("mockInterviewSession.sessionCompleted"));
    navigate(ROUTES.CANDIDATE_DASHBOARD);
  };

  // Toggle mic/video
  const toggleMic = () => {
    setMicEnabled(!micEnabled);
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !micEnabled;
      });
    }
    // Also toggle voice recognition with mic
    if (micEnabled && isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
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

  // Toggle TTS
  const toggleTTS = () => {
    if (isTTSEnabled && synthRef.current) {
      synthRef.current.cancel();
    }
    setIsTTSEnabled(!isTTSEnabled);
  };

  // Loading state
  if (isLoading || !sessionConfig) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {t("mockInterviewSession.loadingSession")}
          </p>
        </div>
      </div>
    );
  }

  const questions = sessionConfig.questions;
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const maxDuration = sessionConfig.duration * 60; // Convert to seconds

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-4 py-2 rounded-lg font-medium">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span>{t("mockInterviewSession.recording")}</span>
              </div>
              <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatTime(elapsedTime)}
                </span>
                <span className="text-gray-400 dark:text-gray-500">/</span>
                <span className="text-gray-500 dark:text-gray-400">
                  {formatTime(maxDuration)}
                </span>
              </div>
              {isSpeaking && (
                <div className="flex items-center space-x-2 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 px-4 py-2 rounded-lg font-medium">
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
                  <span>{t("mockInterviewSession.speaking")}</span>
                </div>
              )}
            </div>
            <div className="text-gray-500 dark:text-gray-400 font-medium">
              {t("mockInterviewSession.questionOf", {
                current: currentQuestionIndex + 1,
                total: questions.length,
              })}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3 shadow-inner">
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="relative aspect-video bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden mb-4">
                {streamLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  </div>
                ) : streamError ? (
                  <div className="absolute inset-0 flex items-center justify-center text-red-500 dark:text-red-400">
                    <p>{t("mockInterviewSession.cameraAccessDenied")}</p>
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
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                    <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-3xl text-gray-700 dark:text-white font-bold">
                        {t("mockInterviewSession.you")}
                      </span>
                    </div>
                  </div>
                )}

                {/* Participant label */}
                <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/60 rounded-lg">
                  <span className="text-white text-sm font-medium">
                    {t("mockInterviewSession.you")}
                  </span>
                </div>
              </div>

              {/* Control Bar */}
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={toggleMic}
                  className={`p-4 rounded-full transition-all ${
                    micEnabled
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                  title={micEnabled ? "Mute microphone" : "Unmute microphone"}
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
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                  title={videoEnabled ? "Turn off camera" : "Turn on camera"}
                >
                  {videoEnabled ? (
                    <Video className="w-6 h-6" />
                  ) : (
                    <VideoOff className="w-6 h-6" />
                  )}
                </button>
                <button
                  onClick={toggleTTS}
                  className={`p-4 rounded-full transition-all ${
                    isTTSEnabled
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                      : "bg-orange-600 text-white hover:bg-orange-700"
                  } ${isSpeakingTTS ? "ring-2 ring-blue-500 animate-pulse" : ""}`}
                  title={isTTSEnabled ? "Mute AI voice" : "Unmute AI voice"}
                >
                  {isTTSEnabled ? (
                    <Volume2 className="w-6 h-6" />
                  ) : (
                    <VolumeX className="w-6 h-6" />
                  )}
                </button>
                <button
                  onClick={handleEndSession}
                  className="p-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all"
                  title="End interview"
                >
                  <Phone className="w-6 h-6 rotate-[135deg]" />
                </button>
              </div>
            </div>

            {/* Current Question */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-medium text-blue-400">
                    {currentQuestion.category}
                  </span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ~{currentQuestion.duration} min
                </span>
              </div>
              <p className="text-lg text-gray-900 dark:text-white font-medium mb-6">
                {currentQuestion.text}
              </p>

              {/* Response Input */}
              <div className="space-y-3">
                {/* Interim transcript display */}
                {interimTranscript && (
                  <div className="px-4 py-2 bg-gray-100/80 dark:bg-gray-700/50 rounded-lg border border-gray-300/50 dark:border-gray-600/50">
                    <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                      {interimTranscript}...
                    </p>
                  </div>
                )}

                <div className="flex space-x-3">
                  {/* Voice input button */}
                  <button
                    onClick={toggleVoiceRecognition}
                    disabled={!micEnabled}
                    className={`px-4 py-3 rounded-xl transition-all ${
                      isListening
                        ? "bg-red-600 text-white animate-pulse"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    } ${!micEnabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    title={isListening ? "Stop listening" : "Start voice input"}
                  >
                    {isListening ? (
                      <MicOff className="w-5 h-5" />
                    ) : (
                      <Mic className="w-5 h-5" />
                    )}
                  </button>

                  <input
                    type="text"
                    value={userResponse}
                    onChange={(e) => setUserResponse(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleSubmitResponse()
                    }
                    placeholder={
                      isListening
                        ? t("mockInterviewSession.listening") || "Listening..."
                        : t("mockInterviewSession.typeResponse")
                    }
                    className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isAIProcessing}
                  />
                  <button
                    onClick={handleSubmitResponse}
                    disabled={
                      (!userResponse.trim() && !interimTranscript) ||
                      isAIProcessing
                    }
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isAIProcessing ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Voice status indicator */}
                {isListening && (
                  <div className="flex items-center justify-center space-x-2 text-red-400 text-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span>Recording your response...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Next Question Button */}
            {currentQuestionIndex < questions.length - 1 && (
              <button
                onClick={handleNextQuestion}
                className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-xl transition-all"
              >
                <span>{t("mockInterviewSession.nextQuestion")}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {currentQuestionIndex === questions.length - 1 && (
              <button
                onClick={handleEndSession}
                className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-xl transition-all"
              >
                <CheckCircle className="w-5 h-5" />
                <span>{t("mockInterviewSession.completeInterview")}</span>
              </button>
            )}

            {/* Speaking Patterns */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t("mockInterviewSession.speakingPatterns")}
                </h3>
              </div>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-blue-400">
                    {speakingPatterns.fillerWords}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    {t("mockInterviewSession.fillerWords")}
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-green-400">
                    {speakingPatterns.avgResponseTime}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    {t("mockInterviewSession.avgResponse")}
                  </p>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-orange-400">
                    {speakingPatterns.totalWords}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    {t("mockInterviewSession.totalWords")}
                  </p>
                </div>
                <div className="text-center p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-cyan-400">
                    {speakingPatterns.avgWordsPerMinute}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    {t("mockInterviewSession.wordsPerMinute")}
                  </p>
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
                <h3 className="font-semibold">
                  {t("mockInterviewSession.liveAIAnalysis")}
                </h3>
              </div>
              <div className="space-y-4">
                {Object.entries(liveMetrics).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize">
                        {t(
                          `mockInterviewSession.metric${key.charAt(0).toUpperCase() + key.slice(1)}`,
                        )}
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-3">
                <AlertCircle className="w-4 h-4 text-orange-400" />
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {t("mockInterviewSession.realTimeTips")}
                </h4>
              </div>
              <div className="space-y-2">
                {realTimeTips.map((tip, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border transition-all ${
                      tip.type === "success"
                        ? "bg-green-100 border-green-300 dark:bg-green-900/20 dark:border-green-800"
                        : tip.type === "warning"
                          ? "bg-orange-100 border-orange-300 dark:bg-orange-900/20 dark:border-orange-800"
                          : "bg-blue-100 border-blue-300 dark:bg-blue-900/20 dark:border-blue-800"
                    }`}
                  >
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      {tip.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Question List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-3">
                <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {t("mockInterviewSession.questionList")}
                </h4>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className={`p-3 rounded-lg border transition-all ${
                      idx === currentQuestionIndex
                        ? "bg-blue-50 border-blue-300 ring-2 ring-blue-400 dark:bg-blue-900/30 dark:border-blue-700 dark:ring-blue-800"
                        : idx < currentQuestionIndex
                          ? "bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-800"
                          : "bg-gray-100 border-gray-200 dark:bg-gray-700 dark:border-gray-600"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">
                        Q{idx + 1}
                      </span>
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-500 dark:text-gray-400">
                        {q.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                      {q.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Transcript */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-3">
                <MessageSquare className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {t("mockInterviewSession.liveTranscript")}
                </h4>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {transcript.length === 0 ? (
                  <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">
                    {t("mockInterviewSession.transcriptPlaceholder")}
                  </p>
                ) : (
                  transcript.map((entry) => (
                    <div
                      key={entry.id}
                      className={`p-3 rounded-lg ${
                        entry.isCandidate
                          ? "bg-blue-50 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-700"
                          : "bg-gray-100 border border-gray-200 dark:bg-gray-700/60 dark:border-gray-600"
                      }`}
                    >
                      <div className="flex justify-between text-xs mb-1">
                        <span
                          className={`font-semibold ${entry.isCandidate ? "text-blue-500 dark:text-blue-400" : "text-gray-600 dark:text-gray-300"}`}
                        >
                          {entry.speaker}
                        </span>
                        <span className="text-gray-400 dark:text-gray-500">
                          {entry.time}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {entry.text}
                      </p>
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
