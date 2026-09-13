import { Navigate } from 'react-router-dom';
import { getSession } from '../api/client';

// Guards /doctor and /triage -- redirects to login if there's no session, or
// if the logged-in role doesn't match this route (e.g. a doctor session
// hitting /triage directly by URL).
export default function ProtectedRoute({ role, loginPath, children }) {
  const session = getSession();
  if (!session || session.role !== role) return <Navigate to={loginPath} replace />;
  return children;
}
