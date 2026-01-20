import { useState, useEffect, useRef } from 'react';
import { Check, X, RefreshCw, Camera, Mic, Volume2 } from 'lucide-react';

interface SystemCheckModuleProps {
    onCheckComplete: (passed: boolean) => void;
    className?: string;
}

interface CheckStatus {
    camera: 'pending' | 'checking' | 'passed' | 'failed';
    microphone: 'pending' | 'checking' | 'passed' | 'failed';
    speaker: 'pending' | 'checking' | 'passed' | 'failed';
}

/**
 * SystemCheckModule - Hardware verification component
 * Verifies camera and microphone permissions before interview starts
 */
export default function SystemCheckModule({
    onCheckComplete,
    className = '',
}: SystemCheckModuleProps) {
    const [status, setStatus] = useState<CheckStatus>({
        camera: 'pending',
        microphone: 'pending',
        speaker: 'pending',
    });
    const [isChecking, setIsChecking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [audioLevel, setAudioLevel] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    // Check camera
    const checkCamera = async (): Promise<boolean> => {
        setStatus(prev => ({ ...prev, camera: 'checking' }));
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            setStatus(prev => ({ ...prev, camera: 'passed' }));
            return true;
        } catch (err) {
            setStatus(prev => ({ ...prev, camera: 'failed' }));
            setError('Camera access denied or not available');
            return false;
        }
    };

    // Check microphone
    const checkMicrophone = async (): Promise<boolean> => {
        setStatus(prev => ({ ...prev, microphone: 'checking' }));
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Add audio tracks to existing stream
            if (streamRef.current) {
                stream.getAudioTracks().forEach(track => {
                    streamRef.current?.addTrack(track);
                });
            } else {
                streamRef.current = stream;
            }

            // Set up audio level monitoring
            audioContextRef.current = new AudioContext();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            const analyser = audioContextRef.current.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            const updateLevel = () => {
                analyser.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
                setAudioLevel(average / 255);

                if (status.microphone === 'checking' || status.microphone === 'passed') {
                    requestAnimationFrame(updateLevel);
                }
            };
            updateLevel();

            setStatus(prev => ({ ...prev, microphone: 'passed' }));
            return true;
        } catch (err) {
            setStatus(prev => ({ ...prev, microphone: 'failed' }));
            setError('Microphone access denied or not available');
            return false;
        }
    };

    // Check speaker (simple audio context test)
    const checkSpeaker = async (): Promise<boolean> => {
        setStatus(prev => ({ ...prev, speaker: 'checking' }));
        try {
            // Just check if AudioContext can be created
            const testContext = new AudioContext();
            await testContext.close();

            setStatus(prev => ({ ...prev, speaker: 'passed' }));
            return true;
        } catch (err) {
            setStatus(prev => ({ ...prev, speaker: 'failed' }));
            return false;
        }
    };

    // Run all checks
    const runAllChecks = async () => {
        setIsChecking(true);
        setError(null);

        const cameraOk = await checkCamera();
        const micOk = await checkMicrophone();
        const speakerOk = await checkSpeaker();

        setIsChecking(false);

        const allPassed = cameraOk && micOk && speakerOk;
        onCheckComplete(allPassed);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    const getStatusIcon = (checkStatus: 'pending' | 'checking' | 'passed' | 'failed') => {
        switch (checkStatus) {
            case 'passed':
                return <Check className="w-5 h-5 text-green-500" />;
            case 'failed':
                return <X className="w-5 h-5 text-red-500" />;
            case 'checking':
                return <RefreshCw className="w-5 h-5 text-cyan-500 animate-spin" />;
            default:
                return <div className="w-5 h-5 rounded-full border-2 border-slate-600" />;
        }
    };

    const getStatusColor = (checkStatus: 'pending' | 'checking' | 'passed' | 'failed') => {
        switch (checkStatus) {
            case 'passed':
                return 'border-green-500/30 bg-green-500/10';
            case 'failed':
                return 'border-red-500/30 bg-red-500/10';
            case 'checking':
                return 'border-cyan-500/30 bg-cyan-500/10';
            default:
                return 'border-slate-700 bg-slate-800/50';
        }
    };

    const allPassed = status.camera === 'passed' &&
        status.microphone === 'passed' &&
        status.speaker === 'passed';

    return (
        <div className={`bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 ${className}`}>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Camera className="w-4 h-4 text-white" />
                </div>
                System Check
            </h3>

            <div className="space-y-4">
                {/* Camera Preview */}
                <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                    />
                    {status.camera !== 'passed' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
                            <Camera className="w-12 h-12 text-slate-600" />
                        </div>
                    )}
                    {status.camera === 'passed' && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Live
                        </div>
                    )}
                </div>

                {/* Check Items */}
                <div className="space-y-3">
                    {/* Camera Check */}
                    <div className={`flex items-center justify-between p-3 rounded-xl border ${getStatusColor(status.camera)}`}>
                        <div className="flex items-center gap-3">
                            <Camera className="w-5 h-5 text-slate-400" />
                            <span className="text-slate-300">Camera</span>
                        </div>
                        {getStatusIcon(status.camera)}
                    </div>

                    {/* Microphone Check */}
                    <div className={`flex items-center justify-between p-3 rounded-xl border ${getStatusColor(status.microphone)}`}>
                        <div className="flex items-center gap-3">
                            <Mic className="w-5 h-5 text-slate-400" />
                            <span className="text-slate-300">Microphone</span>
                            {status.microphone === 'passed' && (
                                <div className="flex-1 mx-4">
                                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-100"
                                            style={{ width: `${audioLevel * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        {getStatusIcon(status.microphone)}
                    </div>

                    {/* Speaker Check */}
                    <div className={`flex items-center justify-between p-3 rounded-xl border ${getStatusColor(status.speaker)}`}>
                        <div className="flex items-center gap-3">
                            <Volume2 className="w-5 h-5 text-slate-400" />
                            <span className="text-slate-300">Speaker</span>
                        </div>
                        {getStatusIcon(status.speaker)}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Run Checks Button */}
                <button
                    onClick={runAllChecks}
                    disabled={isChecking}
                    className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${allPassed
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : isChecking
                                ? 'bg-slate-700 text-slate-400 cursor-wait'
                                : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white'
                        }`}
                >
                    {isChecking ? (
                        <span className="flex items-center justify-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Checking...
                        </span>
                    ) : allPassed ? (
                        <span className="flex items-center justify-center gap-2">
                            <Check className="w-4 h-4" />
                            All Systems Ready
                        </span>
                    ) : (
                        'Run System Check'
                    )}
                </button>
            </div>
        </div>
    );
}
