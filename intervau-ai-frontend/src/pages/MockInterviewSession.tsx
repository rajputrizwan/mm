import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { ROUTES } from "../router";
import toast from "react-hot-toast";
import { useMediaStream } from "../components/interview/MediaStreamHandler";
import { useTranslation } from "../hooks/useTranslation";
import api from "../services/api";
import { useVapiInterview, type VapiMessage } from "../hooks/useVapiInterview";
import type {
  SessionConfig,
  TranscriptEntry,
  LiveMetrics,
} from "../components/interview/mockSessionTypes";
import type { Question } from "../components/interview/mockSessionTypes";
import MockSessionHeader from "../components/interview/MockSessionHeader";
import MockSessionVideoSection from "../components/interview/MockSessionVideoSection";
import MockSessionSpeakingPatterns from "../components/interview/MockSessionSpeakingPatterns";
import MockSessionSidebar from "../components/interview/MockSessionSidebar";

/** Payload from PUT .../complete used for the post-session feedback modal */
type MockInterviewCompletePayload = {
  metrics: {
    overallScore: number;
    overallRating?: string;
    recommendation?: string;
    confidence: number;
    clarity: number;
    technicalAccuracy: number;
    communicationSkills: number;
    fillerWords: number;
    averageResponseTime: number;
    totalWordsSpoken?: number;
    speakingPaceWPM?: number;
  };
  summaryStructured?: {
    text?: string;
    strengths?: string[];
    areasForImprovement?: string[];
    recommendations?: string[];
    keyInsights?: string[];
  };
  questionInsights?: Array<{
    id: number;
    category: string;
    difficulty: string;
    score?: number;
    improvements: string[];
    strengths: string[];
    feedback?: string;
  }>;
};

/** Spoken last; Vapi hangs up when this is detected (case-insensitive) or when the model uses the endCall tool. */
const MOCK_INTERVIEW_END_PHRASE = "This concludes your mock interview session.";

const MOCK_INTERVIEW_END_CALL_PHRASE_NORM = MOCK_INTERVIEW_END_PHRASE.replace(/\.$/, "");

/** Prefer no LLM endCall so we can run /complete and use `say()` for scored debrief before hangup. */
const mockInterviewAssistantOverrides: Record<string, unknown> = {
  endCallPhrases: [MOCK_INTERVIEW_END_CALL_PHRASE_NORM],
  model: { tools: [] },
};

/**
 * VAPI assistant config for mock interview: AI asks questions one by one,
 * user answers with voice, then next question — chatbot style, all via voice.
 */
function buildMockSessionVapiConfig(
  position: string,
  questions: Question[],
): Record<string, unknown> {
  const numberedQuestions = questions
    .map((q, i) => `${i + 1}. ${q.text}`)
    .join("\n");

  const firstQuestionText = questions[0]?.text?.trim() ?? "";

  const systemPrompt = `You are a professional mock interviewer conducting a practice job interview for the role: "${position}".

Your job:
- Your opening line (first message) already includes a short welcome AND Question 1. Do NOT greet again or repeat Question 1.
- After the candidate answers Question 1, give a brief acknowledgment (e.g. "Thanks." or "Good.") then ask Question 2 from the list below, and so on in order.
- Ask the remaining interview questions ONE at a time (Question 2, then 3, …).
- Keep your turn short: ask the question, then stay silent so the candidate can answer.
- Do NOT repeat a question unless they ask. Do NOT give long feedback between questions — just move to the next.
- After the last question and their answer: thank them briefly in one or two short sentences (e.g. thanks for your answers). Do NOT say "${MOCK_INTERVIEW_END_PHRASE}" — the app will read their score and feedback aloud, then end the call. Do NOT use any end-call or hang-up tool. Do NOT ask the candidate to hang up.

Questions to ask (in order):
${numberedQuestions}

Flow: Opening already delivered Q1 → wait for answer → brief ack → Ask Q2 → … → after last answer, short thanks only → stop speaking.`;

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
      temperature: 0.5,
      maxTokens: 220,
    },
    voice: {
      provider: "11labs",
      voiceId: "paula",
    },
    name: "Mock Interviewer",
    endCallPhrases: [MOCK_INTERVIEW_END_CALL_PHRASE_NORM],
    firstMessage: firstQuestionText
      ? `Hello. This is your mock interview for the ${position} role. I'll ask you ${questions.length} questions — please answer each one out loud after I ask it. Here's your first question: ${firstQuestionText}`
      : `Hello. This is your mock interview for the ${position} role. I'll ask you ${questions.length} questions. Answer out loud when I finish each question. Let's begin.`,
    silenceTimeoutSeconds: 45,
    maxDurationSeconds: 3600,
  };
}

/** Count filler words in text (um, uh, like, etc.) */
function countFillerWords(text: string): number {
  const patterns = [
    /\bum+\b/gi,
    /\buh+\b/gi,
    /\blike\b/gi,
    /\byou know\b/gi,
    /\bbasically\b/gi,
    /\bactually\b/gi,
    /\bi mean\b/gi,
    /\bkind of\b/gi,
    /\bsort of\b/gi,
    /\bwell\b/gi,
  ];
  let count = 0;
  patterns.forEach((p) => {
    const m = text.match(p);
    if (m) count += m.length;
  });
  return count;
}

/** Compute speaking patterns from VAPI messages and duration (for API payload). */
function computeSpeakingPatternsFromMessages(
  msgs: VapiMessage[],
  durationSeconds: number,
): { fillerWords: number; avgResponseTimeSeconds: number; totalWords: number; avgWordsPerMinute: number } {
  const userMessages = msgs.filter((m) => m.role === "user");
  const allUserText = userMessages.map((m) => m.content).join(" ");
  const totalWords = allUserText.trim().split(/\s+/).filter(Boolean).length;
  const fillerWords = countFillerWords(allUserText);
  const elapsedMinutes = durationSeconds / 60;
  const avgWordsPerMinute = elapsedMinutes > 0 ? Math.round(totalWords / elapsedMinutes) : 0;
  let avgResponseTimeSeconds = 0;
  if (userMessages.length >= 1 && msgs.length >= 2) {
    const responseTimes: number[] = [];
    for (let i = 0; i < msgs.length; i++) {
      if (msgs[i].role === "user") {
        const prev = msgs[i - 1];
        if (prev) {
          const ms = new Date(msgs[i].timestamp).getTime() - new Date(prev.timestamp).getTime();
          responseTimes.push(ms / 1000);
        }
      }
    }
    if (responseTimes.length > 0) {
      avgResponseTimeSeconds = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    }
  }
  return { fillerWords, avgResponseTimeSeconds, totalWords, avgWordsPerMinute };
}

const NO_ANSWER_PLACEHOLDER = "(No answer provided)";

/**
 * Vapi often emits many short "final" user transcripts in one speaking turn. Merge consecutive
 * user chunks until the assistant speaks again — one merged block ≈ one answer for the current question.
 */
function mergeUserUtterancesByAssistantBoundary(messages: VapiMessage[]): string[] {
  const groups: string[] = [];
  const buffer: string[] = [];

  for (const msg of messages) {
    if (msg.role === "user") {
      const t = msg.content.trim();
      if (t) buffer.push(t);
    } else if (msg.role === "assistant") {
      if (buffer.length > 0) {
        groups.push(buffer.join(" ").trim());
        buffer.length = 0;
      }
    }
  }
  if (buffer.length > 0) groups.push(buffer.join(" ").trim());
  return groups;
}

/**
 * User answers flushed when the assistant speaks next (same semantics as Q&A pairing).
 * Does not count the trailing user buffer — avoids treating an in-progress answer as complete.
 * Raw `user` message count is wrong: Vapi splits one spoken answer into many finals.
 */
function countCompletedMergedAnswerGroups(messages: VapiMessage[]): number {
  const buffer: string[] = [];
  let completed = 0;
  for (const msg of messages) {
    if (msg.role === "user") {
      const t = msg.content.trim();
      if (t) buffer.push(t);
    } else if (msg.role === "assistant") {
      if (buffer.length > 0) {
        completed += 1;
        buffer.length = 0;
      }
    }
  }
  return completed;
}

/** Map N answer groups to M session questions (pad short; merge tail if too many groups). */
function alignAnswerGroupsToQuestionCount(
  groups: string[],
  questionCount: number,
  placeholder: string,
): string[] {
  if (questionCount === 0) return [];
  if (groups.length === 0) {
    return Array.from({ length: questionCount }, () => placeholder);
  }
  if (groups.length <= questionCount) {
    const out = [...groups];
    while (out.length < questionCount) out.push(placeholder);
    return out;
  }
  const head = groups.slice(0, questionCount - 1);
  const tail = groups.slice(questionCount - 1).join(" ");
  return [...head, tail];
}

/**
 * Build Q&A rows for the complete API using session questions as the source of truth.
 * Question text is always from the session; answers come from merged user turns (not raw chunk count).
 */
function buildQAPairsForMockSession(
  questions: Question[],
  messages: VapiMessage[],
): { question: string; answer: string }[] {
  const n = questions.length;
  if (n === 0) return [];

  const grouped = mergeUserUtterancesByAssistantBoundary(messages);
  const answers = alignAnswerGroupsToQuestionCount(grouped, n, NO_ANSWER_PLACEHOLDER);

  return questions.map((q, i) => ({
    question: q.text,
    answer: answers[i] ?? NO_ANSWER_PLACEHOLDER,
  }));
}

/** Map VAPI messages to transcript entries for the UI */
function vapiMessagesToTranscript(msgs: VapiMessage[]): TranscriptEntry[] {
  return msgs.map((msg, i) => ({
    id: `vapi-${i}-${msg.timestamp}`,
    speaker: msg.role === "assistant" ? "AI Interviewer" : "You",
    text: msg.content,
    time: new Date(msg.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    isCandidate: msg.role === "user",
  }));
}

/** Natural-language script for Vapi `say()` — mirrors modal highlights, ends with hangup phrase. */
function buildVoiceDebriefScript(
  position: string,
  data: MockInterviewCompletePayload,
): string {
  const m = data.metrics;
  const s = data.summaryStructured;
  const parts: string[] = [];
  parts.push(`Thanks for completing your mock interview for the ${position} role.`);
  parts.push(
    `Your overall score is ${m.overallScore} out of 100${m.overallRating ? `, rated ${m.overallRating}` : ""}.`,
  );
  const strengths = (s?.strengths ?? []).filter(Boolean).slice(0, 2);
  if (strengths.length) parts.push(`Strengths we noted: ${strengths?.filter((s): s is string => s !== "s:**").join(". ")}.`);
  const improve = (s?.areasForImprovement ?? []).filter(Boolean).slice(0, 2);
  if (improve.length) parts.push(`Areas to work on: ${improve.join(". ")}.`);
  const recs = (s?.recommendations ?? []).filter(Boolean).slice(0, 2);
  if (recs.length) parts.push(`Recommendations: ${recs.join(" ")}`);
  if (parts.length <= 2) {
    parts.push("Open the summary on your screen for full feedback.");
  }
  parts.push(MOCK_INTERVIEW_END_PHRASE);
  let text = parts.join(" ");
  if (text.length > 1200) {
    text = `${text.slice(0, 1150).trim()}… ${MOCK_INTERVIEW_END_PHRASE}`;
  }
  return text;
}

async function submitMockInterviewCompletionToServer(
  sessionId: string,
  config: SessionConfig,
  rawMessages: VapiMessage[],
  durationSeconds: number,
): Promise<
  | { ok: true; results: Record<string, unknown>; serverData: MockInterviewCompletePayload }
  | { ok: false }
> {
  const qaPairs = buildQAPairsForMockSession(config.questions, rawMessages);
  const transcriptForApi = rawMessages.map((msg) => ({
    speaker: msg.role === "assistant" ? ("ai" as const) : ("candidate" as const),
    text: msg.content,
    timestamp: msg.timestamp,
  }));
  const speakingPatterns = computeSpeakingPatternsFromMessages(rawMessages, durationSeconds);

  const results: Record<string, unknown> = {
    sessionId,
    position: config.position,
    duration: durationSeconds,
    questionsAnswered: qaPairs.filter(
      (qa) =>
        qa.answer.trim().length > 0 && !/^\(no answer provided\)$/i.test(qa.answer.trim()),
    ).length,
    totalQuestions: config.questions.length,
    transcript: vapiMessagesToTranscript(rawMessages),
    qaPairs,
    completedAt: new Date().toISOString(),
  };

  try {
    const res = await api.completeMockInterviewSession(sessionId, {
      transcript: transcriptForApi,
      qaPairs,
      durationSeconds,
      speakingPatterns: {
        fillerWords: speakingPatterns.fillerWords,
        avgResponseTimeSeconds: Math.round(speakingPatterns.avgResponseTimeSeconds * 10) / 10,
        totalWords: speakingPatterns.totalWords,
        avgWordsPerMinute: speakingPatterns.avgWordsPerMinute,
      },
    });
    if (res.success && res.data) {
      return {
        ok: true,
        results,
        serverData: {
          metrics: res.data.metrics,
          summaryStructured: res.data.summaryStructured,
          questionInsights: res.data.questionInsights,
        },
      };
    }
  } catch (e) {
    console.error("submitMockInterviewCompletionToServer:", e);
  }
  return { ok: false };
}

export default function MockInterviewSession() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { t } = useTranslation();

  const [sessionConfig, setSessionConfig] = useState<SessionConfig | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [liveMetrics] = useState<LiveMetrics>({
    confidence: 75,
    clarity: 72,
    pace: 70,
    eyeContact: 68,
    technicalAccuracy: 80,
    articulation: 76,
  });
  // Speaking patterns derived in real time from VAPI transcript
  const [realTimeTips] = useState<
    Array<{ type: "success" | "warning" | "info"; message: string }>
  >([
    { type: "info", message: "Answer out loud when the AI finishes each question." },
    { type: "success", message: "Speak clearly; the AI is listening." },
    { type: "warning", message: "Avoid long pauses — the call may time out." },
  ]);

  const [completionModal, setCompletionModal] = useState<{
    results: Record<string, unknown>;
    serverData: MockInterviewCompletePayload;
  } | null>(null);

  const vapiPublicKey = import.meta.env.VITE_VAPI_API_KEY as string;
  const hasVapiKey = Boolean(vapiPublicKey?.trim());

  const sessionConfigRef = useRef<SessionConfig | null>(null);
  const elapsedTimeRef = useRef(0);
  sessionConfigRef.current = sessionConfig;
  elapsedTimeRef.current = elapsedTime;

  /** Set when /complete ran during an active call, right before Vapi `say()` debrief — avoids duplicate API on call-end. */
  const pendingVoiceDebriefModalRef = useRef<{
    results: Record<string, unknown>;
    serverData: MockInterviewCompletePayload;
  } | null>(null);
  const voiceDebriefStartedRef = useRef(false);
  const vapiMessagesRef = useRef<VapiMessage[]>([]);
  const isCallActiveRef = useRef(false);
  const debriefIdleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCallEnd = async (
    _heuristicQAPairs: { question: string; answer: string }[],
    rawMessages: VapiMessage[],
  ) => {
    setIsSessionActive(false);

    const pending = pendingVoiceDebriefModalRef.current;
    if (pending) {
      pendingVoiceDebriefModalRef.current = null;
      voiceDebriefStartedRef.current = false;
      setCompletionModal(pending);
      return;
    }

    const config = sessionConfigRef.current;
    const durationSeconds = elapsedTimeRef.current;
    const qaPairsFallback = buildQAPairsForMockSession(config?.questions ?? [], rawMessages);

    const results: Record<string, unknown> = {
      sessionId,
      position: config?.position,
      duration: durationSeconds,
      questionsAnswered: qaPairsFallback.filter(
        (qa) =>
          qa.answer.trim().length > 0 &&
          !/^\(no answer provided\)$/i.test(qa.answer.trim()),
      ).length,
      totalQuestions: config?.questions.length ?? 0,
      transcript: vapiMessagesToTranscript(rawMessages),
      qaPairs: qaPairsFallback,
      completedAt: new Date().toISOString(),
    };

    if (sessionId && config) {
      const out = await submitMockInterviewCompletionToServer(
        sessionId,
        config,
        rawMessages,
        durationSeconds,
      );
      if (out.ok) {
        setCompletionModal({ results: out.results, serverData: out.serverData });
        return;
      }
    }

    localStorage.setItem("lastInterviewResults", JSON.stringify(results));
    localStorage.removeItem("currentInterviewSession");
    toast.success(t("mockInterviewSession.sessionCompleted"));
    navigate(ROUTES.CANDIDATE_DASHBOARD);
  };

  const dismissCompletionModal = () => {
    if (!completionModal) return;
    const { results, serverData } = completionModal;
    const stored = {
      ...results,
      metrics: serverData.metrics,
      summaryStructured: serverData.summaryStructured,
      questionInsights: serverData.questionInsights,
    };
    localStorage.setItem("lastInterviewResults", JSON.stringify(stored));
    localStorage.removeItem("currentInterviewSession");
    toast.success(t("mockInterviewSession.sessionCompleted"));
    navigate(ROUTES.CANDIDATE_DASHBOARD);
    setCompletionModal(null);
  };

  const {
    status: vapiStatus,
    isCallActive,
    isSpeaking,
    messages: vapiMessages,
    startInterview,
    stopInterview,
    say,
  } = useVapiInterview({
    publicKey: vapiPublicKey || "",
    onCallStart: () => {
      voiceDebriefStartedRef.current = false;
      pendingVoiceDebriefModalRef.current = null;
      setIsSessionActive(true);
      toast.success(t("mockInterviewSession.voiceStarted") || "Voice interview started — speak when the AI asks.");
    },
    onCallEnd: handleCallEnd,
    onTranscriptUpdate: (msgs) => setTranscript(vapiMessagesToTranscript(msgs)),
    onError: (err) => toast.error(`Voice: ${err.message}`),
  });

  useEffect(() => {
    vapiMessagesRef.current = vapiMessages;
  }, [vapiMessages]);

  useEffect(() => {
    isCallActiveRef.current = isCallActive;
  }, [isCallActive]);

  /**
   * After all questions are answered and the assistant finishes talking, call /complete while the
   * call is still up, then Vapi speaks the debrief and hangs up (`say(..., true)`).
   */
  useEffect(() => {
    if (!isCallActive || voiceDebriefStartedRef.current) {
      if (debriefIdleTimerRef.current) {
        clearTimeout(debriefIdleTimerRef.current);
        debriefIdleTimerRef.current = null;
      }
      return;
    }

    const cfg = sessionConfigRef.current;
    const qLen = cfg?.questions?.length ?? 0;
    if (!sessionId || !cfg || qLen === 0) return;

    const msgs = vapiMessages;
    const completedAnswers = countCompletedMergedAnswerGroups(msgs);
    if (completedAnswers < qLen) return;

    const last = msgs[msgs.length - 1];
    if (!last || last.role !== "assistant") return;

    if (debriefIdleTimerRef.current) clearTimeout(debriefIdleTimerRef.current);
    debriefIdleTimerRef.current = setTimeout(async () => {
      debriefIdleTimerRef.current = null;
      if (!isCallActiveRef.current || voiceDebriefStartedRef.current) return;
      if (!sessionId) return;
      const latestCfg = sessionConfigRef.current;
      if (!latestCfg) return;
      const latest = vapiMessagesRef.current;
      if (countCompletedMergedAnswerGroups(latest) < qLen) return;

      voiceDebriefStartedRef.current = true;
      const out = await submitMockInterviewCompletionToServer(
        sessionId,
        latestCfg,
        latest,
        elapsedTimeRef.current,
      );

      if (!out.ok) {
        voiceDebriefStartedRef.current = false;
        stopInterview();
        return;
      }

      pendingVoiceDebriefModalRef.current = {
        results: out.results,
        serverData: out.serverData,
      };
      const script = buildVoiceDebriefScript(latestCfg.position, out.serverData);
      say(script, true);
    }, 4000);

    return () => {
      if (debriefIdleTimerRef.current) {
        clearTimeout(debriefIdleTimerRef.current);
        debriefIdleTimerRef.current = null;
      }
    };
  }, [vapiMessages, isCallActive, sessionId, say, stopInterview]);

  const { stream, isLoading: streamLoading, error: streamError } = useMediaStream({
    audioEnabled: micEnabled,
    videoEnabled: videoEnabled,
    autoStart: true,
    onStreamReady: (s) => {
      if (videoRef.current) videoRef.current.srcObject = s;
    },
    onError: (error) => {
      console.error("Media stream error:", error);
      toast.error(t("mockInterviewSession.cameraOrMicError"));
    },
  });

  // Load session
  useEffect(() => {
    let cancelled = false;
    const loadSession = async () => {
      setIsLoading(true);
      let session: SessionConfig | null = null;

      const stored = localStorage.getItem("currentInterviewSession");
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as SessionConfig;
          if (parsed.id === sessionId) session = parsed;
        } catch (e) {
          console.error("Failed to parse localStorage session:", e);
        }
      }

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
            localStorage.setItem("currentInterviewSession", JSON.stringify(session));
          }
        } catch (e) {
          console.error("Failed to fetch session:", e);
        }
      }

      if (cancelled) return;
      if (!session) {
        toast.error(t("mockInterviewSession.noActiveSession"));
        navigate(ROUTES.MOCK_INTERVIEW);
        setIsLoading(false);
        return;
      }

      setSessionConfig(session);
      setIsLoading(false);
    };
    loadSession();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, navigate]);

  // Start VAPI when session is ready and we have a key
  const vapiStartedRef = useRef(false);
  useEffect(() => {
    if (
      !sessionConfig?.questions?.length ||
      !hasVapiKey ||
      vapiStartedRef.current ||
      vapiStatus === "active" ||
      vapiStatus === "connecting"
    )
      return;

    vapiStartedRef.current = true;
    const assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID as string | undefined;
    if (assistantId?.trim()) {
      startInterview(assistantId.trim(), mockInterviewAssistantOverrides);
    } else {
      const config = buildMockSessionVapiConfig(
        sessionConfig.position,
        sessionConfig.questions,
      );
      startInterview(config);
    }
  }, [sessionConfig, hasVapiKey, vapiStatus, startInterview]);

  // Timer
  useEffect(() => {
    if (!isSessionActive) return;
    const timer = setInterval(() => setElapsedTime((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [isSessionActive]);

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  // Real-time speaking patterns from VAPI transcript (must run before any early return to satisfy Rules of Hooks)
  const speakingPatterns = useMemo(() => {
    const userMessages = vapiMessages.filter((m) => m.role === "user");
    const allUserText = userMessages.map((m) => m.content).join(" ");
    const totalWords = allUserText.trim().split(/\s+/).filter(Boolean).length;
    const fillerWords = countFillerWords(allUserText);
    const elapsedMinutes = elapsedTime / 60;
    const avgWordsPerMinute = elapsedMinutes > 0 ? Math.round(totalWords / elapsedMinutes) : 0;
    let avgResponseTime = "0.0s";
    if (userMessages.length >= 1 && vapiMessages.length >= 2) {
      const responseTimes: number[] = [];
      for (let i = 0; i < vapiMessages.length; i++) {
        if (vapiMessages[i].role === "user") {
          const prev = vapiMessages[i - 1];
          if (prev) {
            const ms = new Date(vapiMessages[i].timestamp).getTime() - new Date(prev.timestamp).getTime();
            responseTimes.push(ms / 1000);
          }
        }
      }
      if (responseTimes.length > 0) {
        const avg = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        avgResponseTime = `${avg.toFixed(1)}s`;
      }
    }
    return {
      fillerWords,
      avgResponseTime,
      totalWords,
      avgWordsPerMinute,
    };
  }, [vapiMessages, elapsedTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEndSession = () => {
    if (!confirm(t("mockInterviewSession.confirmEndSession"))) return;
    stopInterview();
  };

  const toggleMic = () => {
    setMicEnabled((prev) => {
      if (stream) {
        stream.getAudioTracks().forEach((track) => {
          track.enabled = !prev;
        });
      }
      return !prev;
    });
  };

  const toggleVideo = () => {
    setVideoEnabled((prev) => {
      if (stream) {
        stream.getVideoTracks().forEach((track) => {
          track.enabled = !prev;
        });
      }
      return !prev;
    });
  };

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

  if (!hasVapiKey) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-500 dark:text-red-400 font-medium mb-2">
            Voice interview not configured
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            Set VITE_VAPI_API_KEY in your .env to enable the voice interview.
          </p>
          <button
            onClick={() => navigate(ROUTES.MOCK_INTERVIEW)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  const questions = sessionConfig.questions;
  const completedAnswerGroups = countCompletedMergedAnswerGroups(vapiMessages);
  const currentQuestionIndex = Math.min(completedAnswerGroups, questions.length - 1);
  const maxDuration = sessionConfig.duration * 60;

  const metricLabels: Record<keyof LiveMetrics, string> = {
    confidence: t("mockInterviewSession.metricConfidence"),
    clarity: t("mockInterviewSession.metricClarity"),
    pace: t("mockInterviewSession.metricPace"),
    eyeContact: t("mockInterviewSession.metricEyeContact"),
    technicalAccuracy: t("mockInterviewSession.metricTechnicalAccuracy"),
    articulation: t("mockInterviewSession.metricArticulation"),
  };

  const isSpeakingUser = isSpeaking === "user";
  const isSpeakingAssistant = isSpeaking === "assistant";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <MockSessionHeader
          elapsedTime={elapsedTime}
          maxDuration={maxDuration}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={questions.length}
          isSpeaking={isSpeakingUser || isSpeakingAssistant}
          recordingLabel={t("mockInterviewSession.recording")}
          speakingLabel={
            isSpeakingAssistant
              ? t("mockInterviewSession.aiSpeaking") || "AI is speaking…"
              : isSpeakingUser
                ? t("mockInterviewSession.speaking")
                : t("mockInterviewSession.speaking")
          }
          questionOfLabel={t("mockInterviewSession.questionOf", {
            current: Math.min(completedAnswerGroups + 1, questions.length),
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
              isTTSEnabled={true}
              isSpeakingTTS={false}
              youLabel={t("mockInterviewSession.you")}
              cameraAccessDeniedLabel={t("mockInterviewSession.cameraAccessDenied")}
              onToggleMic={toggleMic}
              onToggleVideo={toggleVideo}
              onToggleTTS={() => {}}
              onEndSession={handleEndSession}
            />

            {/* Voice status — no text input; answer by talking */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <p className="text-center text-gray-700 dark:text-gray-300 font-medium">
                {!isCallActive
                  ? t("mockInterviewSession.connecting") || "Connecting to voice interview…"
                  : isSpeakingAssistant
                    ? t("mockInterviewSession.listenToQuestion") || "Listen to the question — then answer out loud."
                    : isSpeakingUser
                      ? t("mockInterviewSession.youAreSpeaking") || "You're speaking…"
                      : t("mockInterviewSession.speakWhenReady") || "Speak your answer when ready."}
              </p>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                {t("mockInterviewSession.voiceOnlyHint") || "Voice only — no typing. The AI asks, you answer, then the next question."}
              </p>
            </div>

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

      {completionModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mock-completion-title"
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-lg w-full max-h-[88vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="p-6 space-y-5">
              <div>
                <h2
                  id="mock-completion-title"
                  className="text-xl font-semibold text-gray-900 dark:text-white"
                >
                  {t("mockInterviewSession.feedbackTitle")}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {completionModal.results.position as string}
                  {" · "}
                  {t("mockInterviewSession.scoreLabel")}{" "}
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {completionModal.serverData.metrics.overallScore}/100
                  </span>
                  {completionModal.serverData.metrics.overallRating
                    ? ` (${completionModal.serverData.metrics.overallRating})`
                    : ""}
                </p>
              </div>

              {(() => {
                const s = completionModal.serverData.summaryStructured;
                const improve = s?.areasForImprovement?.filter(Boolean) ?? [];
                const recs = s?.recommendations?.filter(Boolean) ?? [];
                const strengths = s?.strengths?.filter(Boolean).filter(s => s !== "s:**") ?? [];
                return (
                  <>
                    {improve.length > 0 && (
                      <section>
                        <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200 uppercase tracking-wide mb-2">
                          {t("mockInterviewSession.improveAreasTitle")}
                        </h3>
                        <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1.5">
                          {improve.map((item, i) => (
                            <li key={`imp-${i}`}>{item}</li>
                          ))}
                        </ul>
                      </section>
                    )}

                    {recs.length > 0 && (
                      <section>
                        <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 uppercase tracking-wide mb-2">
                          {t("mockInterviewSession.recommendationsTitle")}
                        </h3>
                        <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1.5">
                          {recs.map((item, i) => (
                            <li key={`rec-${i}`}>{item}</li>
                          ))}
                        </ul>
                      </section>
                    )}

                    {strengths.length > 0 && (
                      <section>
                        <h3 className="text-sm font-semibold text-green-800 dark:text-green-200 uppercase tracking-wide mb-2">
                          {t("mockInterviewSession.strengthsTitle")}
                        </h3>
                        <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1.5">
                          {strengths.filter((s): s is string => s !== "s:**").map((item, i) => (
                            <li key={`str-${i}`}>{item}</li>
                          ))}
                        </ul>
                      </section>
                    )}
                  </>
                );
              })()}

              {completionModal.serverData.questionInsights &&
                completionModal.serverData.questionInsights.some(
                  (q) => q.improvements.length > 0 || q.strengths.length > 0,
                ) && (
                  <section>
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-2">
                      {t("mockInterviewSession.bySectionTitle")}
                    </h3>
                    <div className="space-y-3">
                      {completionModal.serverData.questionInsights.map((q) => (
                        <div
                          key={q.id}
                          className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-sm"
                        >
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="font-medium capitalize text-gray-900 dark:text-white">
                              {q.category}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {q.difficulty}
                              {q.score != null ? ` · ${q.score}%` : ""}
                            </span>
                          </div>
                          {q.improvements.length > 0 && (
                            <p className="text-amber-800 dark:text-amber-200/90 text-xs mt-1">
                              <span className="font-medium">
                                {t("mockInterviewSession.improveLabel")}{" "}
                              </span>
                              {q.improvements.join(" · ")}
                            </p>
                          )}
                          {q.strengths.length > 0 && (
                            <p className="text-green-800 dark:text-green-200/90 text-xs mt-1">
                              <span className="font-medium">
                                {t("mockInterviewSession.strengthLabel")}{" "}
                              </span>
                              {q.strengths?.filter((s): s is string => s !== "s:**").join(" · ")}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

              <button
                type="button"
                onClick={dismissCompletionModal}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
              >
                {t("mockInterviewSession.continueToDashboard")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
