/*
  # Add assigned_to to jobs table

  1. Changes
    - Add assigned_to column to jobs table referencing app_users
    - Add foreign key constraint
*/

-- Add assigned_to column to jobs table
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES app_users(id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_jobs_assigned_to ON jobs(assigned_to);