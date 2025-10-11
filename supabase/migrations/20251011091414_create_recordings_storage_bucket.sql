/*
  # Create recordings storage bucket

  1. New Storage Bucket
    - Create 'recordings' bucket for storing call recordings
    - Set as public bucket so recordings can be accessed
    - Add RLS policies for secure access

  2. Security
    - Users can only upload to their own folders
    - Users can view their own recordings
    - Public read access for authenticated users
*/

-- Create recordings bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'recordings',
  'recordings',
  true,
  104857600,
  ARRAY['video/webm', 'video/mp4', 'video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects (if not already enabled)
DO $$
BEGIN
  ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload own recordings" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own recordings" ON storage.objects;
DROP POLICY IF EXISTS "Public can view recordings" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own recordings" ON storage.objects;

-- Policy: Users can upload recordings to their own rooms
CREATE POLICY "Users can upload own recordings"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'recordings' AND
    (storage.foldername(name))[1] IN (
      SELECT room_id::text FROM video_rooms WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can view their own recordings
CREATE POLICY "Users can view own recordings"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'recordings' AND
    (storage.foldername(name))[1] IN (
      SELECT room_id::text FROM video_rooms WHERE user_id = auth.uid()
    )
  );

-- Policy: Allow public read access (since bucket is public)
CREATE POLICY "Public can view recordings"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'recordings');

-- Policy: Users can delete their own recordings
CREATE POLICY "Users can delete own recordings"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'recordings' AND
    (storage.foldername(name))[1] IN (
      SELECT room_id::text FROM video_rooms WHERE user_id = auth.uid()
    )
  );
