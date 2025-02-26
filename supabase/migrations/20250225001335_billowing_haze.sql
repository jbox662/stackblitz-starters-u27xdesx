/*
  # Add Allen-Bradley MicroLogix PLCs and Accessories

  1. New Items
    - MicroLogix 1100 Controllers
    - MicroLogix 1200 Controllers
    - MicroLogix 1400 Controllers
    - MicroLogix 1500 Controllers
    - MicroLogix I/O Modules
    - MicroLogix Communication Modules
    - MicroLogix Memory Modules
*/

INSERT INTO items (name, sku, category, brand, price, stock) VALUES
-- MicroLogix 1100 Controllers
('1763-L16BWA MicroLogix 1100 16 Point Controller', '1763-L16BWA', 'PLCs and Controllers', 'Allen-Bradley', 995.00, 10),
('1763-L16BBB MicroLogix 1100 16 Point Controller', '1763-L16BBB', 'PLCs and Controllers', 'Allen-Bradley', 995.00, 10),
('1763-L16AWA MicroLogix 1100 16 Point Controller', '1763-L16AWA', 'PLCs and Controllers', 'Allen-Bradley', 995.00, 10),
('1763-L16DWD MicroLogix 1100 16 Point Controller', '1763-L16DWD', 'PLCs and Controllers', 'Allen-Bradley', 995.00, 10),

-- MicroLogix 1200 Controllers
('1762-L24BWA MicroLogix 1200 24 Point Controller', '1762-L24BWA', 'PLCs and Controllers', 'Allen-Bradley', 1195.00, 8),
('1762-L24BXB MicroLogix 1200 24 Point Controller', '1762-L24BXB', 'PLCs and Controllers', 'Allen-Bradley', 1195.00, 8),
('1762-L40BWA MicroLogix 1200 40 Point Controller', '1762-L40BWA', 'PLCs and Controllers', 'Allen-Bradley', 1495.00, 6),
('1762-L40BXB MicroLogix 1200 40 Point Controller', '1762-L40BXB', 'PLCs and Controllers', 'Allen-Bradley', 1495.00, 6),

-- MicroLogix 1400 Controllers
('1766-L32BWA MicroLogix 1400 32 Point Controller', '1766-L32BWA', 'PLCs and Controllers', 'Allen-Bradley', 1695.00, 6),
('1766-L32BXB MicroLogix 1400 32 Point Controller', '1766-L32BXB', 'PLCs and Controllers', 'Allen-Bradley', 1695.00, 6),
('1766-L32BWAA MicroLogix 1400 32 Point Controller', '1766-L32BWAA', 'PLCs and Controllers', 'Allen-Bradley', 1795.00, 5),
('1766-L32AWAA MicroLogix 1400 32 Point Controller', '1766-L32AWAA', 'PLCs and Controllers', 'Allen-Bradley', 1795.00, 5),

-- MicroLogix 1500 Controllers
('1764-LSP MicroLogix 1500 Base Unit', '1764-LSP', 'PLCs and Controllers', 'Allen-Bradley', 1995.00, 4),
('1764-LRP MicroLogix 1500 Base Unit', '1764-LRP', 'PLCs and Controllers', 'Allen-Bradley', 2195.00, 4),
('1764-DAT MicroLogix 1500 Data Access Tool', '1764-DAT', 'PLCs and Controllers', 'Allen-Bradley', 295.00, 10),

-- MicroLogix I/O Modules
('1762-IA8 MicroLogix 8 Point AC Input Module', '1762-IA8', 'I/O Modules', 'Allen-Bradley', 195.00, 15),
('1762-IQ8 MicroLogix 8 Point DC Input Module', '1762-IQ8', 'I/O Modules', 'Allen-Bradley', 195.00, 15),
('1762-OA8 MicroLogix 8 Point AC Output Module', '1762-OA8', 'I/O Modules', 'Allen-Bradley', 225.00, 15),
('1762-OW8 MicroLogix 8 Point Relay Output Module', '1762-OW8', 'I/O Modules', 'Allen-Bradley', 225.00, 15),
('1762-IF4 MicroLogix 4 Channel Analog Input Module', '1762-IF4', 'I/O Modules', 'Allen-Bradley', 495.00, 10),
('1762-OF4 MicroLogix 4 Channel Analog Output Module', '1762-OF4', 'I/O Modules', 'Allen-Bradley', 595.00, 8),
('1762-IT4 MicroLogix 4 Channel Thermocouple Module', '1762-IT4', 'I/O Modules', 'Allen-Bradley', 595.00, 8),
('1762-IR4 MicroLogix 4 Channel RTD Module', '1762-IR4', 'I/O Modules', 'Allen-Bradley', 595.00, 8),

-- MicroLogix Communication Modules
('1761-NET-AIC Advanced Interface Converter', '1761-NET-AIC', 'Network Components', 'Allen-Bradley', 295.00, 12),
('1761-NET-ENI Ethernet Interface', '1761-NET-ENI', 'Network Components', 'Allen-Bradley', 495.00, 10),
('1763-NC01 DeviceNet Scanner Module', '1763-NC01', 'Network Components', 'Allen-Bradley', 695.00, 8),
('1764-LXP MicroLogix Processor Unit', '1764-LXP', 'Network Components', 'Allen-Bradley', 895.00, 6),

-- MicroLogix Memory Modules and Accessories
('1764-MM1 MicroLogix Memory Module 1K', '1764-MM1', 'Accessories', 'Allen-Bradley', 95.00, 20),
('1764-MM2 MicroLogix Memory Module 4K', '1764-MM2', 'Accessories', 'Allen-Bradley', 145.00, 15),
('1761-CBL-PM02 Programming Cable 2m', '1761-CBL-PM02', 'Accessories', 'Allen-Bradley', 65.00, 25),
('1761-CBL-AP00 Programming Cable USB', '1761-CBL-AP00', 'Accessories', 'Allen-Bradley', 95.00, 20),
('1761-CBL-HM02 HMI Cable 2m', '1761-CBL-HM02', 'Accessories', 'Allen-Bradley', 55.00, 25),
('1761-CBL-AM00 Programming Cable Serial', '1761-CBL-AM00', 'Accessories', 'Allen-Bradley', 75.00, 20);