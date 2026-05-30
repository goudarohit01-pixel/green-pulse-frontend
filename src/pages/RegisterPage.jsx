import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import GreenPulseLogo from '../components/GreenPulseLogo'
import Card   from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input  from '../components/ui/Input'
import { PasswordStrength } from '../components/ui/helpers'
import { authBg, BgRings } from './LoginPage'

const COUNTRIES = [
  'United Kingdom', 'United States', 'Germany',
  'France', 'India', 'Australia', 'Canada', 'Other',
]
const DIETS    = ['Omnivore', 'Flexitarian', 'Vegetarian', 'Vegan']
const VEHICLES = ['None', 'Electric Car', 'Hybrid', 'Petrol Car', 'Diesel Car', 'Motorbike']

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate     = useNavigate()

  const [step,     setStep]     = useState(1)
  const [loading,  setLoading]  = useState(false)
  const [apiError, setApiError] = useState('')
  const [errors,   setErrors]   = useState({})

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: '',
    country: '', diet: '', vehicle: '', agree: false,
  })

  function setField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }))
  }

  function validateStep1() {
    const e = {}
    if (!form.name.trim())              e.name     = 'Full name is required.'
    if (!form.email.trim())             e.email    = 'Email is required.'
    else if (!form.email.includes('@')) e.email    = 'Enter a valid email address.'
    if (form.password.length < 8)       e.password = 'Minimum 8 characters.'
    if (form.password !== form.confirm) e.confirm  = 'Passwords do not match.'
    return e
  }

  function goNext() {
    const e = validateStep1()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setApiError('')
    setStep(2)
  }

  async function handleSubmit() {
    if (!form.agree) {
      setErrors({ agree: 'You must accept the terms to continue.' })
      return
    }
    setErrors({})
    setApiError('')
    setLoading(true)

    try {
      // Map diet and vehicle to backend enum format
      const dietMap = {
        'Omnivore':    'OMNIVORE',
        'Flexitarian': 'FLEXITARIAN',
        'Vegetarian':  'VEGETARIAN',
        'Vegan':       'VEGAN',
      }
      const vehicleMap = {
        'None':         'NONE',
        'Electric Car': 'ELECTRIC_CAR',
        'Hybrid':       'HYBRID',
        'Petrol Car':   'PETROL_CAR',
        'Diesel Car':   'DIESEL_CAR',
        'Motorbike':    'MOTORBIKE',
      }

      await register({
        name:     form.name.trim(),
        email:    form.email.trim(),
        password: form.password,
        country:  form.country  || null,
        diet:     form.diet     ? dietMap[form.diet]       : null,
        vehicle:  form.vehicle  ? vehicleMap[form.vehicle] : null,
      })

      navigate('/dashboard')
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.')
      setStep(1)
    } finally {
      setLoading(false)
    }
  }

  const sel = {
    width: '100%',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(74,222,128,0.12)',
    borderRadius: 10,
    padding: '11px 14px',
    color: '#d1fae5',
    fontSize: 14,
    outline: 'none',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    appearance: 'none',
  }

  const lbl = {
    display: 'block',
    fontSize: 12,
    fontWeight: 700,
    color: '#3d6b52',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: 7,
  }

  return (
    <div style={authBg}>
      <BgRings />

      <div className="page-enter" style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        <Card style={{ padding: '36px 36px 32px' }}>

          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <GreenPulseLogo size={40} textSize={18} />
            {/* Step indicator */}
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 2].map(s => (
                <div key={s} style={{ height: 6, width: s === step ? 28 : 10, borderRadius: 99, background: s <= step ? 'linear-gradient(90deg,#22c55e,#4ade80)' : 'rgba(74,222,128,0.12)', transition: 'all 0.3s' }} />
              ))}
            </div>
          </div>

          <h1 style={{ fontFamily: "'Righteous', cursive", fontSize: 24, color: '#d1fae5', margin: '0 0 4px' }}>
            {step === 1 ? 'Create Account' : 'Your Lifestyle'}
          </h1>
          <p style={{ color: '#3d6b52', fontSize: 13, margin: '0 0 24px' }}>
            Step {step} of 2 — {step === 1 ? 'Account details' : 'Personalise your tracker'}
          </p>

          {/* API error */}
          {apiError && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#ef4444', marginBottom: 16 }}>
              {apiError}
            </div>
          )}

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <>
              <Input
                label="Full Name"
                icon="👤"
                placeholder="Alex Morgan"
                value={form.name}
                onChange={e => setField('name', e.target.value)}
                error={errors.name}
              />
              <Input
                label="Email"
                type="email"
                icon="✉️"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setField('email', e.target.value)}
                error={errors.email}
              />
              <Input
                label="Password"
                type="password"
                icon="🔑"
                placeholder="Minimum 8 characters"
                value={form.password}
                onChange={e => setField('password', e.target.value)}
                error={errors.password}
              />
              <PasswordStrength password={form.password} />
              <Input
                label="Confirm Password"
                type="password"
                icon="🔒"
                placeholder="Repeat your password"
                value={form.confirm}
                onChange={e => setField('confirm', e.target.value)}
                error={errors.confirm}
              />
              <Button onClick={goNext} style={{ width: '100%', marginTop: 4 }}>
                Continue →
              </Button>
            </>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <>
              {/* Country */}
              <div style={{ marginBottom: 16 }}>
                <label style={lbl}>Country</label>
                <select
                  value={form.country}
                  onChange={e => setField('country', e.target.value)}
                  style={sel}
                >
                  <option value="">Select your country</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Diet */}
              <div style={{ marginBottom: 16 }}>
                <label style={lbl}>Diet Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {DIETS.map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setField('diet', d)}
                      style={{
                        background:   form.diet === d ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.02)',
                        border:       `1px solid ${form.diet === d ? 'rgba(74,222,128,0.5)' : 'rgba(74,222,128,0.08)'}`,
                        borderRadius: 9,
                        padding:      '10px 8px',
                        color:        form.diet === d ? '#4ade80' : '#3d6b52',
                        fontSize:     13,
                        fontWeight:   form.diet === d ? 700 : 500,
                        cursor:       'pointer',
                        fontFamily:   "'Plus Jakarta Sans', sans-serif",
                        transition:   'all 0.15s',
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vehicle */}
              <div style={{ marginBottom: 20 }}>
                <label style={lbl}>Primary Vehicle</label>
                <select
                  value={form.vehicle}
                  onChange={e => setField('vehicle', e.target.value)}
                  style={sel}
                >
                  <option value="">Select vehicle</option>
                  {VEHICLES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              {/* Terms */}
              <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', marginBottom: 8 }}>
                <input
                  type="checkbox"
                  checked={form.agree}
                  onChange={e => setField('agree', e.target.checked)}
                  style={{ width: 16, height: 16, marginTop: 2, accentColor: '#22c55e', flexShrink: 0 }}
                />
                <span style={{ fontSize: 13, color: '#3d6b52', lineHeight: 1.5 }}>
                  I agree to the{' '}
                  <span style={{ color: '#4ade80' }}>Terms of Service</span>
                  {' '}and{' '}
                  <span style={{ color: '#4ade80' }}>Privacy Policy</span>
                </span>
              </label>
              {errors.agree && (
                <div style={{ fontSize: 12, color: '#ef4444', marginBottom: 12 }}>
                  ⚠ {errors.agree}
                </div>
              )}

              {/* Back + Submit */}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{ width: 46, flexShrink: 0, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(74,222,128,0.12)', borderRadius: 12, color: '#4ade80', fontSize: 18, cursor: 'pointer' }}
                >
                  ←
                </button>
                <Button onClick={handleSubmit} loading={loading} style={{ flex: 1 }}>
                  Create Account 🌱
                </Button>
              </div>
            </>
          )}

          {/* Login link */}
          <p style={{ textAlign: 'center', fontSize: 14, color: '#3d6b52', marginTop: 20, marginBottom: 0 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#4ade80', fontWeight: 800 }}>
              Sign in
            </Link>
          </p>

        </Card>
      </div>
    </div>
  )
}
