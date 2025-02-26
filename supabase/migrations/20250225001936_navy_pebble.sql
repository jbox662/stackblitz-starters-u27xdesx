-- First ensure we have a sample customer
INSERT INTO customers (
  id,
  name,
  email,
  phone,
  address
) VALUES (
  'c290f1ee-6c54-4b01-90e6-d701748f0855',
  'Industrial Automation Inc',
  'projects@indautomation.com',
  '(555) 345-6789',
  '789 Manufacturing Blvd, Detroit, MI 48201'
) ON CONFLICT (id) DO NOTHING;

-- Create a new quote
INSERT INTO quotes (
  id,
  quote_number,
  customer_id,
  date,
  valid_until,
  total_amount,
  status,
  notes
) VALUES (
  'e290f1ee-6c54-4b01-90e6-d701748f0855',
  'Q-2024-005',
  'c290f1ee-6c54-4b01-90e6-d701748f0855',
  '2024-02-25',
  '2024-03-25',
  15270.00,
  'pending',
  'PLC upgrade project including Micro850 controller, I/O modules, and programming services.'
);

-- Add quote items
INSERT INTO quote_items (
  quote_id,
  description,
  quantity,
  unit_price,
  total
) VALUES
-- Hardware items
(
  'e290f1ee-6c54-4b01-90e6-d701748f0855',
  '2080-LC50-48QWB Micro850 48-Point Controller',
  1,
  1695.00,
  1695.00
),
(
  'e290f1ee-6c54-4b01-90e6-d701748f0855',
  '2085-IQ32 Micro800 32-Point Digital Input Module',
  2,
  295.00,
  590.00
),
(
  'e290f1ee-6c54-4b01-90e6-d701748f0855',
  '2085-OQ32 Micro800 32-Point Digital Output Module',
  2,
  325.00,
  650.00
),
(
  'e290f1ee-6c54-4b01-90e6-d701748f0855',
  '2085-IF8 Micro800 8-Channel Analog Input Module',
  1,
  595.00,
  595.00
),
(
  'e290f1ee-6c54-4b01-90e6-d701748f0855',
  '2085-OF4 Micro800 4-Channel Analog Output Module',
  1,
  445.00,
  445.00
),
(
  'e290f1ee-6c54-4b01-90e6-d701748f0855',
  '2080-PS120-240VAC Power Supply',
  1,
  195.00,
  195.00
),
-- Services
(
  'e290f1ee-6c54-4b01-90e6-d701748f0855',
  'PLC Programming and Integration (80 hours)',
  80,
  125.00,
  10000.00
),
(
  'e290f1ee-6c54-4b01-90e6-d701748f0855',
  'System Documentation and Training (8 hours)',
  8,
  137.50,
  1100.00
);