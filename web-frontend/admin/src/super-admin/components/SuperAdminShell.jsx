import { useNavigate } from 'react-router-dom';
import { clearSession } from '../api/client';
import SuperAdminSidebar from './SuperAdminSidebar';

export default function SuperAdminShell({ title, profileName, children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate('/super-admin/login');
  };

  return (
    <div className="min-h-screen flex bg-brand-bg">
      <SuperAdminSidebar onLogout={handleLogout} />
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
