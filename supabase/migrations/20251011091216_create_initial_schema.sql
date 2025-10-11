/*
  # Create AI Companion Platform Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, unique)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `companions`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `avatar_url` (text)
      - `personality` (text)
      - `voice_id` (text)
      - `did_presenter_id` (text, optional)
      - `specialties` (text array)
      - `metadata` (jsonb)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `video_rooms`
      - `id` (uuid, primary key)
      - `room_id` (text, unique)
      - `user_id` (uuid, references auth.users)
      - `companion_id` (uuid, references companions)
      - `status` (text)
      - `created_at` (timestamptz)
      - `started_at` (timestamptz, optional)
      - `ended_at` (timestamptz, optional)
      - `expires_at` (timestamptz)
    
    - `messages`
      - `id` (uuid, primary key)
      - `room_id` (text, references video_rooms.room_id)
      - `sender_type` (text)
      - `content` (text)
      - `created_at` (timestamptz)
    
    - `call_recordings`
      - `id` (uuid, primary key)
      - `room_id` (text)
      - `user_id` (uuid, references auth.users)
      - `storage_path` (text)
      - `duration` (integer)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for companions to be publicly readable
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create companions table
CREATE TABLE IF NOT EXISTS companions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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

ALTER TABLE companions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companions are publicly readable"
  ON companions FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage companions"
  ON companions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create video_rooms table
CREATE TABLE IF NOT EXISTS video_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id text UNIQUE NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  companion_id uuid NOT NULL REFERENCES companions ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'waiting',
  created_at timestamptz DEFAULT now(),
  started_at timestamptz,
  ended_at timestamptz,
  expires_at timestamptz NOT NULL
);

ALTER TABLE video_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rooms"
  ON video_rooms FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own rooms"
  ON video_rooms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rooms"
  ON video_rooms FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own rooms"
  ON video_rooms FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id text NOT NULL,
  sender_type text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their rooms"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM video_rooms
      WHERE video_rooms.room_id = messages.room_id
      AND video_rooms.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create call_recordings table
CREATE TABLE IF NOT EXISTS call_recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  storage_path text NOT NULL,
  duration integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE call_recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recordings"
  ON call_recordings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recordings"
  ON call_recordings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_video_rooms_user_id ON video_rooms(user_id);
CREATE INDEX IF NOT EXISTS idx_video_rooms_room_id ON video_rooms(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_call_recordings_user_id ON call_recordings(user_id);
CREATE INDEX IF NOT EXISTS idx_call_recordings_room_id ON call_recordings(room_id);
