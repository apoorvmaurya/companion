import { supabase } from './supabase';
import type { Companion, VideoRoom, WebRTCConfig } from '../types';

const API_URL = import.meta.env.VITE_BACKEND_URL;

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` })
  };
}

export const api = {
  async getCompanions(): Promise<Companion[]> {
    const response = await fetch(`${API_URL}/api/companions`);
    if (!response.ok) throw new Error('Failed to fetch companions');
    return response.json();
  },

  async getCompanion(id: string): Promise<Companion> {
    const response = await fetch(`${API_URL}/api/companions/${id}`);
    if (!response.ok) throw new Error('Failed to fetch companion');
    return response.json();
  },

  async createRoom(companionId: string): Promise<VideoRoom> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/video/rooms`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ companion_id: companionId })
    });
    if (!response.ok) throw new Error('Failed to create room');
    return response.json();
  },

  async getRoom(roomId: string): Promise<VideoRoom> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/video/rooms/${roomId}`, {
      headers
    });
    if (!response.ok) throw new Error('Failed to fetch room');
    return response.json();
  },

  async endRoom(roomId: string): Promise<void> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/video/rooms/${roomId}/end`, {
      method: 'POST',
      headers
    });
    if (!response.ok) throw new Error('Failed to end room');
  },

  async getWebRTCConfig(): Promise<WebRTCConfig> {
    const response = await fetch(`${API_URL}/api/webrtc/config`);
    if (!response.ok) throw new Error('Failed to fetch WebRTC config');
    return response.json();
  },

  async uploadRecording(roomId: string, blob: Blob): Promise<void> {
    const headers = await getAuthHeaders();
    const formData = new FormData();
    formData.append('file', blob, `recording-${roomId}.webm`);
    formData.append('room_id', roomId);

    const response = await fetch(`${API_URL}/api/video/recordings`, {
      method: 'POST',
      headers: {
        ...(headers.Authorization && { 'Authorization': headers.Authorization })
      },
      body: formData
    });
    if (!response.ok) throw new Error('Failed to upload recording');
  }
};
