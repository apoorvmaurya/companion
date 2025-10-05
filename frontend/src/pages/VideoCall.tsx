import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWebRTC } from '../hooks/useWebRTC';
import { useCallStore } from '../stores/useCallStore';
import { wsService } from '../services/websocket';
import { useAuth } from '../contexts/AuthContext';
import { CallControls } from '../components/CallControls';
import { ChatPanel } from '../components/ChatPanel';
import { Loader as Loader2 } from 'lucide-react';

export function VideoCall() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const { companion, localStream, remoteStream, callStatus } = useCallStore();
  const {
    initializePeerConnection,
    startLocalMedia,
    createOffer,
    toggleMic,
    toggleCamera,
    endCall,
    isMicMuted,
    isCameraOff
  } = useWebRTC(roomId || null);

  useEffect(() => {
    if (!roomId || !user) {
      navigate('/companions');
      return;
    }

    const initCall = async () => {
      try {
        const socket = wsService.connect(user.id);

        socket.emit('join', {
          roomId,
          userId: user.id,
          role: 'user'
        });

        await initializePeerConnection();
        await startLocalMedia();
        await createOffer();
      } catch (error) {
        console.error('Failed to initialize call:', error);
      }
    };

    initCall();

    return () => {
      wsService.disconnect();
    };
  }, [roomId, user]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (callStatus === 'connected') {
      const interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [callStatus]);

  const handleEndCall = async () => {
    await endCall();
    navigate('/companions');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (callStatus === 'connecting') {
    return (
      <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-50">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Connecting to {companion?.name}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col">
      <div className="flex-1 relative flex">
        <div className="flex-1 relative">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {!remoteStream && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
              <div className="text-center">
                <div className="w-32 h-32 rounded-full bg-slate-700 mx-auto mb-4 flex items-center justify-center">
                  {companion?.avatar_url && (
                    <img
                      src={companion.avatar_url}
                      alt={companion.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  )}
                </div>
                <p className="text-white text-lg">{companion?.name}</p>
              </div>
            </div>
          )}

          <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-lg">
            <p className="text-white font-medium">{companion?.name}</p>
            <p className="text-slate-400 text-sm">{formatDuration(callDuration)}</p>
          </div>

          <div className="absolute bottom-24 right-4 w-48 h-36 bg-slate-800 rounded-lg overflow-hidden border-2 border-slate-700">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
            />
            {isCameraOff && (
              <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                <p className="text-white text-sm">Camera Off</p>
              </div>
            )}
          </div>
        </div>

        {isChatOpen && (
          <ChatPanel onClose={() => setIsChatOpen(false)} roomId={roomId || ''} />
        )}
      </div>

      <CallControls
        isMicMuted={isMicMuted}
        isCameraOff={isCameraOff}
        isChatOpen={isChatOpen}
        onToggleMic={toggleMic}
        onToggleCamera={toggleCamera}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        onEndCall={handleEndCall}
      />
    </div>
  );
}
