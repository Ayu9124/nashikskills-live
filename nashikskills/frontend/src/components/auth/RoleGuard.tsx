import React from 'react';
import { Navigate } from 'react-router-dom';
import { User, UserRole } from '../../firebase';
import { getDashboardPathForRole } from './roleUtils';

interface RoleGuardProps {
  user: User | null;
  role: UserRole | null;
  allowedRoles: UserRole[];
  children: React.ReactElement;
}

export const RoleGuard = ({ user, role, allowedRoles, children }: RoleGuardProps) => {
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!role) {
    return <Navigate to="/auth" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={getDashboardPathForRole(role)} replace />;
  }

  return children;
};
