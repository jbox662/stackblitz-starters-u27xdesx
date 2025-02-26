/*
  # Create admin user record

  1. Changes
    - Insert admin user record for johnny@mac-inc.net
    - Links to existing auth user
*/

-- First get the auth user id for the admin email
DO $$
DECLARE
  v_auth_user_id uuid;
BEGIN
  -- Get the auth user id
  SELECT id INTO v_auth_user_id
  FROM auth.users
  WHERE email = 'johnny@mac-inc.net'
  LIMIT 1;

  -- If we found the auth user, create the app user record
  IF v_auth_user_id IS NOT NULL THEN
    INSERT INTO app_users (auth_user_id, name, email, role)
    VALUES (
      v_auth_user_id,
      'Johnny Admin',
      'johnny@mac-inc.net',
      'admin'
    )
    ON CONFLICT (auth_user_id) DO UPDATE
    SET role = 'admin';
  END IF;
END $$;