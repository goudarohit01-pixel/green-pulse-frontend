export default function Button({ children, onClick, variant = 'primary', size = 'md', loading = false, disabled = false, style = {}, type = 'button' }) {
  const styles = {
    primary:   { background: 'linear-gradient(135deg,#22c55e,#16a34a)', border: 'none', color: '#fff', boxShadow: '0 4px 20px rgba(34,197,94,0.3)' },
    secondary: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80', boxShadow: 'none' },
    danger:    { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', boxShadow: 'none' },
  }
  const sizes = {
    sm: { padding: '7px 14px', fontSize: 12 },
    md: { padding: '11px 22px', fontSize: 14 },
    lg: { padding: '14px 28px', fontSize: 16 },
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      style={{
        ...styles[variant],
        ...sizes[size],
        borderRadius: 'var(--radius-md)',
        fontWeight: 700,
        cursor: loading || disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--font-body)',
        transition: 'all 0.2s',
        opacity: loading || disabled ? 0.65 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        whiteSpace: 'nowrap',
        ...style,
      }}
      onMouseEnter={e => { if (!loading && !disabled) e.currentTarget.style.filter = 'brightness(1.1)' }}
      onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}
    >
      {loading ? (
        <>
          <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid currentColor', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
          Loading…
        </>
      ) : children}
    </button>
  )
}
