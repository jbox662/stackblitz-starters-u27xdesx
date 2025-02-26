-- Update image URLs with working links
UPDATE items SET image_url = CASE
  -- Allen-Bradley PLCs and Controllers
  WHEN sku LIKE '1756%' THEN 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400'
  WHEN sku LIKE '1769%' THEN 'https://images.unsplash.com/photo-1581092160607-f6ed2bcc7f31?w=400'
  WHEN sku LIKE '2080%' THEN 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400'
  
  -- Allen-Bradley I/O Modules
  WHEN sku LIKE '1756-I%' THEN 'https://images.unsplash.com/photo-1581092160607-f6ed2bcc7f31?w=400'
  WHEN sku LIKE '1756-O%' THEN 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400'
  
  -- Allen-Bradley HMIs
  WHEN sku LIKE '2711P%' THEN 'https://images.unsplash.com/photo-1581092335397-13c29972f277?w=400'
  WHEN sku LIKE '2711R%' THEN 'https://images.unsplash.com/photo-1581092160607-f6ed2bcc7f31?w=400'
  
  -- Allen-Bradley Drives
  WHEN sku LIKE '25B%' THEN 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400'
  WHEN sku LIKE '20F%' THEN 'https://images.unsplash.com/photo-1581092160607-f6ed2bcc7f31?w=400'
  
  -- Network Components
  WHEN category = 'Network Components' THEN 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400'
  
  -- Power Supplies
  WHEN category = 'Power Supplies' THEN 'https://images.unsplash.com/photo-1597225244660-1cd128c64284?w=400'
  
  -- Circuit Breakers
  WHEN category = 'Circuit Breakers' THEN 'https://images.unsplash.com/photo-1581092160607-f6ed2bcc7f31?w=400'
  
  -- Enclosures
  WHEN category = 'Enclosures' THEN 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400'
  
  -- Wire Management
  WHEN category = 'Wire Management' THEN 'https://images.unsplash.com/photo-1581092335397-13c29972f277?w=400'
  
  -- Default image for other items
  ELSE 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400'
END;

-- Update image alt text to be more descriptive
UPDATE items SET image_alt = CASE
  WHEN category = 'PLCs and Controllers' THEN name || ' - Industrial PLC Controller'
  WHEN category = 'I/O Modules' THEN name || ' - Industrial I/O Module'
  WHEN category = 'HMI and Visualization' THEN name || ' - Industrial HMI Display'
  WHEN category = 'Network Components' THEN name || ' - Industrial Network Component'
  WHEN category = 'Power Supplies' THEN name || ' - Industrial Power Supply'
  WHEN category = 'Circuit Breakers' THEN name || ' - Industrial Circuit Breaker'
  WHEN category = 'Enclosures' THEN name || ' - Industrial Enclosure'
  WHEN category = 'Wire Management' THEN name || ' - Industrial Wire Management'
  ELSE name || ' - Industrial Automation Component'
END;