/*
  # Fix app_users table and policies

  This migration:
  1. Drops existing policies to avoid conflicts
  2. Recreates the app_users table with proper auth user relationship
  3. Adds new policies with proper auth checks
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Allow users to read all app_users" ON app_users;
  DROP POLICY IF EXISTS "Allow users to insert their own app_user record" ON app_users;
  DROP POLICY IF EXISTS "Allow users to update their own app_user record" ON app_users;
END $$;

-- Drop and recreate app_users table
DROP TABLE IF EXISTS app_users;

CREATE TABLE app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  UNIQUE(auth_user_id),
  UNIQUE(email)
);

-- Enable RLS
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow users to read all app_users"
  ON app_users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow users to insert their own app_user record"
  ON app_users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Allow users to update their own app_user record"
  ON app_users
  FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid());