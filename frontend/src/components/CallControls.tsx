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
    <div className="absolute bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 shadow-2xl">
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4">
          <button
            onClick={onToggleMic}
            className={`p-3 sm:p-4 rounded-full transition-all active:scale-90 ${
              isMicMuted
                ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30'
                : 'bg-slate-700 hover:bg-slate-600 shadow-lg'
            }`}
            title={isMicMuted ? 'Unmute' : 'Mute'}
            aria-label={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMicMuted ? (
              <MicOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            ) : (
              <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            )}
          </button>

          <button
            onClick={onToggleCamera}
            className={`p-3 sm:p-4 rounded-full transition-all active:scale-90 ${
              isCameraOff
                ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30'
                : 'bg-slate-700 hover:bg-slate-600 shadow-lg'
            }`}
            title={isCameraOff ? 'Turn on camera' : 'Turn off camera'}
            aria-label={isCameraOff ? 'Turn on camera' : 'Turn off camera'}
          >
            {isCameraOff ? (
              <VideoOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            ) : (
              <Video className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            )}
          </button>

          <button
            onClick={onToggleChat}
            className={`p-3 sm:p-4 rounded-full transition-all active:scale-90 ${
              isChatOpen
                ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30'
                : 'bg-slate-700 hover:bg-slate-600 shadow-lg'
            }`}
            title="Toggle chat"
            aria-label="Toggle chat panel"
          >
            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>

          <button
            onClick={onEndCall}
            className="p-3 sm:p-4 rounded-full bg-red-600 hover:bg-red-700 transition-all shadow-lg shadow-red-500/30 active:scale-90"
            title="End call"
            aria-label="End call"
          >
            <PhoneOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
