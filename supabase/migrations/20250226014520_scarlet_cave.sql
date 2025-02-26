-- Create proposals table
CREATE TABLE IF NOT EXISTS proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id) NOT NULL,
  date date NOT NULL,
  valid_until date NOT NULL,
  total_amount decimal(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  proposal_letter text,
  created_at timestamptz DEFAULT now()
);

-- Create proposal_items table
CREATE TABLE IF NOT EXISTS proposal_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid REFERENCES proposals(id) ON DELETE CASCADE NOT NULL,
  description text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL DEFAULT 0,
  total decimal(10,2) NOT NULL DEFAULT 0,
  type text NOT NULL DEFAULT 'item',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT proposal_items_type_check CHECK (type IN ('item', 'labor'))
);

-- Enable RLS
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users full access to proposals"
  ON proposals
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users full access to proposal_items"
  ON proposal_items
  FOR ALL
  TO authenticated
  USING (true);

-- Add indexes for better performance
CREATE INDEX idx_proposals_customer_id ON proposals(customer_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposal_items_proposal_id ON proposal_items(proposal_id);
CREATE INDEX idx_proposals_created_at ON proposals(created_at);