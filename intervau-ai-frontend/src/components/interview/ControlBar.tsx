import { Video, VideoOff, Mic, MicOff, PhoneOff, Settings, MessageSquare, Users } from 'lucide-react';

interface ControlBarProps {
  isMicEnabled: boolean;
  isVideoEnabled: boolean;
  onToggleMic: () => void;
  onToggleVideo: () => void;
  onEndSession: () => void;
  showChatToggle?: boolean;
  showParticipantsToggle?: boolean;
  onToggleChat?: () => void;
  onToggleParticipants?: () => void;
  variant?: 'default' | 'compact';
}

export default function ControlBar({
  isMicEnabled,
  isVideoEnabled,
  onToggleMic,
  onToggleVideo,
  onEndSession,
  showChatToggle = false,
  showParticipantsToggle = false,
  onToggleChat,
  onToggleParticipants,
  variant = 'default'
}: ControlBarProps) {
  const buttonSize = variant === 'compact' ? 'p-3' : 'p-4';
  const iconSize = variant === 'compact' ? 'w-5 h-5' : 'w-6 h-6';

  return (
    <div className="flex items-center justify-center space-x-3">
      <button
        onClick={onToggleMic}
        className={`${buttonSize} rounded-full transition-all ${
          isMicEnabled
            ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            : 'bg-red-500 hover:bg-red-600 text-white'
        }`}
        title={isMicEnabled ? 'Mute microphone' : 'Unmute microphone'}
      >
        {isMicEnabled ? <Mic className={iconSize} /> : <MicOff className={iconSize} />}
      </button>

      <button
        onClick={onToggleVideo}
        className={`${buttonSize} rounded-full transition-all ${
          isVideoEnabled
            ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            : 'bg-red-500 hover:bg-red-600 text-white'
        }`}
        title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
      >
        {isVideoEnabled ? <Video className={iconSize} /> : <VideoOff className={iconSize} />}
      </button>

      {showChatToggle && onToggleChat && (
        <button
          onClick={onToggleChat}
          className={`${buttonSize} rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all`}
          title="Toggle chat"
        >
          <MessageSquare className={iconSize} />
        </button>
      )}

      {showParticipantsToggle && onToggleParticipants && (
        <button
          onClick={onToggleParticipants}
          className={`${buttonSize} rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all`}
          title="View participants"
        >
          <Users className={iconSize} />
        </button>
      )}

      <button
        className={`${buttonSize} rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all`}
        title="Settings"
      >
        <Settings className={iconSize} />
      </button>

      <button
        onClick={onEndSession}
        className={`px-6 ${buttonSize} bg-red-500 hover:bg-red-600 text-white rounded-full font-semibold transition-all hover:shadow-lg flex items-center space-x-2`}
        title="End session"
      >
        <PhoneOff className={iconSize} />
        <span>End</span>
      </button>
    </div>
  );
}
