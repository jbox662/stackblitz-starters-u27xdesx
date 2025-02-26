/*
  # Add Micro850 Controllers and Accessories

  1. New Items
    - Micro850 Controllers (24-point and 48-point variants)
    - Expansion I/O Modules
    - Plug-In Modules
    - Communication Modules
    - Programming and Configuration Tools

  2. Changes
    - Uses ON CONFLICT to handle duplicate SKUs
    - Maintains existing data integrity
*/

INSERT INTO items (name, sku, category, brand, price, stock) VALUES
-- Micro850 Controllers
('2080-LC50-24QBB Micro850 24-Point Controller', '2080-LC50-24QBB', 'PLCs and Controllers', 'Allen-Bradley', 1295.00, 10),
('2080-LC50-24QVB Micro850 24-Point Controller', '2080-LC50-24QVB', 'PLCs and Controllers', 'Allen-Bradley', 1295.00, 10),
('2080-LC50-24QWB Micro850 24-Point Controller', '2080-LC50-24QWB', 'PLCs and Controllers', 'Allen-Bradley', 1295.00, 10),
('2080-LC50-48QBB Micro850 48-Point Controller', '2080-LC50-48QBB', 'PLCs and Controllers', 'Allen-Bradley', 1695.00, 8),
('2080-LC50-48QVB Micro850 48-Point Controller', '2080-LC50-48QVB', 'PLCs and Controllers', 'Allen-Bradley', 1695.00, 8),
('2080-LC50-48QWB Micro850 48-Point Controller', '2080-LC50-48QWB', 'PLCs and Controllers', 'Allen-Bradley', 1695.00, 8),

-- Micro850 Expansion I/O Modules
('2085-IQ16 Micro800 16-Point Digital Input Module', '2085-IQ16', 'I/O Modules', 'Allen-Bradley', 195.00, 15),
('2085-IQ32 Micro800 32-Point Digital Input Module', '2085-IQ32', 'I/O Modules', 'Allen-Bradley', 295.00, 12),
('2085-OQ16 Micro800 16-Point Digital Output Module', '2085-OQ16', 'I/O Modules', 'Allen-Bradley', 225.00, 15),
('2085-OQ32 Micro800 32-Point Digital Output Module', '2085-OQ32', 'I/O Modules', 'Allen-Bradley', 325.00, 12),
('2085-IF4 Micro800 4-Channel Analog Input Module', '2085-IF4', 'I/O Modules', 'Allen-Bradley', 395.00, 10),
('2085-IF8 Micro800 8-Channel Analog Input Module', '2085-IF8', 'I/O Modules', 'Allen-Bradley', 595.00, 8),
('2085-OF4 Micro800 4-Channel Analog Output Module', '2085-OF4', 'I/O Modules', 'Allen-Bradley', 445.00, 10),
('2085-IRT4 Micro800 4-Channel RTD/TC Input Module', '2085-IRT4', 'I/O Modules', 'Allen-Bradley', 495.00, 8),

-- Micro850 Plug-In Modules
('2080-IQ4 4-Point Digital Input Plug-In Module', '2080-IQ4', 'I/O Modules', 'Allen-Bradley', 95.00, 20),
('2080-OQ4 4-Point Digital Output Plug-In Module', '2080-OQ4', 'I/O Modules', 'Allen-Bradley', 105.00, 20),
('2080-IF2 2-Channel Analog Input Plug-In Module', '2080-IF2', 'I/O Modules', 'Allen-Bradley', 145.00, 15),
('2080-OF2 2-Channel Analog Output Plug-In Module', '2080-OF2', 'I/O Modules', 'Allen-Bradley', 165.00, 15),
('2080-TRTS 2-Channel Serial Port Plug-In Module', '2080-TRTS', 'Network Components', 'Allen-Bradley', 195.00, 12),
('2080-MEMBAK-RTC Memory Backup and RTC Module', '2080-MEMBAK-RTC', 'Accessories', 'Allen-Bradley', 85.00, 25),

-- Micro850 Communication Modules
('2080-SERIALISOL Isolated Serial Port Module', '2080-SERIALISOL', 'Network Components', 'Allen-Bradley', 245.00, 12),
('2080-DNET20 DeviceNet Scanner Module', '2080-DNET20', 'Network Components', 'Allen-Bradley', 495.00, 8),
('2080-PROFIBUS Scanner Module', '2080-PROFIBUS', 'Network Components', 'Allen-Bradley', 595.00, 8),
('2080-PS120-240VAC Power Supply', '2080-PS120-240VAC', 'Power Supplies', 'Allen-Bradley', 195.00, 15),

-- Micro850 Programming and Configuration
('9324-RLD700 Connected Components Workbench', '9324-RLD700', 'Software', 'Allen-Bradley', 0.00, 999),
('2080-REMLCD Remote LCD Display Module', '2080-REMLCD', 'Accessories', 'Allen-Bradley', 295.00, 10),
('2080-LCD LCD Display Module', '2080-LCD', 'Accessories', 'Allen-Bradley', 245.00, 12),
('2080-USBCBL Programming Cable USB', '2080-USBCBL', 'Accessories', 'Allen-Bradley', 65.00, 25)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  stock = EXCLUDED.stock;