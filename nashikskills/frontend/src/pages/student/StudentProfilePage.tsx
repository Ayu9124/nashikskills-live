import React from 'react';
import { User } from '../../firebase';
import { SubmitView } from '../../components/SubmitView';

interface StudentProfilePageProps {
  user: User | null;
  profile: any;
  onProfileUpdate: (data: any) => void;
}

export const StudentProfilePage = ({ user, profile, onProfileUpdate }: StudentProfilePageProps) => (
  <SubmitView user={user} profile={profile} onProfileUpdate={onProfileUpdate} forceStudent />
);
