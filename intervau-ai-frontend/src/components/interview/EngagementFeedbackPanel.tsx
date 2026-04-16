import { useEffect, useRef } from "react";
import { Eye, AlertTriangle, Activity, TrendingUp, Zap } from "lucide-react";

interface EngagementFeedback {
  averageScore?: number;
  totalEyeContactDuration?: number;
  totalDistractionDuration?: number;
  yawnCount?: number;
  engagementTrend?: number[];
  framesAnalyzed?: number;
}

interface EngagementFeedbackPanelProps {
  engagement: EngagementFeedback;
}

/** Format seconds → "1m 23s" or "45s" */
function formatDuration(seconds: number): string {
  const s = Math.round(Math.abs(seconds));
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

/** Compute focus % and distraction % from the two durations. */
function computePercentages(focusSec: number, distractSec: number) {
  const total = focusSec + distractSec;
  if (total <= 0) return { focusPct: 0, distractPct: 0 };
  return {
    focusPct: Math.round((focusSec / total) * 100),
    distractPct: Math.round((distractSec / total) * 100),
  };
}

function normalizeDurations(
  focusSec: number,
  distractSec: number,
  framesAnalyzed: number,
): { focusSec: number; distractSec: number } {
  const safeFocus = Number.isFinite(focusSec) ? Math.max(0, focusSec) : 0;
  const safeDistract = Number.isFinite(distractSec)
    ? Math.max(0, distractSec)
    : 0;
  const total = safeFocus + safeDistract;
  if (total <= 0 || framesAnalyzed <= 0) {
    return { focusSec: safeFocus, distractSec: safeDistract };
  }

  // Engagement service processes roughly 1 frame per sample; with capped 2s deltas,
  // total tracked duration should not exceed framesAnalyzed * 2 seconds.
  const maxPlausibleSeconds = framesAnalyzed * 2;
  if (total <= maxPlausibleSeconds) {
    return { focusSec: safeFocus, distractSec: safeDistract };
  }

  const scale = maxPlausibleSeconds / total;
  return {
    focusSec: safeFocus * scale,
    distractSec: safeDistract * scale,
  };
}

/** Mini donut/pie chart drawn on a <canvas> — no external lib needed. */
function DonutChart({
  focusPct,
  distractPct,
  score,
}: {
  focusPct: number;
  distractPct: number;
  score: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 140;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const outerR = 60;
    const innerR = 38;
    const lineW = outerR - innerR;

    ctx.clearRect(0, 0, size, size);

    // Background ring
    ctx.beginPath();
    ctx.arc(cx, cy, outerR - lineW / 2, 0, Math.PI * 2);
    ctx.lineWidth = lineW;
    ctx.strokeStyle = "rgba(30, 41, 59, 0.55)";
    ctx.stroke();

    const startAngle = -Math.PI / 2;

    // Focus arc (emerald)
    const focusEnd = startAngle + (focusPct / 100) * Math.PI * 2;
    if (focusPct > 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, outerR - lineW / 2, startAngle, focusEnd);
      ctx.lineWidth = lineW;
      ctx.strokeStyle = "#10b981"; // emerald-500
      ctx.lineCap = "round";
      ctx.stroke();
    }

    // Distraction arc (rose)
    const distractEnd = focusEnd + (distractPct / 100) * Math.PI * 2;
    if (distractPct > 0) {
      const gapStart = focusPct > 0 ? focusEnd + 0.06 : startAngle;
      ctx.beginPath();
      ctx.arc(cx, cy, outerR - lineW / 2, gapStart, distractEnd);
      ctx.lineWidth = lineW;
      ctx.strokeStyle = "#f43f5e"; // rose-500
      ctx.lineCap = "round";
      ctx.stroke();
    }

    // Reset lineCap
    ctx.lineCap = "butt";

    // Center text: score
    const scoreColor =
      score >= 70 ? "#34d399" : score >= 40 ? "#fbbf24" : "#fb7185";
    ctx.fillStyle = scoreColor;
    ctx.font = `bold ${dpr > 1 ? 22 : 20}px Inter, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${Math.round(score)}%`, cx, cy - 6);

    ctx.fillStyle = "rgba(148,163,184,0.9)";
    ctx.font = `${dpr > 1 ? 10 : 9}px Inter, system-ui, sans-serif`;
    ctx.fillText("avg score", cx, cy + 10);
  }, [focusPct, distractPct, score]);

  return <canvas ref={canvasRef} />;
}

/** Micro sparkline for engagement trend */
function SparkLine({ trend }: { trend: number[] }) {
  if (trend.length < 2) return null;
  const W = 160;
  const H = 36;
  const pts = trend.slice(-40);
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const range = max - min || 1;
  const xs = pts.map((_, i) => (i / (pts.length - 1)) * W);
  const ys = pts.map((v) => H - ((v - min) / range) * (H - 4) - 2);
  const d = xs
    .map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <path
        d={d}
        fill="none"
        stroke="url(#sparkGrad)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function EngagementFeedbackPanel({
  engagement,
}: EngagementFeedbackPanelProps) {
  const {
    averageScore = 0,
    totalEyeContactDuration = 0,
    totalDistractionDuration = 0,
    yawnCount = 0,
    engagementTrend = [],
    framesAnalyzed = 0,
  } = engagement ?? {};

  const normalizedDurations = normalizeDurations(
    totalEyeContactDuration,
    totalDistractionDuration,
    framesAnalyzed,
  );

  const { focusPct, distractPct } = computePercentages(
    normalizedDurations.focusSec,
    normalizedDurations.distractionSec,
  );

  const scoreColor =
    averageScore >= 70
      ? "text-emerald-400"
      : averageScore >= 40
        ? "text-amber-400"
        : "text-rose-400";

  const scoreBarColor =
    averageScore >= 70
      ? "bg-emerald-500"
      : averageScore >= 40
        ? "bg-amber-500"
        : "bg-rose-500";

  return (
    <section
      className="rounded-2xl border border-sky-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 overflow-hidden shadow-[0_4px_24px_rgba(15,23,42,0.5)]"
      aria-labelledby="eng-feedback-heading"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-700/60 bg-slate-800/50">
        <Activity className="w-4 h-4 text-sky-400 flex-shrink-0" />
        <h3
          id="eng-feedback-heading"
          className="text-sm font-semibold text-white tracking-wide"
        >
          Engagement Analysis
        </h3>
        <span className="ml-auto text-xs text-slate-400 font-mono">
          {framesAnalyzed.toLocaleString()} frames
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* Top row: donut + summary cards */}
        <div className="flex gap-4 items-center">
          {/* Donut */}
          <div className="flex-shrink-0 relative">
            <DonutChart
              focusPct={focusPct}
              distractPct={distractPct}
              score={averageScore}
            />
          </div>

          {/* Cards */}
          <div className="flex-1 space-y-2.5">
            {/* Focus card */}
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 px-3.5 py-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-300">
                    Focus Time
                  </span>
                </div>
                <span className="text-xs font-bold text-emerald-300 tabular-nums">
                  {focusPct}%
                </span>
              </div>
              <div className="w-full bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${focusPct}%` }}
                />
              </div>
              <p className="text-[10px] text-emerald-400/70 mt-1 font-mono">
                {formatDuration(normalizedDurations.focusSec)} eye contact
              </p>
            </div>

            {/* Distraction card */}
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/25 px-3.5 py-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-xs font-semibold text-rose-300">
                    Distraction Time
                  </span>
                </div>
                <span className="text-xs font-bold text-rose-300 tabular-nums">
                  {distractPct}%
                </span>
              </div>
              <div className="w-full bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-rose-500 h-1.5 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${distractPct}%` }}
                />
              </div>
              <p className="text-[10px] text-rose-400/70 mt-1 font-mono">
                {formatDuration(normalizedDurations.distractionSec)} distracted
              </p>
            </div>
          </div>
        </div>

        {/* Overall engagement score bar */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-xs font-semibold text-slate-300">
                Avg Engagement Score
              </span>
            </div>
            <span className={`text-sm font-bold ${scoreColor} tabular-nums`}>
              {Math.round(averageScore)}%
            </span>
          </div>
          <div className="w-full bg-slate-700/60 rounded-full h-2.5 overflow-hidden">
            <div
              className={`${scoreBarColor} h-2.5 rounded-full transition-all duration-700 ease-out relative`}
              style={{ width: `${averageScore}%` }}
            >
              <div className="absolute inset-0 bg-white/20 rounded-full" />
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>0</span>
            <span>Low</span>
            <span>Moderate</span>
            <span>High</span>
            <span>100</span>
          </div>
        </div>

        {/* Trend sparkline */}
        {engagementTrend.length >= 2 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-semibold text-slate-300">
                Engagement Trend
              </span>
              <span className="ml-auto text-[10px] text-slate-500">
                last {Math.min(engagementTrend.length, 40)} readings
              </span>
            </div>
            <div className="rounded-xl bg-slate-800/70 border border-slate-700/50 px-3 py-2.5 overflow-hidden">
              <SparkLine trend={engagementTrend} />
            </div>
          </div>
        )}

        {/* Stats footer row */}
        <div className="grid grid-cols-3 gap-2">
          {/* Eye contact */}
          <div className="rounded-lg bg-slate-800/70 border border-slate-700/50 px-2.5 py-2 text-center">
            <Eye className="w-3.5 h-3.5 text-emerald-400 mx-auto mb-0.5" />
            <p className="text-[11px] font-bold text-white tabular-nums">
              {formatDuration(normalizedDurations.focusSec)}
            </p>
            <p className="text-[9px] text-slate-400">Eye Contact</p>
          </div>

          {/* Yawns */}
          <div className="rounded-lg bg-slate-800/70 border border-slate-700/50 px-2.5 py-2 text-center">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mx-auto mb-0.5" />
            <p className="text-[11px] font-bold text-white tabular-nums">
              {yawnCount}×
            </p>
            <p className="text-[9px] text-slate-400">Yawns</p>
          </div>

          {/* Score level */}
          <div className="rounded-lg bg-slate-800/70 border border-slate-700/50 px-2.5 py-2 text-center">
            <Activity className="w-3.5 h-3.5 text-sky-400 mx-auto mb-0.5" />
            <p className={`text-[11px] font-bold tabular-nums ${scoreColor}`}>
              {averageScore >= 70
                ? "High"
                : averageScore >= 40
                  ? "Moderate"
                  : "Low"}
            </p>
            <p className="text-[9px] text-slate-400">Level</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 justify-center text-[10px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
            <span>Focused</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 flex-shrink-0" />
            <span>Distracted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600 flex-shrink-0" />
            <span>Untracked</span>
          </div>
        </div>
      </div>
    </section>
  );
}
