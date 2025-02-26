-- Add image_url column to items table
ALTER TABLE items ADD COLUMN IF NOT EXISTS image_url text;

-- Update items with image URLs
UPDATE items SET image_url = CASE
  -- Power Supplies
  WHEN sku = 'PSH-24-120' THEN 'https://cdn.automationdirect.com/images/products/large/l_psh24120.jpg'
  WHEN sku LIKE 'PSH%' THEN 'https://cdn.automationdirect.com/images/products/large/l_psh24480.jpg'
  WHEN sku LIKE 'PSB%' THEN 'https://cdn.automationdirect.com/images/products/large/l_psb24120p.jpg'
  WHEN sku LIKE 'PSM%' THEN 'https://cdn.automationdirect.com/images/products/large/l_psm24180s.jpg'
  WHEN sku LIKE 'PSP%' THEN 'https://cdn.automationdirect.com/images/products/large/l_psp24240s.jpg'
  
  -- Circuit Breakers
  WHEN sku = 'FAZ-D20-1-NA-L-SP' THEN 'https://cdn.automationdirect.com/images/products/large/l_fazd201nasp.jpg'
  WHEN sku LIKE 'FAZ%' THEN 'https://cdn.automationdirect.com/images/products/large/l_fazd201nasp.jpg'
  
  -- Air Conditioners
  WHEN sku = 'AHWD242410' THEN 'https://cdn.automationdirect.com/images/products/large/l_ahwd242410.jpg'
  WHEN sku = 'AH2424SPK' THEN 'https://cdn.automationdirect.com/images/products/large/l_ah2424spk.jpg'
  WHEN sku = 'AH24DR' THEN 'https://cdn.automationdirect.com/images/products/large/l_ah24dr.jpg'
  
  -- Pilot Lights
  WHEN sku = 'AR30PR-311BZC' THEN 'https://cdn.automationdirect.com/images/products/large/l_ar30pr311bzc.jpg'
  
  -- Network Switches
  WHEN sku = 'SE3-SW5U' THEN 'https://cdn.automationdirect.com/images/products/large/l_se3sw5u.jpg'
  WHEN sku LIKE 'SE-SW%' THEN 'https://cdn.automationdirect.com/images/products/large/l_sesw8m.jpg'
  
  -- Terminal Blocks
  WHEN sku = 'T1-1522G-1' THEN 'https://cdn.automationdirect.com/images/products/large/l_t11522g1.jpg'
  
  -- Ethernet Cables
  WHEN sku = 'C5E-STPBL-S3' THEN 'https://cdn.automationdirect.com/images/products/large/l_c5estpbls3.jpg'
  WHEN sku LIKE 'CFPE%' THEN 'https://cdn.automationdirect.com/images/products/large/l_cfpe5e25.jpg'
  
  -- Wire Duct
  WHEN sku LIKE 'WD%' THEN 'https://cdn.automationdirect.com/images/products/large/l_wd2x3g.jpg'
  WHEN sku LIKE 'NDW%' THEN 'https://cdn.automationdirect.com/images/products/large/l_ndw2x3g.jpg'
  
  -- Enclosures
  WHEN sku LIKE 'N1W%' THEN 'https://cdn.automationdirect.com/images/products/large/l_n1w2416.jpg'
  WHEN sku LIKE 'SSN4X%' THEN 'https://cdn.automationdirect.com/images/products/large/l_ssn4x1210.jpg'
  
  -- Selector Switches
  WHEN sku LIKE 'ECX%' THEN 'https://cdn.automationdirect.com/images/products/large/l_ecx1310.jpg'
  WHEN sku LIKE 'GCX%' THEN 'https://cdn.automationdirect.com/images/products/large/l_gcx1230.jpg'
  
  -- C-more HMI Panels
  WHEN sku LIKE 'EA9%' THEN 'https://cdn.automationdirect.com/images/products/large/l_ea9t10wcl.jpg'
  WHEN sku LIKE 'EA3%' THEN 'https://cdn.automationdirect.com/images/products/large/l_ea3t8cl.jpg'
  
  -- PLCs and Controllers
  WHEN sku LIKE '1756%' THEN 'https://cdn.automationdirect.com/images/products/large/l_1756l83e.jpg'
  WHEN sku LIKE '1769%' THEN 'https://cdn.automationdirect.com/images/products/large/l_1769l33er.jpg'
  WHEN sku LIKE '2080%' THEN 'https://cdn.automationdirect.com/images/products/large/l_2080lc5048qwb.jpg'
  
  -- Default image for other items
  ELSE 'https://cdn.automationdirect.com/images/products/large/l_noimage.jpg'
END;