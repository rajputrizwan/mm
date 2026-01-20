import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    Phone,
    Clock,
    MessageSquare,
    ChevronRight,
    Volume2
} from 'lucide-react';
import toast from 'react-hot-toast';
import SpeechVisualizer from '../components/interview/SpeechVisualizer';
import QuestionProgress from '../components/interview/QuestionProgress';
import { useMediaStream } from '../components/interview/MediaStreamHandler';
import {
    saveSession,
    loadSession,
    addTranscriptEntry,
    advanceQuestion,
    clearSession,
    getSessionDuration,
} from '../components/interview/InterviewSessionStorage';

interface Question {
    index: number;
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
    jobPosition: string;
    duration: number;
    totalQuestions: number;
    currentQuestion: Question;
    aiSettings: {
        difficultyLevel: string;
        autoScore: boolean;
        enableAiFeedback: boolean;
    };
}

/**
 * AIInterviewSession - Live AI interview session for candidates
 * Displays dual video containers, real-time transcript, and AI interviewer
 */
export default function AIInterviewSession() {
    const { uuid } = useParams<{ uuid: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as LocationState | null;

    // State
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [candidateName, setCandidateName] = useState('');
    const [jobPosition, setJobPosition] = useState('');
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [elapsedTime, setElapsedTime] = useState(0);

    const [audioEnabled, setAudioEnabled] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [aiMode, setAiMode] = useState<'idle' | 'speaking' | 'thinking' | 'listening'>('idle');
    const [isComplete, setIsComplete] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const transcriptRef = useRef<HTMLDivElement>(null);

    // Media stream hook
    const { stream } = useMediaStream({
        audioEnabled,
        videoEnabled,
        onStreamReady: (s) => {
            if (videoRef.current) {
                videoRef.current.srcObject = s;
            }
        },
        onError: (error) => {
            toast.error('Camera access error: ' + error.message);
        },
        autoStart: true,
    });

    // Initialize session from state or localStorage
    useEffect(() => {
        if (state) {
            setSessionId(state.sessionId);
            setCandidateName(state.candidateName);
            setJobPosition(state.jobPosition);
            setCurrentQuestion(state.currentQuestion);
            setTotalQuestions(state.totalQuestions);
            setCurrentQuestionIndex(0);

            // Start with AI greeting
            setAiMode('speaking');
            const greeting = `Hello ${state.candidateName}! Welcome to your interview for the ${state.jobPosition} position. Let's begin with the first question: ${state.currentQuestion.text}`;
            addToTranscript('Intervau.AI', greeting);

            setTimeout(() => {
                setAiMode('listening');
            }, 3000);
        } else {
            // Try to load from localStorage
            const savedSession = loadSession();
            if (savedSession && savedSession.shareableLink === uuid) {
                setSessionId(savedSession.sessionId);
                setCandidateName(savedSession.candidateName);
                setJobPosition(savedSession.jobPosition);
                setCurrentQuestionIndex(savedSession.currentQuestionIndex);
                setTotalQuestions(savedSession.totalQuestions);
                setTranscript(savedSession.transcript);
                setElapsedTime(getSessionDuration() * 60);
                toast.success('Session restored!');
                setAiMode('listening');
            } else {
                // No valid session, redirect to landing
                navigate(`/interview/${uuid}`);
            }
        }
    }, [state, uuid, navigate]);

    // Timer
    useEffect(() => {
        const timer = setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Auto-scroll transcript
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
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const addToTranscript = (speaker: string, text: string) => {
        const entry: TranscriptEntry = {
            speaker,
            text,
            timestamp: new Date().toISOString(),
        };
        setTranscript(prev => [...prev, entry]);
        addTranscriptEntry(speaker, text);
    };

    // Submit response to AI
    const handleSubmitResponse = async () => {
        if (!userInput.trim() || !sessionId) return;

        setSubmitting(true);
        const response = userInput.trim();
        setUserInput('');

        // Add candidate response to transcript
        addToTranscript('Candidate', response);
        setAiMode('thinking');

        try {
            const apiResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/interview-session/respond`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId,
                    response,
                }),
            });

            const data = await apiResponse.json();

            if (!apiResponse.ok || !data.success) {
                throw new Error(data.message || 'Failed to process response');
            }

            // Show AI response
            setAiMode('speaking');
            addToTranscript('Intervau.AI', data.data.aiResponse);

            // Update question if needed
            if (data.data.nextQuestion) {
                setCurrentQuestion(data.data.nextQuestion);
                setCurrentQuestionIndex(data.data.currentQuestionIndex);
                advanceQuestion();

                // After AI speaking, announce next question
                setTimeout(() => {
                    addToTranscript('Intervau.AI', `Next question: ${data.data.nextQuestion.text}`);
                    setAiMode('listening');
                }, 2000);
            } else if (data.data.isComplete) {
                setIsComplete(true);
                setAiMode('idle');
            } else {
                // It's a follow-up, just listen
                setTimeout(() => {
                    setAiMode('listening');
                }, 2000);
            }

            // Update session storage
            saveSession({
                sessionId,
                candidateName,
                candidateEmail: '',
                jobPosition,
                shareableLink: uuid!,
                currentQuestionIndex: data.data.currentQuestionIndex,
                totalQuestions,
                transcript: [...transcript, { speaker: 'Candidate', text: response, timestamp: new Date().toISOString() }],
                startedAt: new Date(Date.now() - elapsedTime * 1000).toISOString(),
                lastUpdated: new Date().toISOString(),
            });

        } catch (error: any) {
            toast.error(error.message || 'Failed to process response');
            setAiMode('listening');
        } finally {
            setSubmitting(false);
        }
    };

    // End interview
    const handleEndInterview = async () => {
        if (!confirm('Are you sure you want to end this interview?')) return;

        setAiMode('thinking');
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/interview-session/end`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                clearSession();
                navigate(`/interview/${uuid}/summary`, {
                    state: {
                        ...data.data,
                        elapsedTime: formatTime(elapsedTime),
                    },
                });
            }
        } catch (error) {
            toast.error('Failed to end interview');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmitResponse();
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950 flex flex-col">
            {/* Header */}
            <div className="bg-slate-900 border-b border-slate-800 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-sm font-medium text-white">Interview in Progress</span>
                        </div>
                        <div className="h-5 w-px bg-slate-700" />
                        <div className="flex items-center gap-2 text-slate-400">
                            <Clock className="w-4 h-4" />
                            <span className="font-mono text-white">{formatTime(elapsedTime)}</span>
                        </div>
                    </div>
                    <div>
                        <span className="text-slate-400 text-sm">{jobPosition}</span>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                    <QuestionProgress
                        current={currentQuestionIndex + 1}
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
                                    isActive={aiMode !== 'idle'}
                                    mode={aiMode}
                                    size="lg"
                                />
                                <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                                    <span className="text-white text-sm font-medium">Intervau.AI</span>
                                </div>
                            </div>

                            {/* Candidate Video */}
                            <div className="bg-slate-900 rounded-2xl border border-slate-800 relative overflow-hidden">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className={`w-full h-full object-cover ${!videoEnabled ? 'hidden' : ''}`}
                                />
                                {!videoEnabled && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                                        <VideoOff className="w-16 h-16 text-slate-600" />
                                    </div>
                                )}
                                <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                                    <span className="text-white text-sm font-medium">{candidateName || 'You'}</span>
                                </div>
                                {!audioEnabled && (
                                    <div className="absolute top-4 right-4 bg-red-500/20 p-2 rounded-lg border border-red-500/30">
                                        <MicOff className="w-4 h-4 text-red-400" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Current Question Display */}
                        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                                    <MessageSquare className="w-4 h-4 text-cyan-400" />
                                </div>
                                <span className="text-sm text-slate-400">
                                    Question {currentQuestionIndex + 1} of {totalQuestions}
                                </span>
                                {currentQuestion?.type && (
                                    <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs text-blue-400 capitalize">
                                        {currentQuestion.type.replace('_', ' ')}
                                    </span>
                                )}
                            </div>
                            <p className="text-white text-lg leading-relaxed">
                                {currentQuestion?.text || 'Preparing your interview...'}
                            </p>
                        </div>

                        {/* Response Input */}
                        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
                            <div className="flex gap-3">
                                <textarea
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type your response here... (Press Enter to submit)"
                                    disabled={submitting || aiMode === 'speaking' || isComplete}
                                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 resize-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50"
                                    rows={2}
                                />
                                <button
                                    onClick={handleSubmitResponse}
                                    disabled={!userInput.trim() || submitting || aiMode === 'speaking' || isComplete}
                                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {submitting ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <ChevronRight className="w-5 h-5" />
                                    )}
                                    Send
                                </button>
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
                                    Transcript will appear here
                                </p>
                            </div>
                        ) : (
                            transcript.map((entry, index) => (
                                <div
                                    key={index}
                                    className={`p-3 rounded-xl ${entry.speaker === 'Candidate'
                                        ? 'bg-cyan-500/10 border border-cyan-500/20'
                                        : 'bg-slate-800 border border-slate-700'
                                        }`}
                                >
                                    <span className={`text-xs font-medium ${entry.speaker === 'Candidate' ? 'text-cyan-400' : 'text-blue-400'
                                        }`}>
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
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${audioEnabled
                            ? 'bg-slate-700 hover:bg-slate-600 text-white'
                            : 'bg-red-500 hover:bg-red-600 text-white'
                            }`}
                    >
                        {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                    </button>

                    <button
                        onClick={() => setVideoEnabled(!videoEnabled)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${videoEnabled
                            ? 'bg-slate-700 hover:bg-slate-600 text-white'
                            : 'bg-red-500 hover:bg-red-600 text-white'
                            }`}
                    >
                        {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
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
