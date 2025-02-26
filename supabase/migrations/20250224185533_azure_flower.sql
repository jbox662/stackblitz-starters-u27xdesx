/*
  # Add Additional Allen Bradley Components

  1. New Components
    - Kinetix Servo Drives
    - Servo Motors
    - Point I/O Modules
    - Safety Components
    - Communication Modules
    - Stratix Switches
    - Software and Licenses
    - Visualization Components
    - Power Supplies and Accessories

  2. Changes
    - Adds new items only if SKU doesn't exist
    - Adds new categories if needed
*/

DO $$ 
BEGIN
  -- Insert new items only if SKU doesn't exist
  INSERT INTO items (name, sku, category, price, stock)
  SELECT * FROM (VALUES
    -- Kinetix 5700 Servo Drives
    ('2198-H070-ERS Kinetix 5700 7.0kW Servo Drive', '2198-H070-ERS', 'Drives and Motion', 4995.00, 3),
    ('2198-H130-ERS Kinetix 5700 13.0kW Servo Drive', '2198-H130-ERS', 'Drives and Motion', 5995.00, 2),
    ('2198-H235-ERS Kinetix 5700 23.5kW Servo Drive', '2198-H235-ERS', 'Drives and Motion', 7995.00, 1),
    ('2198-D020-ERS Kinetix 5700 2.0kW Servo Drive', '2198-D020-ERS', 'Drives and Motion', 2995.00, 5),
    ('2198-D032-ERS Kinetix 5700 3.2kW Servo Drive', '2198-D032-ERS', 'Drives and Motion', 3495.00, 4),

    -- Kinetix 5500 Servo Drives
    ('2198-E1004-ERS Kinetix 5500 1.0kW Servo Drive', '2198-E1004-ERS', 'Drives and Motion', 1995.00, 6),
    ('2198-E1007-ERS Kinetix 5500 1.7kW Servo Drive', '2198-E1007-ERS', 'Drives and Motion', 2495.00, 5),
    ('2198-E2004-ERS Kinetix 5500 2.0kW Servo Drive', '2198-E2004-ERS', 'Drives and Motion', 2995.00, 4),

    -- Servo Motors
    ('MPL-B310P-MJ72AA Kinetix MP-Series Servo Motor', 'MPL-B310P-MJ72AA', 'Motors', 1495.00, 8),
    ('MPL-B420P-MJ72AA Kinetix MP-Series Servo Motor', 'MPL-B420P-MJ72AA', 'Motors', 1795.00, 6),
    ('MPL-B520P-MJ72AA Kinetix MP-Series Servo Motor', 'MPL-B520P-MJ72AA', 'Motors', 2095.00, 5),
    ('MPL-B630P-MJ72AA Kinetix MP-Series Servo Motor', 'MPL-B630P-MJ72AA', 'Motors', 2495.00, 4),

    -- Point I/O Modules
    ('1734-IB8 POINT I/O 8 Point Digital Input Module', '1734-IB8', 'I/O Modules', 195.00, 25),
    ('1734-OB8 POINT I/O 8 Point Digital Output Module', '1734-OB8', 'I/O Modules', 195.00, 25),
    ('1734-IE8C POINT I/O 8 Channel Analog Input Module', '1734-IE8C', 'I/O Modules', 495.00, 15),
    ('1734-OE4C POINT I/O 4 Channel Analog Output Module', '1734-OE4C', 'I/O Modules', 595.00, 12),
    ('1734-AENT POINT I/O EtherNet/IP Adapter', '1734-AENT', 'I/O Modules', 495.00, 20),
    ('1734-TB POINT I/O Terminal Base', '1734-TB', 'I/O Modules', 45.00, 50),
    ('1734-TBS POINT I/O Spring Terminal Base', '1734-TBS', 'I/O Modules', 45.00, 50),

    -- Safety Components (excluding duplicates)
    ('1791DS-IB8XOBV8 CompactBlock Guard I/O', '1791DS-IB8XOBV8', 'Safety Components', 995.00, 8),
    ('440N-G02171 Guardmaster Interlock Switch', '440N-G02171', 'Safety Components', 195.00, 20),
    ('440N-Z21S16A Guardmaster TLS-Z GD2', '440N-Z21S16A', 'Safety Components', 295.00, 15),

    -- Communication Modules
    ('1756-EN2TSC ControlLogix Secure EtherNet/IP Module', '1756-EN2TSC', 'Network Components', 2495.00, 8),
    ('1756-EWEB ControlLogix EtherNet/IP Web Server Module', '1756-EWEB', 'Network Components', 2295.00, 6),
    ('1756-RM2 ControlLogix Redundancy Module', '1756-RM2', 'Network Components', 4995.00, 4),

    -- Stratix Switches
    ('1783-BMS06SGL Stratix 5700 6-Port Switch', '1783-BMS06SGL', 'Network Components', 795.00, 12),
    ('1783-BMS10CGL Stratix 5700 10-Port Switch', '1783-BMS10CGL', 'Network Components', 995.00, 10),
    ('1783-BMS20CGL Stratix 5700 20-Port Switch', '1783-BMS20CGL', 'Network Components', 1495.00, 8),

    -- Software and Licenses
    ('9324-RLD700NXENE FactoryTalk View SE Network 7.0', '9324-RLD700NXENE', 'Software', 4995.00, 5),
    ('9324-RLD700LENE FactoryTalk View SE Local 7.0', '9324-RLD700LENE', 'Software', 2995.00, 8),
    ('9701-VWSTK050LENE FactoryTalk ViewPoint', '9701-VWSTK050LENE', 'Software', 1495.00, 10),
    ('9324-RLD300NXENE FactoryTalk View ME 3.0', '9324-RLD300NXENE', 'Software', 1995.00, 12),

    -- Visualization Components
    ('2711P-RDK12 PanelView Plus 7 Display Kit', '2711P-RDK12', 'HMI and Visualization', 995.00, 8),
    ('2711P-RDB12 PanelView Plus 7 Bezel', '2711P-RDB12', 'HMI and Visualization', 295.00, 12),
    ('2711P-RP8 PanelView Plus 7 8GB SD Card', '2711P-RP8', 'HMI and Visualization', 95.00, 25),
    ('2711P-RSUSB PanelView Plus 7 USB Module', '2711P-RSUSB', 'HMI and Visualization', 145.00, 20),

    -- Power Supplies and Accessories
    ('1606-XLE240E Power Supply 24V DC 240W', '1606-XLE240E', 'Power Supplies', 295.00, 20),
    ('1606-XLE480E Power Supply 24V DC 480W', '1606-XLE480E', 'Power Supplies', 495.00, 15),
    ('1606-XLE960E Power Supply 24V DC 960W', '1606-XLE960E', 'Power Supplies', 795.00, 10),
    ('1585J-M8TBJM-2 Ethernet Cable 2m', '1585J-M8TBJM-2', 'Accessories', 45.00, 50),
    ('1585J-M8TBJM-5 Ethernet Cable 5m', '1585J-M8TBJM-5', 'Accessories', 65.00, 40),
    ('1585J-M8TBJM-10 Ethernet Cable 10m', '1585J-M8TBJM-10', 'Accessories', 85.00, 30)
  ) AS new_items(name, sku, category, price, stock)
  WHERE NOT EXISTS (
    SELECT 1 FROM items WHERE items.sku = new_items.sku
  );

  -- Add category placeholders if they don't exist
  INSERT INTO items (name, sku, category, price, stock)
  SELECT * FROM (VALUES
    ('Software Category Placeholder', 'SOFTWARE-CAT', 'Software', 0, 0),
    ('Motors Category Placeholder', 'MOTORS-CAT', 'Motors', 0, 0),
    ('Accessories Category Placeholder', 'ACC-CAT', 'Accessories', 0, 0)
  ) AS categories(name, sku, category, price, stock)
  WHERE NOT EXISTS (
    SELECT 1 FROM items WHERE items.sku = categories.sku
  );
END $$;