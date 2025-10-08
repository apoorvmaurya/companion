export interface Companion {
  id: string;
  name: string;
  description: string;
  avatar_url: string;
  personality: string;
  voice_id: string;
  did_presenter_id?: string;
  specialties: string[];
  metadata?: Record<string, any>;
  is_active: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface VideoRoom {
  id: string;
  room_id: string;
  user_id: string;
  companion_id: string;
  status: 'waiting' | 'active' | 'ended';
  created_at: string;
  started_at?: string;
  ended_at?: string;
  expires_at: string;
}

export interface Message {
  id: string;
  room_id: string;
  sender_type: 'user' | 'companion';
  sender_id: string;
  content: string;
  timestamp: string;
  created_at: string;
}

export interface CallRecording {
  id: string;
  room_id: string;
  storage_path: string;
  duration_seconds: number;
  file_size_mb: number;
  thumbnail_url?: string;
  created_at: string;
}

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
}

export interface SignalingEvents {
  join: { roomId: string; userId: string; role: 'user' | 'companion' };
  offer: { roomId: string; sdp: RTCSessionDescriptionInit };
  answer: { roomId: string; sdp: RTCSessionDescriptionInit };
  candidate: { roomId: string; candidate: RTCIceCandidateInit };
  chat_message: { roomId: string; message: string };
  leave: { roomId: string };
  end_call: { roomId: string };
}
