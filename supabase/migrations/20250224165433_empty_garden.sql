/*
  # Add quotes and quote items tables

  1. New Tables
    - quotes
      - id (uuid, primary key)
      - quote_number (text, unique)
      - customer_id (uuid, references customers)
      - date (date)
      - valid_until (date)
      - total_amount (decimal)
      - status (text)
      - notes (text)
      - created_at (timestamptz)
    
    - quote_items
      - id (uuid, primary key)
      - quote_id (uuid, references quotes)
      - description (text)
      - quantity (integer)
      - unit_price (decimal)
      - total (decimal)
      - created_at (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create quotes table
CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id) NOT NULL,
  date date NOT NULL,
  valid_until date NOT NULL,
  total_amount decimal(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create quote_items table
CREATE TABLE IF NOT EXISTS quote_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid REFERENCES quotes(id) ON DELETE CASCADE NOT NULL,
  description text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL DEFAULT 0,
  total decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users full access to quotes"
  ON quotes
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users full access to quote_items"
  ON quote_items
  FOR ALL
  TO authenticated
  USING (true);