import { useEffect, useRef } from "react";
import {
  Activity,
  AlertTriangle,
  Eye,
  EyeOff,
  Gauge,
  Focus,
} from "lucide-react";

interface EngagementMetrics {
  timestamp: number;
  face_detected: boolean;
  eye_contact: boolean;
  eye_contact_duration: number;
  head_pose: {
    pitch: number;
    yaw: number;
    roll: number;
  };
  engagement_score: number;
  engagement_level: string;
  distraction_duration: number;
  yawn_detected: boolean;
  gaze_x: number;
  gaze_y: number;
  gaze_variation_x: number;
  gaze_variation_y: number;
  mar: number;
  blink_ratio: number;
  is_blinking: boolean;
  is_focused: boolean;
}

interface EngagementOverlayProps {
  metrics: EngagementMetrics | null;
  className?: string;
}

const MAX_SAMPLE_DELTA_SECONDS = 2;

function toEpochMs(ts: number): number {
  // Support both second-based and millisecond-based timestamps.
  return ts < 1_000_000_000_000 ? ts * 1000 : ts;
}

/** Format seconds → "0m 00s" */
function fmtTime(s: number): string {
  const sec = Math.round(Math.abs(s));
  return `${Math.floor(sec / 60)}m ${String(sec % 60).padStart(2, "0")}s`;
}

/** Animated circular ring drawn on canvas. */
function RingMeter({
  value,
  size = 52,
  strokeWidth = 5,
  color,
}: {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color: string; // CSS color
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const r = (size - strokeWidth * 2) / 2;

    ctx.clearRect(0, 0, size, size);

    // Track
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = "rgba(51, 65, 85, 0.7)";
    ctx.stroke();

    // Fill arc
    const progress = Math.min(Math.max(value, 0), 100) / 100;
    if (progress > 0) {
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + progress * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.lineWidth = strokeWidth;
      ctx.strokeStyle = color;
      ctx.lineCap = "round";
      ctx.stroke();
    }
  }, [value, size, strokeWidth, color]);

  return <canvas ref={canvasRef} />;
}

export function EngagementOverlay({
  metrics,
  className = "",
}: EngagementOverlayProps) {
  const totalsRef = useRef<{
    focusSeconds: number;
    distractionSeconds: number;
    lastTimestampMs: number | null;
  }>({
    focusSeconds: 0,
    distractionSeconds: 0,
    lastTimestampMs: null,
  });

  // Recompute cumulative focus/distraction durations from frame cadence.
  useEffect(() => {
    if (!metrics) {
      totalsRef.current = {
        focusSeconds: 0,
        distractionSeconds: 0,
        lastTimestampMs: null,
      };
      return;
    }

    const nowMs = toEpochMs(metrics.timestamp);
    const prevMs = totalsRef.current.lastTimestampMs;

    if (prevMs !== null && nowMs > prevMs) {
      const deltaSeconds = Math.min(
        MAX_SAMPLE_DELTA_SECONDS,
        (nowMs - prevMs) / 1000,
      );

      if (metrics.is_focused || metrics.eye_contact) {
        totalsRef.current.focusSeconds += deltaSeconds;
      } else {
        totalsRef.current.distractionSeconds += deltaSeconds;
      }
    }

    totalsRef.current.lastTimestampMs = nowMs;
  }, [metrics]);

  /* ---------- Initializing state ---------- */
  if (!metrics) {
    return (
      <div
        className={`rounded-xl border border-sky-500/30 bg-slate-950/85 backdrop-blur-md px-3.5 py-3 text-white shadow-xl ${className}`}
      >
        <div className="flex items-center gap-2 text-slate-300">
          <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
          <span className="text-[11px] font-mono">
            Initializing engagement tracking…
          </span>
        </div>
      </div>
    );
  }

  /* ---------- Derived values ---------- */
  const score = metrics.engagement_score;
  const focusSec = totalsRef.current.focusSeconds;
  const distractSec = totalsRef.current.distractionSeconds;
  const totalSec = focusSec + distractSec;
  const focusPct = totalSec > 0 ? Math.round((focusSec / totalSec) * 100) : 0;
  const distractPct =
    totalSec > 0 ? Math.round((distractSec / totalSec) * 100) : 0;

  const scoreColor =
    score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#f43f5e";
  const scoreTailwind =
    score >= 70
      ? "text-emerald-400"
      : score >= 40
        ? "text-amber-400"
        : "text-rose-400";
  const scoreBarTw =
    score >= 70
      ? "bg-emerald-500"
      : score >= 40
        ? "bg-amber-500"
        : "bg-rose-500";

  /* ---------- Render ---------- */
  return (
    <div
      className={`rounded-2xl border border-sky-500/25 bg-slate-950/90 backdrop-blur-md shadow-[0_8px_32px_rgba(2,12,27,0.6)] overflow-hidden ${className}`}
      style={{ minWidth: 240 }}
    >
      {/* ── Header bar ── */}
      <div className="flex items-center gap-2 px-3.5 pt-3 pb-2 border-b border-slate-800/70">
        <div
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
            metrics.face_detected
              ? "bg-emerald-400 animate-pulse"
              : "bg-rose-500 animate-pulse"
          }`}
        />
        <p className="text-[10px] uppercase tracking-[0.18em] text-sky-300/90 font-semibold">
          Live Engagement HUD
        </p>
        <span className="ml-auto text-[10px] text-slate-500 font-mono">
          {new Date(metrics.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </span>
      </div>

      <div className="px-3.5 py-3 space-y-3">
        {/* ── Score row with ring ── */}
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <RingMeter
              value={score}
              size={52}
              strokeWidth={5}
              color={scoreColor}
            />
            {/* Center value */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className={`text-[11px] font-bold leading-none ${scoreTailwind}`}
              >
                {Math.round(score)}
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <Gauge className={`w-3 h-3 ${scoreTailwind}`} />
                <span className="text-[11px] font-semibold text-slate-200">
                  Engagement
                </span>
              </div>
              <span className={`text-xs font-bold ${scoreTailwind}`}>
                {metrics.engagement_level}
              </span>
            </div>
            {/* Score bar */}
            <div className="w-full bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
              <div
                className={`${scoreBarTw} h-1.5 rounded-full transition-all duration-500`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Focus / Distraction cards ── */}
        <div className="grid grid-cols-2 gap-2">
          {/* Focus */}
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-2">
            <div className="flex items-center gap-1 mb-1.5">
              <Focus className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] font-semibold text-emerald-300">
                Focus
              </span>
            </div>
            {/* Mini bar */}
            <div className="w-full bg-slate-700/60 rounded-full h-1 overflow-hidden mb-1">
              <div
                className="bg-emerald-500 h-1 rounded-full transition-all duration-500"
                style={{ width: `${focusPct}%` }}
              />
            </div>
            <div className="flex items-end justify-between">
              <span className="text-[10px] font-mono text-emerald-300/80">
                {fmtTime(focusSec)}
              </span>
              <span className="text-xs font-bold text-emerald-300 tabular-nums">
                {focusPct}%
              </span>
            </div>
          </div>

          {/* Distraction */}
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 px-2.5 py-2">
            <div className="flex items-center gap-1 mb-1.5">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              <span className="text-[10px] font-semibold text-rose-300">
                Distraction
              </span>
            </div>
            {/* Mini bar */}
            <div className="w-full bg-slate-700/60 rounded-full h-1 overflow-hidden mb-1">
              <div
                className="bg-rose-500 h-1 rounded-full transition-all duration-500"
                style={{ width: `${distractPct}%` }}
              />
            </div>
            <div className="flex items-end justify-between">
              <span className="text-[10px] font-mono text-rose-300/80">
                {fmtTime(distractSec)}
              </span>
              <span className="text-xs font-bold text-rose-300 tabular-nums">
                {distractPct}%
              </span>
            </div>
          </div>
        </div>

        {/* ── Eye contact + Focus state ── */}
        <div className="rounded-xl bg-slate-900/60 border border-slate-700/50 px-3 py-2 space-y-1.5">
          {/* Eye contact */}
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              {metrics.eye_contact ? (
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span className="text-slate-300">Eye Contact</span>
            </div>
            <span
              className={`font-semibold ${
                metrics.eye_contact ? "text-emerald-300" : "text-amber-300"
              }`}
            >
              {metrics.eye_contact ? "Maintained" : "Not detected"}
            </span>
          </div>

          {/* Focus state */}
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-slate-300">State</span>
            </div>
            <span
              className={`font-semibold ${
                metrics.is_focused ? "text-emerald-300" : "text-rose-300"
              }`}
            >
              {metrics.is_focused ? "Focused" : "Distracted"}
            </span>
          </div>
        </div>

        {/* ── Alert badges ── */}
        <div className="space-y-1">
          {metrics.yawn_detected && (
            <div className="flex items-center gap-1.5 rounded-lg border border-amber-400/40 bg-amber-500/12 px-2.5 py-1 text-[10px] font-semibold text-amber-200 animate-pulse">
              <AlertTriangle className="w-3 h-3 flex-shrink-0" />
              Yawning detected — stay alert!
            </div>
          )}
          {!metrics.face_detected && (
            <div className="flex items-center gap-1.5 rounded-lg border border-rose-400/40 bg-rose-500/12 px-2.5 py-1 text-[10px] font-semibold text-rose-200">
              <EyeOff className="w-3 h-3 flex-shrink-0" />
              Face not visible — move into frame
            </div>
          )}
          {metrics.is_blinking && (
            <div className="rounded-lg border border-sky-400/30 bg-sky-500/10 px-2.5 py-1 text-[10px] font-semibold text-sky-200">
              Blink detected
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
