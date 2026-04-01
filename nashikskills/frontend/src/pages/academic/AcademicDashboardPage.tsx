import React from 'react';
import { DashboardView } from '../../components/DashboardView';
import { Response } from '../../types';

interface AcademicDashboardPageProps {
  responses: Response[];
  counts: { ind: number; stu: number };
}

export const AcademicDashboardPage = ({ responses, counts }: AcademicDashboardPageProps) => (
  <DashboardView responses={responses} counts={counts} />
);
