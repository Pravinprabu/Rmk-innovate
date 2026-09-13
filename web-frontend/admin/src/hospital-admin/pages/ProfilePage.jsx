import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { callApi, clearSession, getSession, hospitalApi, setSession } from '../api/client';
import { Button, PageShell } from '../../components/ui';
import ProfileForm from '../../components/ProfileForm';

export default function HospitalAdminProfilePage() {
  const navigate = useNavigate();
  const session = getSession();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const result = await callApi(() => hospitalApi.profile.get());
      setLoading(false);
      if (result.ok) setProfile(result.data);
      else setError(result.error);
    })();
  }, []);

  const handleSave = async (formData) => {
    setSaving(true);
    setError(null);
    const result = await callApi(() => hospitalApi.profile.update(formData));
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setProfile(result.data);
    setSession({ access: session.access, refresh: session.refresh, profile: { ...session.profile, full_name: result.data.full_name } });
  };

  const handleLogout = () => {
    clearSession();
    navigate('/hospital-admin/login');
  };

  return (
    <PageShell
      title="Profile"
      actions={
        <>
          <Button variant="secondary" onClick={() => navigate('/hospital-admin/dashboard')}>← Back</Button>
          <Button variant="secondary" onClick={handleLogout}>Log out</Button>
        </>
      }
    >
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
    </PageShell>
  );
}
