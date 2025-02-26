/*
  # Initial Schema Setup

  1. New Tables
    - services
      - id (uuid, primary key)
      - name (text)
      - description (text)
      - price (decimal)
      - duration (interval)
      - created_at (timestamptz)
      
    - items
      - id (uuid, primary key)
      - name (text)
      - sku (text, unique)
      - category (text)
      - price (decimal)
      - stock (integer)
      - created_at (timestamptz)
      
    - customers
      - id (uuid, primary key)
      - name (text)
      - email (text, unique)
      - phone (text)
      - address (text)
      - created_at (timestamptz)
      
    - jobs
      - id (uuid, primary key)
      - customer_id (uuid, references customers)
      - title (text)
      - start_time (timestamptz)
      - end_time (timestamptz)
      - status (text)
      - created_at (timestamptz)
      
    - app_users
      - id (uuid, primary key)
      - auth_id (uuid, references auth.users)
      - name (text)
      - email (text)
      - role (text)
      - created_at (timestamptz)
      
    - settings
      - id (uuid, primary key)
      - company_name (text)
      - company_email (text)
      - company_phone (text)
      - company_address (text)
      - email_notifications (boolean)
      - sms_notifications (boolean)
      - updated_at (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Services table
CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  duration interval,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users full access to services"
  ON services
  FOR ALL
  TO authenticated
  USING (true);

-- Items table
CREATE TABLE items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sku text UNIQUE NOT NULL,
  category text,
  price decimal(10,2) NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users full access to items"
  ON items
  FOR ALL
  TO authenticated
  USING (true);

-- Customers table
CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  address text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users full access to customers"
  ON customers
  FOR ALL
  TO authenticated
  USING (true);

-- Jobs table
CREATE TABLE jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id),
  title text NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users full access to jobs"
  ON jobs
  FOR ALL
  TO authenticated
  USING (true);

-- App Users table
CREATE TABLE app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid REFERENCES auth.users(id),
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read all app_users"
  ON app_users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow users to update their own app_user record"
  ON app_users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_id);

-- Settings table
CREATE TABLE settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  company_email text NOT NULL,
  company_phone text,
  company_address text,
  email_notifications boolean DEFAULT true,
  sms_notifications boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read settings"
  ON settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to update settings"
  ON settings
  FOR UPDATE
  TO authenticated
  USING (true);

-- Insert initial settings
INSERT INTO settings (
  company_name,
  company_email,
  company_phone,
  company_address
) VALUES (
  'Business Manager',
  'contact@business.com',
  '(555) 123-4567',
  '123 Business St, City, State'
);