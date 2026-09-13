import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { callApi, setSession, superAdminApi } from '../api/client';
import { Button, Card, ErrorBanner, TextField } from '../../components/ui';

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
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <h1 className="text-xl font-bold text-brand-primary mb-1">Super Admin</h1>
        <p className="text-sm text-brand-text-secondary mb-6">Create and manage hospitals across MediKiosk.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
          <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <ErrorBanner message={error} />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
