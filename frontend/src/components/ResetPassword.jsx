import React, { useEffect, useState } from 'react';
import { apiFetch, checkPassword, PASSWORD_RULES } from '../api.js';
import { styles } from '../styles.js';
import Field from './Field.jsx';

// Step 2 of password recovery: opened from the emailed link /reset-password?token=...
export default function ResetPassword({ token, onDone }) {
  const [status, setStatus] = useState('checking'); // checking | valid | invalid
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      setError('This reset link is missing its token. Please request a new one.');
      return;
    }
    apiFetch(`/api/auth/reset-password/validate?token=${encodeURIComponent(token)}`)
      .then(() => setStatus('valid'))
      .catch((err) => {
        setStatus('invalid');
        setError(err.message);
      });
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const next = {};
    const pwError = checkPassword(form.newPassword);
    if (pwError) next.newPassword = pwError;
    if (form.newPassword !== form.confirmPassword) next.confirmPassword = 'Passwords do not match.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      const data = await apiFetch('/api/auth/reset-password', {
        method: 'POST',
        body: { token, newPassword: form.newPassword, confirmPassword: form.confirmPassword }
      });
      onDone(data.message);
    } catch (err) {
      setError(err.message);
      setErrors(err.fieldErrors || {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>Set a new password</h2>
      {status === 'checking' && <div style={styles.infoBox}>Checking your reset link...</div>}
      {error && <div style={styles.errorBox}>{error}</div>}

      {status === 'valid' && (
        <form onSubmit={submit} style={styles.form} noValidate>
          <Field
            label="New Password"
            name="reset-new"
            type="password"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            autoComplete="new-password"
            error={errors.newPassword}
            hint={PASSWORD_RULES}
          />
          <Field
            label="Confirm New Password"
            name="reset-confirm"
            type="password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            autoComplete="new-password"
            error={errors.confirmPassword}
          />
          <button style={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Reset Password'}
          </button>
        </form>
      )}

      <button type="button" style={{ ...styles.linkBtn, textAlign: 'center', width: '100%', marginTop: '14px' }} onClick={() => onDone('')}>
        Back to Sign In
      </button>
    </>
  );
}
