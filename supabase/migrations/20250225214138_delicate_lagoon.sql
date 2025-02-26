-- Add proposal_letter column to quotes table
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS proposal_letter text;

-- Add index for better performance when searching proposal text
CREATE INDEX IF NOT EXISTS idx_quotes_proposal_letter ON quotes USING gin(to_tsvector('english', proposal_letter));