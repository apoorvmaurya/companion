/*
  # Update call_recordings table schema

  1. Changes
    - Add url column for public URL
    - Add file_size_mb column
    - Rename duration to duration_seconds for clarity

  2. Notes
    - This ensures the schema matches what the recordings route expects
*/

-- Add missing columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'call_recordings' AND column_name = 'url'
  ) THEN
    ALTER TABLE call_recordings ADD COLUMN url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'call_recordings' AND column_name = 'file_size_mb'
  ) THEN
    ALTER TABLE call_recordings ADD COLUMN file_size_mb numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'call_recordings' AND column_name = 'duration_seconds'
  ) THEN
    ALTER TABLE call_recordings ADD COLUMN duration_seconds integer DEFAULT 0;
  END IF;
END $$;
