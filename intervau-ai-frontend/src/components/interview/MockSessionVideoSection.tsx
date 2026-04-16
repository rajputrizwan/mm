import {
  Loader2,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

type FaceLandmark = {
  x: number;
  y: number;
  z: number;
};

type EngagementVisualMetrics = {
  face_detected: boolean;
  face_landmarks: FaceLandmark[];
};

interface MockSessionVideoSectionProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  streamLoading: boolean;
  streamError: boolean;
  videoEnabled: boolean;
  micEnabled: boolean;
  isTTSEnabled: boolean;
  isSpeakingTTS: boolean;
  youLabel: string;
  cameraAccessDeniedLabel: string;
  onToggleMic: () => void;
  onToggleVideo: () => void;
  onToggleTTS: () => void;
  onEndSession: () => void;
  onVideoReady?: () => void;
  onVideoEmptied?: () => void;
  engagementMetrics?: EngagementVisualMetrics | null;
  showLandmarkOverlay?: boolean;
  topOverlay?: ReactNode;
  bottomOverlay?: ReactNode;
}

export default function MockSessionVideoSection({
  videoRef,
  streamLoading,
  streamError,
  videoEnabled,
  micEnabled,
  isTTSEnabled,
  isSpeakingTTS,
  youLabel,
  cameraAccessDeniedLabel,
  onToggleMic,
  onToggleVideo,
  onToggleTTS,
  onEndSession,
  onVideoReady,
  onVideoEmptied,
  engagementMetrics,
  showLandmarkOverlay = false,
  topOverlay,
  bottomOverlay,
}: MockSessionVideoSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (
      !showLandmarkOverlay ||
      !videoEnabled ||
      !engagementMetrics?.face_detected ||
      !engagementMetrics.face_landmarks?.length
    ) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const width = video.videoWidth || canvas.clientWidth;
    const height = video.videoHeight || canvas.clientHeight;
    if (width <= 0 || height <= 0) return;

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    ctx.clearRect(0, 0, width, height);

    const landmarks = engagementMetrics.face_landmarks;

    ctx.fillStyle = "rgba(0, 255, 255, 0.78)";
    for (const landmark of landmarks) {
      const x = (1 - landmark.x) * width;
      const y = landmark.y * height;
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      ctx.fillRect(Math.round(x), Math.round(y), 2, 2);
    }

    const highlighted = [468, 473, 33, 133, 362, 263, 1, 152, 61, 291, 13, 14, 17, 18, 78, 308];
    ctx.fillStyle = "rgba(255, 166, 0, 0.95)";
    for (const index of highlighted) {
      const point = landmarks[index];
      if (!point) continue;
      const x = (1 - point.x) * width;
      const y = point.y * height;
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;

      ctx.beginPath();
      ctx.arc(x, y, 2.8, 0, Math.PI * 2);
      ctx.fill();
    }

    const irisIndices = [468, 469, 470, 471, 472, 473, 474, 475, 476, 477];
    ctx.fillStyle = "rgba(0, 255, 102, 0.95)";
    for (const index of irisIndices) {
      const point = landmarks[index];
      if (!point) continue;
      const x = (1 - point.x) * width;
      const y = point.y * height;
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;

      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [engagementMetrics, showLandmarkOverlay, videoEnabled, videoRef]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="relative aspect-video bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden mb-4">
        {streamLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : streamError ? (
          <div className="absolute inset-0 flex items-center justify-center text-red-500 dark:text-red-400">
            <p>{cameraAccessDeniedLabel}</p>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            onLoadedMetadata={onVideoReady}
            onLoadedData={onVideoReady}
            onCanPlay={onVideoReady}
            onPlaying={onVideoReady}
            onEmptied={onVideoEmptied}
            className={`w-full h-full object-cover ${!videoEnabled ? "hidden" : ""}`}
          />
        )}

        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full pointer-events-none z-10 ${showLandmarkOverlay && videoEnabled ? "block" : "hidden"}`}
        />

        {!videoEnabled && !streamLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-3xl text-gray-700 dark:text-white font-bold">
                {youLabel}
              </span>
            </div>
          </div>
        )}

        <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/60 rounded-lg">
          <span className="text-white text-sm font-medium">{youLabel}</span>
        </div>

        {topOverlay}
        {bottomOverlay}
      </div>

      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={onToggleMic}
          className={`p-4 rounded-full transition-all ${
            micEnabled
              ? "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              : "bg-red-600 text-white hover:bg-red-700"
          }`}
          title={micEnabled ? "Mute microphone" : "Unmute microphone"}
        >
          {micEnabled ? (
            <Mic className="w-6 h-6" />
          ) : (
            <MicOff className="w-6 h-6" />
          )}
        </button>
        <button
          onClick={onToggleVideo}
          className={`p-4 rounded-full transition-all ${
            videoEnabled
              ? "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              : "bg-red-600 text-white hover:bg-red-700"
          }`}
          title={videoEnabled ? "Turn off camera" : "Turn on camera"}
        >
          {videoEnabled ? (
            <Video className="w-6 h-6" />
          ) : (
            <VideoOff className="w-6 h-6" />
          )}
        </button>
        <button
          onClick={onToggleTTS}
          className={`p-4 rounded-full transition-all ${
            isTTSEnabled
              ? "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              : "bg-orange-600 text-white hover:bg-orange-700"
          } ${isSpeakingTTS ? "ring-2 ring-blue-500 animate-pulse" : ""}`}
          title={isTTSEnabled ? "Mute AI voice" : "Unmute AI voice"}
        >
          {isTTSEnabled ? (
            <Volume2 className="w-6 h-6" />
          ) : (
            <VolumeX className="w-6 h-6" />
          )}
        </button>
        <button
          onClick={onEndSession}
          className="p-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all"
          title="End interview"
        >
          <Phone className="w-6 h-6 rotate-[135deg]" />
        </button>
      </div>
    </div>
  );
}
