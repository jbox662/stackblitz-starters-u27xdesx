/*
  # Add Items from Additional Automation Brands

  1. New Items
    - Siemens PLCs and components
    - Schneider Electric products
    - ABB automation products
    - Omron control components
    - Phoenix Contact components

  2. Changes
    - Adds items with different brands
    - Maintains consistent categorization
*/

-- Insert items from other brands
INSERT INTO items (name, sku, category, brand, price, stock)
SELECT * FROM (VALUES
  -- Siemens PLCs
  ('SIMATIC S7-1200 CPU 1214C DC/DC/DC', '6ES7214-1AG40-0XB0', 'PLCs and Controllers', 'Siemens', 795.00, 10),
  ('SIMATIC S7-1200 CPU 1215C DC/DC/DC', '6ES7215-1AG40-0XB0', 'PLCs and Controllers', 'Siemens', 995.00, 8),
  ('SIMATIC S7-1500 CPU 1511-1 PN', '6ES7511-1AK02-0AB0', 'PLCs and Controllers', 'Siemens', 1495.00, 5),
  ('SIMATIC S7-1500 CPU 1513-1 PN', '6ES7513-1AL02-0AB0', 'PLCs and Controllers', 'Siemens', 1995.00, 4),

  -- Siemens I/O Modules
  ('SIMATIC SM 1231 4 AI', '6ES7231-4HD32-0XB0', 'I/O Modules', 'Siemens', 295.00, 15),
  ('SIMATIC SM 1232 2 AO', '6ES7232-4HB32-0XB0', 'I/O Modules', 'Siemens', 345.00, 12),
  ('SIMATIC SM 1221 8 DI', '6ES7221-1BF32-0XB0', 'I/O Modules', 'Siemens', 195.00, 20),
  ('SIMATIC SM 1222 8 DO', '6ES7222-1BF32-0XB0', 'I/O Modules', 'Siemens', 225.00, 18),

  -- Schneider Electric PLCs
  ('Modicon M241 24IO Controller', 'TM241CE24T', 'PLCs and Controllers', 'Schneider Electric', 895.00, 8),
  ('Modicon M251 Logic Controller', 'TM251MESE', 'PLCs and Controllers', 'Schneider Electric', 995.00, 6),
  ('Modicon M221 16IO Controller', 'TM221CE16T', 'PLCs and Controllers', 'Schneider Electric', 595.00, 12),
  ('Modicon M258 Logic Controller', 'TMEM258MFKE', 'PLCs and Controllers', 'Schneider Electric', 1495.00, 4),

  -- Schneider Electric I/O Modules
  ('TM3 Digital Input Module 16DI', 'TM3DI16', 'I/O Modules', 'Schneider Electric', 195.00, 20),
  ('TM3 Digital Output Module 16DO', 'TM3DQ16R', 'I/O Modules', 'Schneider Electric', 225.00, 18),
  ('TM3 Analog Input Module 4AI', 'TM3AI4', 'I/O Modules', 'Schneider Electric', 295.00, 15),
  ('TM3 Analog Output Module 2AO', 'TM3AQ2', 'I/O Modules', 'Schneider Electric', 325.00, 12),

  -- ABB PLCs
  ('AC500 PM573-ETH CPU', '1SAP130300R0271', 'PLCs and Controllers', 'ABB', 1295.00, 6),
  ('AC500 PM583-ETH CPU', '1SAP150300R0271', 'PLCs and Controllers', 'ABB', 1695.00, 4),
  ('AC500-eCo CPU', '1SAP120100R0170', 'PLCs and Controllers', 'ABB', 695.00, 10),
  ('AC500 PM554-TP-ETH', '1SAP554100R0271', 'PLCs and Controllers', 'ABB', 895.00, 8),

  -- ABB I/O Modules
  ('AC500 DI524 Digital Input', '1SAP245000R0001', 'I/O Modules', 'ABB', 245.00, 15),
  ('AC500 DO524 Digital Output', '1SAP255000R0001', 'I/O Modules', 'ABB', 265.00, 15),
  ('AC500 AI523 Analog Input', '1SAP323000R0001', 'I/O Modules', 'ABB', 345.00, 12),
  ('AC500 AO523 Analog Output', '1SAP333000R0001', 'I/O Modules', 'ABB', 365.00, 10),

  -- Omron PLCs
  ('NX1P2 CPU Unit', 'NX1P2-1140DT', 'PLCs and Controllers', 'Omron', 895.00, 8),
  ('NJ301 CPU Unit', 'NJ301-1100', 'PLCs and Controllers', 'Omron', 1495.00, 5),
  ('CP1L CPU Unit', 'CP1L-EM40DR-D', 'PLCs and Controllers', 'Omron', 595.00, 12),
  ('CJ2M CPU Unit', 'CJ2M-CPU35', 'PLCs and Controllers', 'Omron', 995.00, 6),

  -- Omron I/O Modules
  ('NX Digital Input Unit', 'NX-ID5442', 'I/O Modules', 'Omron', 195.00, 20),
  ('NX Digital Output Unit', 'NX-OD5256', 'I/O Modules', 'Omron', 225.00, 18),
  ('NX Analog Input Unit', 'NX-AD4203', 'I/O Modules', 'Omron', 295.00, 15),
  ('NX Analog Output Unit', 'NX-DA3203', 'I/O Modules', 'Omron', 325.00, 12),

  -- Phoenix Contact Components
  ('ILC 131 ETH Controller', '2700973', 'PLCs and Controllers', 'Phoenix Contact', 695.00, 10),
  ('ILC 151 ETH Controller', '2700974', 'PLCs and Controllers', 'Phoenix Contact', 895.00, 8),
  ('AXL F DI16/4 2F Digital Input', '2688064', 'I/O Modules', 'Phoenix Contact', 195.00, 20),
  ('AXL F DO16/4 2F Digital Output', '2688077', 'I/O Modules', 'Phoenix Contact', 225.00, 18),
  
  -- Terminal Blocks from Other Brands
  ('CLIPLINE Terminal Block 2.5mm²', '3044102', 'Terminal Blocks', 'Phoenix Contact', 2.95, 200),
  ('Spring Terminal Block 4mm²', '3044128', 'Terminal Blocks', 'Phoenix Contact', 3.95, 150),
  ('Feed-through Terminal Block 6mm²', '3044157', 'Terminal Blocks', 'Phoenix Contact', 4.95, 100),
  ('Double-Level Terminal Block', '3044225', 'Terminal Blocks', 'Phoenix Contact', 6.95, 80),
  
  ('Screw Terminal Block 2.5mm²', 'AB1TP35U', 'Terminal Blocks', 'Schneider Electric', 2.75, 200),
  ('Spring Terminal Block 4mm²', 'AB1RRNTP35U', 'Terminal Blocks', 'Schneider Electric', 3.75, 150),
  ('Feed-through Terminal Block 6mm²', 'AB1TP35U6', 'Terminal Blocks', 'Schneider Electric', 4.75, 100),
  
  ('Screw Terminal Block 2.5mm²', 'SNK PI-2.5', 'Terminal Blocks', 'ABB', 2.85, 200),
  ('Spring Terminal Block 4mm²', 'SNK PI-4', 'Terminal Blocks', 'ABB', 3.85, 150),
  ('Feed-through Terminal Block 6mm²', 'SNK PI-6', 'Terminal Blocks', 'ABB', 4.85, 100),
  
  -- Circuit Breakers from Other Brands
  ('Miniature Circuit Breaker 1P 10A', '5SY41107', 'Circuit Breakers', 'Siemens', 22.95, 50),
  ('Miniature Circuit Breaker 2P 16A', '5SY42167', 'Circuit Breakers', 'Siemens', 42.95, 40),
  ('Miniature Circuit Breaker 3P 20A', '5SY43207', 'Circuit Breakers', 'Siemens', 62.95, 30),
  
  ('iC60N Circuit Breaker 1P 10A', 'A9F74110', 'Circuit Breakers', 'Schneider Electric', 23.95, 50),
  ('iC60N Circuit Breaker 2P 16A', 'A9F74216', 'Circuit Breakers', 'Schneider Electric', 43.95, 40),
  ('iC60N Circuit Breaker 3P 20A', 'A9F74320', 'Circuit Breakers', 'Schneider Electric', 63.95, 30),
  
  ('S200 Circuit Breaker 1P 10A', 'S201-C10', 'Circuit Breakers', 'ABB', 21.95, 50),
  ('S200 Circuit Breaker 2P 16A', 'S202-C16', 'Circuit Breakers', 'ABB', 41.95, 40),
  ('S200 Circuit Breaker 3P 20A', 'S203-C20', 'Circuit Breakers', 'ABB', 61.95, 30),
  
  -- Contactors from Other Brands
  ('SIRIUS Contactor 9A 24V DC', '3RT2023-1BB40', 'Contactors', 'Siemens', 82.95, 20),
  ('SIRIUS Contactor 12A 24V DC', '3RT2024-1BB40', 'Contactors', 'Siemens', 92.95, 18),
  ('SIRIUS Contactor 16A 24V DC', '3RT2026-1BB40', 'Contactors', 'Siemens', 102.95, 15),
  
  ('TeSys D Contactor 9A 24V DC', 'LC1D09BD', 'Contactors', 'Schneider Electric', 83.95, 20),
  ('TeSys D Contactor 12A 24V DC', 'LC1D12BD', 'Contactors', 'Schneider Electric', 93.95, 18),
  ('TeSys D Contactor 18A 24V DC', 'LC1D18BD', 'Contactors', 'Schneider Electric', 103.95, 15),
  
  ('AF Contactor 9A 24V DC', 'AF09-30-10-13', 'Contactors', 'ABB', 81.95, 20),
  ('AF Contactor 12A 24V DC', 'AF12-30-10-13', 'Contactors', 'ABB', 91.95, 18),
  ('AF Contactor 16A 24V DC', 'AF16-30-10-13', 'Contactors', 'ABB', 101.95, 15)
) AS new_items(name, sku, category, brand, price, stock)
WHERE NOT EXISTS (
  SELECT 1 FROM items WHERE items.sku = new_items.sku
);