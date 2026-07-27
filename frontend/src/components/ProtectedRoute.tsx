import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { Role } from '../types';

export function ProtectedRoute({ roles }: { roles: Role[] }) {
  const { token, user } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  if (!roles.includes(user.role)) {
    return <Navigate to={user.role === 'TADBIRKOR' ? '/tadbirkor' : '/admin'} replace />;
  }
  return <Outlet />;
}
