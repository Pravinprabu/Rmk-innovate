import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { callApi, getSession, triageApi } from '../api/client';
import { Button, Card, ErrorBanner, SelectField, TextField } from '../../components/ui';
import StaffShell from '../components/StaffShell';

export default function TriageCreateTokenPage() {
  const session = getSession();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ full_name: '', age_years: '', department: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [issued, setIssued] = useState(null);

  useEffect(() => {
    (async () => {
      const result = await callApi(() => triageApi.departments());
      if (result.ok) {
        setDepartments(result.data);
        if (result.data.length > 0) {
          setForm((f) => ({ ...f, department: result.data[0].id }));
        }
      }
    })();
  }, []);

  const handleQuickFill = () => {
    setForm({
      full_name: 'Suresh Raina',
      age_years: '32',
      department: departments[0]?.id || 'gen-med',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.age_years) {
      setError('Please provide patient name and age.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setIssued(null);

    const result = await callApi(() =>
      triageApi.createToken({
        full_name: form.full_name.trim(),
        age_years: parseInt(form.age_years, 10),
        department: form.department,
      })
    );

    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setIssued(result.data);
    setForm({ full_name: '', age_years: '', department: departments[0]?.id || '' });
  };

  return (
    <StaffShell role="triage" title="Create Patient Token" profileName={session?.profile?.full_name}>
      <ErrorBanner message={error} />

      <Card className="max-w-xl">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-xl text-brand-primary flex items-center gap-2">
            <span>🎫</span> Create Patient Walk-in Token
          </h2>
          <button
            type="button"
            onClick={handleQuickFill}
            className="text-xs font-bold text-brand-accent-darker bg-brand-accent-soft hover:bg-brand-accent/20 px-2.5 py-1 rounded-full transition-colors"
          >
            ⚡ Quick Fill Demo
          </button>
        </div>

        <p className="text-sm text-brand-text-secondary mb-5">
          Generate an instant consultation token for walk-in patients. They will be placed directly into the department queue for doctor consultation.
        </p>

        {issued && (
          <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-5 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                ✓ Token Generated Successfully
              </span>
              <span className="text-xs text-brand-text-muted">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-xs font-semibold text-brand-text-secondary uppercase">Token Number:</span>
              <span className="text-4xl font-mono font-extrabold text-brand-primary tracking-wide">
                {issued.token_no}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-emerald-200 text-sm">
              <div>
                <span className="block text-xs text-brand-text-muted">Patient Name & Age:</span>
                <span className="font-bold text-brand-primary">
                  {issued.patient_name} · {issued.age_years} yrs
                </span>
              </div>
              <div>
                <span className="block text-xs text-brand-text-muted">Assigned Department:</span>
                <span className="font-bold text-emerald-700">{issued.department_name}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-4">
              <Button
                type="button"
                onClick={() => navigate('/staff/triage')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                📋 View in Patient Queue
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIssued(null)}
              >
                + Issue Another Token
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => window.print()}
              >
                🖨 Print Token Slip
              </Button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            label="Patient Name"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            placeholder="e.g. Ramesh Kumar"
            required
            autoFocus
          />

          <TextField
            label="Age (Years)"
            type="number"
            min="1"
            max="120"
            value={form.age_years}
            onChange={(e) => setForm({ ...form, age_years: e.target.value })}
            placeholder="e.g. 28"
            required
          />

          <SelectField
            label="Department to Visit"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            required
          >
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} {d.description ? `(${d.description})` : ''}
              </option>
            ))}
          </SelectField>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={submitting || !form.full_name.trim() || !form.age_years}
              className="w-full py-3 text-base flex items-center justify-center gap-2"
            >
              {submitting ? 'Generating Token...' : '🎫 Generate Patient Token'}
            </Button>
          </div>
        </form>
      </Card>
    </StaffShell>
  );
}
