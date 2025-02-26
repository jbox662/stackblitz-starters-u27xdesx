/*
  # Add location field to jobs table

  1. Changes
    - Add location column to jobs table
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'location'
  ) THEN
    ALTER TABLE jobs ADD COLUMN location text;
  END IF;
END $$;