import { Video, VideoOff, Mic, MicOff, User } from 'lucide-react';

interface VideoTileProps {
  label: string;
  participant: 'candidate' | 'hr' | 'ai';
  isVideoEnabled?: boolean;
  isAudioEnabled?: boolean;
  isActive?: boolean;
  showControls?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function VideoTile({
  label,
  participant,
  isVideoEnabled = true,
  isAudioEnabled = true,
  isActive = false,
  showControls = false,
  size = 'large'
}: VideoTileProps) {
  const sizeClasses = {
    small: 'aspect-video',
    medium: 'aspect-video',
    large: 'aspect-video'
  };

  const getBorderColor = () => {
    if (isActive) return 'ring-4 ring-blue-500';
    return 'border-2 border-gray-200';
  };

  const getParticipantColor = () => {
    if (participant === 'hr') return 'from-cyan-500 to-blue-500';
    if (participant === 'ai') return 'from-blue-600 to-cyan-600';
    return 'from-blue-500 to-cyan-500';
  };

  return (
    <div className={`relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden ${sizeClasses[size]} ${getBorderColor()}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20" />

      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {isVideoEnabled ? (
          <div className="text-center">
            <div className={`bg-gradient-to-br ${getParticipantColor()} w-20 h-20 rounded-full flex items-center justify-center mb-3 mx-auto`}>
              <User className="w-10 h-10 text-white" />
            </div>
            <p className="text-white text-lg font-medium">{label}</p>
            <p className="text-blue-200 text-sm mt-1">Camera active</p>
          </div>
        ) : (
          <div className="text-center">
            <VideoOff className="w-16 h-16 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-400 text-lg font-medium">{label}</p>
            <p className="text-gray-500 text-sm mt-1">Video disabled</p>
          </div>
        )}
      </div>

      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
        <p className="text-white text-sm font-medium">{label}</p>
      </div>

      <div className="absolute bottom-3 right-3 flex items-center space-x-2">
        {!isAudioEnabled && (
          <div className="bg-red-500 p-2 rounded-full">
            <MicOff className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {showControls && (
        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
          <button className="bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/30 transition-colors">
            {isVideoEnabled ? <Video className="w-5 h-5 text-white" /> : <VideoOff className="w-5 h-5 text-white" />}
          </button>
          <button className="bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/30 transition-colors">
            {isAudioEnabled ? <Mic className="w-5 h-5 text-white" /> : <MicOff className="w-5 h-5 text-white" />}
          </button>
        </div>
      )}
    </div>
  );
}
