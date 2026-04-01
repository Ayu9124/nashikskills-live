import React from 'react';
import { User } from '../../firebase';
import { SubmitView } from '../../components/SubmitView';

interface AcademicStudentsPageProps {
  user: User | null;
  profile: any;
  onProfileUpdate: (data: any) => void;
}

export const AcademicStudentsPage = ({ user, profile, onProfileUpdate }: AcademicStudentsPageProps) => (
  <SubmitView user={user} profile={profile} onProfileUpdate={onProfileUpdate} />
);
