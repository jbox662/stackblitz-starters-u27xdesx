/*
  # Add hourly rates to services

  1. Changes:
    - Add hourly_rate column to services table
    - Update existing services with industry-standard hourly rates
    - Adjust total prices based on duration and hourly rates

  2. Notes:
    - Rates are set according to industry standards for automation and controls work
    - Different rates for different service types based on complexity and expertise required
*/

-- Add hourly_rate column
ALTER TABLE services ADD COLUMN IF NOT EXISTS hourly_rate decimal(10,2);

-- Update existing services with hourly rates
UPDATE services SET
  hourly_rate = 125.00,
  price = 125.00 * EXTRACT(EPOCH FROM duration) / 3600
WHERE name = 'PLC Programming and Integration';

UPDATE services SET
  hourly_rate = 150.00,
  price = 150.00 * EXTRACT(EPOCH FROM duration) / 3600
WHERE name = 'SCADA System Implementation';

UPDATE services SET
  hourly_rate = 135.00,
  price = 135.00 * EXTRACT(EPOCH FROM duration) / 3600
WHERE name = 'Industrial Network Design';

UPDATE services SET
  hourly_rate = 115.00,
  price = 115.00 * EXTRACT(EPOCH FROM duration) / 3600
WHERE name = 'Control Panel Design and Assembly';

UPDATE services SET
  hourly_rate = 125.00,
  price = 125.00 * EXTRACT(EPOCH FROM duration) / 3600
WHERE name = 'HMI Development';

UPDATE services SET
  hourly_rate = 145.00,
  price = 145.00 * EXTRACT(EPOCH FROM duration) / 3600
WHERE name = 'Motion Control Systems';

UPDATE services SET
  hourly_rate = 140.00,
  price = 140.00 * EXTRACT(EPOCH FROM duration) / 3600
WHERE name = 'Process Automation';

UPDATE services SET
  hourly_rate = 130.00,
  price = 130.00 * EXTRACT(EPOCH FROM duration) / 3600
WHERE name = 'Building Automation';

UPDATE services SET
  hourly_rate = 95.00,
  price = 95.00 * EXTRACT(EPOCH FROM duration) / 3600
WHERE name = 'Preventive Maintenance';

UPDATE services SET
  hourly_rate = 135.00,
  price = 135.00 * EXTRACT(EPOCH FROM duration) / 3600
WHERE name = 'System Upgrades and Retrofits';