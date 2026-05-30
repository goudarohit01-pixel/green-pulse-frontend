import { useState } from 'react'
import { Link } from 'react-router-dom'
import GreenPulseLogo from '../components/GreenPulseLogo'
import Card   from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input  from '../components/ui/Input'
import { authBg, BgRings } from './LoginPage'
import api from '../api/axiosInstance'

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('')
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleSend() {
    if (!email.includes('@')) {
      setError('Enter a valid email address.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch {
      // Always show success — don't reveal if email exists
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={authBg}>
      <BgRings />
      <div className="page-enter" style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        <Card style={{ padding: '36px' }}>

          <div style={{ marginBottom: 28 }}>
            <GreenPulseLogo size={40} textSize={18} />
          </div>

          {!sent ? (
            <>
              <h1 style={{ fontFamily: "'Righteous', cursive", fontSize: 24, color: '#d1fae5', margin: '0 0 6px' }}>
                Reset Password
              </h1>
              <p style={{ color: '#3d6b52', fontSize: 14, margin: '0 0 26px' }}>
                Enter your email and we will send a secure reset link.
              </p>

              <Input
                label="Email"
                type="email"
                icon="✉️"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                error={error}
              />

              <Button onClick={handleSend} loading={loading} style={{ width: '100%', marginTop: 4 }}>
                Send Reset Link
              </Button>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ fontSize: 52, marginBottom: 14 }}>📬</div>
              <div style={{
                fontFamily: "'Righteous', cursive",
                fontSize: 22,
                background: 'linear-gradient(135deg,#4ade80,#22d3ee)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: 10,
              }}>
                Check your inbox
              </div>
              <p style={{ color: '#3d6b52', fontSize: 14, lineHeight: 1.6, marginBottom: 8 }}>
                If an account exists for
              </p>
              <div style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 9, padding: '9px 16px', fontSize: 14, color: '#4ade80', fontWeight: 700, marginBottom: 20 }}>
                {email}
              </div>
              <p style={{ fontSize: 13, color: '#3d6b52' }}>
                A reset link has been sent. Check your spam folder too.
              </p>
              <p style={{ fontSize: 13, color: '#3d6b52', marginTop: 8 }}>
                Did not receive it?{' '}
                <button onClick={() => setSent(false)}
                  style={{ background: 'none', border: 'none', color: '#4ade80', fontSize: 13, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Try again
                </button>
              </p>
            </div>
          )}

          <p style={{ textAlign: 'center', fontSize: 14, color: '#3d6b52', marginTop: 22, marginBottom: 0 }}>
            <Link to="/login" style={{ color: '#4ade80', fontWeight: 700 }}>
              ← Back to Login
            </Link>
          </p>

        </Card>
      </div>
    </div>
  )
}
