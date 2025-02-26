-- Add image_url column if it doesn't exist
ALTER TABLE items ADD COLUMN IF NOT EXISTS image_url text;

-- Add default image URL for items without images
UPDATE items 
SET image_url = 'https://cdn.automationdirect.com/images/products/large/l_noimage.jpg'
WHERE image_url IS NULL;

-- Add image_alt column for accessibility
ALTER TABLE items ADD COLUMN IF NOT EXISTS image_alt text;

-- Set default alt text based on item name
UPDATE items
SET image_alt = name
WHERE image_alt IS NULL;