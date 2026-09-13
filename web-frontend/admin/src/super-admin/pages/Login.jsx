import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { callApi, setSession, superAdminApi } from '../api/client';
import { Button, ErrorBanner, TextField } from '../../components/ui';
import superAdminSvg from '../../assets/superadmin.svg';

export default function SuperAdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await callApi(() => superAdminApi.login(username, password));
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSession({
      access: result.data.access,
      refresh: result.data.refresh,
      profile: { username: result.data.username },
    });
    navigate('/super-admin/dashboard');
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-brand-bg">
      {/* LEFT SIDE PANEL -- WITH BOLD TITLE AND ANIMATED ENTERPRISE SVG */}
      <div className="hidden lg:flex p-12 xl:p-16 flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[#1E3A8A] via-[#1E3A5F] to-[#0F172A]">
        {/* Subtle decorative glow circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        {/* TOP: BRAND LOGO & BOLD TITLE ONLY */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xl font-black shadow-inner">
              ┼
            </div>
            <span className="text-white/90 text-2xl font-bold tracking-wide">MediKiosk</span>
          </div>

          {/* BOLD DYNAMIC TITLE AT THE TOP */}
          <h1 className="text-white text-4xl xl:text-5xl 2xl:text-6xl font-black tracking-tight leading-tight">
            Super Admin Login
          </h1>
        </div>

        {/* CENTER ANIMATED SVG ILLUSTRATION */}
        <div className="relative z-10 flex items-center justify-center py-8">
          <img
            src={superAdminSvg}
            alt="Super Admin Console Illustration"
            className="w-full max-w-lg xl:max-w-xl 2xl:max-w-2xl max-h-[560px] object-contain drop-shadow-2xl"
          />
        </div>

        {/* BOTTOM FOOTER */}
        <div className="relative z-10 text-white/40 text-sm font-medium">
          © {new Date().getFullYear()} MediKiosk · Hospital Operations Portal
        </div>
      </div>

      {/* RIGHT SIDE LOGIN CARD CONTAINER -- PROMINENT, LARGE & SPACIOUS */}
      <div className="flex items-center justify-center p-6 sm:p-10 lg:p-14 xl:p-18">
        <div className="w-full max-w-xl xl:max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-slate-300/60 p-8 sm:p-12 lg:p-14">
          {/* CARD TITLE & SUBTITLE */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-brand-accent text-xs sm:text-sm font-bold uppercase tracking-wider mb-4">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              Platform Governance
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-primary tracking-tight mb-2">
              Super Admin Login
            </h2>
            <p className="text-base sm:text-lg text-brand-text-secondary">
              Sign in to manage hospitals, system health, and platform governance across MediKiosk.
            </p>
          </div>

          {/* FORM -- LARGE TOUCH TARGETS & SPACIOUS LAYOUT */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <TextField
                label="Super Admin Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                className="py-3.5 px-4 text-base sm:text-lg rounded-xl border-slate-300"
                placeholder="e.g. superadmin"
              />
            </div>

            <div>
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="py-3.5 px-4 text-base sm:text-lg rounded-xl border-slate-300"
                placeholder="••••••••••••"
              />
            </div>

            <ErrorBanner message={error} />

            <div className="pt-3">
              <Button
                type="submit"
                className="w-full py-4 text-base sm:text-lg font-bold rounded-xl bg-brand-accent hover:bg-brand-accent-dark text-white shadow-xl shadow-blue-500/30 transition-all hover:scale-[1.01]"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in as Super Admin'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
