import { useEffect, useState } from 'react';
import { callApi, doctorApi, getSession } from '../api/client';
import { Button, Card, ErrorBanner, SelectField, TextField } from '../../components/ui';
import StaffShell from '../components/StaffShell';
import MarkedSummaryText from '../components/MarkedSummaryText';

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl border border-brand-border p-4 text-center">
      <p className="text-3xl font-bold text-brand-accent-dark">{value ?? '—'}</p>
      <p className="text-sm text-brand-text-secondary mt-1">{label}</p>
    </div>
  );
}

// Medical Timeline -- every past prescription/lab report/discharge summary
// for this patient at this hospital, chronological, newest first. Same
// `documents` list the lookup result already returns; this is purely a
// different rendering of it (a timeline, not a flat list) plus the
// abnormal-value flag from DoctorDocumentSerializer.is_flagged.
function MedicalTimeline({ documents }) {
  if (documents.length === 0) {
    return <p className="text-sm text-brand-text-muted">No documents on file.</p>;
  }
  return (
    <div className="space-y-3">
      {documents.map((d) => (
        <div key={d.id} className="flex gap-3 border-l-2 border-brand-border pl-4 relative">
          <span className="absolute-left-[5px] top-1.5 w-2 h-2 rounded-full bg-brand-accent" />
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-brand-primary text-sm">{d.title}</p>
              <span className="text-xs text-brand-text-muted">· {d.category}</span>
              {d.is_flagged && (
                <span className="text-xs font-bold text-brand-danger bg-brand-danger-light px-2 py-0.5 rounded-full">
                  ⚠ Abnormal
                </span>
              )}
            </div>
            <p className="text-xs text-brand-text-secondary mt-1">
              {d.diagnosis_extracted || 'No diagnosis extracted'} · {d.investigation_summary || 'No investigation summary'}
            </p>
            <p className="text-xs text-brand-text-muted mt-0.5">
              {new Date(d.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              {d.file_url && (
                <>
                  {' '}
                  · <a href={d.file_url} target="_blank" rel="noreferrer" className="text-brand-accent-darker underline">View</a>
                </>
              )}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PatientLookup({ setError }) {
  const [mode, setMode] = useState('token_no');
  const [value, setValue] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingSummary, setEditingSummary] = useState(false);
  const [summaryDraft, setSummaryDraft] = useState('');
  const [savingSummary, setSavingSummary] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [emrPushed, setEmrPushed] = useState(false);

  // OTP gate -- a search no longer returns the record directly. Requesting
  // sends a code to the patient's registered mobile (real SMS for a real
  // number, the fixed "1234" demo code for the seeded placeholder-number
  // patients); only a correct, unexpired OTP unlocks the actual lookup.
  const [otpInfo, setOtpInfo] = useState(null); // { masked_mobile, is_dummy, sms_sent, detail }
  const [otpValue, setOtpValue] = useState('');
  const [verifying, setVerifying] = useState(false);

  const currentSummary = result?.ai_summaries?.find((s) => s.encounter === result.encounter?.id)
    || result?.ai_summaries?.[0]
    || null;

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setOtpInfo(null);
    setOtpValue('');
    setEmrPushed(false);
    setEditingSummary(false);
    const outcome = await callApi(() => doctorApi.requestOtp({ [mode]: value }));
    setLoading(false);
    if (!outcome.ok) {
      setError(outcome.error);
      return;
    }
    setOtpInfo(outcome.data);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setVerifying(true);
    setError(null);
    const outcome = await callApi(() => doctorApi.verifyOtp({ [mode]: value }, otpValue));
    setVerifying(false);
    if (!outcome.ok) {
      setError(outcome.error);
      return;
    }
    setResult(outcome.data);
    setOtpInfo(null);
  };

  const handleStartEdit = () => {
    setSummaryDraft(currentSummary?.summary_text || '');
    setEditingSummary(true);
  };

  const handleSaveSummary = async () => {
    if (!currentSummary) return;
    setSavingSummary(true);
    const outcome = await callApi(() => doctorApi.updateAiSummary(currentSummary.id, summaryDraft));
    setSavingSummary(false);
    if (!outcome.ok) {
      setError(outcome.error);
      return;
    }
    setResult((prev) => ({
      ...prev,
      ai_summaries: prev.ai_summaries.map((s) => (s.id === currentSummary.id ? outcome.data : s)),
    }));
    setEditingSummary(false);
  };

  const handleConfirmAndPush = async () => {
    if (!result?.encounter) return;
    setConfirming(true);
    const outcome = await callApi(() => doctorApi.confirmEncounter(result.encounter.id));
    setConfirming(false);
    if (!outcome.ok) {
      setError(outcome.error);
      return;
    }
    setResult((prev) => ({ ...prev, encounter: { ...prev.encounter, review_status: outcome.data.review_status } }));
    // Real EMR push is out of scope -- there's no external EMR system
    // connected -- this is a clearly-labeled stub confirming the intent,
    // same spirit as the FHIR/ABDM stubs elsewhere in this project.
    setEmrPushed(true);
  };

  const handleReject = async () => {
    if (!result?.encounter) return;
    const outcome = await callApi(() => doctorApi.rejectEncounter(result.encounter.id));
    if (!outcome.ok) {
      setError(outcome.error);
      return;
    }
    setResult((prev) => ({ ...prev, encounter: { ...prev.encounter, review_status: outcome.data.review_status } }));
  };

  return (
    <Card className="mb-6">
      <h2 className="font-semibold text-brand-primary mb-4">Look up a patient</h2>
      <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-4 mb-4">
        <SelectField label="Search by" value={mode} onChange={(e) => setMode(e.target.value)} className="w-40">
          <option value="token_no">Token number</option>
          <option value="abha_id">ABHA ID</option>
        </SelectField>
        <TextField label="Value" value={value} onChange={(e) => setValue(e.target.value)} required className="w-56" />
        <Button type="submit" disabled={loading}>{loading ? 'Searching...' : 'Search'}</Button>
      </form>

      {otpInfo && !result && (
        <form onSubmit={handleVerifyOtp} className="border-t border-brand-border pt-4 flex flex-wrap items-end gap-4 mb-2">
          <div className="text-sm text-brand-text-secondary max-w-sm">
            {otpInfo.is_dummy ? (
              <p><strong className="text-brand-warning">Demo mode</strong> -- this patient has a placeholder mobile number, so no real SMS was sent. Enter <strong>1234</strong>.</p>
            ) : otpInfo.sms_sent ? (
              <p>OTP sent to <span className="font-mono">{otpInfo.masked_mobile}</span>. Valid for {otpInfo.otp_valid_minutes} minutes.</p>
            ) : (
              <p><strong className="text-brand-warning">No SMS gateway configured</strong> -- the OTP for <span className="font-mono">{otpInfo.masked_mobile}</span> was logged on the server instead of texted. Valid for {otpInfo.otp_valid_minutes} minutes.</p>
            )}
          </div>
          <TextField label="Enter OTP" value={otpValue} onChange={(e) => setOtpValue(e.target.value)} required className="w-32" maxLength={4} />
          <Button type="submit" disabled={verifying || otpValue.length !== 4}>{verifying ? 'Verifying...' : 'Verify & View'}</Button>
        </form>
      )}

      {result && (
        <div className="border-t border-brand-border pt-4 space-y-5">
          <div>
            <p className="font-semibold text-brand-primary">{result.patient.full_name}</p>
            <p className="text-sm text-brand-text-secondary">
              ABHA: {result.patient.abha_id || '—'} · Mobile: {result.patient.mobile_number || '—'} ·
              {' '}{result.patient.age_years ?? '—'} yrs · {result.patient.gender}
            </p>
            {result.encounter && (
              <p className="text-sm mt-1">
                <span className="font-mono">{result.encounter.token_no}</span> · {result.encounter.department_name || 'No department'} ·
                {' '}
                <span className={result.encounter.review_status === 'Confirmed' ? 'text-brand-success font-semibold' : 'text-brand-warning font-semibold'}>
                  {result.encounter.review_status}
                </span>
                {result.encounter.priority === 'HIGH ALERT' && <span className="ml-2 text-brand-danger font-bold">HIGH ALERT</span>}
              </p>
            )}
          </div>

          {/* AI Summary Review + Clinical Transparency + edit */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-brand-text-secondary">AI Summary Review</p>
              {currentSummary && !editingSummary && (
                <button className="text-xs font-semibold text-brand-accent-darker underline" onClick={handleStartEdit}>
                  Edit
                </button>
              )}
            </div>
            {!currentSummary ? (
              <p className="text-sm text-brand-text-muted">No AI summary generated yet.</p>
            ) : editingSummary ? (
              <div>
                <textarea
                  className="w-full min-h-35 rounded-lg border border-brand-border p-3 text-sm font-mono"
                  value={summaryDraft}
                  onChange={(e) => setSummaryDraft(e.target.value)}
                />
                <div className="flex gap-2 mt-2">
                  <Button onClick={handleSaveSummary} disabled={savingSummary}>{savingSummary ? 'Saving...' : 'Save'}</Button>
                  <Button variant="secondary" onClick={() => setEditingSummary(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="bg-brand-accent-soft rounded-lg p-3 text-sm">
                {currentSummary.is_placeholder && (
                  <span className="text-xs font-semibold text-brand-warning block mb-1">PLACEHOLDER (not a real AI model yet)</span>
                )}
                <MarkedSummaryText text={currentSummary.summary_text} />
                <p className="text-xs text-brand-text-muted mt-2">
                  ✦ marks a term the AI normalized -- hover it to see the patient's own words.
                </p>
              </div>
            )}
          </div>

          {/* Medical Timeline + Abnormal Alerting */}
          <div>
            <p className="text-sm font-semibold text-brand-text-secondary mb-2">Medical Timeline ({result.documents.length})</p>
            <MedicalTimeline documents={result.documents} />
          </div>

          {/* Clinical Verification & EMR Push */}
          {result.encounter && (
            <div className="flex items-center gap-3 pt-2">
              <Button onClick={handleConfirmAndPush} disabled={confirming || result.encounter.review_status === 'Confirmed'}>
                {confirming ? 'Pushing...' : 'Confirm & Push to EMR'}
              </Button>
              <Button variant="danger" onClick={handleReject} disabled={result.encounter.review_status === 'Rejected'}>
                Reject
              </Button>
              {emrPushed && (
                <span className="text-xs font-semibold text-brand-success">
                  ✓ Confirmed & pushed to EMR (stub -- no external EMR connected yet)
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export default function DoctorQueuePage() {
  const session = getSession();
  const [queue, setQueue] = useState(null); // null = not loaded yet -- the queue table itself stays collapsed until asked for
  const [queueOpen, setQueueOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      const result = await callApi(() => doctorApi.stats());
      if (result.ok) setStats(result.data);
    })();
  }, []);

  const loadQueue = async () => {
    setLoading(true);
    const result = await callApi(() => doctorApi.queue());
    setLoading(false);
    if (result.ok) setQueue(result.data);
    else setError(result.error);
  };

  const handleToggleQueue = () => {
    const opening = !queueOpen;
    setQueueOpen(opening);
    if (opening && queue === null) loadQueue();
  };

  return (
    <StaffShell
      role="doctor"
      title={`Dr. ${session?.profile?.full_name || ''}`}
      profileName={session?.profile?.department || session?.profile?.role}
    >
      <ErrorBanner message={error} />

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Patients waiting" value={stats.patients_waiting} />
          <StatCard label="Completed histories" value={stats.completed_histories} />
          <StatCard label="Awaiting review" value={stats.awaiting_review} />
          <StatCard label="Priority intakes" value={stats.priority_intakes} />
        </div>
      )}

      <PatientLookup setError={setError} />

      <Card>
        <button
          onClick={handleToggleQueue}
          className="w-full flex items-center justify-between text-left"
        >
          <h2 className="font-semibold text-brand-primary">OPD Intake Queue</h2>
          <span className="text-sm font-semibold text-brand-accent-darker">{queueOpen ? 'Hide ▲' : 'View Patient Queue ▼'}</span>
        </button>

        {queueOpen && (
          <div className="mt-4">
            {loading ? (
              <p className="text-sm text-brand-text-secondary">Loading...</p>
            ) : !queue || queue.length === 0 ? (
              <p className="text-sm text-brand-text-secondary">No patients in the queue.</p>
            ) : (
              <div className="space-y-2">
                {queue.map((e) => (
                  <div key={e.id} className="border border-brand-border rounded-lg p-4">
                    <p className="font-semibold text-brand-primary">
                      {e.patient_name} <span className="font-mono text-brand-text-muted font-normal">· {e.token_no}</span>
                      {e.priority === 'HIGH ALERT' && <span className="ml-2 text-xs font-bold text-brand-danger">HIGH ALERT</span>}
                    </p>
                    <p className="text-sm text-brand-text-secondary">
                      {e.chief_complaint || 'No chief complaint yet'} · {e.patient_age ?? '—'} yrs, {e.patient_gender} · {e.doc_count} doc(s)
                    </p>
                    <span className="text-xs px-2 py-1 rounded-full bg-brand-accent-soft text-brand-accent-darker font-semibold inline-block mt-1">
                      {e.review_status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    </StaffShell>
  );
}
