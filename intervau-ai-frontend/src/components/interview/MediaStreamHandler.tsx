import { useEffect, useRef, useCallback, useState } from 'react';

interface MediaStreamHandlerProps {
    onStreamReady?: (stream: MediaStream) => void;
    onError?: (error: Error) => void;
    audioEnabled: boolean;
    videoEnabled: boolean;
    autoStart?: boolean;
}

interface MediaStreamState {
    stream: MediaStream | null;
    isLoading: boolean;
    error: Error | null;
    hasPermission: boolean;
}

/**
 * MediaStreamHandler - Manages WebRTC video/audio streams
 * Handles camera and microphone access with enable/disable controls
 */
export function useMediaStream({
    onStreamReady,
    onError,
    audioEnabled,
    videoEnabled,
    autoStart = true,
}: MediaStreamHandlerProps) {
    const [state, setState] = useState<MediaStreamState>({
        stream: null,
        isLoading: false,
        error: null,
        hasPermission: false,
    });

    const streamRef = useRef<MediaStream | null>(null);

    // Start the media stream
    const startStream = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: videoEnabled,
                audio: audioEnabled,
            });

            streamRef.current = stream;
            setState({
                stream,
                isLoading: false,
                error: null,
                hasPermission: true,
            });

            onStreamReady?.(stream);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to access media devices');
            setState(prev => ({
                ...prev,
                isLoading: false,
                error,
                hasPermission: false,
            }));
            onError?.(error);
        }
    }, [videoEnabled, audioEnabled, onStreamReady, onError]);

    // Stop all tracks
    const stopStream = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
            setState(prev => ({ ...prev, stream: null }));
        }
    }, []);

    // Toggle audio track
    const toggleAudio = useCallback((enabled: boolean) => {
        if (streamRef.current) {
            streamRef.current.getAudioTracks().forEach(track => {
                track.enabled = enabled;
            });
        }
    }, []);

    // Toggle video track
    const toggleVideo = useCallback((enabled: boolean) => {
        if (streamRef.current) {
            streamRef.current.getVideoTracks().forEach(track => {
                track.enabled = enabled;
            });
        }
    }, []);

    // Auto-start on mount if enabled
    useEffect(() => {
        if (autoStart) {
            startStream();
        }

        return () => {
            stopStream();
        };
    }, []);

    // Handle audio/video toggle changes
    useEffect(() => {
        toggleAudio(audioEnabled);
    }, [audioEnabled, toggleAudio]);

    useEffect(() => {
        toggleVideo(videoEnabled);
    }, [videoEnabled, toggleVideo]);

    return {
        ...state,
        startStream,
        stopStream,
        toggleAudio,
        toggleVideo,
    };
}

/**
 * Component version of MediaStreamHandler
 */
interface MediaStreamHandlerComponentProps extends MediaStreamHandlerProps {
    videoRef: React.RefObject<HTMLVideoElement>;
    className?: string;
}

export default function MediaStreamHandler({
    videoRef,
    className = '',
    ...props
}: MediaStreamHandlerComponentProps) {
    const { stream, isLoading, error, hasPermission } = useMediaStream(props);

    // Attach stream to video element
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream, videoRef]);

    if (isLoading) {
        return (
            <div className={`flex items-center justify-center bg-slate-900 ${className}`}>
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">Accessing camera...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`flex items-center justify-center bg-slate-900 ${className}`}>
                <div className="text-center text-red-400">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-sm">{error.message}</p>
                </div>
            </div>
        );
    }

    if (!hasPermission) {
        return (
            <div className={`flex items-center justify-center bg-slate-900 ${className}`}>
                <div className="text-center text-slate-400">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">Camera access required</p>
                </div>
            </div>
        );
    }

    return null; // Video is rendered by parent component
}
