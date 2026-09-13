import { useEffect, useState } from 'react';
import { callApi, getSession, superAdminApi } from '../api/client';
import { Button, Card, ErrorBanner, TextField } from '../../components/ui';
import SuperAdminShell from '../components/SuperAdminShell';

export default function SuperAdminDashboard() {
  const session = getSession();

  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newHospital, setNewHospital] = useState({ name: '', code: '', city: '', phone: '' });
  const [creating, setCreating] = useState(false);

  // The one-time-shown credentials from the most recent "Create Admin" action.
  const [revealedCredential, setRevealedCredential] = useState(null);
  const [adminNameDrafts, setAdminNameDrafts] = useState({});

  const loadHospitals = async () => {
    setLoading(true);
    const result = await callApi(() => superAdminApi.hospitals.list());
    setLoading(false);
    if (result.ok) setHospitals(result.data);
    else setError(result.error);
  };

  useEffect(() => {
    loadHospitals();
  }, []);

  const handleCreateHospital = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    const result = await callApi(() => superAdminApi.hospitals.create(newHospital));
    setCreating(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setNewHospital({ name: '', code: '', city: '', phone: '' });
    loadHospitals();
  };

  const handleToggleActive = async (hospital) => {
    const result = await callApi(() => superAdminApi.hospitals.update(hospital.id, { is_active: !hospital.is_active }));
    if (result.ok) loadHospitals();
    else setError(result.error);
  };

  const handleDeleteHospital = async (hospital) => {
    if (!confirm(`Delete "${hospital.name}"? This cannot be undone.`)) return;
    const result = await callApi(() => superAdminApi.hospitals.remove(hospital.id));
    if (result.ok) loadHospitals();
    else setError(result.error);
  };

  const handleCreateAdmin = async (hospital) => {
    const fullName = adminNameDrafts[hospital.id];
    if (!fullName) {
      setError('Enter the admin’s full name first.');
      return;
    }
    const result = await callApi(() => superAdminApi.hospitalAdmins.create({ hospital: hospital.id, full_name: fullName }));
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setRevealedCredential({ hospitalName: hospital.name, ...result.data });
    setAdminNameDrafts((prev) => ({ ...prev, [hospital.id]: '' }));
  };

  return (
    <SuperAdminShell title="Hospitals" profileName={session?.profile?.username}>
      <ErrorBanner message={error} />

      {revealedCredential && (
        <Card className="mb-6 border-brand-success bg-brand-success-light/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-brand-primary">Admin credentials created for {revealedCredential.hospitalName}</p>
              <p className="text-sm text-brand-text-secondary mt-1">
                Shown once -- copy these to the hospital now, they can't be retrieved again.
              </p>
              <p className="mt-2 font-mono text-sm">
                Username: <strong>{revealedCredential.username}</strong><br />
                Password: <strong>{revealedCredential.temp_password}</strong>
              </p>
            </div>
            <button className="text-brand-text-muted hover:text-brand-text" onClick={() => setRevealedCredential(null)}>✕</button>
          </div>
        </Card>
      )}

      <Card className="mb-6">
        <h2 className="font-semibold text-brand-primary mb-4">Create a new hospital</h2>
        <form onSubmit={handleCreateHospital} className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
          <TextField label="Name" value={newHospital.name} onChange={(e) => setNewHospital({ ...newHospital, name: e.target.value })} required />
          <TextField label="Code" value={newHospital.code} onChange={(e) => setNewHospital({ ...newHospital, code: e.target.value.toUpperCase() })} required />
          <TextField label="City" value={newHospital.city} onChange={(e) => setNewHospital({ ...newHospital, city: e.target.value })} />
          <TextField label="Phone" value={newHospital.phone} onChange={(e) => setNewHospital({ ...newHospital, phone: e.target.value })} />
          <Button type="submit" disabled={creating} className="col-span-2 md:col-span-4 w-fit">
            {creating ? 'Creating...' : '+ Create Hospital'}
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="font-semibold text-brand-primary mb-4">Hospitals</h2>
        {loading ? (
          <p className="text-brand-text-secondary text-sm">Loading...</p>
        ) : hospitals.length === 0 ? (
          <p className="text-brand-text-secondary text-sm">No hospitals yet -- create one above.</p>
        ) : (
          <div className="space-y-3">
            {hospitals.map((h) => (
              <div key={h.id} className="border border-brand-border rounded-lg p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-brand-primary">
                    {h.name} <span className="text-brand-text-muted font-normal">({h.code})</span>
                    {!h.is_active && <span className="ml-2 text-xs text-brand-danger font-semibold">INACTIVE</span>}
                  </p>
                  <p className="text-sm text-brand-text-secondary">{h.city || '—'} · {h.phone || 'no phone on file'}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    className="px-2 py-1.5 rounded-lg border border-brand-border text-sm w-40"
                    placeholder="Admin's full name"
                    value={adminNameDrafts[h.id] || ''}
                    onChange={(e) => setAdminNameDrafts((prev) => ({ ...prev, [h.id]: e.target.value }))}
                  />
                  <Button variant="secondary" onClick={() => handleCreateAdmin(h)}>+ Admin credentials</Button>
                  <Button variant="secondary" onClick={() => handleToggleActive(h)}>{h.is_active ? 'Deactivate' : 'Activate'}</Button>
                  <Button variant="danger" onClick={() => handleDeleteHospital(h)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </SuperAdminShell>
  );
}
