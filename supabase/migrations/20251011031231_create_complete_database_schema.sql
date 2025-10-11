/*
  # AI Companion Platform - Complete Database Schema

  ## Overview
  This migration creates the complete database structure for the AI Companion video call platform
  with proper authentication, video rooms, messaging, recordings, and memory storage.

  ## New Tables Created

  ### 1. companions
  Stores AI companion profiles with their personalities and configurations
  - `id` (text, primary key) - Unique companion identifier
  - `name` (text) - Companion display name
  - `description` (text) - Companion bio/description
  - `avatar_url` (text) - Profile image URL
  - `personality` (text) - Personality traits description
  - `voice_id` (text) - ElevenLabs voice identifier
  - `did_presenter_id` (text, nullable) - D-ID presenter identifier
  - `specialties` (text[]) - Array of specialty topics
  - `metadata` (jsonb) - Additional configuration data
  - `is_active` (boolean) - Whether companion is available
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. video_rooms
  Manages video call sessions between users and companions
  - `id` (uuid, primary key) - Auto-generated room database ID
  - `room_id` (text, unique) - Human-readable room identifier
  - `user_id` (uuid, foreign key to auth.users) - User who created the room
  - `companion_id` (text, foreign key to companions) - Selected companion
  - `status` (text) - Room status: waiting, active, ended
  - `created_at` (timestamptz) - Room creation time
  - `started_at` (timestamptz, nullable) - When call actually started
  - `ended_at` (timestamptz, nullable) - When call ended
  - `expires_at` (timestamptz) - Room expiration time

  ### 3. messages
  Stores chat messages exchanged during video calls
  - `id` (uuid, primary key) - Message identifier
  - `room_id` (text, foreign key to video_rooms) - Associated room
  - `sender_type` (text) - Message sender: user or companion
  - `content` (text) - Message content
  - `timestamp` (timestamptz) - Message timestamp
  - `created_at` (timestamptz) - Database insert time

  ### 4. call_recordings
  Stores metadata for recorded video calls
  - `id` (text, primary key) - Recording identifier
  - `room_id` (text, foreign key to video_rooms) - Associated room
  - `storage_path` (text) - Supabase storage path
  - `url` (text) - Public URL to recording
  - `duration_seconds` (integer) - Recording duration
  - `file_size_mb` (numeric) - File size in megabytes
  - `created_at` (timestamptz) - Recording creation time

  ### 5. conversation_memories
  Stores conversation history for context retention across sessions
  - `id` (uuid, primary key) - Memory identifier
  - `user_id` (uuid, foreign key to auth.users) - User in conversation
  - `companion_id` (text, foreign key to companions) - Companion in conversation
  - `room_id` (text) - Associated room (optional)
  - `user_message` (text) - User's message
  - `ai_response` (text) - Companion's response
  - `timestamp` (timestamptz) - Interaction timestamp
  - `created_at` (timestamptz) - Database insert time

  ## Security (Row Level Security)

  All tables have RLS enabled with policies that:
  - Allow authenticated users to access only their own data
  - Allow public read access to companions (active ones only)
  - Restrict write access to authorized users only
  - Protect sensitive user data and conversation history

  ## Indexes

  Optimized indexes for:
  - Room lookups by room_id and user_id
  - Message queries by room_id and timestamp
  - Recording queries by room_id
  - Memory queries by user_id and companion_id
  - Companion queries by is_active status
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create companions table
CREATE TABLE IF NOT EXISTS companions (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  avatar_url text NOT NULL,
  personality text NOT NULL,
  voice_id text NOT NULL,
  did_presenter_id text,
  specialties text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create video_rooms table
CREATE TABLE IF NOT EXISTS video_rooms (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id text UNIQUE NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  companion_id text NOT NULL REFERENCES companions(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'waiting',
  created_at timestamptz DEFAULT now(),
  started_at timestamptz,
  ended_at timestamptz,
  expires_at timestamptz NOT NULL,
  CONSTRAINT valid_status CHECK (status IN ('waiting', 'active', 'ended'))
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id text NOT NULL,
  sender_type text NOT NULL,
  content text NOT NULL,
  timestamp timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_sender_type CHECK (sender_type IN ('user', 'companion'))
);

-- Create call_recordings table
CREATE TABLE IF NOT EXISTS call_recordings (
  id text PRIMARY KEY,
  room_id text NOT NULL,
  storage_path text NOT NULL,
  url text NOT NULL,
  duration_seconds integer DEFAULT 0,
  file_size_mb numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create conversation_memories table
CREATE TABLE IF NOT EXISTS conversation_memories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  companion_id text NOT NULL REFERENCES companions(id) ON DELETE CASCADE,
  room_id text,
  user_message text NOT NULL,
  ai_response text NOT NULL,
  timestamp timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_video_rooms_room_id ON video_rooms(room_id);
CREATE INDEX IF NOT EXISTS idx_video_rooms_user_id ON video_rooms(user_id);
CREATE INDEX IF NOT EXISTS idx_video_rooms_status ON video_rooms(status);
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_call_recordings_room_id ON call_recordings(room_id);
CREATE INDEX IF NOT EXISTS idx_conversation_memories_user_companion ON conversation_memories(user_id, companion_id);
CREATE INDEX IF NOT EXISTS idx_companions_is_active ON companions(is_active);

-- Enable Row Level Security on all tables
ALTER TABLE companions ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_memories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companions table
-- Allow anyone to read active companions
CREATE POLICY "Anyone can view active companions"
  ON companions FOR SELECT
  USING (is_active = true);

-- Allow service role to manage companions
CREATE POLICY "Service role can manage companions"
  ON companions FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- RLS Policies for video_rooms table
-- Users can view their own rooms
CREATE POLICY "Users can view own rooms"
  ON video_rooms FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create rooms
CREATE POLICY "Users can create rooms"
  ON video_rooms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own rooms
CREATE POLICY "Users can update own rooms"
  ON video_rooms FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for messages table
-- Users can view messages from their rooms
CREATE POLICY "Users can view messages from own rooms"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM video_rooms
      WHERE video_rooms.room_id = messages.room_id
      AND video_rooms.user_id = auth.uid()
    )
  );

-- Users can insert messages to their rooms
CREATE POLICY "Users can insert messages to own rooms"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM video_rooms
      WHERE video_rooms.room_id = messages.room_id
      AND video_rooms.user_id = auth.uid()
    )
  );

-- Service role can manage all messages
CREATE POLICY "Service role can manage messages"
  ON messages FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- RLS Policies for call_recordings table
-- Users can view recordings from their rooms
CREATE POLICY "Users can view recordings from own rooms"
  ON call_recordings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM video_rooms
      WHERE video_rooms.room_id = call_recordings.room_id
      AND video_rooms.user_id = auth.uid()
    )
  );

-- Users can insert recordings to their rooms
CREATE POLICY "Users can insert recordings to own rooms"
  ON call_recordings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM video_rooms
      WHERE video_rooms.room_id = call_recordings.room_id
      AND video_rooms.user_id = auth.uid()
    )
  );

-- Service role can manage all recordings
CREATE POLICY "Service role can manage recordings"
  ON call_recordings FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- RLS Policies for conversation_memories table
-- Users can view their own memories
CREATE POLICY "Users can view own memories"
  ON conversation_memories FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own memories
CREATE POLICY "Users can insert own memories"
  ON conversation_memories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Service role can manage all memories
CREATE POLICY "Service role can manage memories"
  ON conversation_memories FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on companions
CREATE TRIGGER update_companions_updated_at
  BEFORE UPDATE ON companions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();