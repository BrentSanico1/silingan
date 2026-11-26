// Small fetch wrapper: sends JSON, attaches the bearer token, and turns error
// responses into an Error carrying `status` and `fieldErrors` from the backend.
export async function apiFetch(path, { method = 'GET', body, token } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
  } catch {
    const err = new Error('Cannot reach the server. Check that the backend is running.');
    err.status = 0;
    throw err;
  }

  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.fieldErrors = data.fieldErrors || {};
    throw err;
  }
  return data;
}

export const PASSWORD_RULES = 'At least 8 characters, with at least one letter and one number.';

// Mirrors the backend PasswordPolicy so users get instant feedback.
export function checkPassword(pw) {
  if (!pw) return 'Password is required.';
  if (pw !== pw.trim()) return 'Password must not start or end with a space.';
  if (pw.length < 8 || new TextEncoder().encode(pw).length > 72 || !/\p{L}/u.test(pw) || !/\d/.test(pw)) {
    return 'Password must be 8-72 characters and contain at least one letter and one number.';
  }
  return '';
}
