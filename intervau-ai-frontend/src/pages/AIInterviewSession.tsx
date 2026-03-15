import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  Clock,
  MessageSquare,
  Volume2,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import SpeechVisualizer from "../components/interview/SpeechVisualizer";
import QuestionProgress from "../components/interview/QuestionProgress";
import { useMediaStream } from "../components/interview/MediaStreamHandler";
import {
  loadSession,
  clearSession,
  getSessionDuration,
} from "../components/interview/InterviewSessionStorage";
import { useVapiInterview, VapiMessage } from "../hooks/useVapiInterview";

interface Question {
  id: number;
  text: string;
  type: string;
}

interface TranscriptEntry {
  speaker: string;
  text: string;
  timestamp: string;
}

interface LocationState {
  sessionId: string;
  candidateName: string;
  candidateEmail?: string;
  jobPosition: string;
  jobDescription?: string;
  duration: number;
  totalQuestions: number;
  currentQuestion: { index: number; text: string; type: string };
  /** All interview questions — used to build the Vapi assistant system prompt */
  questions: Question[];
  aiSettings: {
    difficultyLevel: string;
    autoScore: boolean;
    enableAiFeedback: boolean;
  };
}

/**
 * Builds the Vapi inline-assistant configuration.
 *
 * The system prompt embeds all interview questions so the AI knows exactly
 * what to ask and in which order. Vapi handles speech-to-text, TTS, and
 * the entire conversational turn-taking.
 *
 * ⚙️  Model / voice defaults can be overridden via Vapi dashboard assistant IDs.
 *    Set VITE_VAPI_ASSISTANT_ID in .env to use a pre-configured dashboard assistant.
 */
function buildVapiAssistantConfig(
  candidateName: string,
  jobPosition: string,
  questions: Question[],
): object {
  const numberedQuestions = questions
    .map((q, i) => `${i + 1}. ${q.text}`)
    .join("\n");

  const systemPrompt = `You are an AI interviewer named Intervau.AI conducting a professional job interview for the position of "${jobPosition}".

Your responsibilities:
- Ask interview questions one at a time from the list below
- Wait for the candidate's complete response before asking the next question
- Maintain a professional and friendly tone
- If an answer is too short (fewer than 10 words), ask exactly one follow-up question for clarification
- Do NOT ask follow-ups after you have already asked one for the same question — move to the next

Interview questions to ask (in order):
${numberedQuestions}

Interview flow:
1. Greet the candidate: "Hello ${candidateName}, welcome to your AI interview for the ${jobPosition} position. I'll be asking you ${questions.length} questions today. Let's begin."
2. Ask each question from the list above, one at a time, in order.
3. After all questions are complete, close with: "Thank you for completing the interview, ${candidateName}. Your responses have been recorded and feedback will be generated shortly. Best of luck!"

Keep responses concise (2–3 sentences). Stay professional at all times.`;

  return {
    transcriber: {
      provider: "deepgram",
      model: "nova-2",
      language: "en-US",
    },
    model: {
      provider: "openai",
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: systemPrompt }],
      temperature: 0.7,
      maxTokens: 300,
    },
    voice: {
      provider: "11labs",
      voiceId: "paula",
    },
    name: "Intervau AI Interviewer",
    firstMessage: `Hello ${candidateName}, welcome to your AI interview for the ${jobPosition} position. I'll be asking you ${questions.length} questions today. Let's begin.`,
    endCallPhrases: [
      "best of luck",
      "thank you for completing the interview",
      "feedback will be generated shortly",
    ],
    silenceTimeoutSeconds: 30,
    maxDurationSeconds: 3600,
  };
}

/** Maps Vapi message roles to the TranscriptEntry speaker labels used by the UI */
function vapiMsgToTranscriptEntry(msg: VapiMessage): TranscriptEntry {
  return {
    speaker: msg.role === "assistant" ? "Intervau.AI" : "Candidate",
    text: msg.content,
    timestamp: msg.timestamp,
  };
}

/**
 * AIInterviewSession
 *
 * Live AI voice interview session powered by Vapi.
 * - Initialises Vapi with the interview questions embedded in the system prompt
 * - Displays dual video tiles (AI visualiser + candidate camera)
 * - Shows a real-time live transcript from Vapi transcription events
 * - On call end, sends the Q&A pairs to /api/interview-feedback for Mistral evaluation
 * - Navigates to /interview/:uuid/summary with the feedback data
 */
export default function AIInterviewSession() {
  const { uuid } = useParams<{ uuid: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;

  // ── Session meta ─────────────────────────────────────────────────────────
  const [candidateName, setCandidateName] = useState("");
  const [jobPosition, setJobPosition] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [aiMode, setAiMode] = useState<
    "idle" | "speaking" | "thinking" | "listening"
  >("idle");

  // ── Post-interview evaluation ─────────────────────────────────────────────
  const [evaluating, setEvaluating] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  // ── Vapi voice hook ───────────────────────────────────────────────────────
  const vapiPublicKey = import.meta.env.VITE_VAPI_API_KEY as string;

  /**
   * handleCallEnd — fired by useVapiInterview when the Vapi call finishes.
   * Sends the Q&A pairs to the backend for Mistral evaluation, then navigates
   * to the summary page.
   */
  const handleCallEnd = useCallback(
    async (
      qaPairs: { question: string; answer: string }[],
      _rawMessages: VapiMessage[],
    ) => {
      setAiMode("thinking");
      setEvaluating(true);

      try {
        const apiBase =
          import.meta.env.VITE_API_URL || "http://localhost:5000/api";

        const res = await fetch(`${apiBase}/interview-feedback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversation:
              qaPairs.length > 0
                ? qaPairs
                : [
                    {
                      question: "General interview",
                      answer: "Candidate completed the interview.",
                    },
                  ],
            candidateName,
            jobPosition,
          }),
        });

        const data = await res.json();

        clearSession();

        navigate(`/interview/${uuid}/summary`, {
          state: {
            feedback: res.ok && data.success ? data.data : null,
            candidateName,
            jobPosition,
            questionsAnswered: qaPairs.length,
            elapsedTime: formatTime(elapsedTime),
          },
        });
      } catch (err) {
        console.error("Feedback request failed:", err);
        toast.error("Could not generate feedback. Redirecting...");
        clearSession();
        navigate(`/interview/${uuid}/summary`, {
          state: {
            feedback: null,
            candidateName,
            jobPosition,
            questionsAnswered: qaPairs.length,
            elapsedTime: formatTime(elapsedTime),
          },
        });
      } finally {
        setEvaluating(false);
      }
    },
    [candidateName, jobPosition, uuid, elapsedTime, navigate],
  );

  const {
    isCallActive,
    isSpeaking,
    messages: vapiMessages,
    startInterview,
    stopInterview,
  } = useVapiInterview({
    publicKey: vapiPublicKey,
    onCallStart: () => {
      setAiMode("speaking");
      toast.success("Interview started — speak clearly into your microphone.");
    },
    onCallEnd: handleCallEnd,
    onTranscriptUpdate: (msgs) => {
      setTranscript(msgs.map(vapiMsgToTranscriptEntry));
      const last = msgs[msgs.length - 1];
      if (last) {
        setAiMode(last.role === "assistant" ? "speaking" : "listening");
      }
    },
    onError: (err) => {
      toast.error(`Voice error: ${err.message}`);
      setAiMode("idle");
    },
  });

  // ── Media stream (candidate camera) ──────────────────────────────────────
  const { stream } = useMediaStream({
    audioEnabled,
    videoEnabled,
    onStreamReady: (s) => {
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    },
    onError: (error) => {
      toast.error(`Camera access error: ${error.message}`);
    },
    autoStart: true,
  });

  // ── Session initialisation ────────────────────────────────────────────────
  useEffect(() => {
    if (state) {
      setCandidateName(state.candidateName);
      setJobPosition(state.jobPosition);
      setTotalQuestions(state.totalQuestions);
      setQuestions(state.questions || []);
    } else {
      const saved = loadSession();
      if (saved && saved.shareableLink === uuid) {
        setCandidateName(saved.candidateName);
        setJobPosition(saved.jobPosition);
        setTotalQuestions(saved.totalQuestions);
        setElapsedTime(getSessionDuration() * 60);
        toast("Session restored. The voice interview will start shortly.");
      } else {
        navigate(`/interview/${uuid}`);
      }
    }
  }, [state, uuid, navigate]);

  // ── Start Vapi call once session meta is ready ────────────────────────────
  useEffect(() => {
    if (!candidateName || !jobPosition || !vapiPublicKey) return;
    if (isCallActive) return;

    const assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID as
      | string
      | undefined;

    if (assistantId) {
      startInterview(assistantId);
    } else if (questions.length > 0) {
      const config = buildVapiAssistantConfig(
        candidateName,
        jobPosition,
        questions,
      );
      startInterview(config);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateName, jobPosition, questions, vapiPublicKey]);

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ── Auto-scroll transcript ────────────────────────────────────────────────
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  // Attach stream to video element
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEndInterview = () => {
    if (!confirm("Are you sure you want to end this interview?")) return;
    stopInterview();
  };

  const answeredCount = vapiMessages.filter((m) => m.role === "user").length;
  const progressCurrent = Math.min(answeredCount + 1, totalQuestions);

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col">
      {/* ── Evaluating overlay ── */}
      {evaluating && (
        <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center gap-6">
          <Loader2 className="w-16 h-16 text-cyan-400 animate-spin" />
          <div className="text-center">
            <p className="text-xl font-semibold text-white mb-2">
              Analysing your interview…
            </p>
            <p className="text-slate-400 text-sm">
              Our AI is generating your personalised feedback. This may take a
              moment.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full animate-pulse ${isCallActive ? "bg-red-500" : "bg-slate-600"}`}
              />
              <span className="text-sm font-medium text-white">
                {isCallActive ? "Interview in Progress" : "Connecting…"}
              </span>
            </div>
            <div className="h-5 w-px bg-slate-700" />
            <div className="flex items-center gap-2 text-slate-400">
              <Clock className="w-4 h-4" />
              <span className="font-mono text-white">
                {formatTime(elapsedTime)}
              </span>
            </div>
          </div>
          <div>
            <span className="text-slate-400 text-sm">{jobPosition}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <QuestionProgress
            current={progressCurrent}
            total={totalQuestions}
            variant="bar"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Section */}
        <div className="flex-1 p-6">
          <div className="h-full flex flex-col gap-4">
            {/* Video containers */}
            <div className="flex-1 grid grid-cols-2 gap-4">
              {/* AI Interviewer */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5" />
                <SpeechVisualizer
                  isActive={aiMode !== "idle"}
                  mode={aiMode}
                  size="lg"
                />
                <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <span className="text-white text-sm font-medium">
                    Intervau.AI
                  </span>
                </div>
                {isSpeaking === "assistant" && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-cyan-500/20 px-3 py-1.5 rounded-full border border-cyan-500/30">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                    <span className="text-xs text-cyan-400 font-medium">
                      Speaking
                    </span>
                  </div>
                )}
              </div>

              {/* Candidate Video */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 relative overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`w-full h-full object-cover ${!videoEnabled ? "hidden" : ""}`}
                />
                {!videoEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                    <VideoOff className="w-16 h-16 text-slate-600" />
                  </div>
                )}
                <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <span className="text-white text-sm font-medium">
                    {candidateName || "You"}
                  </span>
                </div>
                {!audioEnabled && (
                  <div className="absolute top-4 right-4 bg-red-500/20 p-2 rounded-lg border border-red-500/30">
                    <MicOff className="w-4 h-4 text-red-400" />
                  </div>
                )}
                {isSpeaking === "user" && (
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-cyan-500/20 px-3 py-1.5 rounded-full border border-cyan-500/30">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                    <span className="text-xs text-cyan-400 font-medium">
                      Listening
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Voice status bar */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    isSpeaking === "user"
                      ? "bg-cyan-500/20 border border-cyan-500/40"
                      : "bg-slate-800 border border-slate-700"
                  }`}
                >
                  {audioEnabled ? (
                    <Mic
                      className={`w-5 h-5 ${isSpeaking === "user" ? "text-cyan-400" : "text-slate-500"}`}
                    />
                  ) : (
                    <MicOff className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-300">
                    {!isCallActive
                      ? "Connecting to AI interviewer…"
                      : isSpeaking === "assistant"
                        ? "AI interviewer is speaking — listen carefully"
                        : isSpeaking === "user"
                          ? "Recording your response…"
                          : "Speak your answer when ready"}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Voice-powered · No typing required · Speak naturally
                  </p>
                </div>
                {isSpeaking === "user" && (
                  <div className="flex items-end gap-0.5 h-6">
                    {[3, 5, 7, 4, 6].map((h, i) => (
                      <div
                        key={i}
                        className="w-1 bg-cyan-400 rounded-full animate-pulse"
                        style={{
                          height: `${h * 3}px`,
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Transcript Panel */}
        <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col">
          <div className="p-4 border-b border-slate-800">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              Live Transcript
            </h3>
          </div>
          <div
            ref={transcriptRef}
            className="flex-1 overflow-y-auto p-4 space-y-3"
          >
            {transcript.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                <p className="text-sm text-slate-500">
                  {isCallActive
                    ? "Transcript will appear as you speak…"
                    : "Connecting to voice interview…"}
                </p>
              </div>
            ) : (
              transcript.map((entry, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-xl ${
                    entry.speaker === "Candidate"
                      ? "bg-cyan-500/10 border border-cyan-500/20"
                      : "bg-slate-800 border border-slate-700"
                  }`}
                >
                  <span
                    className={`text-xs font-medium ${
                      entry.speaker === "Candidate"
                        ? "text-cyan-400"
                        : "text-blue-400"
                    }`}
                  >
                    {entry.speaker}
                  </span>
                  <p className="text-sm text-slate-300 mt-1">{entry.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-slate-900 border-t border-slate-800 px-6 py-4">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              audioEnabled
                ? "bg-slate-700 hover:bg-slate-600 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            {audioEnabled ? (
              <Mic className="w-5 h-5" />
            ) : (
              <MicOff className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={() => setVideoEnabled(!videoEnabled)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              videoEnabled
                ? "bg-slate-700 hover:bg-slate-600 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            {videoEnabled ? (
              <Video className="w-5 h-5" />
            ) : (
              <VideoOff className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={handleEndInterview}
            className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all"
          >
            <Phone className="w-5 h-5 rotate-[135deg]" />
          </button>
        </div>
      </div>
    </div>
  );
}
