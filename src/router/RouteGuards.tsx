import { Navigate, Outlet } from 'react-router-dom';
import { useStore } from '../store';

export function RequireAuth() {
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export function RedirectIfAuthenticated() {
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/overview" replace />;
  }

  return <Outlet />;
}
