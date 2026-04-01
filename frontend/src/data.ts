import { Sector, Skill, Response, TrendData } from './types';

export const ALL_SKILLS_LIST = [
  'ERP basics', 'Excel / Sheets', 'Data entry', 'Digital comms', 'Tally / GST', 
  'CAD basics', 'Inventory tools', 'WhatsApp Business', 'Digital marketing', 
  'CNC basics', 'Python', 'AutoCAD', 'SolidWorks', 'SAP', 'Oracle Lite', 
  'Inventory mgmt', 'Stock dispatch', 'Instagram marketing', 'GMB', 
  'Invoicing', 'CRM', 'GPS tracking', 'Shipment SW', 'Warehouse mgmt'
];

export const SKILLS: Record<string, Skill[]> = {
  auto: [
    { name: 'ERP basics', sub: 'SAP, Oracle Lite', gap: 87, color: 'var(--color-coral)', demand: 'critical', link: 'https://www.coursera.org/courses?query=erp' },
    { name: 'CAD basics', sub: 'AutoCAD, SolidWorks', gap: 72, color: 'var(--color-amber)', demand: 'critical', link: 'https://www.coursera.org/courses?query=autocad' },
    { name: 'Excel / Sheets', sub: 'Inventory, prod. logs', gap: 65, color: 'var(--color-amber)', demand: 'high', link: 'https://www.coursera.org/learn/excel-basics-data-analysis-ibm' },
    { name: 'CNC basics', sub: 'G-code, machining', gap: 58, color: 'var(--color-teal)', demand: 'high', link: 'https://www.coursera.org/courses?query=cnc' },
    { name: 'Digital comms', sub: 'Email, reporting', gap: 44, color: 'var(--color-purple)', demand: 'medium', link: 'https://www.coursera.org/courses?query=business+communication' },
  ],
  agri: [
    { name: 'Excel / Sheets', sub: 'Harvest, costing', gap: 74, color: 'var(--color-coral)', demand: 'critical', link: 'https://www.coursera.org/learn/excel-basics-data-analysis-ibm' },
    { name: 'Inventory tools', sub: 'Stock, dispatch', gap: 66, color: 'var(--color-amber)', demand: 'critical', link: 'https://www.coursera.org/courses?query=inventory+management' },
    { name: 'WhatsApp Business', sub: 'Orders, clients', gap: 55, color: 'var(--color-amber)', demand: 'high', link: 'https://www.facebook.com/business/tools/whatsapp' },
    { name: 'Digital marketing', sub: 'Wine tourism, exports', gap: 48, color: 'var(--color-teal)', demand: 'medium', link: 'https://learndigital.withgoogle.com/digitalgarage' },
    { name: 'Tally / GST', sub: 'Billing, compliance', gap: 40, color: 'var(--color-purple)', demand: 'medium', link: 'https://tallysolutions.com/learning' },
  ],
  sme: [
    { name: 'Tally / GST', sub: 'Billing, GST filing', gap: 79, color: 'var(--color-coral)', demand: 'critical', link: 'https://tallysolutions.com/learning' },
    { name: 'Digital marketing', sub: 'Instagram, GMB', gap: 71, color: 'var(--color-amber)', demand: 'critical', link: 'https://learndigital.withgoogle.com/digitalgarage' },
    { name: 'Excel / Sheets', sub: 'Business records', gap: 63, color: 'var(--color-amber)', demand: 'high', link: 'https://www.coursera.org/learn/excel-basics-data-analysis-ibm' },
    { name: 'WhatsApp Business', sub: 'Order catalog', gap: 54, color: 'var(--color-teal)', demand: 'high', link: 'https://www.facebook.com/business/tools/whatsapp' },
    { name: 'Data entry', sub: 'Invoicing, CRM', gap: 42, color: 'var(--color-purple)', demand: 'medium', link: 'https://www.coursera.org/courses?query=data+entry' },
  ],
  logi: [
    { name: 'Digital tracking', sub: 'GPS, shipment SW', gap: 68, color: 'var(--color-coral)', demand: 'critical', link: 'https://www.coursera.org/courses?query=logistics+technology' },
    { name: 'Excel / Sheets', sub: 'Route, costing', gap: 60, color: 'var(--color-amber)', demand: 'high', link: 'https://www.coursera.org/learn/excel-basics-data-analysis-ibm' },
    { name: 'Data entry', sub: 'Consignment logs', gap: 55, color: 'var(--color-amber)', demand: 'high', link: 'https://www.coursera.org/courses?query=data+entry' },
    { name: 'ERP basics', sub: 'Warehouse mgmt', gap: 48, color: 'var(--color-teal)', demand: 'medium', link: 'https://www.coursera.org/courses?query=erp' },
  ]
};

export const SECTORS: Sector[] = [
  { key: 'auto', name: 'Auto & Manufacturing', badge: 'CRITICAL', bc: 'bg-coral/10 text-coral', fill: 'var(--color-coral)', pct: 87, co: 5, gap: 87, hot: true },
  { key: 'agri', name: 'Agri / Vineyards', badge: 'HIGH', bc: 'bg-amber/10 text-amber', fill: 'var(--color-amber)', pct: 74, co: 3, gap: 74 },
  { key: 'sme', name: 'SMEs & Local Biz', badge: 'HIGH', bc: 'bg-amber/10 text-amber', fill: 'var(--color-amber)', pct: 71, co: 8, gap: 71 },
  { key: 'logi', name: 'Logistics & Supply', badge: 'MEDIUM', bc: 'bg-teal/10 text-teal', fill: 'var(--color-teal)', pct: 68, co: 2, gap: 68 },
];

export const INITIAL_RESPONSES: Response[] = [
  { co: 'Mahindra & Mahindra', sec: 'Auto & Mfg', gap: 87, t: '8m ago' },
  { co: 'Sula Vineyards', sec: 'Agri', gap: 74, t: '23m ago' },
  { co: 'Anand Traders', sec: 'SME', gap: 71, t: '1h ago' },
  { co: 'Bosch Nashik', sec: 'Auto & Mfg', gap: 82, t: '2h ago' },
  { co: 'Gangapur Logistics', sec: 'Logistics', gap: 68, t: '3h ago' },
];

export const TREND_DATA: TrendData[] = [
  { name: 'Feb 1', erp: 72, excel: 66, tally: 60, tracking: 55 },
  { name: 'Feb 8', erp: 74, excel: 68, tally: 62, tracking: 57 },
  { name: 'Feb 15', erp: 76, excel: 68, tally: 63, tracking: 58 },
  { name: 'Feb 22', erp: 79, excel: 70, tally: 65, tracking: 60 },
  { name: 'Mar 1', erp: 82, excel: 71, tally: 67, tracking: 62 },
  { name: 'Mar 8', erp: 84, excel: 72, tally: 68, tracking: 64 },
  { name: 'Mar 15', erp: 85, excel: 73, tally: 69, tracking: 65 },
  { name: 'Mar 22', erp: 87, excel: 74, tally: 70, tracking: 68 },
];

export const TICKER_ITEMS = [
  { text: "Auto & Mfg — ERP gap critical: 87%", color: "var(--color-coral)" },
  { text: "Agri / Vineyards — Excel gap: 74%", color: "var(--color-amber)" },
  { text: "New response — Sula Vineyards — 3 min ago", color: "var(--color-teal)" },
  { text: "Logistics — Digital tracking gap: 68%", color: "var(--color-purple)" },
  { text: "47 students checked skill match today", color: "var(--color-lime)" },
  { text: "Nashik skill gap costs industry est. ₹340Cr/yr", color: "var(--color-blue)" },
];
