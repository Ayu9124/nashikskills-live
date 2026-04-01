import { UserRole } from '../../firebase';

export function getDashboardPathForRole(role: UserRole) {
  if (role === 'student') return '/student-dashboard';
  if (role === 'industry') return '/industry-dashboard';
  return '/academic-dashboard';
}
