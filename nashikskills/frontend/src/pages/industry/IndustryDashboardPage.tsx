import React from 'react';
import { DashboardView } from '../../components/DashboardView';
import { Response } from '../../types';

interface IndustryDashboardPageProps {
  responses: Response[];
  counts: { ind: number; stu: number };
}

export const IndustryDashboardPage = ({ responses, counts }: IndustryDashboardPageProps) => (
  <DashboardView responses={responses} counts={counts} />
);
