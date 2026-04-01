import React from 'react';
import { User } from '../../firebase';
import { StudentView } from '../../components/StudentView';

interface StudentDashboardPageProps {
  user: User | null;
  profile: any;
  onLogin: () => void;
}

export const StudentDashboardPage = ({ user, profile, onLogin }: StudentDashboardPageProps) => (
  <StudentView user={user} profile={profile} onLogin={onLogin} />
);
