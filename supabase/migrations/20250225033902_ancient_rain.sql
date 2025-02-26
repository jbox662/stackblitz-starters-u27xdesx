-- Remove image-related columns from items table
ALTER TABLE items 
DROP COLUMN IF EXISTS image_url,
DROP COLUMN IF EXISTS image_alt;