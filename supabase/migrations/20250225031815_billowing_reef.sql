-- Update existing C-more panel price and add new circuit breaker
UPDATE items 
SET price = 986.00 
WHERE sku = 'EA9-T10WCL';

INSERT INTO items (name, sku, category, brand, price) VALUES
('FAZ-D20-1-NA-L-SP Single-Pole 20A Circuit Breaker', 'FAZ-D20-1-NA-L-SP', 'Circuit Breakers', 'AutomationDirect', 23.00);