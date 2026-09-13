import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { callApi, clearSession, getSession, hospitalApi } from '../api/client';
import { Button, Card, ErrorBanner, PageShell, TextField } from '../../components/ui';

function CredentialReveal({ credential, onDismiss }) {
  if (!credential) return null;
  return (
    <Card className="mb-6 border-brand-success bg-brand-success-light/30">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-brand-primary">Credentials created</p>
          <p className="text-sm text-brand-text-secondary mt-1">Shown once -- hand these to {credential.full_name} now.</p>
          <p className="mt-2 font-mono text-sm">
            Username: <strong>{credential.username}</strong><br />
            Password: <strong>{credential.temp_password}</strong>
          </p>
        </div>
        <button className="text-brand-text-muted hover:text-brand-text" onClick={onDismiss}>✕</button>
      </div>
    </Card>
  );
}

function DepartmentsSection({ setError }) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', token_prefix: '' });
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const result = await callApi(() => hospitalApi.departments.list());
    setLoading(false);
    if (result.ok) setDepartments(result.data);
    else setError(result.error);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    const result = await callApi(() => hospitalApi.departments.create({
      name: form.name,
      token_prefix: form.token_prefix.toUpperCase(),
    }));
    setCreating(false);
    if (!result.ok) { setError(result.error); return; }
    setForm({ name: '', token_prefix: '' });
    load();
  };

  const handleToggleActive = async (dept) => {
    const result = await callApi(() => hospitalApi.departments.update(dept.id, { is_active: !dept.is_active }));
    if (result.ok) load();
    else setError(result.error);
  };

  const handleDelete = async (dept) => {
    if (!confirm(`Delete "${dept.name}"? Patients will no longer be able to select it at the kiosk.`)) return;
    const result = await callApi(() => hospitalApi.departments.remove(dept.id));
    if (result.ok) load();
    else setError(result.error);
  };

  return (
    <Card className="mb-6">
      <h2 className="font-semibold text-brand-primary mb-1">Departments</h2>
      <p className="text-sm text-brand-text-secondary mb-4">
        Only <strong>active</strong> departments are shown to patients on the kiosk's "Select
        Department" screen. Token prefix appears in every token issued for that department
        (e.g. ENT → SA-ENT-0001).
      </p>
      <form onSubmit={handleCreate} className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end mb-4">
        <TextField label="Name" placeholder="e.g. ENT" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <TextField
          label="Token prefix"
          placeholder="e.g. ENT"
          value={form.token_prefix}
          onChange={(e) => setForm({ ...form, token_prefix: e.target.value.toUpperCase() })}
          required
          maxLength={6}
        />
        <Button type="submit" disabled={creating}>{creating ? 'Adding...' : '+ Add Department'}</Button>
      </form>
      {loading ? (
        <p className="text-sm text-brand-text-secondary">Loading...</p>
      ) : departments.length === 0 ? (
        <p className="text-sm text-brand-text-secondary">No departments yet -- add one above so patients have something to select at the kiosk.</p>
      ) : (
        <div className="space-y-2">
          {departments.map((d) => (
            <div key={d.id} className="flex items-center justify-between border border-brand-border rounded-lg px-4 py-2">
              <div>
                <p className="font-medium text-brand-primary">
                  {d.name} <span className="text-brand-text-muted font-normal font-mono">· {d.token_prefix}</span>
                  {!d.is_active && <span className="ml-2 text-xs text-brand-danger font-semibold">INACTIVE (hidden from kiosk)</span>}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={() => handleToggleActive(d)}>{d.is_active ? 'Deactivate' : 'Activate'}</Button>
                <Button variant="danger" onClick={() => handleDelete(d)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function DoctorsSection({ setError }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ full_name: '', role: 'OPD Specialist', license_no: '' });
  const [revealed, setRevealed] = useState(null);

  const load = async () => {
    setLoading(true);
    const result = await callApi(() => hospitalApi.doctors.list());
    setLoading(false);
    if (result.ok) setDoctors(result.data);
    else setError(result.error);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const result = await callApi(() => hospitalApi.doctors.create(form));
    if (!result.ok) { setError(result.error); return; }
    setRevealed(result.data);
    setForm({ full_name: '', role: 'OPD Specialist', license_no: '' });
    load();
  };

  const handleDelete = async (doctor) => {
    if (!confirm(`Revoke ${doctor.full_name}'s doctor credentials?`)) return;
    const result = await callApi(() => hospitalApi.doctors.remove(doctor.id));
    if (result.ok) load();
    else setError(result.error);
  };

  return (
    <Card className="mb-6">
      <h2 className="font-semibold text-brand-primary mb-4">Doctors</h2>
      <CredentialReveal credential={revealed} onDismiss={() => setRevealed(null)} />
      <form onSubmit={handleCreate} className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end mb-4">
        <TextField label="Full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
        <TextField label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required />
        <TextField label="Doctor / license ID" value={form.license_no} onChange={(e) => setForm({ ...form, license_no: e.target.value })} required />
        <Button type="submit">+ Add Doctor</Button>
      </form>
      {loading ? (
        <p className="text-sm text-brand-text-secondary">Loading...</p>
      ) : doctors.length === 0 ? (
        <p className="text-sm text-brand-text-secondary">No doctors yet.</p>
      ) : (
        <div className="space-y-2">
          {doctors.map((d) => (
            <div key={d.id} className="flex items-center justify-between border border-brand-border rounded-lg px-4 py-2">
              <div>
                <p className="font-medium text-brand-primary">{d.full_name} <span className="text-brand-text-muted font-normal">· {d.role}</span></p>
                <p className="text-sm text-brand-text-secondary">ID: {d.license_no} · Username: {d.username}</p>
              </div>
              <Button variant="danger" onClick={() => handleDelete(d)}>Revoke</Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function TriageSection({ setError }) {
  const [triageStaff, setTriageStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ full_name: '' });
  const [revealed, setRevealed] = useState(null);

  const load = async () => {
    setLoading(true);
    const result = await callApi(() => hospitalApi.triage.list());
    setLoading(false);
    if (result.ok) setTriageStaff(result.data);
    else setError(result.error);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const result = await callApi(() => hospitalApi.triage.create(form));
    if (!result.ok) { setError(result.error); return; }
    setRevealed(result.data);
    setForm({ full_name: '' });
    load();
  };

  const handleDelete = async (worker) => {
    if (!confirm(`Revoke ${worker.full_name}'s triage credentials?`)) return;
    const result = await callApi(() => hospitalApi.triage.remove(worker.id));
    if (result.ok) load();
    else setError(result.error);
  };

  return (
    <Card className="mb-6">
      <h2 className="font-semibold text-brand-primary mb-4">Triage workers</h2>
      <CredentialReveal credential={revealed} onDismiss={() => setRevealed(null)} />
      <form onSubmit={handleCreate} className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end mb-4">
        <TextField label="Full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
        <Button type="submit">+ Add Triage Worker</Button>
      </form>
      {loading ? (
        <p className="text-sm text-brand-text-secondary">Loading...</p>
      ) : triageStaff.length === 0 ? (
        <p className="text-sm text-brand-text-secondary">No triage workers yet.</p>
      ) : (
        <div className="space-y-2">
          {triageStaff.map((t) => (
            <div key={t.id} className="flex items-center justify-between border border-brand-border rounded-lg px-4 py-2">
              <div>
                <p className="font-medium text-brand-primary">{t.full_name}</p>
                <p className="text-sm text-brand-text-secondary">Username: {t.username}</p>
              </div>
              <Button variant="danger" onClick={() => handleDelete(t)}>Revoke</Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function PatientsSection({ setError }) {
  const [encounters, setEncounters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const result = await callApi(() => hospitalApi.patients.list());
      setLoading(false);
      if (result.ok) setEncounters(result.data);
      else setError(result.error);
    })();
  }, []);

  return (
    <Card>
      <h2 className="font-semibold text-brand-primary mb-4">Patients seen at this hospital</h2>
      {loading ? (
        <p className="text-sm text-brand-text-secondary">Loading...</p>
      ) : encounters.length === 0 ? (
        <p className="text-sm text-brand-text-secondary">No patients yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-brand-text-secondary border-b border-brand-border">
                <th className="py-2 pr-4">Token</th>
                <th className="py-2 pr-4">Patient</th>
                <th className="py-2 pr-4">ABHA ID</th>
                <th className="py-2 pr-4">Department</th>
                <th className="py-2 pr-4">Priority</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {encounters.map((e) => (
                <tr key={e.id} className="border-b border-brand-border last:border-0">
                  <td className="py-2 pr-4 font-mono">{e.token_no}</td>
                  <td className="py-2 pr-4">{e.patient_name}</td>
                  <td className="py-2 pr-4">{e.patient_abha_id || '—'}</td>
                  <td className="py-2 pr-4">{e.department_name || '—'}</td>
                  <td className="py-2 pr-4">
                    {e.priority === 'HIGH ALERT'
                      ? <span className="text-brand-danger font-semibold">HIGH ALERT</span>
                      : e.priority}
                  </td>
                  <td className="py-2 pr-4">{e.review_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

export default function HospitalAdminDashboard() {
  const navigate = useNavigate();
  const session = getSession();
  const [error, setError] = useState(null);

  const handleLogout = () => {
    clearSession();
    navigate('/hospital-admin/login');
  };

  return (
    <PageShell
      title={session?.profile?.hospital_name || 'Hospital Admin'}
      actions={
        <>
          <span className="text-sm text-brand-text-secondary">{session?.profile?.full_name}</span>
          <Button variant="secondary" onClick={() => navigate('/hospital-admin/profile')}>Profile</Button>
          <Button variant="secondary" onClick={handleLogout}>Log out</Button>
        </>
      }
    >
      <ErrorBanner message={error} />
      <DepartmentsSection setError={setError} />
      <DoctorsSection setError={setError} />
      <TriageSection setError={setError} />
      <PatientsSection setError={setError} />
    </PageShell>
  );
}
