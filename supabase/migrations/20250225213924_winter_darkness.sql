-- Add type column to quote_items table
ALTER TABLE quote_items ADD COLUMN IF NOT EXISTS type text DEFAULT 'item';

-- Add type column to invoice_items table
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS type text DEFAULT 'item';

-- Update existing items to have proper types
UPDATE quote_items
SET type = CASE
  WHEN description ILIKE '%labor%' OR 
       description ILIKE '%hour%' OR 
       description ILIKE '%service%' OR
       description ILIKE '%installation%' OR
       description ILIKE '%programming%' OR
       description ILIKE '%configuration%'
  THEN 'labor'
  ELSE 'item'
END;

UPDATE invoice_items
SET type = CASE
  WHEN description ILIKE '%labor%' OR 
       description ILIKE '%hour%' OR 
       description ILIKE '%service%' OR
       description ILIKE '%installation%' OR
       description ILIKE '%programming%' OR
       description ILIKE '%configuration%'
  THEN 'labor'
  ELSE 'item'
END;

-- Add check constraints to ensure valid types
ALTER TABLE quote_items
ADD CONSTRAINT quote_items_type_check
CHECK (type IN ('item', 'labor'));

ALTER TABLE invoice_items
ADD CONSTRAINT invoice_items_type_check
CHECK (type IN ('item', 'labor'));