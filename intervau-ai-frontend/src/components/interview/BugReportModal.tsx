import { useState, useEffect, useRef } from "react";
import { X, Bug, Send, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import api from "../../services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type Category =
  | "audio"
  | "video"
  | "ai_response"
  | "ui_freeze"
  | "connection"
  | "scoring"
  | "other";

type Severity = "low" | "medium" | "high";

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId?: string;
  sessionType?: "mock" | "live" | "public" | "general";
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: "audio", label: "Audio / Microphone", emoji: "🎤" },
  { value: "video", label: "Video / Camera", emoji: "📹" },
  { value: "ai_response", label: "AI Response Quality", emoji: "🤖" },
  { value: "ui_freeze", label: "UI Freeze / Crash", emoji: "🧊" },
  { value: "connection", label: "Connection / Network", emoji: "📡" },
  { value: "scoring", label: "Scoring / Results", emoji: "📊" },
  { value: "other", label: "Other", emoji: "💬" },
];

const SEVERITIES: { value: Severity; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "#22c55e" },
  { value: "medium", label: "Medium", color: "#f59e0b" },
  { value: "high", label: "High", color: "#ef4444" },
];

const MIN_CHARS = 20;
const MAX_CHARS = 2000;

// ─── Component ────────────────────────────────────────────────────────────────

export default function BugReportModal({
  isOpen,
  onClose,
  sessionId,
  sessionType = "mock",
}: BugReportModalProps) {
  const [category, setCategory] = useState<Category | "">("");
  const [severity, setSeverity] = useState<Severity>("medium");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Auto-focus description when category is chosen
  useEffect(() => {
    if (category && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [category]);

  // Reset form when modal is opened
  useEffect(() => {
    if (isOpen) {
      setCategory("");
      setSeverity("medium");
      setDescription("");
      setStatus("idle");
      setErrorMsg("");
    }
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const charCount = description.length;
  const isDescriptionValid = charCount >= MIN_CHARS && charCount <= MAX_CHARS;
  const canSubmit =
    category !== "" && isDescriptionValid && status !== "loading";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || category === "") return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await api.submitBugReport({
        sessionId: sessionId || undefined,
        sessionType,
        category,
        description: description.trim(),
        severity,
      });

      if (res.success) {
        setStatus("success");
        // Auto-close after 2.5 s
        setTimeout(() => {
          onClose();
        }, 2500);
      } else {
        setStatus("error");
        setErrorMsg(res.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Failed to send report. Check your connection and retry.");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* ── Inline styles ────────────────────────────────────────────────── */}
      <style>{`
        @keyframes brm-backdrop-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes brm-slide-up {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes brm-success-pop {
          0%   { transform: scale(0.7); opacity: 0; }
          70%  { transform: scale(1.1); }
          100% { transform: scale(1);   opacity: 1; }
        }

        .brm-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          animation: brm-backdrop-in 0.2s ease;
        }

        .brm-card {
          position: relative;
          width: 100%;
          max-width: 540px;
          max-height: 92vh;
          overflow-y: auto;
          background: linear-gradient(145deg, rgba(15, 23, 42, 0.97) 0%, rgba(17, 24, 48, 0.97) 100%);
          border: 1px solid rgba(99, 102, 241, 0.25);
          border-radius: 20px;
          box-shadow:
            0 0 0 1px rgba(99, 102, 241, 0.1),
            0 24px 60px rgba(0, 0, 0, 0.6),
            0 0 80px rgba(99, 102, 241, 0.08) inset;
          animation: brm-slide-up 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
          scrollbar-width: thin;
          scrollbar-color: rgba(99,102,241,0.3) transparent;
        }

        .brm-card::-webkit-scrollbar { width: 4px; }
        .brm-card::-webkit-scrollbar-track { background: transparent; }
        .brm-card::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.35); border-radius: 4px; }

        /* Decorative top glow bar */
        .brm-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #6366f1, #a78bfa, #6366f1, transparent);
          border-radius: 20px 20px 0 0;
        }

        .brm-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 24px 24px 0;
        }

        .brm-icon-wrap {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(167,139,250,0.15));
          border: 1px solid rgba(99,102,241,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .brm-title {
          flex: 1;
        }
        .brm-title h2 {
          font-size: 17px;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 2px;
          letter-spacing: -0.3px;
        }
        .brm-title p {
          font-size: 12.5px;
          color: #94a3b8;
          margin: 0;
        }

        .brm-close {
          width: 32px;
          height: 32px;
          border: none;
          background: rgba(255,255,255,0.06);
          border-radius: 8px;
          color: #64748b;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s, color 0.15s;
          flex-shrink: 0;
        }
        .brm-close:hover { background: rgba(239,68,68,0.15); color: #f87171; }

        .brm-body {
          padding: 20px 24px 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        /* Session badge */
        .brm-session-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          background: rgba(99,102,241,0.1);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 8px;
          font-size: 11.5px;
          color: #a5b4fc;
          font-family: 'SF Mono', 'Fira Code', monospace;
          width: fit-content;
        }
        .brm-session-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #6366f1;
        }

        /* Field labels */
        .brm-field-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          margin-bottom: 8px;
        }

        /* Category grid */
        .brm-category-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .brm-cat-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: #94a3b8;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.15s;
          text-align: left;
        }
        .brm-cat-btn:hover {
          background: rgba(99,102,241,0.1);
          border-color: rgba(99,102,241,0.35);
          color: #c7d2fe;
        }
        .brm-cat-btn.active {
          background: rgba(99,102,241,0.18);
          border-color: #6366f1;
          color: #e0e7ff;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }
        .brm-cat-emoji { font-size: 16px; }

        /* Severity pills */
        .brm-severity-row {
          display: flex;
          gap: 8px;
        }
        .brm-sev-btn {
          flex: 1;
          padding: 8px 4px;
          border-radius: 10px;
          border: 1.5px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: #94a3b8;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .brm-sev-btn .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .brm-sev-btn:hover { border-color: rgba(255,255,255,0.2); color: #e2e8f0; }
        .brm-sev-btn.active-low  { background: rgba(34,197,94,0.12); border-color: #22c55e; color: #86efac; box-shadow: 0 0 0 3px rgba(34,197,94,0.1); }
        .brm-sev-btn.active-medium { background: rgba(245,158,11,0.12); border-color: #f59e0b; color: #fcd34d; box-shadow: 0 0 0 3px rgba(245,158,11,0.1); }
        .brm-sev-btn.active-high { background: rgba(239,68,68,0.12); border-color: #ef4444; color: #fca5a5; box-shadow: 0 0 0 3px rgba(239,68,68,0.1); }

        /* Textarea */
        .brm-textarea-wrap { position: relative; }
        .brm-textarea {
          width: 100%;
          min-height: 120px;
          padding: 12px 14px;
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          color: #e2e8f0;
          font-size: 14px;
          line-height: 1.6;
          resize: vertical;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
          font-family: inherit;
        }
        .brm-textarea::placeholder { color: #475569; }
        .brm-textarea:focus {
          border-color: rgba(99,102,241,0.5);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }
        .brm-textarea.over-limit {
          border-color: rgba(239,68,68,0.5);
          box-shadow: 0 0 0 3px rgba(239,68,68,0.1);
        }

        .brm-char-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 5px;
        }
        .brm-char-hint { font-size: 11.5px; color: #475569; }
        .brm-char-count { font-size: 11.5px; font-weight: 600; }
        .brm-char-count.ok    { color: #6366f1; }
        .brm-char-count.low   { color: #f59e0b; }
        .brm-char-count.over  { color: #ef4444; }
        .brm-char-count.valid { color: #22c55e; }

        /* Error message */
        .brm-error {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 10px 12px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 10px;
          color: #fca5a5;
          font-size: 13px;
        }

        /* Submit button */
        .brm-submit {
          width: 100%;
          padding: 13px;
          border: none;
          border-radius: 12px;
          font-size: 14.5px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          box-shadow: 0 4px 20px rgba(99,102,241,0.35);
          letter-spacing: 0.2px;
        }
        .brm-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 28px rgba(99,102,241,0.5);
        }
        .brm-submit:active:not(:disabled) { transform: translateY(0); }
        .brm-submit:disabled {
          background: rgba(99,102,241,0.3);
          box-shadow: none;
          cursor: not-allowed;
          color: rgba(255,255,255,0.4);
        }

        /* Success state */
        .brm-success {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          padding: 48px 24px;
          text-align: center;
        }
        .brm-success-icon {
          animation: brm-success-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
          color: #22c55e;
        }
        .brm-success h3 {
          margin: 0;
          font-size: 19px;
          font-weight: 700;
          color: #f1f5f9;
        }
        .brm-success p {
          margin: 0;
          font-size: 13.5px;
          color: #64748b;
          max-width: 300px;
          line-height: 1.6;
        }
        .brm-success-closing {
          font-size: 12px;
          color: #475569;
          margin-top: 4px;
        }
      `}</style>

      {/* ── Backdrop ────────────────────────────────────────────────────────── */}
      <div className="brm-backdrop" onClick={handleBackdropClick}>
        <div className="brm-card" ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="brm-title">

          {/* ── Success state ─────────────────────────────────────────────── */}
          {status === "success" ? (
            <>
              {/* Close button still available */}
              <div style={{ position: "absolute", top: 16, right: 16 }}>
                <button className="brm-close" onClick={onClose} aria-label="Close">
                  <X size={16} />
                </button>
              </div>
              <div className="brm-success">
                <div className="brm-success-icon">
                  <CheckCircle size={56} strokeWidth={1.5} />
                </div>
                <h3>Report Submitted!</h3>
                <p>
                  Thank you for helping us improve Intervau.AI. Our team will
                  review your report and work on a fix.
                </p>
                <span className="brm-success-closing">
                  This window will close automatically…
                </span>
              </div>
            </>
          ) : (
            <>
              {/* ── Header ──────────────────────────────────────────────── */}
              <div className="brm-header">
                <div className="brm-icon-wrap">
                  <Bug size={20} color="#a78bfa" strokeWidth={1.8} />
                </div>
                <div className="brm-title">
                  <h2 id="brm-title">Report an Issue</h2>
                  <p>Help us improve by describing what went wrong</p>
                </div>
                <button className="brm-close" onClick={onClose} aria-label="Close modal">
                  <X size={16} />
                </button>
              </div>

              {/* ── Body ────────────────────────────────────────────────── */}
              <form className="brm-body" onSubmit={handleSubmit} noValidate>

                {/* Session badge */}
                {sessionId && (
                  <div>
                    <div className="brm-session-badge">
                      <span className="brm-session-badge-dot" />
                      Session: {sessionId.slice(0, 8).toUpperCase()}…
                    </div>
                  </div>
                )}

                {/* ── Category ──────────────────────────────────────────── */}
                <div>
                  <label className="brm-field-label">What type of issue?</label>
                  <div className="brm-category-grid">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        id={`brm-cat-${c.value}`}
                        className={`brm-cat-btn${category === c.value ? " active" : ""}`}
                        onClick={() => setCategory(c.value)}
                      >
                        <span className="brm-cat-emoji">{c.emoji}</span>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Severity ──────────────────────────────────────────── */}
                <div>
                  <label className="brm-field-label">How severe was it?</label>
                  <div className="brm-severity-row">
                    {SEVERITIES.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        id={`brm-sev-${s.value}`}
                        className={`brm-sev-btn${severity === s.value ? ` active-${s.value}` : ""}`}
                        onClick={() => setSeverity(s.value)}
                      >
                        <span
                          className="dot"
                          style={{ background: s.color }}
                        />
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Description ───────────────────────────────────────── */}
                <div>
                  <label htmlFor="brm-description" className="brm-field-label">
                    Describe what happened
                  </label>
                  <div className="brm-textarea-wrap">
                    <textarea
                      id="brm-description"
                      ref={textareaRef}
                      className={`brm-textarea${charCount > MAX_CHARS ? " over-limit" : ""}`}
                      placeholder="Tell us what went wrong — step by step if possible. The more detail, the faster we can fix it."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={5}
                    />
                    <div className="brm-char-row">
                      <span className="brm-char-hint">
                        Minimum {MIN_CHARS} characters
                      </span>
                      <span
                        className={`brm-char-count ${
                          charCount > MAX_CHARS
                            ? "over"
                            : charCount >= MIN_CHARS
                            ? "valid"
                            : charCount > 0
                            ? "low"
                            : "ok"
                        }`}
                      >
                        {charCount} / {MAX_CHARS}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── Inline error ──────────────────────────────────────── */}
                {status === "error" && errorMsg && (
                  <div className="brm-error" role="alert">
                    <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* ── Submit ────────────────────────────────────────────── */}
                <button
                  type="submit"
                  id="brm-submit-btn"
                  className="brm-submit"
                  disabled={!canSubmit}
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Submit Report
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
