import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/auth-store';

interface Props {
  children: ReactNode;
}

export default function PublicOnlyRoute({ children }: Props) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to="/todos" replace />;
  }
  return <>{children}</>;
}
