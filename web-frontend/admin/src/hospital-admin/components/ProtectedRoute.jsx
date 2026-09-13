import { Navigate } from 'react-router-dom';
import { getSession } from '../api/client';

// Guards the dashboard route -- redirects to login if there's no session.
export default function ProtectedRoute({ loginPath, children }) {
  const session = getSession();
  if (!session) return <Navigate to={loginPath} replace />;
  return children;
}
