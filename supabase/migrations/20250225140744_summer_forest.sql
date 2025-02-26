-- Add description column to items table
ALTER TABLE items ADD COLUMN IF NOT EXISTS description text;

-- Update description for AHWD242410
UPDATE items 
SET description = 'NEMA 1/3R/4/4X/12 Enclosure Air Conditioner, 24 x 24 x 10in, 2400 BTU/H cooling capacity'
WHERE sku = 'AHWD242410';

-- Update descriptions for other items
UPDATE items 
SET description = CASE
  WHEN sku = 'AH2424SPK' THEN 'Side mount kit for AHWD242410 air conditioner'
  WHEN sku = 'AH24DR' THEN 'Condensate drain kit for AHWD242410 air conditioner'
  WHEN sku = 'AR30PR-311BZC' THEN '30mm blue pilot light, 120V AC, IP65/IP66 rated'
  WHEN sku = 'SE3-SW5U' THEN '5-port unmanaged industrial Ethernet switch, 10/100 Mbps'
  WHEN sku = 'T1-1522G-1' THEN 'Gray terminal block, 600V rated, 15A maximum current'
  WHEN sku = 'C5E-STPBL-S3' THEN 'Cat5e shielded industrial Ethernet cable, 3ft length'
  ELSE description
END
WHERE description IS NULL;