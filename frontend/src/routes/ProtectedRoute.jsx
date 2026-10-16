import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { Loading } from '../components/States.jsx';

// role="candidate" atau role="admin": hanya role itu yang boleh masuk
export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  if (role && user.role !== role) {
    const home = user.role === 'admin' ? '/admin/dashboard' : '/candidate/dashboard';
    return <Navigate to={home} replace />;
  }
  return <Outlet />;
}
