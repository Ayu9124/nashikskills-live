/**
 * Frontend API helper — calls the Express backend at /api/*
 * In development, Vite proxies /api -> http://localhost:5000
 * In production, set VITE_API_URL to your deployed backend URL
 */

const BASE_URL = "https://nashikskills-backend.onrender.com";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'API request failed');
  return json;
}

// ── Dashboard ──────────────────────────────────────────────
export const getStats = () =>
  request<{ data: { totalCompanies: number; totalStudents: number; averageSkillGap: number } }>('/api/dashboard/stats');

export const getSectors = () =>
  request<{ data: { name: string; averageGap: number; responses: number }[] }>('/api/dashboard/sectors');

// ── Industries ─────────────────────────────────────────────
export const getIndustries = () =>
  request<{ data: any[] }>('/api/industries');

export const submitIndustry = (payload: {
  companyName: string;
  sector: string;
  missingSkills: string[];
  hiringTarget?: string;
  message?: string;
}) =>
  request('/api/industries', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

// ── Students ───────────────────────────────────────────────
export const getStudent = (uid: string) =>
  request<{ data: any }>(`/api/students/${uid}`);

export const saveStudent = (uid: string, payload: {
  displayName: string;
  email: string;
  college?: string;
  targetSector?: string;
  mySkills?: string[];
}) =>
  request(`/api/students/${uid}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const searchStudents = (sector?: string, skill?: string) => {
  const params = new URLSearchParams();
  if (sector) params.set('sector', sector);
  if (skill) params.set('skill', skill);
  return request<{ data: any[] }>(`/api/students?${params}`);
};

// ── Health check ──────────────────────────────────────────
export const checkHealth = () =>
  request<{ status: string; message: string }>('/api/health');
