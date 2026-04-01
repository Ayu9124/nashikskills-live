import React from 'react';
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart, Line } from 'recharts';
import { Response } from '../../types';

interface IndustryInsightsPageProps {
  responses: Response[];
  counts: { ind: number; stu: number };
}

const TREND = [
  { week: 'W1', applications: 21, shortlist: 9 },
  { week: 'W2', applications: 29, shortlist: 11 },
  { week: 'W3', applications: 34, shortlist: 14 },
  { week: 'W4', applications: 31, shortlist: 13 },
  { week: 'W5', applications: 38, shortlist: 16 },
];

export const IndustryInsightsPage = ({ responses, counts }: IndustryInsightsPageProps) => {
  const sectorMap: Record<string, number> = {
    'Auto & Mfg': 0,
    Agri: 0,
    SME: 0,
    Logistics: 0,
  };

  responses.forEach((r) => {
    if (sectorMap[r.sec] !== undefined) {
      sectorMap[r.sec] = Math.max(sectorMap[r.sec], r.gap);
    }
  });

  const sectorData = Object.entries(sectorMap).map(([sector, gap]) => ({
    sector,
    gap,
  }));

  return (
    <div className="max-w-7xl mx-auto px-8 py-16">
      <div className="mono-label text-lime mb-2">Industry</div>
      <h1 className="section-h2 text-3xl mb-3">Insights</h1>
      <p className="text-sm text-muted mb-6">Hiring signal intelligence from latest responses and candidate activity.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="p-4 rounded-xl bg-s1 border border-b1">
          <div className="font-mono text-2xl text-lime">{counts.ind}</div>
          <div className="text-xs text-muted">Industry submissions</div>
        </div>
        <div className="p-4 rounded-xl bg-s1 border border-b1">
          <div className="font-mono text-2xl text-amber">{counts.stu}</div>
          <div className="text-xs text-muted">Student profiles tracked</div>
        </div>
        <div className="p-4 rounded-xl bg-s1 border border-b1">
          <div className="font-mono text-2xl text-coral">{responses[0]?.gap ?? 0}%</div>
          <div className="text-xs text-muted">Latest reported gap</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-s1 border border-b1 rounded-2xl p-5">
          <div className="text-sm mb-3">Sector gap intensity</div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="sector" stroke="#8a8a8a" fontSize={10} />
                <YAxis stroke="#8a8a8a" fontSize={10} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#161616', border: '1px solid #2a2a2a' }} />
                <Bar dataKey="gap" fill="#ff6b4a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-s1 border border-b1 rounded-2xl p-5">
          <div className="text-sm mb-3">Applications vs shortlist trend</div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="week" stroke="#8a8a8a" fontSize={10} />
                <YAxis stroke="#8a8a8a" fontSize={10} />
                <Tooltip contentStyle={{ background: '#161616', border: '1px solid #2a2a2a' }} />
                <Line type="monotone" dataKey="applications" stroke="#3dd9a4" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="shortlist" stroke="#f0a500" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-4 bg-s1 border border-b1 rounded-2xl p-5 text-sm text-muted">
        Recommended action: prioritize ERP and Excel bridge cohorts this month; these are consistently appearing in top-gap responses.
      </div>
    </div>
  );
};
