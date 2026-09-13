import { useRef, useState } from 'react';
import { Button, Card, ErrorBanner, TextField } from './ui';

// Shared body for every role's Profile page (doctor/triage/hospital-admin) --
// same photo + basic-info-edit shape across all three, only the read-only
// fields and the API call differ per role, which each page passes in.
export default function ProfileForm({ profile, readOnlyFields, onSave, saving, error }) {
  const [fullName, setFullName] = useState(profile.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState(profile.phone_number || '');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(profile.photo_url);
  const fileInputRef = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('full_name', fullName);
    formData.append('phone_number', phoneNumber);
    if (photoFile) formData.append('photo', photoFile);
    onSave(formData);
  };

  return (
    <Card className="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-20 h-20 rounded-full bg-brand-accent-soft border-2 border-brand-border overflow-hidden flex items-center justify-center shrink-0"
          >
            {photoPreview ? (
              <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl text-brand-accent-darker font-bold">{(fullName || '?').charAt(0).toUpperCase()}</span>
            )}
          </button>
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm font-semibold text-brand-accent-darker underline"
            >
              Change photo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <p className="text-xs text-brand-text-muted mt-1">PNG or JPG</p>
          </div>
        </div>

        <TextField label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        <TextField label="Phone number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="10-digit mobile number" />

        {readOnlyFields.map((f) => (
          <div key={f.label}>
            <span className="block text-sm font-medium text-brand-text-secondary mb-1">{f.label}</span>
            <p className="px-3 py-2 rounded-lg bg-brand-bg border border-brand-border text-brand-text-muted text-sm">
              {f.value || '—'}
            </p>
          </div>
        ))}

        <ErrorBanner message={error} />

        <Button type="submit" disabled={saving} className="w-full">
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Card>
  );
}
