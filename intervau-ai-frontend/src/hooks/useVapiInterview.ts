import { useEffect, useRef, useState, useCallback } from "react";
import Vapi from "@vapi-ai/web";

export interface VapiMessage {
  role: "assistant" | "user";
  content: string;
  timestamp: string;
}

/** A parsed question-answer pair extracted from the Vapi transcript */
export interface QAPair {
  question: string;
  answer: string;
}

export type SpeakingRole = "assistant" | "user" | null;
export type CallStatus = "idle" | "connecting" | "active" | "ended" | "error";

interface UseVapiInterviewOptions {
  /** Vapi public API key from VITE_VAPI_API_KEY */
  publicKey: string;
  /** Called when the Vapi call is fully connected */
  onCallStart?: () => void;
  /**
   * Called when the call ends.
   * Provides parsed Q&A pairs and raw message history.
   */
  onCallEnd?: (qaPairs: QAPair[], messages: VapiMessage[]) => void;
  /** Called on any Vapi SDK error */
  onError?: (error: Error) => void;
  /** Called whenever a new final transcript message arrives */
  onTranscriptUpdate?: (messages: VapiMessage[]) => void;
}

/**
 * useVapiInterview
 *
 * Manages the full lifecycle of a Vapi voice interview:
 * - Initialises the Vapi SDK with the provided public key
 * - Exposes `startInterview` / `stopInterview` controls
 * - Collects final transcript messages in real time
 * - Parses transcript into Q&A pairs when the call ends
 */
export function useVapiInterview({
  publicKey,
  onCallStart,
  onCallEnd,
  onError,
  onTranscriptUpdate,
}: UseVapiInterviewOptions) {
  const vapiRef = useRef<Vapi | null>(null);

  const [status, setStatus] = useState<CallStatus>("idle");
  const [isSpeaking, setIsSpeaking] = useState<SpeakingRole>(null);
  const [messages, setMessages] = useState<VapiMessage[]>([]);

  // Keep a mutable ref to accumulate messages without stale closure issues
  const messagesRef = useRef<VapiMessage[]>([]);

  useEffect(() => {
    if (!publicKey) return;

    const vapi = new Vapi(publicKey);
    vapiRef.current = vapi;

    // ─── Event: call started ──────────────────────────────────────────────
    vapi.on("call-start", () => {
      setStatus("active");
      onCallStart?.();
    });

    // ─── Event: call ended ────────────────────────────────────────────────
    vapi.on("call-end", () => {
      setStatus("ended");
      setIsSpeaking(null);
      const qaPairs = buildQAPairs(messagesRef.current);
      onCallEnd?.(qaPairs, messagesRef.current);
    });

    // ─── Event: assistant speech started ─────────────────────────────────
    vapi.on("speech-start", () => {
      setIsSpeaking("assistant");
    });

    // ─── Event: speech ended ──────────────────────────────────────────────
    vapi.on("speech-end", () => {
      setIsSpeaking(null);
    });

    // ─── Event: transcript / message data ────────────────────────────────
    vapi.on("message", (msg: unknown) => {
      const m = msg as Record<string, unknown>;

      // Only process final transcripts (not partials, not system messages)
      if (
        m.type === "transcript" &&
        m.transcriptType === "final" &&
        (m.role === "assistant" || m.role === "user")
      ) {
        const role = m.role as "assistant" | "user";
        const content = String(m.transcript || "").trim();

        if (!content) return;

        // Update speaking indicator based on who just finished speaking
        setIsSpeaking(role);

        const newMsg: VapiMessage = {
          role,
          content,
          timestamp: new Date().toISOString(),
        };

        messagesRef.current = [...messagesRef.current, newMsg];
        setMessages([...messagesRef.current]);
        onTranscriptUpdate?.(messagesRef.current);
      }
    });

    // ─── Event: error ─────────────────────────────────────────────────────
    vapi.on("error", (err: unknown) => {
      console.error("[Vapi] Error:", err);
      setStatus("error");
      onError?.(err instanceof Error ? err : new Error(String(err)));
    });

    return () => {
      vapi.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey]);

  /**
   * Start the Vapi interview with an inline assistant configuration.
   *
   * Pass either:
   *  - A string (assistant ID from the Vapi dashboard)
   *  - An object (inline assistant config)
   */
  const startInterview = useCallback(
    async (
      assistantConfig: string | Record<string, unknown>,
      assistantOverrides?: Record<string, unknown>,
    ) => {
      if (!vapiRef.current) {
        console.error("[Vapi] SDK not initialised");
        return;
      }
      // Reset transcript for a fresh interview
      messagesRef.current = [];
      setMessages([]);
      setStatus("connecting");

      try {
        await (vapiRef.current as Vapi).start(
          assistantConfig as Parameters<Vapi["start"]>[0],
          assistantOverrides as Parameters<Vapi["start"]>[1],
        );
      } catch (err) {
        setStatus("error");
        onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /** Manually end the Vapi call (triggers the `call-end` event) */
  const stopInterview = useCallback(() => {
    vapiRef.current?.stop();
  }, []);

  return {
    /** Current call lifecycle status */
    status,
    /** Whether the call is currently connected */
    isCallActive: status === "active",
    /** Which speaker is currently active (or null when silent) */
    isSpeaking,
    /** Accumulated final transcript messages */
    messages,
    startInterview,
    stopInterview,
  };
}

// ─── Helper ──────────────────────────────────────────────────────────────────

/**
 * buildQAPairs
 *
 * Converts a flat transcript message list into structured Q&A pairs.
 *
 * Strategy:
 * - AI messages that end with "?" or start with known question patterns → question
 * - The next user message after a question → answer
 * - Consecutive AI messages are concatenated (handles multi-sentence questions)
 */
function buildQAPairs(msgs: VapiMessage[]): QAPair[] {
  const pairs: QAPair[] = [];
  let pendingQuestion = "";

  const QUESTION_STARTERS = [
    "tell me",
    "describe",
    "explain",
    "what",
    "how",
    "why",
    "can you",
    "could you",
    "have you",
    "do you",
    "walk me",
  ];

  function looksLikeQuestion(text: string): boolean {
    const lower = text.toLowerCase().trim();
    return (
      lower.endsWith("?") || QUESTION_STARTERS.some((s) => lower.startsWith(s))
    );
  }

  /** Opening message may bundle welcome + "Here's your first question: …" — extract Q1 for pairing. */
  function extractOpeningFirstQuestion(text: string): string | null {
    const m = text.match(/here'?s your first question:\s*(.+)$/is);
    return m?.[1]?.trim() ? m[1].trim() : null;
  }

  for (const msg of msgs) {
    if (msg.role === "assistant") {
      const fromOpening = extractOpeningFirstQuestion(msg.content);
      const questionBody =
        fromOpening ??
        (looksLikeQuestion(msg.content) ? msg.content.trim() : "");

      if (questionBody) {
        // If we have an unanswered question already, save it with an empty answer
        if (pendingQuestion) {
          pairs.push({
            question: pendingQuestion,
            answer: "(No answer provided)",
          });
        }
        pendingQuestion = questionBody;
      }
    } else if (msg.role === "user") {
      if (pendingQuestion) {
        pairs.push({ question: pendingQuestion, answer: msg.content });
        pendingQuestion = "";
      }
    }
  }

  // If the interview ended with an unanswered question, record it
  if (pendingQuestion) {
    pairs.push({ question: pendingQuestion, answer: "(No answer provided)" });
  }

  return pairs;
}
