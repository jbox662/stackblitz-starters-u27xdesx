-- Insert additional AutomationDirect items with conflict handling
INSERT INTO items (name, sku, category, brand, price) VALUES
-- Enclosure Air Conditioner
('AHWD242410 2400 BTU/H Air Conditioner', 'AHWD242410', 'Climate Control', 'AutomationDirect', 1495.00),

-- Enclosure Air Conditioner Accessories
('AH2424SPK Side Mount Kit', 'AH2424SPK', 'Climate Control', 'AutomationDirect', 195.00),
('AH24DR Condensate Drain Kit', 'AH24DR', 'Climate Control', 'AutomationDirect', 45.00),

-- Pilot Devices
('AR30PR-311BZC Pilot Light 30mm Blue 120V', 'AR30PR-311BZC', 'Pilot Lights', 'AutomationDirect', 18.50),

-- Network Switches
('SE3-SW5U 5-Port Unmanaged Switch', 'SE3-SW5U', 'Network Components', 'AutomationDirect', 89.00),

-- Terminal Blocks
('T1-1522G-1 Terminal Block Gray', 'T1-1522G-1', 'Terminal Blocks', 'AutomationDirect', 3.75),

-- Ethernet Cables
('C5E-STPBL-S3 Cat5e Shielded Cable 3ft', 'C5E-STPBL-S3', 'Network Components', 'AutomationDirect', 8.50)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price;