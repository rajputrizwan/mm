import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { ROUTES } from "../router";
import toast from "react-hot-toast";
import { useMediaStream } from "../components/interview/MediaStreamHandler";
import { useTranslation } from "../hooks/useTranslation";
import api from "../services/api";
import type {
  SessionConfig,
  TranscriptEntry,
  LiveMetrics,
} from "../components/interview/mockSessionTypes";
import MockSessionHeader from "../components/interview/MockSessionHeader";
import MockSessionVideoSection from "../components/interview/MockSessionVideoSection";
import MockSessionQuestionCard from "../components/interview/MockSessionQuestionCard";
import MockSessionNavigationButtons from "../components/interview/MockSessionNavigationButtons";
import MockSessionSpeakingPatterns from "../components/interview/MockSessionSpeakingPatterns";
import MockSessionSidebar from "../components/interview/MockSessionSidebar";

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

  // Unique ID counter for transcript entries (avoids duplicate key when adding in same ms)
  const transcriptIdRef = useRef(0);
  const nextTranscriptId = () => `transcript-${++transcriptIdRef.current}`;

  // Ref to clear "first question" timeout when effect re-runs or component unmounts
  const firstQuestionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

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
        id: nextTranscriptId(),
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
      if (firstQuestionTimeoutRef.current) {
        clearTimeout(firstQuestionTimeoutRef.current);
      }
      firstQuestionTimeoutRef.current = setTimeout(() => {
        if (session && session.questions.length > 0) {
          const firstQuestion: TranscriptEntry = {
            id: nextTranscriptId(),
            speaker: t("mockInterviewSession.aiInterviewer"),
            text: session.questions[0].text,
            time: "00:02",
            isCandidate: false,
          };
          setTranscript((prev) => [...prev, firstQuestion]);
        }
        firstQuestionTimeoutRef.current = null;
      }, 2000);
    };

    loadSession();
    return () => {
      if (firstQuestionTimeoutRef.current) {
        clearTimeout(firstQuestionTimeoutRef.current);
        firstQuestionTimeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- omit `t` to avoid max update depth (t reference changes each render)
  }, [sessionId, navigate]);

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
        id: nextTranscriptId(),
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
  const maxDuration = sessionConfig.duration * 60; // Convert to seconds

  const metricLabels: Record<keyof LiveMetrics, string> = {
    confidence: t("mockInterviewSession.metricConfidence"),
    clarity: t("mockInterviewSession.metricClarity"),
    pace: t("mockInterviewSession.metricPace"),
    eyeContact: t("mockInterviewSession.metricEyeContact"),
    technicalAccuracy: t("mockInterviewSession.metricTechnicalAccuracy"),
    articulation: t("mockInterviewSession.metricArticulation"),
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <MockSessionHeader
          elapsedTime={elapsedTime}
          maxDuration={maxDuration}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={questions.length}
          isSpeaking={isSpeaking}
          recordingLabel={t("mockInterviewSession.recording")}
          speakingLabel={t("mockInterviewSession.speaking")}
          questionOfLabel={t("mockInterviewSession.questionOf", {
            current: currentQuestionIndex + 1,
            total: questions.length,
          })}
          formatTime={formatTime}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div className="lg:col-span-2 xl:col-span-3 space-y-6">
            <MockSessionVideoSection
              videoRef={videoRef}
              streamLoading={streamLoading}
              streamError={!!streamError}
              videoEnabled={videoEnabled}
              micEnabled={micEnabled}
              isTTSEnabled={isTTSEnabled}
              isSpeakingTTS={isSpeakingTTS}
              youLabel={t("mockInterviewSession.you")}
              cameraAccessDeniedLabel={t("mockInterviewSession.cameraAccessDenied")}
              onToggleMic={toggleMic}
              onToggleVideo={toggleVideo}
              onToggleTTS={toggleTTS}
              onEndSession={handleEndSession}
            />

            <MockSessionQuestionCard
              question={currentQuestion}
              userResponse={userResponse}
              interimTranscript={interimTranscript}
              isListening={isListening}
              isAIProcessing={isAIProcessing}
              micEnabled={micEnabled}
              listeningPlaceholder={
                t("mockInterviewSession.listening") || "Listening..."
              }
              typeResponsePlaceholder={t("mockInterviewSession.typeResponse")}
              onUserResponseChange={setUserResponse}
              onToggleVoiceRecognition={toggleVoiceRecognition}
              onSubmitResponse={handleSubmitResponse}
            />

            <MockSessionNavigationButtons
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={questions.length}
              nextQuestionLabel={t("mockInterviewSession.nextQuestion")}
              completeInterviewLabel={t("mockInterviewSession.completeInterview")}
              onNextQuestion={handleNextQuestion}
              onEndSession={handleEndSession}
            />

            <MockSessionSpeakingPatterns
              patterns={speakingPatterns}
              title={t("mockInterviewSession.speakingPatterns")}
              fillerWordsLabel={t("mockInterviewSession.fillerWords")}
              avgResponseLabel={t("mockInterviewSession.avgResponse")}
              totalWordsLabel={t("mockInterviewSession.totalWords")}
              wordsPerMinuteLabel={t("mockInterviewSession.wordsPerMinute")}
            />
          </div>

          <MockSessionSidebar
            liveMetrics={liveMetrics}
            metricLabels={metricLabels}
            realTimeTips={realTimeTips}
            questions={questions}
            currentQuestionIndex={currentQuestionIndex}
            transcript={transcript}
            liveAIAnalysisTitle={t("mockInterviewSession.liveAIAnalysis")}
            realTimeTipsTitle={t("mockInterviewSession.realTimeTips")}
            questionListTitle={t("mockInterviewSession.questionList")}
            liveTranscriptTitle={t("mockInterviewSession.liveTranscript")}
            transcriptPlaceholder={t("mockInterviewSession.transcriptPlaceholder")}
          />
        </div>
      </div>
    </div>
  );
}
