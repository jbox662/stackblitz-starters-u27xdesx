/*
  # Add quote relationship to jobs table

  1. Changes
    - Add quote_id column to jobs table as a foreign key reference to quotes table
    - Add description column to jobs table
  
  2. Security
    - No changes to RLS policies needed
*/

-- Add quote_id and description columns to jobs table
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS quote_id uuid REFERENCES quotes(id),
ADD COLUMN IF NOT EXISTS description text;

-- Update existing jobs with quote relationships
UPDATE jobs SET quote_id = 'e290f1ee-6c54-4b01-90e6-d701748f0852'
WHERE id = 'f290f1ee-6c54-4b01-90e6-d701748f0852';