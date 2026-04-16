import { useEffect, useState } from 'react';

interface SpeechVisualizerProps {
    isActive: boolean;
    mode: 'thinking' | 'speaking' | 'listening' | 'idle';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

/**
 * SpeechVisualizer - AI avatar with visual feedback
 * Shows pulsing ring and glow effects based on AI state
 */
export default function SpeechVisualizer({
    isActive,
    mode,
    size = 'lg',
    className = '',
}: SpeechVisualizerProps) {
    const [pulseIntensity, setPulseIntensity] = useState(0);

    // Animate pulse when speaking
    useEffect(() => {
        if (mode === 'speaking' || mode === 'thinking') {
            const interval = setInterval(() => {
                setPulseIntensity(Math.random() * 0.5 + 0.5);
            }, 150);
            return () => clearInterval(interval);
        } else {
            setPulseIntensity(0);
        }
    }, [mode]);

    const sizeClasses = {
        sm: 'w-16 h-16',
        md: 'w-24 h-24',
        lg: 'w-32 h-32',
    };

    const ringSize = {
        sm: 'w-20 h-20',
        md: 'w-28 h-28',
        lg: 'w-40 h-40',
    };

    const outerRingSize = {
        sm: 'w-24 h-24',
        md: 'w-32 h-32',
        lg: 'w-48 h-48',
    };

    const getModeColor = () => {
        switch (mode) {
            case 'speaking':
                return 'from-cyan-500 to-blue-500';
            case 'thinking':
                return 'from-purple-500 to-pink-500';
            case 'listening':
                return 'from-green-500 to-emerald-500';
            default:
                return 'from-slate-600 to-slate-700';
        }
    };

    const getGlowColor = () => {
        switch (mode) {
            case 'speaking':
                return 'shadow-cyan-500/50';
            case 'thinking':
                return 'shadow-purple-500/50';
            case 'listening':
                return 'shadow-green-500/50';
            default:
                return 'shadow-slate-500/20';
        }
    };

    const getModeLabel = () => {
        switch (mode) {
            case 'speaking':
                return 'Speaking...';
            case 'thinking':
                return 'Thinking...';
            case 'listening':
                return 'Listening';
            default:
                return 'Ready';
        }
    };

    return (
        <div className={`relative flex flex-col items-center ${className}`}>
            {/* Outer pulsing rings */}
            {isActive && (
                <>
                    <div
                        className={`absolute ${outerRingSize[size]} rounded-full bg-gradient-to-r ${getModeColor()} opacity-10 animate-ping`}
                        style={{ animationDuration: '2s' }}
                    />
                    <div
                        className={`absolute ${ringSize[size]} rounded-full bg-gradient-to-r ${getModeColor()} opacity-20 animate-pulse`}
                    />
                </>
            )}

            {/* Main avatar container */}
            <div
                className={`relative ${sizeClasses[size]} rounded-full bg-gradient-to-br ${getModeColor()} flex items-center justify-center transition-all duration-300 ${isActive ? `shadow-2xl ${getGlowColor()}` : ''
                    }`}
                style={{
                    transform: isActive ? `scale(${1 + pulseIntensity * 0.1})` : 'scale(1)',
                }}
            >
                {/* Inner glow */}
                <div className="absolute inset-1 rounded-full bg-slate-900/50 backdrop-blur-sm" />

                {/* AI Icon */}
                <div className="relative z-10">
                    {mode === 'thinking' ? (
                        <div className="flex space-x-1">
                            {[0, 1, 2].map((i) => (
                                <div
                                    key={i}
                                    className="w-2 h-2 bg-white rounded-full animate-bounce"
                                    style={{ animationDelay: `${i * 0.15}s` }}
                                />
                            ))}
                        </div>
                    ) : (
                        <svg
                            className={`${size === 'lg' ? 'w-12 h-12' : size === 'md' ? 'w-8 h-8' : 'w-6 h-6'} text-white`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            {mode === 'speaking' ? (
                                // Speaking wave icon
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                                />
                            ) : mode === 'listening' ? (
                                // Ear/listening icon
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                            ) : (
                                // Default AI icon
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            )}
                        </svg>
                    )}
                </div>

                {/* Sound wave animation when speaking */}
                {mode === 'speaking' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex space-x-0.5">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div
                                    key={i}
                                    className="w-1 bg-white/30 rounded-full animate-soundwave"
                                    style={{
                                        height: `${20 + Math.random() * 30}%`,
                                        animationDelay: `${i * 0.1}s`,
                                        animationDuration: '0.5s',
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Mode label */}
            <div className={`mt-3 px-3 py-1 rounded-full text-xs font-medium ${isActive
                    ? `bg-gradient-to-r ${getModeColor()} text-white`
                    : 'bg-slate-800 text-slate-400'
                }`}>
                {getModeLabel()}
            </div>

            {/* Status indicator */}
            <div className="mt-2 flex items-center gap-2">
                <div
                    className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-600'
                        }`}
                />
                <span className="text-xs text-slate-400">
                    {isActive ? 'Interview in Progress' : 'Standby'}
                </span>
            </div>
        </div>
    );
}
