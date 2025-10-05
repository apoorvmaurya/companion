import { Mic, MicOff, Video, VideoOff, MessageSquare, PhoneOff } from 'lucide-react';

interface CallControlsProps {
  isMicMuted: boolean;
  isCameraOff: boolean;
  isChatOpen: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleChat: () => void;
  onEndCall: () => void;
}

export function CallControls({
  isMicMuted,
  isCameraOff,
  isChatOpen,
  onToggleMic,
  onToggleCamera,
  onToggleChat,
  onEndCall
}: CallControlsProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-800">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={onToggleMic}
            className={`p-4 rounded-full transition-all ${
              isMicMuted
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
            title={isMicMuted ? 'Unmute' : 'Mute'}
          >
            {isMicMuted ? (
              <MicOff className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </button>

          <button
            onClick={onToggleCamera}
            className={`p-4 rounded-full transition-all ${
              isCameraOff
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
            title={isCameraOff ? 'Turn on camera' : 'Turn off camera'}
          >
            {isCameraOff ? (
              <VideoOff className="w-6 h-6 text-white" />
            ) : (
              <Video className="w-6 h-6 text-white" />
            )}
          </button>

          <button
            onClick={onToggleChat}
            className={`p-4 rounded-full transition-all ${
              isChatOpen
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
            title="Toggle chat"
          >
            <MessageSquare className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={onEndCall}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-all"
            title="End call"
          >
            <PhoneOff className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
