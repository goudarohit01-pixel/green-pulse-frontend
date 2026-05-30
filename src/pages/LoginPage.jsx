import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import GreenPulseLogo from '../components/GreenPulseLogo'
import Card   from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input  from '../components/ui/Input'
import { Divider } from '../components/ui/helpers'

// ── Shared auth background style ─────────────────────────────
export const authBg = {
  minHeight:      '100vh',
  background:     '#050d0a',
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'center',
  padding:        20,
  position:       'relative',
  overflow:       'hidden',
  fontFamily:     "'Plus Jakarta Sans', sans-serif",
}

// ── Decorative background rings ──────────────────────────────
export function BgRings() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)', top: -150, left: -150 }} />
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.04) 0%, transparent 70%)', bottom: -100, right: -100 }} />
      {[700, 500, 350, 200, 100].map((s, i) => (
        <div key={i} style={{ position: 'absolute', borderRadius: '50%', border: '1px solid rgba(74,222,128,0.04)', width: s, height: s, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
      ))}
    </div>
  )
}

// function GoogleIcon() {
//   return (
//     <svg width="18" height="18" viewBox="0 0 48 48">
//       <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.8 2.2 30.2 0 24 0 14.7 0 6.7 5.4 2.7 13.3l7.9 6.1C12.5 13.1 17.8 9.5 24 9.5Z"/>
//       <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.4c-.5 2.8-2.1 5.2-4.5 6.8l7 5.4C43.1 37 46.1 31.2 46.1 24.5Z"/>
//       <path fill="#FBBC05" d="M10.6 28.6A14.7 14.7 0 0 1 9.5 24c0-1.6.3-3.2.8-4.6l-7.9-6.1A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.6 10.7l8-6.1Z"/>
//       <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7-5.4c-2 1.4-4.6 2.2-8.2 2.2-6.2 0-11.5-4.2-13.4-9.8l-8 6.1C6.7 42.6 14.7 48 24 48Z"/>
//     </svg>
//   )
// }

export default function LoginPage() {
  const { login }  = useAuth()
  const navigate   = useNavigate()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [errors,   setErrors]   = useState({})
  const [apiError, setApiError] = useState('')
  const [loading,  setLoading]  = useState(false)

  function validate() {
    const e = {}
    if (!email.trim())           e.email    = 'Email is required.'
    if (!email.includes('@'))    e.email    = 'Enter a valid email address.'
    if (password.length < 6)     e.password = 'Password must be at least 6 characters.'
    return e
  }

  async function handleSubmit() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setApiError('')
    setLoading(true)
    try {
      await login(email.trim(), password)
      navigate('/dashboard')
    } catch (err) {
      setApiError(err.response?.data?.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div style={authBg}>
      <BgRings />

      <div className="page-enter" style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        <Card style={{ padding: '36px 36px 32px' }}>

          {/* Logo */}
          <div style={{ marginBottom: 32 }}>
            <GreenPulseLogo size={48} textSize={22} />
          </div>

          <h1 style={{ fontFamily: "'Righteous', cursive", fontSize: 26, color: '#d1fae5', margin: '0 0 6px' }}>
            Sign In
          </h1>
          <p style={{ color: '#3d6b52', fontSize: 14, margin: '0 0 24px' }}>
            Track your carbon footprint today
          </p>

          {/* API error banner */}
          {apiError && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#ef4444', marginBottom: 16 }}>
              {apiError}
            </div>
          )}

          {/* Fields */}
          <div onKeyDown={handleKeyDown}>
            <Input
              label="Email"
              type="email"
              icon="✉️"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              error={errors.email}
            />
            <Input
              label="Password"
              type="password"
              icon="🔑"
              placeholder="Your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              error={errors.password}
            />
          </div>

          {/* Forgot password */}
          <div style={{ textAlign: 'right', marginTop: -4, marginBottom: 22 }}>
            <Link to="/forgot-password" style={{ fontSize: 13, color: '#4ade80' }}>
              Forgot password?
            </Link>
          </div>

          <Button onClick={handleSubmit} loading={loading} style={{ width: '100%', padding: '13px' }}>
            Sign In →
          </Button>

          {/* <Divider label="or" /> */}

          {/* Google button */}
          {/* <button
            style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px', color: '#8ab89a', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
            onClick={() => alert('Google OAuth requires backend setup')}
          >
            <GoogleIcon /> Continue with Google
          </button> */}

          <p style={{ textAlign: 'center', fontSize: 14, color: '#3d6b52', marginTop: 24, marginBottom: 0 }}>
            No account?{' '}
            <Link to="/register" style={{ color: '#4ade80', fontWeight: 800 }}>
              Create one free
            </Link>
          </p>

        </Card>
      </div>
    </div>
  )
}
