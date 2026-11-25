import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';
import { ChatPage } from '@/features/chat/ChatPage';
import { DocumentsAdminPage } from '@/features/documents/DocumentsAdminPage';
import { useAuthStore } from '@/stores/useAuthStore';

function PublicOnlyRoute() {
  const { accessToken, user } = useAuthStore();

  if (accessToken && user) {
    return (
      <Navigate
        to={user.role === 'ADMIN' ? '/admin/documents' : '/chat'}
        replace
      />
    );
  }

  return <Outlet />;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas (solo si no hay sesión activa) */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Módulo de consultas: accesible para USER y ADMIN */}
        <Route element={<RoleGuard allowedRoles={['USER', 'ADMIN']} />}>
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:conversationId" element={<ChatPage />} />
        </Route>

        {/* Panel de administración documental: exclusivo para ADMIN */}
        <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
          <Route path="/admin/documents" element={<DocumentsAdminPage />} />
        </Route>

        {/* Redirección por defecto */}
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
    </BrowserRouter>
  );
}