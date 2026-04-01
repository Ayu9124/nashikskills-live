import React from 'react';
import { User } from '../../firebase';
import { SubmitView } from '../../components/SubmitView';

interface IndustryPostPageProps {
  user: User | null;
  profile: any;
  onProfileUpdate: (data: any) => void;
}

export const IndustryPostPage = ({ user, profile, onProfileUpdate }: IndustryPostPageProps) => (
  <SubmitView user={user} profile={profile} onProfileUpdate={onProfileUpdate} forceIndustry />
);
