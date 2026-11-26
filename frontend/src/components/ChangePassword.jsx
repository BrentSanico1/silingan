import React, { useState } from 'react';
import { apiFetch, checkPassword, PASSWORD_RULES } from '../api.js';
import { styles } from '../styles.js';
import Field from './Field.jsx';

const EMPTY = { currentPassword: '', newPassword: '', confirmPassword: '' };

// Change password for the signed-in user (PUT /api/users/me/password).
export default function ChangePassword({ token, onPasswordChanged, onUnauthorized }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    const next = {};
    if (!form.currentPassword) next.currentPassword = 'Current password is required.';
    const pwError = checkPassword(form.newPassword);
    if (pwError) next.newPassword = pwError;
    else if (form.newPassword === form.currentPassword) next.newPassword = 'New password must be different from your current password.';
    if (form.newPassword !== form.confirmPassword) next.confirmPassword = 'Passwords do not match.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      const data = await apiFetch('/api/users/me/password', { method: 'PUT', token, body: form });
      onPasswordChanged(data.auth.token);
      setForm(EMPTY);
      setMessage(data.message);
    } catch (err) {
      if (err.status === 401) return onUnauthorized(err.message);
      setError(err.message);
      setErrors(err.fieldErrors || {});
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.roleDetailBox}>
      <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>Change Password</h3>
      <p style={{ ...styles.hint, marginBottom: '16px' }}>
        After changing your password, your old password stops working and other signed-in sessions are logged out.
      </p>

      {message && <div style={styles.successBox}>{message}</div>}
      {error && <div style={styles.errorBox}>{error}</div>}

      <form onSubmit={submit} style={{ ...styles.form, maxWidth: '420px' }} noValidate autoComplete="off">
        <Field label="Current Password" name="current-password" type="password" value={form.currentPassword}
               error={errors.currentPassword} autoComplete="current-password"
               onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />
        <Field label="New Password" name="new-password" type="password" value={form.newPassword}
               error={errors.newPassword} hint={PASSWORD_RULES} autoComplete="new-password"
               onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
        <Field label="Confirm New Password" name="confirm-password" type="password" value={form.confirmPassword}
               error={errors.confirmPassword} autoComplete="new-password"
               onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
        <button style={{ ...styles.submitBtn, alignSelf: 'flex-start', padding: '10px 18px' }} type="submit" disabled={saving}>
          {saving ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
