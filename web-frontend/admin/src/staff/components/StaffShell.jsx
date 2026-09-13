import { useNavigate } from 'react-router-dom';
import { clearSession } from '../api/client';
import StaffSidebar from './StaffSidebar';

// Sidebar + topbar shell for every doctor/triage page -- replaces the old
// single-scrolling-dashboard layout (bare PageShell) now that each role is
// a small multi-page app (Patient Queue / Booked Patients / [Emergency
// Token for triage]) instead of one page with everything stacked on it.
export default function StaffShell({ role, title, profileName, children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate('/staff/login');
  };

  return (
    <div className="min-h-screen flex bg-brand-bg">
      <StaffSidebar role={role} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-brand-border px-8 py-5 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-brand-primary">{title}</h1>
          {profileName && <span className="text-sm text-brand-text-secondary">{profileName}</span>}
        </header>
        <main className="p-8 max-w-6xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}
