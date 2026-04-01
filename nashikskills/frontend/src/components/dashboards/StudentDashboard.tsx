import React from 'react';
import { DashboardView } from '../DashboardView';
import { Response } from '../../types';

interface StudentDashboardProps {
  responses: Response[];
  counts: { ind: number; stu: number };
}

export const StudentDashboard = ({ responses, counts }: StudentDashboardProps) => (
  <div>
    <div className="px-8 py-6 border-b border-b1 bg-s1">
      <div className="mono-label text-teal mb-2">Student Dashboard</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {['Courses in progress', 'Skill progress', 'Recommended resources'].map((item) => (
          <div key={item} className="p-4 border border-b1 rounded-xl bg-bg text-sm text-muted">{item}</div>
        ))}
      </div>
    </div>
    <DashboardView responses={responses} counts={counts} />
  </div>
);
