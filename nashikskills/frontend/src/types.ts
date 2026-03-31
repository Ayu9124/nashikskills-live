export type SectorKey = 'auto' | 'agri' | 'sme' | 'logi';

export interface Skill {
  name: string;
  sub: string;
  gap: number;
  color: string;
  demand: 'critical' | 'high' | 'medium' | 'low';
  link: string;
}

export interface Sector {
  key: SectorKey;
  name: string;
  badge: string;
  bc: string;
  fill: string;
  pct: number;
  co: number;
  gap: number;
  hot?: boolean;
}

export interface Response {
  co: string;
  sec: string;
  gap: number;
  t: string;
}

export interface TrendData {
  name: string;
  erp: number;
  excel: number;
  tally: number;
  tracking: number;
}
