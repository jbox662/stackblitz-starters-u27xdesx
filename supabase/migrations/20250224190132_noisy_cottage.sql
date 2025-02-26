/*
  # Update Brands for Existing Items

  1. Changes
    - Updates brand field for C-more items
    - Updates brand field for any other items missing brand information
*/

-- Update C-more items
UPDATE items 
SET brand = 'C-more'
WHERE sku LIKE 'EA%' 
  AND brand IS NULL;

-- Update brand for any remaining items without a brand
UPDATE items 
SET brand = CASE
  WHEN sku LIKE '1756%' THEN 'Allen-Bradley'
  WHEN sku LIKE '1769%' THEN 'Allen-Bradley'
  WHEN sku LIKE '2711%' THEN 'Allen-Bradley'
  WHEN sku LIKE '25B%' THEN 'Allen-Bradley'
  WHEN sku LIKE '20F%' THEN 'Allen-Bradley'
  WHEN sku LIKE '1783%' THEN 'Allen-Bradley'
  WHEN sku LIKE '1732%' THEN 'Allen-Bradley'
  WHEN sku LIKE '1791%' THEN 'Allen-Bradley'
  WHEN sku LIKE '440%' THEN 'Allen-Bradley'
  WHEN sku LIKE '42EF%' THEN 'Allen-Bradley'
  WHEN sku LIKE '871%' THEN 'Allen-Bradley'
  WHEN sku LIKE '872%' THEN 'Allen-Bradley'
  WHEN sku LIKE '1606%' THEN 'Allen-Bradley'
  WHEN sku LIKE '1585%' THEN 'Allen-Bradley'
  WHEN sku LIKE '1492%' THEN 'Allen-Bradley'
  WHEN sku LIKE '1489%' THEN 'Allen-Bradley'
  WHEN sku LIKE '800F%' THEN 'Allen-Bradley'
  WHEN sku LIKE '100-%' THEN 'Allen-Bradley'
  WHEN sku LIKE '194L%' THEN 'Allen-Bradley'
  WHEN sku LIKE '6ES7%' THEN 'Siemens'
  WHEN sku LIKE 'TM2%' THEN 'Schneider Electric'
  WHEN sku LIKE 'TM3%' THEN 'Schneider Electric'
  WHEN sku LIKE '1SAP%' THEN 'ABB'
  WHEN sku LIKE 'NX%' THEN 'Omron'
  WHEN sku LIKE 'CJ2%' THEN 'Omron'
  WHEN sku LIKE 'CP1%' THEN 'Omron'
  WHEN sku LIKE '2700%' THEN 'Phoenix Contact'
  WHEN sku LIKE '2688%' THEN 'Phoenix Contact'
  ELSE brand
END
WHERE brand IS NULL;