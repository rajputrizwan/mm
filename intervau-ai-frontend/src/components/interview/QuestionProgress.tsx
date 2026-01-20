interface QuestionProgressProps {
    current: number;
    total: number;
    variant?: 'bar' | 'dots' | 'steps';
    showLabels?: boolean;
    className?: string;
}

/**
 * QuestionProgress - Displays interview progress
 * Shows how many questions have been answered
 */
export default function QuestionProgress({
    current,
    total,
    variant = 'bar',
    showLabels = true,
    className = '',
}: QuestionProgressProps) {
    const progress = Math.min((current / total) * 100, 100);

    if (variant === 'dots') {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                {showLabels && (
                    <span className="text-xs text-slate-400 mr-2">
                        {current}/{total}
                    </span>
                )}
                <div className="flex gap-1.5">
                    {Array.from({ length: total }).map((_, i) => (
                        <div
                            key={i}
                            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i < current
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/30'
                                    : i === current
                                        ? 'bg-cyan-500/50 animate-pulse'
                                        : 'bg-slate-700'
                                }`}
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (variant === 'steps') {
        return (
            <div className={`flex items-center ${className}`}>
                {Array.from({ length: total }).map((_, i) => (
                    <div key={i} className="flex items-center">
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${i < current
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                                    : i === current
                                        ? 'bg-cyan-500/20 text-cyan-400 border-2 border-cyan-500 animate-pulse'
                                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                                }`}
                        >
                            {i < current ? (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                i + 1
                            )}
                        </div>
                        {i < total - 1 && (
                            <div
                                className={`w-8 h-0.5 transition-all duration-300 ${i < current ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-slate-700'
                                    }`}
                            />
                        )}
                    </div>
                ))}
            </div>
        );
    }

    // Default: bar variant
    return (
        <div className={`w-full ${className}`}>
            {showLabels && (
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-300">
                        Question {current} of {total}
                    </span>
                    <span className="text-sm text-cyan-400 font-semibold">
                        {Math.round(progress)}%
                    </span>
                </div>
            )}
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500 ease-out relative"
                    style={{ width: `${progress}%` }}
                >
                    {/* Animated shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </div>
            </div>
        </div>
    );
}
