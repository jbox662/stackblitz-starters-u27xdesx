/*
  # Fix app_users RLS policies

  1. Changes
    - Drop existing policies
    - Create new policies for proper access control
    - Allow authenticated users to read all users
    - Allow users to manage their own records
    - Allow initial user creation during signup
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow users to read all app_users" ON app_users;
DROP POLICY IF EXISTS "Allow users to insert their own app_user record" ON app_users;
DROP POLICY IF EXISTS "Allow users to update their own app_user record" ON app_users;

-- Create new policies
CREATE POLICY "Allow users to read all app_users"
  ON app_users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow users to insert app_user record"
  ON app_users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow users to update their own app_user record"
  ON app_users
  FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Allow users to delete their own app_user record"
  ON app_users
  FOR DELETE
  TO authenticated
  USING (auth_user_id = auth.uid());