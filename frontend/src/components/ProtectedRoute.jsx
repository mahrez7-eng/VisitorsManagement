import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, ready } = useAuth();

  // Wait until we've checked localStorage for a saved session,
  // otherwise a logged-in user gets bounced to login on every refresh.
  if (!ready) return null;

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin-dashboard' : '/dashboard'} replace />;
  }

  return children;
}
