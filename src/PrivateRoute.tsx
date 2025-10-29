import { Navigate, Outlet } from 'react-router-dom';
import { User } from '../src/type';

interface PrivateRouteProps {
  user: User | null;
  role: 'admin' | 'cajero';
}

export default function PrivateRoute({ user, role }: PrivateRouteProps) {
  if (!user) return <Navigate to="/login" replace />; // no logueado
  if (user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/cajero'} replace />;
  }
  return <Outlet />; // renderiza las rutas hijas
}