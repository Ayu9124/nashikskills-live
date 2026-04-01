import React from 'react';
import { User } from '../../firebase';
import { StudentView } from '../../components/StudentView';

interface StudentLearningPageProps {
  user: User | null;
  profile: any;
  onLogin: () => void;
}

export const StudentLearningPage = ({ user, profile, onLogin }: StudentLearningPageProps) => (
  <StudentView user={user} profile={profile} onLogin={onLogin} />
);
