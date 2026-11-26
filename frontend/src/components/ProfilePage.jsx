import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api.js';
import { styles } from '../styles.js';
import Field from './Field.jsx';

const ROLE_LABEL = { RESIDENT: 'Resident', OFFICIAL: 'Barangay Official', ADMIN: 'System Administrator' };
const EMPTY = { name: '', contactNumber: '', address: '', bio: '' };

function validate(form) {
  const e = {};
  const name = form.name.trim();
  if (!name) e.name = 'Full name is required.';
  else if (name.length < 2 || name.length > 100) e.name = 'Full name must be 2 to 100 characters.';
  else if (!/^[\p{L} .'-]+$/u.test(name)) e.name = 'Full name may only contain letters, spaces, periods, apostrophes, and hyphens.';
  const phone = form.contactNumber.replace(/[\s-]/g, '');
  if (phone && !/^(\+639|09)\d{9}$/.test(phone)) e.contactNumber = 'Contact number must be a valid PH mobile number (09XXXXXXXXX or +639XXXXXXXXX).';
  if (form.address.length > 255) e.address = 'Address must be at most 255 characters.';
  if (/[<>]/.test(form.address)) e.address = 'Address must not contain < or > characters.';
  if (form.bio.length > 500) e.bio = 'Bio must be at most 500 characters.';
  if (/[<>]/.test(form.bio)) e.bio = 'Bio must not contain < or > characters.';
  return e;
}

// View and edit the signed-in user's own profile (GET/PUT /api/users/me).
export default function ProfilePage({ token, onProfileUpdated, onUnauthorized }) {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const handleError = (err) => {
    if (err.status === 401) return onUnauthorized(err.message);
    setError(err.message);
    setErrors(err.fieldErrors || {});
  };

  useEffect(() => {
    apiFetch('/api/users/me', { token }).then(setProfile).catch(handleError);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const startEdit = () => {
    setForm({
      name: profile.name || '',
      contactNumber: profile.contactNumber || '',
      address: profile.address || '',
      bio: profile.bio || ''
    });
    setErrors({});
    setError('');
    setMessage('');
    setEditing(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) return;
    setSaving(true);
    try {
      const updated = await apiFetch('/api/users/me', { method: 'PUT', token, body: form });
      setProfile(updated);
      setEditing(false);
      setMessage('Profile updated successfully.');
      onProfileUpdated(updated);
    } catch (err) {
      handleError(err);
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return (
      <div style={styles.roleDetailBox}>
        {error ? <div style={styles.errorBox}>{error}</div> : <p style={styles.hint}>Loading profile...</p>}
      </div>
    );
  }

  return (
    <div style={styles.roleDetailBox}>
      <div style={styles.sectionHeader}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>My Profile</h3>
          <p style={styles.hint}>Only you can view and edit this information.</p>
        </div>
        {!editing && (
          <button style={{ ...styles.submitBtn, marginTop: 0, padding: '8px 16px' }} onClick={startEdit}>
            Edit Profile
          </button>
        )}
      </div>

      {message && <div style={styles.successBox}>{message}</div>}
      {error && <div style={styles.errorBox}>{error}</div>}

      {!editing ? (
        <div style={styles.profileGrid}>
          <span style={styles.profileKey}>Full Name</span><span>{profile.name}</span>
          <span style={styles.profileKey}>Email</span><span>{profile.email}</span>
          <span style={styles.profileKey}>Role</span><span>{ROLE_LABEL[profile.role] || profile.role}</span>
          <span style={styles.profileKey}>Contact Number</span><span>{profile.contactNumber || '—'}</span>
          <span style={styles.profileKey}>Address</span><span>{profile.address || '—'}</span>
          <span style={styles.profileKey}>Bio</span><span style={{ whiteSpace: 'pre-wrap' }}>{profile.bio || '—'}</span>
          <span style={styles.profileKey}>Barangay</span><span>{profile.barangayName || 'Not yet verified'}</span>
          <span style={styles.profileKey}>Last Updated</span>
          <span>{profile.updatedAt ? new Date(profile.updatedAt).toLocaleString() : '—'}</span>
        </div>
      ) : (
        <form onSubmit={save} style={{ ...styles.form, maxWidth: '520px' }} noValidate>
          <Field label="Full Name" name="profile-name" value={form.name} error={errors.name}
                 onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Field label="Email" name="profile-email" value={profile.email} disabled
                 hint="Email is your login identity and cannot be changed here." />
          <Field label="Contact Number" name="profile-contact" placeholder="09XXXXXXXXX" value={form.contactNumber}
                 error={errors.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} />
          <Field label="Address" name="profile-address" placeholder="Purok / Street, Barangay" value={form.address}
                 error={errors.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Field label={`Bio (${form.bio.length}/500)`} name="profile-bio" as="textarea" value={form.bio}
                 error={errors.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button style={{ ...styles.submitBtn, marginTop: 0, padding: '10px 18px' }} type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button style={styles.secondaryBtn} type="button" onClick={() => { setEditing(false); setError(''); }}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
