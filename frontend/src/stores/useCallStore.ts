import { create } from 'zustand';
import type { Companion, VideoRoom } from '../types';

interface CallState {
  activeRoom: VideoRoom | null;
  companion: Companion | null;
  isInCall: boolean;
  callStatus: 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'ended';
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isRecording: boolean;
  setActiveRoom: (room: VideoRoom | null) => void;
  setCompanion: (companion: Companion | null) => void;
  setInCall: (inCall: boolean) => void;
  setCallStatus: (status: CallState['callStatus']) => void;
  setLocalStream: (stream: MediaStream | null) => void;
  setRemoteStream: (stream: MediaStream | null) => void;
  setRecording: (recording: boolean) => void;
  reset: () => void;
}

export const useCallStore = create<CallState>((set) => ({
  activeRoom: null,
  companion: null,
  isInCall: false,
  callStatus: 'idle',
  localStream: null,
  remoteStream: null,
  isRecording: false,
  setActiveRoom: (room) => set({ activeRoom: room }),
  setCompanion: (companion) => set({ companion }),
  setInCall: (inCall) => set({ isInCall: inCall }),
  setCallStatus: (status) => set({ callStatus: status }),
  setLocalStream: (stream) => set({ localStream: stream }),
  setRemoteStream: (stream) => set({ remoteStream: stream }),
  setRecording: (recording) => set({ isRecording: recording }),
  reset: () => set({
    activeRoom: null,
    companion: null,
    isInCall: false,
    callStatus: 'idle',
    localStream: null,
    remoteStream: null,
    isRecording: false
  })
}));
