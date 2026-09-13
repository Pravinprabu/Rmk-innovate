import { useEffect, useState } from 'react';
import { callApi, getSession, setSession, superAdminApi } from '../api/client';
import ProfileForm from '../../components/ProfileForm';
import SuperAdminShell from '../components/SuperAdminShell';

export default function ProfilePage() {
  const session = getSession();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const result = await callApi(() => superAdminApi.profile.get());
      setLoading(false);
      if (result.ok) setProfile(result.data);
      else setError(result.error);
    })();
  }, []);

  const handleSave = async (formData) => {
    setSaving(true);
    setError(null);
    const result = await callApi(() => superAdminApi.profile.update(formData));
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setProfile(result.data);
    setSession({ access: session.access, refresh: session.refresh, profile: { ...session.profile } });
  };

  return (
    <SuperAdminShell title="Profile" profileName={session?.profile?.username}>
      {loading ? (
        <p className="text-sm text-brand-text-secondary">Loading...</p>
      ) : profile ? (
        <ProfileForm
          profile={profile}
          readOnlyFields={[{ label: 'Username', value: profile.username }]}
          onSave={handleSave}
          saving={saving}
          error={error}
        />
      ) : null}
    </SuperAdminShell>
  );
}
