-- Update items with image URLs for all brands and categories
UPDATE items SET image_url = CASE
  -- Allen-Bradley PLCs and Controllers
  WHEN sku LIKE '1756%' THEN 'https://literature.rockwellautomation.com/images/400w/1756-L71_400w.png'
  WHEN sku LIKE '1769%' THEN 'https://literature.rockwellautomation.com/images/400w/1769-L33ER_400w.png'
  WHEN sku LIKE '2080%' THEN 'https://literature.rockwellautomation.com/images/400w/2080-LC50-48QWB_400w.png'
  WHEN sku LIKE '1763%' THEN 'https://literature.rockwellautomation.com/images/400w/1763-L16BWA_400w.png'
  WHEN sku LIKE '1762%' THEN 'https://literature.rockwellautomation.com/images/400w/1762-L40BWA_400w.png'
  WHEN sku LIKE '1766%' THEN 'https://literature.rockwellautomation.com/images/400w/1766-L32BWA_400w.png'
  WHEN sku LIKE '1764%' THEN 'https://literature.rockwellautomation.com/images/400w/1764-LSP_400w.png'

  -- Allen-Bradley I/O Modules
  WHEN sku LIKE '1756-I%' THEN 'https://literature.rockwellautomation.com/images/400w/1756-IF16_400w.png'
  WHEN sku LIKE '1756-O%' THEN 'https://literature.rockwellautomation.com/images/400w/1756-OB32_400w.png'
  WHEN sku LIKE '1769-I%' THEN 'https://literature.rockwellautomation.com/images/400w/1769-IQ16_400w.png'
  WHEN sku LIKE '1769-O%' THEN 'https://literature.rockwellautomation.com/images/400w/1769-OB16_400w.png'

  -- Allen-Bradley HMIs
  WHEN sku LIKE '2711P%' THEN 'https://literature.rockwellautomation.com/images/400w/2711P-T15C22D9P_400w.png'
  WHEN sku LIKE '2711R%' THEN 'https://literature.rockwellautomation.com/images/400w/2711R-T10T_400w.png'

  -- Allen-Bradley Drives
  WHEN sku LIKE '25B%' THEN 'https://literature.rockwellautomation.com/images/400w/25B-D010N104_400w.png'
  WHEN sku LIKE '20F%' THEN 'https://literature.rockwellautomation.com/images/400w/20F-D010N103_400w.png'

  -- Allen-Bradley Network Components
  WHEN sku LIKE '1783%' THEN 'https://literature.rockwellautomation.com/images/400w/1783-US5T_400w.png'
  WHEN sku LIKE '1756-EN%' THEN 'https://literature.rockwellautomation.com/images/400w/1756-EN2TR_400w.png'

  -- Siemens PLCs
  WHEN sku LIKE '6ES7214%' THEN 'https://assets.new.siemens.com/siemens/assets/api/uuid:6e421a8c-e25f-4645-8c05-ef726eacc4c1/width:1125/quality:high/simatic-s7-1200.png'
  WHEN sku LIKE '6ES7215%' THEN 'https://assets.new.siemens.com/siemens/assets/api/uuid:6e421a8c-e25f-4645-8c05-ef726eacc4c1/width:1125/quality:high/simatic-s7-1200.png'
  WHEN sku LIKE '6ES7511%' THEN 'https://assets.new.siemens.com/siemens/assets/api/uuid:f11a0d34-5f34-4e28-8f68-4d4a8e09665f/width:1125/quality:high/simatic-s7-1500.png'
  WHEN sku LIKE '6ES7513%' THEN 'https://assets.new.siemens.com/siemens/assets/api/uuid:f11a0d34-5f34-4e28-8f68-4d4a8e09665f/width:1125/quality:high/simatic-s7-1500.png'

  -- Schneider Electric PLCs
  WHEN sku LIKE 'TM241%' THEN 'https://download.schneider-electric.com/files?p_Doc_Ref=TM241CE24T_1&p_File_Type=product_photo_hd'
  WHEN sku LIKE 'TM251%' THEN 'https://download.schneider-electric.com/files?p_Doc_Ref=TM251MESE_1&p_File_Type=product_photo_hd'
  WHEN sku LIKE 'TM221%' THEN 'https://download.schneider-electric.com/files?p_Doc_Ref=TM221CE16T_1&p_File_Type=product_photo_hd'

  -- ABB PLCs
  WHEN sku LIKE '1SAP130%' THEN 'https://library.abb.com/images/AC500_PM573.png'
  WHEN sku LIKE '1SAP150%' THEN 'https://library.abb.com/images/AC500_PM583.png'
  WHEN sku LIKE '1SAP120%' THEN 'https://library.abb.com/images/AC500-eCo.png'

  -- Omron PLCs
  WHEN sku LIKE 'NX1P2%' THEN 'https://assets.omron.eu/images/nx1p2_1140dt.png'
  WHEN sku LIKE 'NJ301%' THEN 'https://assets.omron.eu/images/nj301_1100.png'
  WHEN sku LIKE 'CP1L%' THEN 'https://assets.omron.eu/images/cp1l_em40dr_d.png'

  -- AutomationDirect Products
  WHEN sku LIKE 'PSH%' THEN 'https://cdn.automationdirect.com/images/products/large/l_psh24120.jpg'
  WHEN sku LIKE 'PSB%' THEN 'https://cdn.automationdirect.com/images/products/large/l_psb24120p.jpg'
  WHEN sku LIKE 'PSM%' THEN 'https://cdn.automationdirect.com/images/products/large/l_psm24180s.jpg'
  WHEN sku LIKE 'PSP%' THEN 'https://cdn.automationdirect.com/images/products/large/l_psp24240s.jpg'
  WHEN sku LIKE 'FAZ%' THEN 'https://cdn.automationdirect.com/images/products/large/l_fazd201nasp.jpg'
  WHEN sku = 'AHWD242410' THEN 'https://cdn.automationdirect.com/images/products/large/l_ahwd242410.jpg'
  WHEN sku = 'AH2424SPK' THEN 'https://cdn.automationdirect.com/images/products/large/l_ah2424spk.jpg'
  WHEN sku = 'AH24DR' THEN 'https://cdn.automationdirect.com/images/products/large/l_ah24dr.jpg'
  WHEN sku LIKE 'AR30PR%' THEN 'https://cdn.automationdirect.com/images/products/large/l_ar30pr311bzc.jpg'
  WHEN sku LIKE 'SE3-SW%' THEN 'https://cdn.automationdirect.com/images/products/large/l_se3sw5u.jpg'
  WHEN sku LIKE 'T1-%' THEN 'https://cdn.automationdirect.com/images/products/large/l_t11522g1.jpg'
  WHEN sku LIKE 'C5E%' THEN 'https://cdn.automationdirect.com/images/products/large/l_c5estpbls3.jpg'
  WHEN sku LIKE 'CFPE%' THEN 'https://cdn.automationdirect.com/images/products/large/l_cfpe5e25.jpg'
  WHEN sku LIKE 'WD%' THEN 'https://cdn.automationdirect.com/images/products/large/l_wd2x3g.jpg'
  WHEN sku LIKE 'NDW%' THEN 'https://cdn.automationdirect.com/images/products/large/l_ndw2x3g.jpg'
  WHEN sku LIKE 'N1W%' THEN 'https://cdn.automationdirect.com/images/products/large/l_n1w2416.jpg'
  WHEN sku LIKE 'SSN4X%' THEN 'https://cdn.automationdirect.com/images/products/large/l_ssn4x1210.jpg'
  WHEN sku LIKE 'ECX%' THEN 'https://cdn.automationdirect.com/images/products/large/l_ecx1310.jpg'
  WHEN sku LIKE 'GCX%' THEN 'https://cdn.automationdirect.com/images/products/large/l_gcx1230.jpg'

  -- C-more HMI Panels
  WHEN sku LIKE 'EA9%' THEN 'https://cdn.automationdirect.com/images/products/large/l_ea9t10wcl.jpg'
  WHEN sku LIKE 'EA3%' THEN 'https://cdn.automationdirect.com/images/products/large/l_ea3t8cl.jpg'

  -- Eaton Circuit Breakers
  WHEN sku LIKE 'GD3%' THEN 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/circuit-breakers/molded-case-circuit-breakers/series-g-mccb-gallery-1.jpg'
  WHEN sku LIKE 'BR1%' THEN 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/circuit-breakers/type-br-circuit-breakers/br-circuit-breaker-1p-gallery-1.jpg'
  WHEN sku LIKE 'BR2%' THEN 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/circuit-breakers/type-br-circuit-breakers/br-circuit-breaker-2p-gallery-1.jpg'
  WHEN sku LIKE 'BRG%' THEN 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/circuit-breakers/type-br-circuit-breakers/br-gfci-circuit-breaker-gallery-1.jpg'
  WHEN sku LIKE 'BRAF%' THEN 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/circuit-breakers/type-br-circuit-breakers/br-afci-circuit-breaker-gallery-1.jpg'
  WHEN sku LIKE 'BRLAFGF%' THEN 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/circuit-breakers/type-br-circuit-breakers/br-dual-function-afci-gfci-circuit-breaker-gallery-1.jpg'
  WHEN sku LIKE 'HFD3%' THEN 'https://www.eaton.com/content/dam/eaton/products/electrical-circuit-protection/circuit-breakers/molded-case-circuit-breakers/hfd-mccb-gallery-1.jpg'

  -- Default image for other items
  ELSE 'https://cdn.automationdirect.com/images/products/large/l_noimage.jpg'
END;