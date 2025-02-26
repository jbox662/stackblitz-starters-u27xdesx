-- Add avatar_url column to app_users table
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS avatar_url text;

-- Create storage bucket for profile pictures if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files to the profiles bucket
CREATE POLICY "Allow authenticated users to upload avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profiles' AND
  (storage.foldername(name))[1] = 'avatars'
);

-- Allow authenticated users to update their own avatar
CREATE POLICY "Allow authenticated users to update avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profiles' AND
  (storage.foldername(name))[1] = 'avatars'
);

-- Allow public access to read avatars
CREATE POLICY "Allow public to read avatars"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'profiles' AND
  (storage.foldername(name))[1] = 'avatars'
);