import { useState, useRef, MouseEvent } from "react";
import { LucideIcon, Sparkles, Lock } from "lucide-react";

interface InterviewSelectionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  ctaText: string;
  onClick: () => void;
  locked?: boolean;
  lockMessage?: string;
  variant: "practice" | "professional";
}

export default function InterviewSelectionCard({
  title,
  description,
  icon: Icon,
  ctaText,
  onClick,
  locked = false,
  lockMessage,
  variant,
}: InterviewSelectionCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -20;

    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = requestAnimationFrame(() => {
      if (!cardRef.current) return;
      cardRef.current.style.setProperty("--rotateX", `${y}deg`);
      cardRef.current.style.setProperty("--rotateY", `${x}deg`);
    });
  };

  const handleMouseLeave = () => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    if (cardRef.current) {
      cardRef.current.style.setProperty("--rotateX", "0deg");
      cardRef.current.style.setProperty("--rotateY", "0deg");
    }
    setIsHovered(false);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={(event) => {
        if (locked) return;
        if ((event.target as HTMLElement).closest("button")) return;
        onClick();
      }}
      className="relative group perspective-1000"
      style={{
        transform:
          "rotateY(var(--rotateY, 0deg)) rotateX(var(--rotateX, 0deg))",
        transition: "transform 0.1s ease-out",
        willChange: "transform",
      }}
      role={locked ? undefined : "button"}
      tabIndex={locked ? -1 : 0}
    >
      {/* Main Card */}
      <div
        className={`relative overflow-hidden rounded-3xl border transition-all duration-500 ${
          locked
            ? "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
            : "border-white/20 dark:border-gray-700/50 hover:shadow-2xl hover:scale-[1.02]"
        }`}
        style={{
          minHeight: "450px",
        }}
      >
        {/* Animated Background Gradient */}
        {!locked && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                variant === "practice"
                  ? "linear-gradient(135deg, #0EA5E9 0%, #06B6D4 25%, #3B82F6 50%, #0284C7 75%, #0EA5E9 100%)"
                  : "linear-gradient(135deg, #10B981 0%, #059669 25%, #14B8A6 50%, #0D9488 75%, #10B981 100%)",
              backgroundSize: "400% 400%",
              animation: "gradientShift 15s ease infinite",
            }}
          />
        )}

        {/* Glassmorphism Overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent pointer-events-none"
          style={{
            backdropFilter: "blur(0px)",
          }}
        />

        {/* Animated Particles (Practice Card) */}
        {!locked && variant === "practice" && isHovered && (
          <>
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white/40 animate-float"
                style={{
                  width: `${Math.random() * 4 + 2}px`,
                  height: `${Math.random() * 4 + 2}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 3}s`,
                }}
              />
            ))}
          </>
        )}

        {/* Grid Pattern (Professional Card) */}
        {!locked && variant === "professional" && (
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: "30px 30px",
            }}
          />
        )}

        {/* Lock Overlay */}
        {locked && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center z-20">
            <div className="text-center px-6 max-w-sm">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-300 dark:bg-gray-700 mb-4">
                <Lock className="w-10 h-10 text-gray-500 dark:text-gray-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {lockMessage || "This feature is currently locked"}
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 p-8 h-full flex flex-col">
          {/* Icon Section */}
          <div className="mb-6">
            <div
              className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl transition-all duration-500 ${
                isHovered && !locked ? "scale-110 rotate-6" : ""
              }`}
              style={{
                background: locked
                  ? "rgba(156, 163, 175, 0.2)"
                  : variant === "practice"
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(255, 255, 255, 0.25)",
                backdropFilter: "blur(10px)",
                boxShadow: locked ? "none" : "0 8px 32px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Icon
                className={`w-10 h-10 ${
                  locked
                    ? "text-gray-400 dark:text-gray-500"
                    : "text-white drop-shadow-lg"
                }`}
              />
            </div>

            {/* Badge */}
            {!locked && variant === "professional" && (
              <div className="mt-4 inline-block">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-semibold rounded-full border border-white/30">
                  PREMIUM
                </span>
              </div>
            )}

            {!locked && variant === "practice" && (
              <div className="mt-4 inline-flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-semibold rounded-full border border-white/30">
                  INSTANT ACCESS
                </span>
              </div>
            )}
          </div>

          {/* Text Content */}
          <div className="flex-1 mb-6">
            <h3
              className={`text-3xl font-bold mb-3 ${
                locked
                  ? "text-gray-700 dark:text-gray-300"
                  : "text-white drop-shadow-md"
              }`}
            >
              {title}
            </h3>
            <p
              className={`text-base leading-relaxed ${
                locked ? "text-gray-600 dark:text-gray-400" : "text-white/90"
              }`}
            >
              {description}
            </p>
          </div>

          {/* CTA Button */}
          <button
            onClick={onClick}
            disabled={locked}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform ${
              locked
                ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed"
                : variant === "practice"
                  ? "bg-white text-blue-600 hover:bg-blue-50 hover:scale-105 hover:shadow-2xl"
                  : "bg-white text-green-600 hover:bg-green-50 hover:scale-105 hover:shadow-2xl"
            }`}
            style={{
              ...(isHovered &&
                !locked && {
                  boxShadow:
                    variant === "practice"
                      ? "0 0 30px rgba(14, 165, 233, 0.5)"
                      : "0 0 30px rgba(16, 185, 129, 0.5)",
                }),
            }}
          >
            {locked ? "🔒 Locked" : ctaText}
          </button>
        </div>

        {/* Shine Effect on Hover */}
        {!locked && isHovered && (
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background:
                "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)",
              backgroundSize: "200% 200%",
              animation: "shine 2s ease-in-out infinite",
            }}
          />
        )}
      </div>

      {/* Floating Shadow */}
      {!locked && isHovered && (
        <div
          className="absolute inset-0 -z-10 blur-2xl opacity-50 transition-opacity duration-500"
          style={{
            background:
              variant === "practice"
                ? "radial-gradient(circle, rgba(14, 165, 233, 0.4) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%)",
          }}
        />
      )}

      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          25% { background-position: 50% 75%; }
          50% { background-position: 100% 50%; }
          75% { background-position: 50% 25%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes float {
          0% {
            transform: translateY(0px) translateX(0px) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-50px) translateX(20px) scale(1.5);
            opacity: 0;
          }
        }

        @keyframes shine {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .perspective-1000 {
          perspective: 1000px;
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
}
