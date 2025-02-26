-- Delete all users except the admin from app_users table
DELETE FROM app_users 
WHERE email != 'johnny@mac-inc.net';

-- Delete all users except the admin from auth.users table
DELETE FROM auth.users 
WHERE email != 'johnny@mac-inc.net';