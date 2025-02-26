/*
  # Add Sample Invoice Data

  1. New Records
    - Add a sample customer first
    - Add a sample invoice with items
    - Include both products and services

  2. Changes
    - Ensure customer exists before creating invoice
    - Use realistic dates and amounts
*/

-- First ensure we have a sample customer
INSERT INTO customers (
  id,
  name,
  email,
  phone,
  address
) VALUES (
  'c290f1ee-6c54-4b01-90e6-d701748f0851',
  'Tech Solutions Inc',
  'contact@techsolutions.com',
  '(555) 234-5678',
  '456 Innovation Drive, Chicago, IL 60601'
) ON CONFLICT (id) DO NOTHING;

-- Insert a sample invoice
INSERT INTO invoices (
  id,
  invoice_number,
  customer_id,
  date,
  due_date,
  total_amount,
  status,
  notes
) VALUES (
  'e390f1ee-6c54-4b01-90e6-d701748f0854',
  'INV-2024-004',
  'c290f1ee-6c54-4b01-90e6-d701748f0851',
  '2024-02-24',
  '2024-03-24',
  28380.00,
  'pending',
  'PLC upgrade and programming services'
);

-- Insert invoice items
INSERT INTO invoice_items (
  invoice_id,
  description,
  quantity,
  unit_price,
  total
) VALUES
-- Hardware items
(
  'e390f1ee-6c54-4b01-90e6-d701748f0854',
  '1756-L83E ControlLogix 5580 Controller',
  1,
  15995.00,
  15995.00
),
(
  'e390f1ee-6c54-4b01-90e6-d701748f0854',
  '1756-EN2TR ControlLogix EtherNet/IP Module',
  2,
  1995.00,
  3990.00
),
(
  'e390f1ee-6c54-4b01-90e6-d701748f0854',
  '1756-PA72 ControlLogix Power Supply',
  1,
  895.00,
  895.00
),
-- Services
(
  'e390f1ee-6c54-4b01-90e6-d701748f0854',
  'PLC Programming and Integration (40 hours)',
  40,
  125.00,
  5000.00
),
(
  'e390f1ee-6c54-4b01-90e6-d701748f0854',
  'HMI Development (20 hours)',
  20,
  125.00,
  2500.00
);