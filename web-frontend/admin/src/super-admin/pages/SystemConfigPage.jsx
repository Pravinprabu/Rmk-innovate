import { useEffect, useState } from 'react';
import { callApi, getSession, superAdminApi } from '../api/client';
import { Card, ErrorBanner } from '../../components/ui';
import SuperAdminShell from '../components/SuperAdminShell';

const STATUS_STYLES = {
  stub: 'bg-brand-warning-light text-brand-warning',
  configured: 'bg-brand-success-light text-brand-success',
  'not configured': 'bg-brand-danger-light text-brand-danger',
};

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-brand-bg text-brand-text-secondary';
  return <span className={`text-xs font-bold px-2 py-1 rounded-full ${style}`}>{status}</span>;
}

// "System Configuration" -- language packs and API/integration status,
// read-only reporting rather than a settings editor: there's genuinely
// nothing behind "FHIR/ABDM" to toggle yet (see the backend view's
// docstring), so this honestly reports that instead of faking a switch.
export default function SystemConfigPage() {
  const session = getSession();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const result = await callApi(() => superAdminApi.systemConfig());
      setLoading(false);
      if (result.ok) setData(result.data);
      else setError(result.error);
    })();
  }, []);

  return (
    <SuperAdminShell title="System Configuration" profileName={session?.profile?.username}>
      <ErrorBanner message={error} />
      {loading ? (
        <p className="text-sm text-brand-text-secondary">Loading...</p>
      ) : data ? (
        <>
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-brand-primary">Database</h2>
              <StatusBadge status={data.database.connected ? 'configured' : 'not configured'} />
            </div>
            <p className="text-sm text-brand-text-secondary">{data.database.engine}</p>
          </Card>

          <Card className="mb-6">
            <h2 className="font-semibold text-brand-primary mb-4">API Integrations</h2>
            <div className="space-y-3">
              {data.integrations.map((i) => (
                <div key={i.name} className="border border-brand-border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-brand-primary text-sm">{i.name}</p>
                    <StatusBadge status={i.status} />
                  </div>
                  <p className="text-xs text-brand-text-secondary">{i.detail}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="font-semibold text-brand-primary mb-1">Language Packs</h2>
            <p className="text-sm text-brand-text-secondary mb-4">{data.language_count} languages available on the kiosk.</p>
            <div className="flex flex-wrap gap-2">
              {data.languages.map((l) => (
                <span key={l.code} className="text-xs font-semibold px-2 py-1 rounded-full bg-brand-accent-soft text-brand-accent-darker">
                  {l.name} ({l.native_name})
                </span>
              ))}
            </div>
          </Card>
        </>
      ) : null}
    </SuperAdminShell>
  );
}
