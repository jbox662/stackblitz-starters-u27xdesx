/*
  # Set Admin User
  
  Sets the specified user as an admin in the app_users table
*/

UPDATE app_users
SET role = 'admin'
WHERE email = 'johnny@mac-inc.net';