import { Navigate } from 'react-router-dom';
import { isAuthenticated, getAuth } from '../utils/auth';

export default function ProtectedRoute({ children, roles }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  const { role } = getAuth();
  if (roles && !roles.includes(role)) return <Navigate to="/dashboard" replace />;
  return children;
}
