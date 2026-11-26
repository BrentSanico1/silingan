import React, { useState } from 'react';
import { apiFetch } from '../api.js';
import { styles } from '../styles.js';
import Field from './Field.jsx';

// Step 1 of password recovery: ask for the account email and send a reset link.
export default function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch('/api/auth/forgot-password', { method: 'POST', body: { email: email.trim() } });
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>Forgot your password?</h2>
      <p style={{ ...styles.hint, fontSize: '13px', marginBottom: '16px' }}>
        Enter the email address of your account and we will send you a link to reset your password.
      </p>

      {error && <div style={styles.errorBox}>{error}</div>}
      {message && <div style={styles.successBox}>{message}</div>}

      <form onSubmit={submit} style={styles.form} noValidate>
        <Field
          label="Email Address"
          name="forgot-email"
          type="email"
          placeholder="juan@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <button style={styles.submitBtn} type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
        <button type="button" style={{ ...styles.linkBtn, textAlign: 'center' }} onClick={onBack}>
          Back to Sign In
        </button>
      </form>
    </>
  );
}
