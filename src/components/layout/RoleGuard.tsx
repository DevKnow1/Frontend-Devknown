import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '../../api/auth.api';
import { useAuthStore } from '@/stores/useAuthStore';
import type { Role } from '../../types/api';

interface RoleGuardProps {
  allowedRoles?: Role[];
}

export function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const location = useLocation();
  const { accessToken, user, setUser, clearSession } = useAuthStore();

  // Sincroniza el rol y validez del token con /api/auth/me al cargar la app
  const { data: freshUser, isLoading, isError } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.getMe,
    enabled: Boolean(accessToken),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  useEffect(() => {
    if (freshUser) {
      setUser(freshUser);
    }
  }, [freshUser, setUser]);

  useEffect(() => {
    if (isError) {
      clearSession();
    }
  }, [isError, clearSession]);

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const activeUser = freshUser ?? user;

  if (isLoading && !activeUser) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-slate-500">
        Verificando credenciales...
      </div>
    );
  }

  if (!activeUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(activeUser.role)) {
    return <Navigate to="/chat" replace />;
  }

  return <Outlet />;
}