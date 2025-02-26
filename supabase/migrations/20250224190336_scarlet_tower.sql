/*
  # Update C-more Brand

  1. Changes
    - Updates brand field for C-more items to 'C-more' instead of 'Allen-Bradley'
*/

-- Update C-more items to have the correct brand
UPDATE items 
SET brand = 'C-more'
WHERE sku LIKE 'EA%' 
  OR name LIKE 'C-more%'
  OR name LIKE '%C-more%';

-- Also update any specific C-more accessories
UPDATE items
SET brand = 'C-more'
WHERE sku IN (
  'EA-MG-BZ1',
  'EA-DC-COV',
  'EA-PSP-2',
  'EA-SD-32G',
  'EA-CF-32G',
  'EA-USB-CBL',
  'EA-PRW-CBL',
  'EA-ECOM',
  'EA-ECOM-F',
  'EA-ECOM-WIFI'
);