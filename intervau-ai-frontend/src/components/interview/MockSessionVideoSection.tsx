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

interface MockSessionVideoSectionProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
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
}: MockSessionVideoSectionProps) {
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
            className={`w-full h-full object-cover ${!videoEnabled ? "hidden" : ""}`}
          />
        )}
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
