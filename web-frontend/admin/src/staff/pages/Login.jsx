import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { callApi, doctorApi, publicApi, setSession, triageApi } from '../api/client';
import { Button, Card, ErrorBanner, SelectField, TextField } from '../../components/ui';

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
        if (result.data.length > 0) setHospitalId(result.data[0].id);
      }
    })();
  }, []);

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

  return (
    <div className="min-h-screen flex">
      {/* Brand panel -- solid blue, deliberately empty of real content
          beyond the wordmark so an animation can be dropped in here later
          without fighting existing layout. Hidden on narrow screens so the
          login form itself never loses space to it. */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-accent-dark relative overflow-hidden flex-col justify-between p-14">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center text-white text-xl font-black">┼</div>
          <span className="text-white text-2xl font-bold">MediKiosk</span>
        </div>
        <div>
          <h2 className="text-white text-4xl font-black leading-tight mb-3">
            Complete history.<br />Better consultation.
          </h2>
          <p className="text-white/70 text-base max-w-sm">
            Sign in to review patient intake, AI-assisted summaries, and the live triage queue for your hospital.
          </p>
        </div>
        <p className="text-white/40 text-xs">© {new Date().getFullYear()} MediKiosk</p>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 bg-brand-bg">
        <Card className="w-full max-w-sm">
          <h1 className="text-xl font-bold text-brand-primary mb-1">Staff Login</h1>
          <p className="text-sm text-brand-text-secondary mb-6">For doctors and triage workers.</p>

          <div className="flex rounded-lg border border-brand-border overflow-hidden mb-5">
            {['doctor', 'triage'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-2 text-sm font-semibold capitalize transition-colors ${
                  role === r ? 'bg-brand-accent text-white' : 'bg-white text-brand-text-secondary hover:bg-brand-accent-soft'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <SelectField label="Hospital" value={hospitalId} onChange={(e) => setHospitalId(e.target.value)} required>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </SelectField>
            <TextField
              label={role === 'doctor' ? 'Doctor / License ID' : 'Worker ID'}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
            <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <ErrorBanner message={error} />
            <Button type="submit" className="w-full" disabled={loading || !hospitalId}>
              {loading ? 'Signing in...' : `Sign in as ${role}`}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
