/*
  # Add invoices and invoice items tables

  1. New Tables
    - invoices
      - id (uuid, primary key)
      - invoice_number (text, unique)
      - customer_id (uuid, references customers)
      - date (date)
      - due_date (date)
      - total_amount (decimal)
      - status (text)
      - notes (text)
      - created_at (timestamptz)
    
    - invoice_items
      - id (uuid, primary key)
      - invoice_id (uuid, references invoices)
      - description (text)
      - quantity (integer)
      - unit_price (decimal)
      - total (decimal)
      - created_at (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id) NOT NULL,
  date date NOT NULL,
  due_date date NOT NULL,
  total_amount decimal(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  description text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL DEFAULT 0,
  total decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users full access to invoices"
  ON invoices
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users full access to invoice_items"
  ON invoice_items
  FOR ALL
  TO authenticated
  USING (true);