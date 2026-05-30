// Badge.jsx
export function Badge({ color = '#4ade80', children }) {
  return (
    <span style={{ background: color + '18', border: `1px solid ${color}40`, color, borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
      {children}
    </span>
  )
}

// Spinner.jsx
export function Spinner({ size = 24, color = '#4ade80' }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', border: `2px solid ${color}33`, borderTopColor: color, animation: 'spin 0.7s linear infinite', display: 'inline-block', flexShrink: 0 }} />
  )
}

// Toast.jsx
export function Toast({ message, type = 'success' }) {
  if (!message) return null
  const color = type === 'error' ? '#ef4444' : type === 'warning' ? '#fb923c' : '#4ade80'
  return (
    <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', background: 'rgba(10,25,18,0.97)', border: `1px solid ${color}50`, borderRadius: 'var(--radius-md)', padding: '12px 24px', fontSize: 14, color, fontWeight: 600, boxShadow: '0 16px 48px rgba(0,0,0,0.5)', zIndex: 9999, whiteSpace: 'nowrap', animation: 'fadeUp 0.3s ease both' }}>
      {message}
    </div>
  )
}

// PasswordStrength.jsx
export function PasswordStrength({ password }) {
  if (!password) return null
  const strength =
    password.length < 6 ? 0
    : password.length < 8 ? 1
    : /[A-Z]/.test(password) && /\d/.test(password) ? 3
    : 2
  const info = [
    { label: 'Too short', color: '#ef4444', width: '20%' },
    { label: 'Weak',      color: '#fb923c', width: '45%' },
    { label: 'Fair',      color: '#eab308', width: '70%' },
    { label: 'Strong 💪', color: '#4ade80', width: '100%' },
  ][strength]
  return (
    <div style={{ marginTop: -8, marginBottom: 14 }}>
      <div style={{ height: 4, background: 'rgba(74,222,128,0.08)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: info.width, height: '100%', background: info.color, borderRadius: 99, transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontSize: 11, color: info.color, marginTop: 4, display: 'block' }}>{info.label}</span>
    </div>
  )
}

// Divider.jsx
export function Divider({ label = 'or' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'rgba(74,222,128,0.08)' }} />
      <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'rgba(74,222,128,0.08)' }} />
    </div>
  )
}
