export const styles = {
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
  },
  successBox: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    padding: '10px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '16px'
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    color: '#1e40af',
    padding: '10px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '16px'
  },
  fieldError: {
    fontSize: '12px',
    color: '#b91c1c'
  },
  inputInvalid: {
    borderColor: '#dc2626'
  },
  hint: {
    fontSize: '12px',
    color: '#6b7280'
  },
  linkBtn: {
    background: 'none',
    border: 'none',
    color: '#1e40af',
    fontSize: '13px',
    fontWeight: '600',
    padding: 0,
    textAlign: 'right'
  },
  secondaryBtn: {
    padding: '10px 16px',
    border: '1px solid #d1d5db',
    backgroundColor: '#ffffff',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
  },
  profileGrid: {
    display: 'grid',
    gridTemplateColumns: '160px 1fr',
    rowGap: '12px',
    columnGap: '16px',
    fontSize: '14px'
  },
  profileKey: {
    color: '#6b7280',
    fontWeight: '600'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    gap: '12px'
  }
};
