/*
  # Add sample data for customers, quotes, jobs, and invoices

  This migration adds realistic sample data with proper relationships between:
  - Customers
  - Quotes and quote items
  - Jobs
  - Invoices and invoice items
*/

-- First, ensure we have a sample customer
INSERT INTO customers (id, name, email, phone, address) VALUES
('d290f1ee-6c54-4b01-90e6-d701748f0851', 'Acme Manufacturing', 'contact@acme.com', '(555) 123-4567', '123 Industrial Way, Springfield, IL 62701'),
('d290f1ee-6c54-4b01-90e6-d701748f0852', 'Tech Solutions Inc', 'info@techsolutions.com', '(555) 234-5678', '456 Innovation Drive, Chicago, IL 60601'),
('d290f1ee-6c54-4b01-90e6-d701748f0853', 'Global Industries', 'contact@globalind.com', '(555) 345-6789', '789 Corporate Blvd, Aurora, IL 60505')
ON CONFLICT (id) DO NOTHING;

-- Add sample quotes
INSERT INTO quotes (id, quote_number, customer_id, date, valid_until, total_amount, status, notes) VALUES
('e290f1ee-6c54-4b01-90e6-d701748f0851', 'Q-2024-001', 'd290f1ee-6c54-4b01-90e6-d701748f0851', '2024-02-24', '2024-03-24', 12500.00, 'pending', 'PLC upgrade project'),
('e290f1ee-6c54-4b01-90e6-d701748f0852', 'Q-2024-002', 'd290f1ee-6c54-4b01-90e6-d701748f0852', '2024-02-23', '2024-03-23', 8750.00, 'accepted', 'SCADA system implementation'),
('e290f1ee-6c54-4b01-90e6-d701748f0853', 'Q-2024-003', 'd290f1ee-6c54-4b01-90e6-d701748f0853', '2024-02-22', '2024-03-22', 5500.00, 'pending', 'HMI replacement project');

-- Add sample quote items
INSERT INTO quote_items (quote_id, description, quantity, unit_price, total) VALUES
('e290f1ee-6c54-4b01-90e6-d701748f0851', 'ControlLogix 5580 Controller', 1, 8500.00, 8500.00),
('e290f1ee-6c54-4b01-90e6-d701748f0851', 'Installation and Programming', 40, 100.00, 4000.00),
('e290f1ee-6c54-4b01-90e6-d701748f0852', 'SCADA Software License', 1, 5000.00, 5000.00),
('e290f1ee-6c54-4b01-90e6-d701748f0852', 'System Configuration', 25, 150.00, 3750.00),
('e290f1ee-6c54-4b01-90e6-d701748f0853', 'PanelView Plus 7', 1, 4000.00, 4000.00),
('e290f1ee-6c54-4b01-90e6-d701748f0853', 'Programming and Setup', 15, 100.00, 1500.00);

-- Add sample jobs
INSERT INTO jobs (id, customer_id, title, start_time, end_time, status, location) VALUES
('f290f1ee-6c54-4b01-90e6-d701748f0851', 'd290f1ee-6c54-4b01-90e6-d701748f0851', 'PLC Installation', '2024-03-01 09:00:00', '2024-03-01 17:00:00', 'scheduled', '123 Industrial Way, Springfield, IL 62701'),
('f290f1ee-6c54-4b01-90e6-d701748f0852', 'd290f1ee-6c54-4b01-90e6-d701748f0852', 'SCADA Implementation', '2024-03-02 08:00:00', '2024-03-02 16:00:00', 'scheduled', '456 Innovation Drive, Chicago, IL 60601'),
('f290f1ee-6c54-4b01-90e6-d701748f0853', 'd290f1ee-6c54-4b01-90e6-d701748f0853', 'HMI Upgrade', '2024-03-03 10:00:00', '2024-03-03 18:00:00', 'scheduled', '789 Corporate Blvd, Aurora, IL 60505');

-- Add sample invoices
INSERT INTO invoices (id, invoice_number, customer_id, date, due_date, total_amount, status, notes) VALUES
('e390f1ee-6c54-4b01-90e6-d701748f0851', 'INV-2024-001', 'd290f1ee-6c54-4b01-90e6-d701748f0851', '2024-02-24', '2024-03-24', 12500.00, 'pending', 'PLC upgrade project completion'),
('e390f1ee-6c54-4b01-90e6-d701748f0852', 'INV-2024-002', 'd290f1ee-6c54-4b01-90e6-d701748f0852', '2024-02-23', '2024-03-23', 8750.00, 'paid', 'SCADA implementation phase 1'),
('e390f1ee-6c54-4b01-90e6-d701748f0853', 'INV-2024-003', 'd290f1ee-6c54-4b01-90e6-d701748f0853', '2024-02-22', '2024-03-22', 5500.00, 'pending', 'HMI replacement');

-- Add sample invoice items
INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total) VALUES
('e390f1ee-6c54-4b01-90e6-d701748f0851', 'ControlLogix 5580 Controller', 1, 8500.00, 8500.00),
('e390f1ee-6c54-4b01-90e6-d701748f0851', 'Installation and Programming', 40, 100.00, 4000.00),
('e390f1ee-6c54-4b01-90e6-d701748f0852', 'SCADA Software License', 1, 5000.00, 5000.00),
('e390f1ee-6c54-4b01-90e6-d701748f0852', 'System Configuration', 25, 150.00, 3750.00),
('e390f1ee-6c54-4b01-90e6-d701748f0853', 'PanelView Plus 7', 1, 4000.00, 4000.00),
('e390f1ee-6c54-4b01-90e6-d701748f0853', 'Programming and Setup', 15, 100.00, 1500.00);