import { useEffect, useState } from 'react';
import { callApi, getSession, superAdminApi } from '../api/client';
import { Card, ErrorBanner } from '../../components/ui';
import SuperAdminShell from '../components/SuperAdminShell';

function StatCard({ label, value, highlight }) {
  return (
    <Card className={highlight ? 'border-brand-accent' : ''}>
      <p className={`text-4xl font-bold ${highlight ? 'text-brand-accent-dark' : 'text-brand-primary'}`}>{value ?? '—'}</p>
      <p className="text-sm text-brand-text-secondary mt-1">{label}</p>
    </Card>
  );
}

// "Global Analytics" -- system-wide data across every hospital on the
// platform, per the pitch deck's Super Admin role. How many hospitals are
// currently connected is the headline number, per the bug report.
export default function AnalyticsPage() {
  const session = getSession();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const result = await callApi(() => superAdminApi.analytics());
      setLoading(false);
      if (result.ok) setData(result.data);
      else setError(result.error);
    })();
  }, []);

  return (
    <SuperAdminShell title="Global Analytics" profileName={session?.profile?.username}>
      <ErrorBanner message={error} />
      {loading ? (
        <p className="text-sm text-brand-text-secondary">Loading...</p>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <StatCard label="Hospitals connected" value={data.total_hospitals} highlight />
            <StatCard label="Active hospitals" value={data.active_hospitals} />
            <StatCard label="Inactive hospitals" value={data.total_hospitals - data.active_hospitals} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard label="Unique patients (all-time, all hospitals)" value={data.total_unique_patients} />
            <StatCard label="Encounters (all-time)" value={data.total_encounters_all_time} />
            <StatCard label="Encounters today" value={data.encounters_today} />
          </div>
          <p className="text-xs text-brand-text-muted mt-6">
            "Connected" means provisioned on this platform (created by a super admin) -- active/inactive is set
            per hospital from the Hospitals page.
          </p>
        </>
      ) : null}
    </SuperAdminShell>
  );
}
