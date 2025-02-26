/*
  # Fix app_users policies

  This migration safely adds policies to the app_users table by checking if they exist first.
*/

DO $$ 
BEGIN
  -- Check and create "Allow users to read all app_users" policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'app_users' 
    AND policyname = 'Allow users to read all app_users'
  ) THEN
    CREATE POLICY "Allow users to read all app_users"
      ON app_users
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  -- Check and create "Allow users to insert their own app_user record" policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'app_users' 
    AND policyname = 'Allow users to insert their own app_user record'
  ) THEN
    CREATE POLICY "Allow users to insert their own app_user record"
      ON app_users
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  -- Check and create "Allow users to update their own app_user record" policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'app_users' 
    AND policyname = 'Allow users to update their own app_user record'
  ) THEN
    CREATE POLICY "Allow users to update their own app_user record"
      ON app_users
      FOR UPDATE
      TO authenticated
      USING (email = auth.jwt()->>'email');
  END IF;
END $$;