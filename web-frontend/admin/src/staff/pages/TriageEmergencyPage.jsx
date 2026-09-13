import { useEffect, useState } from 'react';
import { callApi, getSession, triageApi } from '../api/client';
import { Button, Card, ErrorBanner, SelectField, TextField } from '../../components/ui';
import StaffShell from '../components/StaffShell';

// Manual emergency token -- for an on-the-spot urgent walk-in that never
// touches the kiosk (chest pain at the front desk, etc.). Hits the same
// backend endpoint the queue's alert broadcast uses, so the resulting
// token shows up immediately in Patient Queue with HIGH ALERT.
export default function TriageEmergencyPage() {
  const session = getSession();
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ full_name: '', department: '', abha_id: '', mobile_number: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [issued, setIssued] = useState(null);

  useEffect(() => {
    (async () => {
      const result = await callApi(() => triageApi.departments());
      if (result.ok) {
        setDepartments(result.data);
        if (result.data.length > 0) setForm((f) => ({ ...f, department: result.data[0].id }));
      }
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setIssued(null);
    const result = await callApi(() => triageApi.createEmergencyToken(form));
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setIssued(result.data);
    setForm((f) => ({ ...f, full_name: '', abha_id: '', mobile_number: '' }));
  };

  return (
    <StaffShell role="triage" title="Emergency Token" profileName={session?.profile?.full_name}>
      <ErrorBanner message={error} />

      <Card className="max-w-lg">
        <h2 className="font-semibold text-brand-danger mb-1">🚨 Create an emergency token</h2>
        <p className="text-sm text-brand-text-secondary mb-4">
          For an urgent walk-in that needs to bypass the queue right now -- creates a HIGH ALERT
          token immediately, no kiosk registration needed.
        </p>

        {issued && (
          <div className="bg-brand-danger-light rounded-lg p-4 mb-4">
            <p className="text-sm font-semibold text-brand-danger">Token issued</p>
            <p className="text-2xl font-mono font-bold text-brand-primary mt-1">{issued.token_no}</p>
            <p className="text-sm text-brand-text-secondary mt-1">{issued.patient_name}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            label="Patient full name"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            required
            autoFocus
          />
          <SelectField
            label="Department"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            required
          >
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </SelectField>
          <TextField
            label="ABHA ID (optional)"
            value={form.abha_id}
            onChange={(e) => setForm({ ...form, abha_id: e.target.value })}
            placeholder="Leave blank for a walk-in with no ABHA"
          />
          <TextField
            label="Mobile number (optional)"
            value={form.mobile_number}
            onChange={(e) => setForm({ ...form, mobile_number: e.target.value })}
          />
          <Button type="submit" variant="danger" disabled={submitting || !form.department} className="w-full">
            {submitting ? 'Issuing...' : '+ Issue Emergency Token'}
          </Button>
        </form>
      </Card>
    </StaffShell>
  );
}
