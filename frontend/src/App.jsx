import React, { useState, useEffect } from 'react';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('silingan_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('silingan_token') || '');
  const [isRegistering, setIsRegistering] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'RESIDENT' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    if (user) {
      localStorage.setItem('silingan_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('silingan_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('silingan_token', token);
    } else {
      localStorage.removeItem('silingan_token');
    }
  }, [token]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegistering
      ? { name: form.name, email: form.email, password: form.password, role: form.role }
      : { email: form.email, password: form.password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      setToken(data.token);
      setUser({ email: data.email, name: data.name, role: data.role });
      setForm({ name: '', email: '', password: '', role: 'RESIDENT' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    localStorage.clear();
  };

  if (!user) {
    return (
      <div style={styles.authContainer}>
        <div style={styles.authCard}>
          <div style={styles.headerArea}>
            <h1 style={styles.logoTitle}>Silingan</h1>
            <p style={styles.subTitle}>Barangay Community & Engagement Platform</p>
          </div>

          <div style={styles.switchTabs}>
            <button
              style={{ ...styles.switchBtn, ...(isRegistering ? {} : styles.switchBtnActive) }}
              onClick={() => { setIsRegistering(false); setError(''); }}
            >
              Sign In
            </button>
            <button
              style={{ ...styles.switchBtn, ...(isRegistering ? styles.switchBtnActive : {}) }}
              onClick={() => { setIsRegistering(true); setError(''); }}
            >
              Create Account
            </button>
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleAuth} style={styles.form} autoComplete="off">
            {isRegistering && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>Full Name</label>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="e.g. Juan dela Cruz"
                  value={form.name}
                  autoComplete="off"
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            )}

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                style={styles.input}
                type="email"
                placeholder="juan@example.com"
                value={form.email}
                autoComplete="new-password"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                type="password"
                placeholder="••••••••"
                value={form.password}
                autoComplete="new-password"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            {isRegistering && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>Role (SRS Matrix)</label>
                <select
                  style={styles.input}
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="RESIDENT">Resident</option>
                  <option value="OFFICIAL">Barangay Official</option>
                  <option value="ADMIN">System Administrator</option>
                </select>
              </div>
            )}

            <button style={styles.submitBtn} type="submit" disabled={loading}>
              {loading ? 'Processing...' : (isRegistering ? 'Register Account' : 'Sign In')}
            </button>
          </form>

          <div style={styles.mockHint}>
            <strong>Default SRS Roles to test:</strong>
            <p>• <b>Resident:</b> View feed, report concerns, comment</p>
            <p>• <b>Official:</b> Official notices, resolve concerns</p>
            <p>• <b>Admin:</b> Manage barangays, boundaries, users</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.appLayout}>
      <header style={styles.navbar}>
        <div style={styles.navLeft}>
          <span style={styles.brandBadge}>Silingan</span>
          <span style={styles.brandTitle}>Barangay Platform</span>
        </div>
        <div style={styles.navRight}>
          <div style={styles.userProfilePill}>
            <span style={styles.userNameText}>{user.name}</span>
            <span style={{
              ...styles.roleTag,
              backgroundColor: user.role === 'ADMIN' ? '#dc2626' : user.role === 'OFFICIAL' ? '#2563eb' : '#16a34a'
            }}>
              {user.role}
            </span>
          </div>
          <button style={styles.logoutBtn} onClick={handleLogout}>Log Out</button>
        </div>
      </header>

      <div style={styles.mainWrapper}>
        <aside style={styles.sidebar}>
          <div style={styles.sidebarHeader}>Navigation</div>
          <nav style={styles.sideNav}>
            <button
              style={{ ...styles.navItem, ...(activeTab === 'home' ? styles.navItemActive : {}) }}
              onClick={() => setActiveTab('home')}
            >
              Dashboard Overview
            </button>
            <button
              style={{ ...styles.navItem, ...(activeTab === 'feed' ? styles.navItemActive : {}) }}
              onClick={() => setActiveTab('feed')}
            >
              Community Feed
            </button>
            <button
              style={{ ...styles.navItem, ...(activeTab === 'concerns' ? styles.navItemActive : {}) }}
              onClick={() => setActiveTab('concerns')}
            >
              Concerns & Reports
            </button>
            {user.role === 'OFFICIAL' && (
              <button
                style={{ ...styles.navItem, ...(activeTab === 'official' ? styles.navItemActive : {}) }}
                onClick={() => setActiveTab('official')}
              >
                Official Notices
              </button>
            )}
            {user.role === 'ADMIN' && (
              <button
                style={{ ...styles.navItem, ...(activeTab === 'admin' ? styles.navItemActive : {}) }}
                onClick={() => setActiveTab('admin')}
              >
                System Administration
              </button>
            )}
          </nav>
        </aside>

        <main style={styles.content}>
          {activeTab === 'home' && (
            <div>
              <div style={styles.welcomeBanner}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Welcome back, {user.name}!</h2>
                <p style={{ color: '#4b5563', marginTop: '4px' }}>
                  Logged in as <b>{user.role}</b> ({user.email}). Here is your role-specific dashboard based on the approved SRS.
                </p>
              </div>

              <div style={styles.statsGrid}>
                {user.role === 'RESIDENT' && (
                  <>
                    <div style={styles.statCard}>
                      <div style={styles.statLabel}>Barangay Membership</div>
                      <div style={styles.statVal}>Verified Resident</div>
                      <span style={styles.verifiedBadge}>✓ Location Verified</span>
                    </div>
                    <div style={styles.statCard}>
                      <div style={styles.statLabel}>My Submitted Concerns</div>
                      <div style={styles.statVal}>2 Active</div>
                      <span style={{ fontSize: '13px', color: '#f59e0b' }}>1 In Progress</span>
                    </div>
                    <div style={styles.statCard}>
                      <div style={styles.statLabel}>Barangay Announcements</div>
                      <div style={styles.statVal}>3 New</div>
                      <span style={{ fontSize: '13px', color: '#2563eb' }}>Updated today</span>
                    </div>
                  </>
                )}

                {user.role === 'OFFICIAL' && (
                  <>
                    <div style={styles.statCard}>
                      <div style={styles.statLabel}>Active Concerns</div>
                      <div style={styles.statVal}>8 Pending</div>
                      <span style={{ fontSize: '13px', color: '#ef4444' }}>Requires review</span>
                    </div>
                    <div style={styles.statCard}>
                      <div style={styles.statLabel}>Official Announcements</div>
                      <div style={styles.statVal}>12 Published</div>
                      <span style={{ fontSize: '13px', color: '#16a34a' }}>Reaching all residents</span>
                    </div>
                    <div style={styles.statCard}>
                      <div style={styles.statLabel}>Moderation Queue</div>
                      <div style={styles.statVal}>1 Flagged Post</div>
                      <span style={{ fontSize: '13px', color: '#d97706' }}>Needs resolution</span>
                    </div>
                  </>
                )}

                {user.role === 'ADMIN' && (
                  <>
                    <div style={styles.statCard}>
                      <div style={styles.statLabel}>Registered Barangays</div>
                      <div style={styles.statVal}>6 Active</div>
                      <span style={{ fontSize: '13px', color: '#16a34a' }}>All boundaries defined</span>
                    </div>
                    <div style={styles.statCard}>
                      <div style={styles.statLabel}>Total Platform Users</div>
                      <div style={styles.statVal}>1,248</div>
                      <span style={{ fontSize: '13px', color: '#2563eb' }}>Across registered barangays</span>
                    </div>
                    <div style={styles.statCard}>
                      <div style={styles.statLabel}>System Health</div>
                      <div style={styles.statVal}>Optimal</div>
                      <span style={{ fontSize: '13px', color: '#16a34a' }}>PostgreSQL & OAuth OK</span>
                    </div>
                  </>
                )}
              </div>

              <div style={styles.roleDetailBox}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                  {user.role === 'ADMIN' && 'System Administrator Privileges'}
                  {user.role === 'OFFICIAL' && 'Barangay Official Capabilities'}
                  {user.role === 'RESIDENT' && 'Resident Access & Feed'}
                </h3>
                <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
                  {user.role === 'ADMIN' && 'You have platform-wide access to manage barangay polygons, verify official accounts, review flagged content across all jurisdictions, and monitor system metrics.'}
                  {user.role === 'OFFICIAL' && 'You have authority to publish verified official announcements, manage resident concern tickets, assign status updates (Acknowledged, In Progress, Resolved), and moderate content.'}
                  {user.role === 'RESIDENT' && 'You can access the hyper-local community feed, create posts in categories (Announcements, Recommendations, Concerns, General), pin issues with photos on the barangay map, and comment/react.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'feed' && (
            <div style={styles.roleDetailBox}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>Community Feed (Chronological)</h3>
              <p style={{ color: '#6b7280', marginBottom: '16px' }}>Posts visible only to verified members of your registered barangay.</p>
              <div style={styles.samplePost}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <b>Barangay Health Center</b>
                  <span style={styles.officialPill}>Official</span>
                </div>
                <p>Free Rabies Vaccination drive scheduled this Saturday 8:00 AM at the Barangay Covered Court. Bring your pets!</p>
              </div>
              <div style={styles.samplePost}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <b>Maria Santos</b>
                  <span style={styles.residentPill}>Resident</span>
                </div>
                <p>Recommendation: Does anyone know a reliable electrician nearby? Streetlight on 3rd corner flickers frequently.</p>
              </div>
            </div>
          )}

          {activeTab === 'concerns' && (
            <div style={styles.roleDetailBox}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>Concern Reporting & Tracking</h3>
              <p style={{ color: '#6b7280', marginBottom: '16px' }}>Track the lifecycle: <b>SUBMITTED → ACKNOWLEDGED → IN_PROGRESS → RESOLVED</b></p>
              <div style={styles.samplePost}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <b>Pothole along Acacia Street</b>
                  <span style={{ fontSize: '12px', padding: '2px 8px', background: '#fef3c7', color: '#b45309', borderRadius: '12px', fontWeight: 'bold' }}>IN_PROGRESS</span>
                </div>
                <p style={{ fontSize: '14px', color: '#4b5563' }}>Reported with map pin & photo. Official remark: "Assigned to road maintenance crew."</p>
              </div>
            </div>
          )}

          {activeTab === 'official' && user.role === 'OFFICIAL' && (
            <div style={styles.roleDetailBox}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>Official Announcement Board</h3>
              <p style={{ color: '#6b7280', marginBottom: '16px' }}>Create official notices: Meeting, Relief Distribution, Health Campaign, or Emergency Alert.</p>
              <button style={{ ...styles.submitBtn, width: 'auto', padding: '8px 16px' }}>+ Publish New Official Announcement</button>
            </div>
          )}

          {activeTab === 'admin' && user.role === 'ADMIN' && (
            <div style={styles.roleDetailBox}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>Platform Administration Console</h3>
              <p style={{ color: '#6b7280', marginBottom: '16px' }}>Register new barangays, define boundary polygons, and assign official credentials.</p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={{ ...styles.submitBtn, width: 'auto', padding: '8px 16px' }}>+ Register New Barangay</button>
                <button style={{ ...styles.submitBtn, width: 'auto', padding: '8px 16px', background: '#374151' }}>Manage Role Assignments</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const styles = {
  authContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    padding: '20px'
  },
  authCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '32px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  },
  headerArea: {
    textAlign: 'center',
    marginBottom: '24px'
  },
  logoTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#1e40af'
  },
  subTitle: {
    fontSize: '13px',
    color: '#6b7280',
    marginTop: '4px'
  },
  switchTabs: {
    display: 'flex',
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    padding: '4px',
    marginBottom: '20px'
  },
  switchBtn: {
    flex: 1,
    padding: '8px',
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#4b5563'
  },
  switchBtnActive: {
    backgroundColor: '#ffffff',
    color: '#1e40af',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '10px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '16px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151'
  },
  input: {
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    outline: 'none'
  },
  submitBtn: {
    backgroundColor: '#1e40af',
    color: '#ffffff',
    padding: '12px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    marginTop: '6px'
  },
  mockHint: {
    marginTop: '20px',
    padding: '12px',
    backgroundColor: '#f8fafc',
    border: '1px dashed #cbd5e1',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#475569'
  },
  appLayout: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column'
  },
  navbar: {
    height: '60px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px'
  },
  navLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  brandBadge: {
    backgroundColor: '#1e40af',
    color: '#ffffff',
    padding: '4px 10px',
    borderRadius: '6px',
    fontWeight: '800',
    fontSize: '15px'
  },
  brandTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#111827'
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  userProfilePill: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#f3f4f6',
    padding: '6px 12px',
    borderRadius: '20px'
  },
  userNameText: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937'
  },
  roleTag: {
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#ffffff',
    padding: '2px 8px',
    borderRadius: '10px'
  },
  logoutBtn: {
    padding: '6px 14px',
    border: '1px solid #d1d5db',
    backgroundColor: '#ffffff',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151'
  },
  mainWrapper: {
    flex: 1,
    display: 'flex'
  },
  sidebar: {
    width: '240px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e5e7eb',
    padding: '20px 16px'
  },
  sidebarHeader: {
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#9ca3af',
    marginBottom: '12px',
    letterSpacing: '0.05em'
  },
  sideNav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  navItem: {
    textAlign: 'left',
    padding: '10px 12px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '14px',
    fontWeight: '500',
    color: '#4b5563'
  },
  navItemActive: {
    backgroundColor: '#eff6ff',
    color: '#1e40af',
    fontWeight: '600'
  },
  content: {
    flex: 1,
    padding: '28px',
    backgroundColor: '#f9fafb'
  },
  welcomeBanner: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #e5e7eb',
    marginBottom: '24px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '24px'
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  statLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#6b7280'
  },
  statVal: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#111827'
  },
  verifiedBadge: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#16a34a'
  },
  roleDetailBox: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #e5e7eb'
  },
  samplePost: {
    padding: '14px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    marginBottom: '12px'
  },
  officialPill: {
    fontSize: '11px',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    fontWeight: 'bold',
    padding: '2px 8px',
    borderRadius: '10px'
  },
  residentPill: {
    fontSize: '11px',
    backgroundColor: '#dcfce7',
    color: '#166534',
    fontWeight: 'bold',
    padding: '2px 8px',
    borderRadius: '10px'
  }
};
