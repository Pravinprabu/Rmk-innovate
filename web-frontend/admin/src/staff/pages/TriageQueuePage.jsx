import { useEffect, useState } from 'react';
import { callApi, getSession, triageApi } from '../api/client';
import { Button, Card, ErrorBanner } from '../../components/ui';
import StaffShell from '../components/StaffShell';

// Patient Queue -- token id + name, segregated by department (a section
// per department, not just a flat table) so triage can see at a glance
// how each department's queue is building up.
function groupByDepartment(queue) {
  const groups = {};
  for (const e of queue) {
    const key = e.department_name || 'No department assigned';
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  }
  return groups;
}

export default function TriageQueuePage() {
  const session = getSession();
  const [alerts, setAlerts] = useState([]);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAll = async () => {
    setLoading(true);
    const [alertsResult, queueResult] = await Promise.all([
      callApi(() => triageApi.alerts()),
      callApi(() => triageApi.queue()),
    ]);
    setLoading(false);
    if (alertsResult.ok) setAlerts(alertsResult.data);
    else setError(alertsResult.error);
    if (queueResult.ok) setQueue(queueResult.data);
    else setError(queueResult.error);
  };

  useEffect(() => { loadAll(); }, []);

  const handleAcknowledge = async (encounter) => {
    const result = await callApi(() => triageApi.acknowledgeAlert(encounter.id));
    if (result.ok) loadAll();
    else setError(result.error);
  };

  const grouped = groupByDepartment(queue);

  return (
    <StaffShell role="triage" title="Patient Queue" profileName={session?.profile?.full_name}>
      <ErrorBanner message={error} />

      <Card className="mb-6 border-brand-danger">
        <h2 className="font-semibold text-brand-danger mb-4">🚨 Emergency Alerts</h2>
        {loading ? (
          <p className="text-sm text-brand-text-secondary">Loading...</p>
        ) : alerts.length === 0 ? (
          <p className="text-sm text-brand-text-secondary">No active alerts.</p>
        ) : (
          <div className="space-y-2">
            {alerts.map((a) => (
              <div key={a.id} className="flex items-center justify-between bg-brand-danger-light rounded-lg px-4 py-3">
                <div>
                  <p className="font-semibold text-brand-primary">{a.patient_name} <span className="font-mono text-brand-text-muted font-normal">· {a.token_no}</span></p>
                  <p className="text-sm text-brand-danger">{a.alert_message}</p>
                </div>
                <Button onClick={() => handleAcknowledge(a)}>Acknowledge</Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {loading ? (
        <Card><p className="text-sm text-brand-text-secondary">Loading...</p></Card>
      ) : queue.length === 0 ? (
        <Card><p className="text-sm text-brand-text-secondary">No patients in the queue.</p></Card>
      ) : (
        Object.entries(grouped).map(([deptName, rows]) => (
          <Card key={deptName} className="mb-6">
            <h2 className="font-semibold text-brand-primary mb-4">{deptName} <span className="text-brand-text-muted font-normal text-sm">({rows.length})</span></h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-brand-text-secondary border-b border-brand-border">
                    <th className="py-2 pr-4">Token</th>
                    <th className="py-2 pr-4">Patient</th>
                    <th className="py-2 pr-4">Priority</th>
                    <th className="py-2 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((e) => (
                    <tr key={e.id} className="border-b border-brand-border last:border-0">
                      <td className="py-2 pr-4 font-mono">{e.token_no}</td>
                      <td className="py-2 pr-4">{e.patient_name}</td>
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
          </Card>
        ))
      )}
    </StaffShell>
  );
}
