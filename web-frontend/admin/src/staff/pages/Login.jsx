import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { callApi, doctorApi, publicApi, setSession, triageApi } from '../api/client';
import { Button, ErrorBanner, SelectField, TextField } from '../../components/ui';
import doctorSvg from '../../assets/doctorpage.svg';
import triageSvg from '../../assets/triage.svg';

export default function StaffLogin() {
  const navigate = useNavigate();
  const [role, setRole] = useState('doctor'); // 'doctor' | 'triage' -- the role toggle
  const [hospitals, setHospitals] = useState([]);
  const [hospitalId, setHospitalId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const result = await callApi(() => publicApi.hospitals());
      if (result.ok) {
        setHospitals(result.data);
        if (result.data.length > 0) {
          const sanjeevi = result.data.find((h) => h.id === 'sanjeevi');
          setHospitalId(sanjeevi ? sanjeevi.id : result.data[0].id);
        }
      }
    })();
  }, []);

  const handleFillDemoDoctor = () => {
    setRole('doctor');
    const san = hospitals.find((h) => h.id === 'sanjeevi');
    if (san) setHospitalId(san.id);
    setUsername('san-doc-001');
    setPassword('raj12345');
    setError(null);
  };

  const handleFillDemoTriage = () => {
    setRole('triage');
    const san = hospitals.find((h) => h.id === 'sanjeevi');
    if (san) setHospitalId(san.id);
    setUsername('kum-tri-001');
    setPassword('kumar12345');
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Role toggle picks the endpoint directly -- no guessing between doctor
    // and triage login.
    const api = role === 'doctor' ? doctorApi : triageApi;
    const result = await callApi(() => api.login(username, password, hospitalId));
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSession({
      access: result.data.access,
      refresh: result.data.refresh,
      profile: result.data[role],
      role,
    });
    navigate(role === 'doctor' ? '/staff/doctor' : '/staff/triage');
  };

  const isDoctor = role === 'doctor';

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-brand-bg">
      {/* LEFT SIDE PANEL -- WITH BOLD ROLE TITLE AND SVG ILLUSTRATION */}
      <div className="hidden lg:flex p-12 xl:p-16 flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[#1E3A8A] via-[#1E3A5F] to-[#0F172A]">
        {/* Subtle decorative glow circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        {/* TOP: BRAND LOGO & BOLD TITLE ONLY (NO EXTRA TEXT AS REQUESTED) */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xl font-black shadow-inner">
              ┼
            </div>
            <span className="text-white/90 text-2xl font-bold tracking-wide">MediKiosk</span>
          </div>

          {/* BOLD DYNAMIC TITLE AT THE TOP */}
          <h1 className="text-white text-4xl xl:text-5xl 2xl:text-6xl font-black tracking-tight leading-tight">
            {isDoctor ? 'Doctor Login' : 'Triage Login'}
          </h1>
        </div>

        {/* CENTER SVG ILLUSTRATION (doctorpage.svg FOR DOCTOR, triage.svg FOR TRIAGE) */}
        <div className="relative z-10 flex items-center justify-center py-8">
          <img
            src={isDoctor ? doctorSvg : triageSvg}
            alt={isDoctor ? 'Doctor Login Illustration' : 'Triage Login Illustration'}
            className="w-full max-w-md xl:max-w-lg 2xl:max-w-xl max-h-[520px] object-contain drop-shadow-2xl"
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
          {/* DYNAMIC CARD TITLE & SUBTITLE */}
          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-black text-brand-primary tracking-tight mb-2">
              {isDoctor ? 'Doctor Login' : 'Triage Login'}
            </h2>
            <p className="text-base sm:text-lg text-brand-text-secondary">
              {isDoctor
                ? 'Sign in to access patient records and start consultations.'
                : 'Sign in to manage emergency walk-ins and triage assignments.'}
            </p>
          </div>

          {/* LARGE ROLE TOGGLE BUTTONS -- SAME CONSISTENT BLUE BRAND COLOR */}
          <div className="grid grid-cols-2 p-2 rounded-2xl bg-slate-100 border border-slate-200 mb-8">
            <button
              key="doctor"
              type="button"
              onClick={() => setRole('doctor')}
              className={`py-3.5 px-6 rounded-xl text-base sm:text-lg font-bold transition-all flex items-center justify-center gap-3 ${
                isDoctor
                  ? 'bg-brand-accent text-white shadow-lg shadow-blue-500/30'
                  : 'text-brand-text-secondary hover:text-brand-primary hover:bg-slate-200/70'
              }`}
            >
              <span className="text-xl">🩺</span>
              <span>Doctor</span>
            </button>

            <button
              key="triage"
              type="button"
              onClick={() => setRole('triage')}
              className={`py-3.5 px-6 rounded-xl text-base sm:text-lg font-bold transition-all flex items-center justify-center gap-3 ${
                !isDoctor
                  ? 'bg-brand-accent text-white shadow-lg shadow-blue-500/30'
                  : 'text-brand-text-secondary hover:text-brand-primary hover:bg-slate-200/70'
              }`}
            >
              <span className="text-xl">📋</span>
              <span>Triage</span>
            </button>
          </div>

          <div className="mb-6 flex justify-end">
            {isDoctor ? (
              <button
                type="button"
                onClick={handleFillDemoDoctor}
                className="text-xs sm:text-sm font-semibold text-brand-accent hover:text-brand-accent-darker bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span>⚡</span>
                <span>Fill Doctor Demo (Sanjeevi / san-doc-001)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFillDemoTriage}
                className="text-xs sm:text-sm font-semibold text-brand-accent hover:text-brand-accent-darker bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span>⚡</span>
                <span>Fill Triage Demo (Sanjeevi / kum-tri-001)</span>
              </button>
            )}
          </div>

          {/* FORM -- LARGE TOUCH TARGETS & SPACIOUS LAYOUT */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <SelectField
                label="Hospital"
                value={hospitalId}
                onChange={(e) => setHospitalId(e.target.value)}
                required
                className="py-3.5 px-4 text-base sm:text-lg rounded-xl border-slate-300"
              >
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </SelectField>
            </div>

            <div>
              <TextField
                label={isDoctor ? 'Doctor / License ID' : 'Worker ID'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                className="py-3.5 px-4 text-base sm:text-lg rounded-xl border-slate-300"
                placeholder={isDoctor ? 'e.g. DOC-001 or superadmin' : 'e.g. TR-001'}
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
                disabled={loading || !hospitalId}
              >
                {loading
                  ? 'Signing in...'
                  : isDoctor
                  ? 'Sign in as Doctor'
                  : 'Sign in as Triage Worker'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
