/*
  # Add Additional Allen Bradley Components and Brand Information

  1. New Components
    - Terminal Blocks
    - Circuit Breakers
    - Push Buttons
    - Pilot Lights
    - Contactors
    - Switches

  2. Changes
    - Adds brand column to items table
    - Adds new items with brand information
    - Updates existing items with brand information
*/

-- Add brand column to items table
ALTER TABLE items ADD COLUMN IF NOT EXISTS brand text;

-- Update existing items to set brand
UPDATE items SET brand = 'Allen-Bradley' WHERE brand IS NULL;

-- Insert new items
INSERT INTO items (name, sku, category, brand, price, stock)
SELECT * FROM (VALUES
  -- Terminal Blocks
  ('1492-J3 Terminal Block, 2.5mm², Gray', '1492-J3', 'Terminal Blocks', 'Allen-Bradley', 3.95, 100),
  ('1492-J4 Terminal Block, 4mm², Gray', '1492-J4', 'Terminal Blocks', 'Allen-Bradley', 4.95, 100),
  ('1492-J6 Terminal Block, 6mm², Gray', '1492-J6', 'Terminal Blocks', 'Allen-Bradley', 5.95, 100),
  ('1492-J10 Terminal Block, 10mm², Gray', '1492-J10', 'Terminal Blocks', 'Allen-Bradley', 7.95, 75),
  ('1492-JD3 Double-Level Terminal Block', '1492-JD3', 'Terminal Blocks', 'Allen-Bradley', 8.95, 50),
  
  -- Circuit Breakers
  ('1489-M1C100 Circuit Breaker, 1-pole, 10A', '1489-M1C100', 'Circuit Breakers', 'Allen-Bradley', 24.95, 30),
  ('1489-M1C160 Circuit Breaker, 1-pole, 16A', '1489-M1C160', 'Circuit Breakers', 'Allen-Bradley', 24.95, 30),
  ('1489-M1C200 Circuit Breaker, 1-pole, 20A', '1489-M1C200', 'Circuit Breakers', 'Allen-Bradley', 24.95, 30),
  ('1489-M2C100 Circuit Breaker, 2-pole, 10A', '1489-M2C100', 'Circuit Breakers', 'Allen-Bradley', 45.95, 20),
  ('1489-M3C100 Circuit Breaker, 3-pole, 10A', '1489-M3C100', 'Circuit Breakers', 'Allen-Bradley', 65.95, 15),
  
  -- Push Buttons and Pilot Lights
  ('800FP-F3 Push Button, Flush, Green', '800FP-F3', 'Push Buttons', 'Allen-Bradley', 34.95, 25),
  ('800FP-F4 Push Button, Flush, Red', '800FP-F4', 'Push Buttons', 'Allen-Bradley', 34.95, 25),
  ('800FP-F5 Push Button, Flush, Yellow', '800FP-F5', 'Push Buttons', 'Allen-Bradley', 34.95, 25),
  ('800FP-LF3 Pilot Light, LED, Green', '800FP-LF3', 'Pilot Lights', 'Allen-Bradley', 45.95, 25),
  ('800FP-LF4 Pilot Light, LED, Red', '800FP-LF4', 'Pilot Lights', 'Allen-Bradley', 45.95, 25),
  ('800FP-LF5 Pilot Light, LED, Yellow', '800FP-LF5', 'Pilot Lights', 'Allen-Bradley', 45.95, 25),
  
  -- Contactors
  ('100-C09D10 Contactor, 9A, 24V DC', '100-C09D10', 'Contactors', 'Allen-Bradley', 85.95, 15),
  ('100-C12D10 Contactor, 12A, 24V DC', '100-C12D10', 'Contactors', 'Allen-Bradley', 95.95, 15),
  ('100-C16D10 Contactor, 16A, 24V DC', '100-C16D10', 'Contactors', 'Allen-Bradley', 105.95, 12),
  ('100-C23D10 Contactor, 23A, 24V DC', '100-C23D10', 'Contactors', 'Allen-Bradley', 125.95, 10),
  ('100-C30D10 Contactor, 30A, 24V DC', '100-C30D10', 'Contactors', 'Allen-Bradley', 145.95, 8),
  
  -- Switches
  ('194L-E16-1753 Disconnect Switch, 16A', '194L-E16-1753', 'Switches', 'Allen-Bradley', 125.95, 10),
  ('194L-E25-1753 Disconnect Switch, 25A', '194L-E25-1753', 'Switches', 'Allen-Bradley', 145.95, 8),
  ('194L-E40-1753 Disconnect Switch, 40A', '194L-E40-1753', 'Switches', 'Allen-Bradley', 185.95, 6),
  ('194L-E63-1753 Disconnect Switch, 63A', '194L-E63-1753', 'Switches', 'Allen-Bradley', 225.95, 4),
  ('194L-E100-1753 Disconnect Switch, 100A', '194L-E100-1753', 'Switches', 'Allen-Bradley', 295.95, 3),
  
  -- Auxiliary Contacts
  ('100-FA11 Auxiliary Contact Block, 1NO/1NC', '100-FA11', 'Contactors', 'Allen-Bradley', 15.95, 50),
  ('100-FA20 Auxiliary Contact Block, 2NO', '100-FA20', 'Contactors', 'Allen-Bradley', 15.95, 50),
  ('100-FA02 Auxiliary Contact Block, 2NC', '100-FA02', 'Contactors', 'Allen-Bradley', 15.95, 50),
  ('100-FA13 Auxiliary Contact Block, 1NO/3NC', '100-FA13', 'Contactors', 'Allen-Bradley', 19.95, 40),
  ('100-FA31 Auxiliary Contact Block, 3NO/1NC', '100-FA31', 'Contactors', 'Allen-Bradley', 19.95, 40)
) AS new_items(name, sku, category, brand, price, stock)
WHERE NOT EXISTS (
  SELECT 1 FROM items WHERE items.sku = new_items.sku
);