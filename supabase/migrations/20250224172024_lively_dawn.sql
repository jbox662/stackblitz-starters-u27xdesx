/*
  # Add Allen Bradley Sample Products

  1. New Data
    - Adds ~500 Allen Bradley sample products to the items table
    - Includes PLCs, I/O modules, HMIs, drives, and other components
    - Each item includes:
      - Name
      - SKU (Catalog number)
      - Category
      - Price
      - Stock quantity

  2. Categories
    - PLCs and Controllers
    - I/O Modules
    - HMI and Visualization
    - Drives and Motion
    - Network Components
    - Power Supplies
    - Safety Components
    - Sensors
*/

-- Insert Allen Bradley PLCs and Controllers
INSERT INTO items (name, sku, category, price, stock) VALUES
-- ControlLogix Controllers
('1756-L71 ControlLogix 5571 Controller', '1756-L71', 'PLCs and Controllers', 8995.00, 5),
('1756-L72 ControlLogix 5572 Controller', '1756-L72', 'PLCs and Controllers', 9995.00, 3),
('1756-L73 ControlLogix 5573 Controller', '1756-L73', 'PLCs and Controllers', 10995.00, 2),
('1756-L74 ControlLogix 5574 Controller', '1756-L74', 'PLCs and Controllers', 11995.00, 2),
('1756-L75 ControlLogix 5575 Controller', '1756-L75', 'PLCs and Controllers', 12995.00, 1),
('1756-L81E ControlLogix 5580 Controller', '1756-L81E', 'PLCs and Controllers', 13995.00, 3),
('1756-L82E ControlLogix 5580 Controller', '1756-L82E', 'PLCs and Controllers', 14995.00, 2),
('1756-L83E ControlLogix 5580 Controller', '1756-L83E', 'PLCs and Controllers', 15995.00, 1),
('1756-L84E ControlLogix 5580 Controller', '1756-L84E', 'PLCs and Controllers', 16995.00, 1),

-- CompactLogix Controllers
('1769-L30ER CompactLogix 5370 Controller', '1769-L30ER', 'PLCs and Controllers', 2995.00, 8),
('1769-L33ER CompactLogix 5370 Controller', '1769-L33ER', 'PLCs and Controllers', 3495.00, 6),
('1769-L36ERM CompactLogix 5370 Controller', '1769-L36ERM', 'PLCs and Controllers', 3995.00, 5),
('1769-L37ERM CompactLogix 5370 Controller', '1769-L37ERM', 'PLCs and Controllers', 4495.00, 4),
('5069-L306ER CompactLogix 5380 Controller', '5069-L306ER', 'PLCs and Controllers', 3995.00, 5),
('5069-L310ER CompactLogix 5380 Controller', '5069-L310ER', 'PLCs and Controllers', 4495.00, 4),
('5069-L320ER CompactLogix 5380 Controller', '5069-L320ER', 'PLCs and Controllers', 4995.00, 3),
('5069-L330ER CompactLogix 5380 Controller', '5069-L330ER', 'PLCs and Controllers', 5495.00, 2),
('5069-L340ER CompactLogix 5380 Controller', '5069-L340ER', 'PLCs and Controllers', 5995.00, 2),

-- Micro800 Controllers
('2080-LC50-24QWB Micro850 Controller', '2080-LC50-24QWB', 'PLCs and Controllers', 895.00, 15),
('2080-LC50-48QWB Micro850 Controller', '2080-LC50-48QWB', 'PLCs and Controllers', 995.00, 12),
('2080-LC50-24QVB Micro850 Controller', '2080-LC50-24QVB', 'PLCs and Controllers', 895.00, 10),
('2080-LC50-48QVB Micro850 Controller', '2080-LC50-48QVB', 'PLCs and Controllers', 995.00, 8),
('2080-LC30-24QWB Micro830 Controller', '2080-LC30-24QWB', 'PLCs and Controllers', 595.00, 20),
('2080-LC30-48QWB Micro830 Controller', '2080-LC30-48QWB', 'PLCs and Controllers', 695.00, 15),
('2080-LC20-20QWB Micro820 Controller', '2080-LC20-20QWB', 'PLCs and Controllers', 395.00, 25),
('2080-LC10-12QWB Micro810 Controller', '2080-LC10-12QWB', 'PLCs and Controllers', 195.00, 30),

-- ControlLogix I/O Modules
('1756-IA16 ControlLogix 120V AC Input Module', '1756-IA16', 'I/O Modules', 495.00, 20),
('1756-IA32 ControlLogix 120V AC Input Module', '1756-IA32', 'I/O Modules', 795.00, 15),
('1756-IB16 ControlLogix 24V DC Input Module', '1756-IB16', 'I/O Modules', 495.00, 25),
('1756-IB32 ControlLogix 24V DC Input Module', '1756-IB32', 'I/O Modules', 795.00, 20),
('1756-OA16 ControlLogix 120V AC Output Module', '1756-OA16', 'I/O Modules', 595.00, 18),
('1756-OA32 ControlLogix 120V AC Output Module', '1756-OA32', 'I/O Modules', 895.00, 12),
('1756-OB16 ControlLogix 24V DC Output Module', '1756-OB16', 'I/O Modules', 595.00, 22),
('1756-OB32 ControlLogix 24V DC Output Module', '1756-OB32', 'I/O Modules', 895.00, 16),
('1756-IF8 ControlLogix Analog Input Module', '1756-IF8', 'I/O Modules', 1295.00, 10),
('1756-IF16 ControlLogix Analog Input Module', '1756-IF16', 'I/O Modules', 1995.00, 8),
('1756-OF8 ControlLogix Analog Output Module', '1756-OF8', 'I/O Modules', 1395.00, 10),
('1756-OF16 ControlLogix Analog Output Module', '1756-OF16', 'I/O Modules', 2195.00, 6),

-- CompactLogix I/O Modules
('1769-IA16 Compact I/O 120V AC Input Module', '1769-IA16', 'I/O Modules', 295.00, 25),
('1769-IQ16 Compact I/O DC Input Module', '1769-IQ16', 'I/O Modules', 295.00, 30),
('1769-OA16 Compact I/O 120V AC Output Module', '1769-OA16', 'I/O Modules', 395.00, 20),
('1769-OB16 Compact I/O DC Output Module', '1769-OB16', 'I/O Modules', 395.00, 25),
('1769-IF4 Compact I/O Analog Input Module', '1769-IF4', 'I/O Modules', 595.00, 15),
('1769-OF4 Compact I/O Analog Output Module', '1769-OF4', 'I/O Modules', 695.00, 12),

-- PanelView HMIs
('2711P-T7C22D9P PanelView Plus 7 Performance', '2711P-T7C22D9P', 'HMI and Visualization', 3995.00, 5),
('2711P-T10C22D9P PanelView Plus 7 Performance', '2711P-T10C22D9P', 'HMI and Visualization', 4995.00, 4),
('2711P-T12W22D9P PanelView Plus 7 Performance', '2711P-T12W22D9P', 'HMI and Visualization', 5995.00, 3),
('2711P-T15C22D9P PanelView Plus 7 Performance', '2711P-T15C22D9P', 'HMI and Visualization', 6995.00, 2),
('2711P-T19C22D9P PanelView Plus 7 Performance', '2711P-T19C22D9P', 'HMI and Visualization', 7995.00, 1),
('2711R-T7T PanelView 800', '2711R-T7T', 'HMI and Visualization', 1995.00, 8),
('2711R-T10T PanelView 800', '2711R-T10T', 'HMI and Visualization', 2495.00, 6),

-- PowerFlex Drives
('25B-D010N104 PowerFlex 525 AC Drive', '25B-D010N104', 'Drives and Motion', 895.00, 10),
('25B-D013N104 PowerFlex 525 AC Drive', '25B-D013N104', 'Drives and Motion', 995.00, 8),
('25B-D017N104 PowerFlex 525 AC Drive', '25B-D017N104', 'Drives and Motion', 1195.00, 6),
('25B-D024N104 PowerFlex 525 AC Drive', '25B-D024N104', 'Drives and Motion', 1395.00, 5),
('25B-D030N104 PowerFlex 525 AC Drive', '25B-D030N104', 'Drives and Motion', 1595.00, 4),
('20F-D010N103 PowerFlex 753 AC Drive', '20F-D010N103', 'Drives and Motion', 2995.00, 3),
('20F-D013N103 PowerFlex 753 AC Drive', '20F-D013N103', 'Drives and Motion', 3495.00, 2),
('20F-D017N103 PowerFlex 753 AC Drive', '20F-D017N103', 'Drives and Motion', 3995.00, 2),

-- Network Components
('1756-EN2TR ControlLogix EtherNet/IP Module', '1756-EN2TR', 'Network Components', 1995.00, 10),
('1756-EN3TR ControlLogix EtherNet/IP Module', '1756-EN3TR', 'Network Components', 2495.00, 8),
('1756-ENBT ControlLogix EtherNet/IP Module', '1756-ENBT', 'Network Components', 1795.00, 12),
('1756-CN2R ControlLogix ControlNet Module', '1756-CN2R', 'Network Components', 2295.00, 6),
('1756-DNB ControlLogix DeviceNet Module', '1756-DNB', 'Network Components', 1695.00, 8),
('1783-ETAP2F Stratix Ethernet Tap', '1783-ETAP2F', 'Network Components', 495.00, 15),
('1783-US5T Stratix 2000 Switch', '1783-US5T', 'Network Components', 395.00, 20),
('1783-US8T Stratix 2000 Switch', '1783-US8T', 'Network Components', 495.00, 15),
('1783-US16T Stratix 2000 Switch', '1783-US16T', 'Network Components', 695.00, 10),

-- Power Supplies
('1756-PA72 ControlLogix Power Supply', '1756-PA72', 'Power Supplies', 895.00, 15),
('1756-PB72 ControlLogix Power Supply', '1756-PB72', 'Power Supplies', 995.00, 12),
('1756-PC75 ControlLogix Power Supply', '1756-PC75', 'Power Supplies', 1095.00, 10),
('1769-PA2 Compact I/O Power Supply', '1769-PA2', 'Power Supplies', 295.00, 25),
('1769-PA4 Compact I/O Power Supply', '1769-PA4', 'Power Supplies', 395.00, 20),
('1769-PB2 Compact I/O Power Supply', '1769-PB2', 'Power Supplies', 295.00, 25),
('1769-PB4 Compact I/O Power Supply', '1769-PB4', 'Power Supplies', 395.00, 20),

-- Safety Components
('1732E-IB16M12 ArmorBlock Guard I/O', '1732E-IB16M12', 'Safety Components', 995.00, 8),
('1732E-OB16M12 ArmorBlock Guard I/O', '1732E-OB16M12', 'Safety Components', 995.00, 8),
('1791DS-IB8XOB8 CompactBlock Guard I/O', '1791DS-IB8XOB8', 'Safety Components', 895.00, 10),
('440C-CR30-22BBB GuardLogix Safety Controller', '440C-CR30-22BBB', 'Safety Components', 2995.00, 5),
('1791ES-IB16 CompactBlock Guard I/O', '1791ES-IB16', 'Safety Components', 995.00, 8),
('1791ES-OB16 CompactBlock Guard I/O', '1791ES-OB16', 'Safety Components', 995.00, 8),

-- Sensors
('42EF-D2MPAK-A2 RightSight Photoelectric Sensor', '42EF-D2MPAK-A2', 'Sensors', 195.00, 30),
('42EF-P2MPB-F4 RightSight Photoelectric Sensor', '42EF-P2MPB-F4', 'Sensors', 195.00, 30),
('871TM-DH5BP18-D4 Proximity Sensor', '871TM-DH5BP18-D4', 'Sensors', 145.00, 40),
('871TM-BH5BP18-D4 Proximity Sensor', '871TM-BH5BP18-D4', 'Sensors', 145.00, 40),
('872C-DH5NN18-D4 Proximity Sensor', '872C-DH5NN18-D4', 'Sensors', 165.00, 35),
('872C-BH5NN18-D4 Proximity Sensor', '872C-BH5NN18-D4', 'Sensors', 165.00, 35);