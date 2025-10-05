import { useEffect, useRef, useState, useCallback } from 'react';
import { wsService } from '../services/websocket';
import { api } from '../services/api';
import { useCallStore } from '../stores/useCallStore';

export function useWebRTC(roomId: string | null) {
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);

  const {
    setLocalStream,
    setRemoteStream,
    setCallStatus,
    setRecording
  } = useCallStore();

  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const initializePeerConnection = useCallback(async () => {
    try {
      const config = await api.getWebRTCConfig();

      peerConnection.current = new RTCPeerConnection(config);

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate && roomId) {
          wsService.emit('ice_candidate', {
            roomId,
            candidate: event.candidate.toJSON()
          });
        }
      };

      peerConnection.current.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
        }
      };

      peerConnection.current.onconnectionstatechange = () => {
        const state = peerConnection.current?.connectionState;
        console.log('Connection state:', state);

        if (state === 'connected') {
          setCallStatus('connected');
        } else if (state === 'connecting') {
          setCallStatus('connecting');
        } else if (state === 'disconnected') {
          setCallStatus('reconnecting');
        } else if (state === 'failed' || state === 'closed') {
          setCallStatus('ended');
        }
      };

    } catch (error) {
      console.error('Failed to initialize peer connection:', error);
      throw error;
    }
  }, [roomId, setRemoteStream, setCallStatus]);

  const startLocalMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      localStreamRef.current = stream;
      setLocalStream(stream);

      if (peerConnection.current) {
        stream.getTracks().forEach(track => {
          peerConnection.current?.addTrack(track, stream);
        });
      }

      return stream;
    } catch (error) {
      console.error('Failed to get local media:', error);
      throw error;
    }
  }, [setLocalStream]);

  const createOffer = useCallback(async () => {
    if (!peerConnection.current || !roomId) return;

    try {
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      wsService.emit('offer', {
        roomId,
        sdp: offer
      });
    } catch (error) {
      console.error('Failed to create offer:', error);
      throw error;
    }
  }, [roomId]);

  const handleOffer = useCallback(async (sdp: RTCSessionDescriptionInit) => {
    if (!peerConnection.current || !roomId) return;

    try {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);

      wsService.emit('answer', {
        roomId,
        sdp: answer
      });
    } catch (error) {
      console.error('Failed to handle offer:', error);
      throw error;
    }
  }, [roomId]);

  const handleAnswer = useCallback(async (sdp: RTCSessionDescriptionInit) => {
    if (!peerConnection.current) return;

    try {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(sdp));
    } catch (error) {
      console.error('Failed to handle answer:', error);
      throw error;
    }
  }, []);

  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    if (!peerConnection.current) return;

    try {
      await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Failed to add ICE candidate:', error);
    }
  }, []);

  const toggleMic = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicMuted(!audioTrack.enabled);
      }
    }
  }, []);

  const toggleCamera = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOff(!videoTrack.enabled);
      }
    }
  }, []);

  const startRecording = useCallback(() => {
    if (!localStreamRef.current) return;

    try {
      recordedChunks.current = [];
      mediaRecorder.current = new MediaRecorder(localStreamRef.current, {
        mimeType: 'video/webm;codecs=vp9'
      });

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.start();
      setRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }, [setRecording]);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorder.current || mediaRecorder.current.state === 'inactive') {
        resolve(null);
        return;
      }

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
        setRecording(false);
        resolve(blob);
      };

      mediaRecorder.current.stop();
    });
  }, [setRecording]);

  const endCall = useCallback(async () => {
    if (roomId) {
      wsService.emit('end_call', { roomId });
      await api.endRoom(roomId);
    }

    localStreamRef.current?.getTracks().forEach(track => track.stop());
    peerConnection.current?.close();

    setLocalStream(null);
    setRemoteStream(null);
    setCallStatus('ended');
  }, [roomId, setLocalStream, setRemoteStream, setCallStatus]);

  useEffect(() => {
    if (!roomId) return;

    wsService.on('offer', handleOffer);
    wsService.on('answer', handleAnswer);
    wsService.on('ice_candidate', handleIceCandidate);

    return () => {
      wsService.off('offer', handleOffer);
      wsService.off('answer', handleAnswer);
      wsService.off('ice_candidate', handleIceCandidate);
    };
  }, [roomId, handleOffer, handleAnswer, handleIceCandidate]);

  return {
    initializePeerConnection,
    startLocalMedia,
    createOffer,
    toggleMic,
    toggleCamera,
    startRecording,
    stopRecording,
    endCall,
    isMicMuted,
    isCameraOff
  };
}
