import { useEffect, useState } from 'react';
import { callApi, getSession, setSession, triageApi } from '../api/client';
import ProfileForm from '../../components/ProfileForm';
import StaffShell from '../components/StaffShell';

export default function TriageProfilePage() {
  const session = getSession();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const result = await callApi(() => triageApi.profile.get());
      setLoading(false);
      if (result.ok) setProfile(result.data);
      else setError(result.error);
    })();
  }, []);

  const handleSave = async (formData) => {
    setSaving(true);
    setError(null);
    const result = await callApi(() => triageApi.profile.update(formData));
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setProfile(result.data);
    setSession({ access: session.access, refresh: session.refresh, role: session.role, profile: { ...session.profile, full_name: result.data.full_name } });
  };

  return (
    <StaffShell role="triage" title="Profile" profileName={session?.profile?.full_name}>
      {loading ? (
        <p className="text-sm text-brand-text-secondary">Loading...</p>
      ) : profile ? (
        <ProfileForm
          profile={profile}
          readOnlyFields={[{ label: 'Hospital', value: profile.hospital_name }]}
          onSave={handleSave}
          saving={saving}
          error={error}
        />
      ) : null}
    </StaffShell>
  );
}
