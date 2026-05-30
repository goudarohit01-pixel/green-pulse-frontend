import { useState } from 'react'

export default function Input({ label, type = 'text', value, onChange, placeholder, icon, error, hint, style = {} }) {
  const [focused, setFocused] = useState(false)
  const [showPw,  setShowPw]  = useState(false)
  const isPassword = type === 'password'

  return (
    <div style={{ marginBottom: 16, ...style }}>
      {label && (
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 7 }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 15, opacity: 0.5, pointerEvents: 'none' }}>
            {icon}
          </span>
        )}
        <input
          type={isPassword && showPw ? 'text' : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            background: focused ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
            border: error ? '1px solid var(--red)' : focused ? '1px solid rgba(74,222,128,0.5)' : '1px solid rgba(74,222,128,0.12)',
            borderRadius: 'var(--radius-sm)',
            padding: `11px ${isPassword ? '44px' : '14px'} 11px ${icon ? '42px' : '14px'}`,
            color: 'var(--text)',
            fontSize: 14,
            outline: 'none',
            fontFamily: 'var(--font-body)',
            transition: 'all 0.2s',
          }}
        />
        {isPassword && (
          <button type="button" onClick={() => setShowPw(s => !s)}
            style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: 15, cursor: 'pointer' }}>
            {showPw ? '🙈' : '👁'}
          </button>
        )}
      </div>
      {error && <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 5 }}>⚠ {error}</div>}
      {hint && !error && <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 5 }}>{hint}</div>}
    </div>
  )
}
