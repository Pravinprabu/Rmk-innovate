import { useEffect, useState } from 'react';
import { callApi, getSession, triageApi } from '../api/client';
import { Card, ErrorBanner } from '../../components/ui';
import StaffShell from '../components/StaffShell';

export default function TriageBookedPage() {
  const session = getSession();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const result = await callApi(() => triageApi.bookings());
      setLoading(false);
      if (result.ok) setBookings(result.data);
      else setError(result.error);
    })();
  }, []);

  return (
    <StaffShell role="triage" title="Booked Patients" profileName={session?.profile?.full_name}>
      <ErrorBanner message={error} />
      <Card>
        <p className="text-sm text-brand-text-secondary mb-4">
          Booked today via the mobile app -- not yet checked in at the kiosk.
        </p>
        {loading ? (
          <p className="text-sm text-brand-text-secondary">Loading...</p>
        ) : bookings.length === 0 ? (
          <p className="text-sm text-brand-text-secondary">No bookings for today.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-brand-text-secondary border-b border-brand-border">
                  <th className="py-2 pr-4">Time</th>
                  <th className="py-2 pr-4">Patient</th>
                  <th className="py-2 pr-4">Mobile</th>
                  <th className="py-2 pr-4">Department</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b border-brand-border last:border-0">
                    <td className="py-2 pr-4 font-mono">{b.slot_time}</td>
                    <td className="py-2 pr-4">{b.full_name}</td>
                    <td className="py-2 pr-4">{b.mobile_number || '—'}</td>
                    <td className="py-2 pr-4">{b.department_name || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </StaffShell>
  );
}
