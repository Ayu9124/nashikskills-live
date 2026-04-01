import React from 'react';
import { DashboardView } from '../DashboardView';
import { Response } from '../../types';

interface IndustryDashboardProps {
  responses: Response[];
  counts: { ind: number; stu: number };
}

export const IndustryDashboard = ({ responses, counts }: IndustryDashboardProps) => (
  <div>
    <div className="px-8 py-6 border-b border-b1 bg-s1">
      <div className="mono-label text-lime mb-2">Industry Dashboard</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {['Job postings', 'Candidate pipeline'].map((item) => (
          <div key={item} className="p-4 border border-b1 rounded-xl bg-bg text-sm text-muted">{item}</div>
        ))}
      </div>
    </div>
    <DashboardView responses={responses} counts={counts} />
  </div>
);
