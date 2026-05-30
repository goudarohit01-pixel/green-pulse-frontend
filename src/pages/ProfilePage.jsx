import { useState, useEffect, useRef } from 'react'
import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useAuth } from '../context/AuthContext'
import Card   from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input  from '../components/ui/Input'
import { Badge, Toast, Spinner } from '../components/ui/helpers'
import userApi    from '../api/userApi'
import dashboardApi from '../api/dashboardApi'
import BadgesTab from '../components/BadgesTab'

const DIETS     = ['OMNIVORE', 'FLEXITARIAN', 'VEGETARIAN', 'VEGAN']
const COUNTRIES = ['United Kingdom','United States','Germany','France','India','Australia','Canada','Other']

const COMPARE = [
  { label: 'Your Footprint', color: '#4ade80' },
  { label: 'UK Average',     value: 95,  color: '#22d3ee' },
  { label: 'Global Average', value: 117, color: '#a78bfa' },
  { label: '1.5C Target',    value: 42,  color: '#fb923c' },
]

const BADGES = [
  { icon: '🌱', label: 'First Log',      desc: 'Logged your first activity',      earned: true  },
  { icon: '🚴', label: 'Bike Week',      desc: '7 days zero transport emissions', earned: true  },
  { icon: '🥗', label: 'Plant Powered',  desc: '30 days meat-free meals',         earned: true  },
  { icon: '⚡', label: 'Energy Saver',   desc: '20% below energy average',        earned: false },
  { icon: '🌍', label: 'Carbon Neutral', desc: 'Net zero for a full month',       earned: false },
  { icon: '🏆', label: 'Top 10%',        desc: 'Top 10% lowest footprint',        earned: false },
]

function getInitials(name) {
  if (!name || !name.trim()) return 'GP'
  const parts = name.trim().split(' ').filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = e => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function ProfilePage() {
  const { user, logout } = useAuth()

  const [tab,       setTab]       = useState('info')
  const [editing,   setEditing]   = useState(false)
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [toast,     setToast]     = useState(null)
  const [dashData,  setDashData]  = useState(null)

  const [profile, setProfile] = useState(null)
  const [draft,   setDraft]   = useState(null)

  const [bannerImg, setBannerImg] = useState(() => localStorage.getItem('gp_banner') || null)
  const [avatarImg, setAvatarImg] = useState(() => localStorage.getItem('gp_avatar') || null)
  const [bannerHover, setBannerHover] = useState(false)
  const [avatarHover, setAvatarHover] = useState(false)

  const bannerRef = useRef(null)
  const avatarRef = useRef(null)

  useEffect(() => {
    loadProfile()
    loadDashboard()
  }, [])

  async function loadProfile() {
    try {
      setLoading(true)
      const data = await userApi.getProfile()
      setProfile(data)
      setDraft({
        name:    data.name    || '',
        country: data.country || '',
        bio:     data.bio     || '',
        diet:    data.diet    || '',
      })
    } catch (err) {
      showToast('Failed to load profile', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function loadDashboard() {
    try {
      const data = await dashboardApi.getSummary()
      setDashData(data)
    } catch { /* ignore */ }
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  async function save() {
    setSaving(true)
    try {
      const updated = await userApi.updateProfile({
        name:    draft.name,
        country: draft.country,
        bio:     draft.bio,
        diet:    draft.diet || null,
      })
      setProfile(updated)
      setEditing(false)
      showToast('Profile saved successfully')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  function cancel() {
    setDraft({ name: profile.name || '', country: profile.country || '', bio: profile.bio || '', diet: profile.diet || '' })
    setEditing(false)
  }

  // Banner upload
  async function handleBannerChange(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { showToast('Image must be under 5MB', 'error'); return }
    const dataUrl = await readFile(file)
    setBannerImg(dataUrl)
    localStorage.setItem('gp_banner', dataUrl)
  }

  // Avatar upload
  async function handleAvatarChange(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { showToast('Image must be under 2MB', 'error'); return }
    const dataUrl = await readFile(file)
    setAvatarImg(dataUrl)
    localStorage.setItem('gp_avatar', dataUrl)
  }

  const initials = getInitials(profile?.name || user?.name || '')

  const joinDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : 'Unknown'

  // Build monthly trend from dashboard data
  const monthlyTrend = dashData?.weeklyTrend?.map(p => ({
    m:  new Date(p.date).toLocaleDateString('en-GB', { weekday: 'short' }),
    v:  Number(p.co2eKg).toFixed(1),
  })) || []

  const myFootprint = Number(dashData?.monthCo2eKg || 0).toFixed(1)

  const compareData = [
    { label: 'Your Footprint', value: parseFloat(myFootprint), color: '#4ade80' },
    { label: 'UK Average',     value: 95,   color: '#22d3ee' },
    { label: 'Global Average', value: 117,  color: '#a78bfa' },
    { label: '1.5C Target',    value: 42,   color: '#fb923c' },
  ]

  const lbl = { display: 'block', fontSize: 12, fontWeight: 700, color: '#3d6b52', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 7 }
  const sel = { width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(74,222,128,0.12)', borderRadius: 10, padding: '11px 14px', color: '#d1fae5', fontSize: 14, outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif", appearance: 'none' }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <Spinner size={40} />
    </div>
  )

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Hidden file inputs */}
      <input ref={bannerRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBannerChange} />
      <input ref={avatarRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />

      {/* ── Profile Card ── */}
      <Card style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>

        {/* Banner */}
        <div
          style={{ height: 130, position: 'relative', overflow: 'hidden', cursor: 'pointer', background: bannerImg ? 'transparent' : 'linear-gradient(135deg, #052e14 0%, #0a2540 55%, #050d1a 100%)' }}
          onMouseEnter={() => setBannerHover(true)}
          onMouseLeave={() => setBannerHover(false)}
        >
          {bannerImg && <img src={bannerImg} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          {!bannerImg && (
            <>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 15% 60%, rgba(34,197,94,0.2) 0%, transparent 55%)' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 40%, rgba(34,211,238,0.1) 0%, transparent 50%)' }} />
              <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 40, opacity: 0.12 }} viewBox="0 0 800 40" preserveAspectRatio="none">
                <path d="M0 20 L100 20 L140 5 L180 35 L220 5 L260 35 L300 20 L800 20" stroke="#4ade80" strokeWidth="1.5" fill="none" />
              </svg>
            </>
          )}
          {bannerHover && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <button onClick={() => bannerRef.current.click()}
                style={{ background: 'rgba(34,197,94,0.9)', border: 'none', borderRadius: 8, padding: '8px 16px', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                📷 {bannerImg ? 'Change Banner' : 'Add Banner'}
              </button>
              {bannerImg && (
                <button onClick={e => { e.stopPropagation(); setBannerImg(null); localStorage.removeItem('gp_banner') }}
                  style={{ background: 'rgba(239,68,68,0.9)', border: 'none', borderRadius: 8, padding: '8px 14px', color: '#fff', fontSize: 13, cursor: 'pointer' }}>
                  ✕ Remove
                </button>
              )}
            </div>
          )}
          {/* Edit button */}
          <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }} onMouseEnter={e => e.stopPropagation()}>
            {editing ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="secondary" onClick={cancel} size="sm">Cancel</Button>
                <Button onClick={save} loading={saving} size="sm">Save Changes</Button>
              </div>
            ) : (
              <Button variant="secondary" onClick={() => setEditing(true)} size="sm">✎ Edit Profile</Button>
            )}
          </div>
        </div>

        {/* Avatar + Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '20px 24px 24px', background: 'rgba(10,25,18,0.95)' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}
            onMouseEnter={() => setAvatarHover(true)}
            onMouseLeave={() => setAvatarHover(false)}>
            <div style={{ width: 80, height: 80, borderRadius: 20, background: avatarImg ? 'transparent' : 'linear-gradient(135deg,#16a34a,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#fff', border: '3px solid rgba(74,222,128,0.3)', overflow: 'hidden', cursor: 'pointer' }}>
              {avatarImg ? <img src={avatarImg} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
            </div>
            {avatarHover && (
              <div onClick={() => avatarRef.current.click()}
                style={{ position: 'absolute', inset: 0, borderRadius: 20, background: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <span style={{ fontSize: 18 }}>📷</span>
                <span style={{ fontSize: 9, color: '#fff', fontWeight: 700 }}>{avatarImg ? 'Change' : 'Add'}</span>
              </div>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Righteous', cursive", fontSize: 22, color: '#d1fae5', marginBottom: 6 }}>
              {profile?.name || user?.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: '#3d6b52' }}>🌍 {profile?.country || 'Not set'}</span>
              <span style={{ color: '#1e3a26' }}>·</span>
              <span style={{ fontSize: 13, color: '#3d6b52' }}>Member since {joinDate}</span>
              <span style={{ color: '#1e3a26' }}>·</span>
              <Badge color="#4ade80">{dashData?.currentStreakDays || 0} day streak 🔥</Badge>
            </div>
          </div>

          {/* Quick stats */}
          <div style={{ display: 'flex', gap: 28, flexShrink: 0 }}>
            {[
              { label: 'Activities', value: dashData?.totalActivities || 0,          color: '#fb923c' },
              { label: 'This Month', value: `${myFootprint} kg`,                      color: '#4ade80' },
              { label: 'All Time',   value: `${Number(dashData?.allTimeCo2eKg || 0).toFixed(0)} kg`, color: '#22d3ee' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: s.color, fontFamily: "'Righteous', cursive" }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#3d6b52', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Tip */}
      <div style={{ fontSize: 12, color: '#2a4a38', marginBottom: 20 }}>
        💡 Hover over banner or avatar to upload a photo
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 4, background: 'rgba(10,25,18,0.7)', borderRadius: 12, padding: 5, width: 'fit-content', marginBottom: 24 }}>
        {[['info','👤','Info'],['stats','📊','Stats'],['badges','🏅','Badges']].map(([id, icon, label]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ background: tab===id ? 'rgba(34,197,94,0.15)':'transparent', border: tab===id ? '1px solid rgba(74,222,128,0.25)':'1px solid transparent', borderRadius: 9, padding: '9px 20px', color: tab===id ? '#4ade80':'#3d6b52', fontSize: 13, fontWeight: tab===id ? 700:500, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>{icon}</span>{label}
          </button>
        ))}
      </div>

      {/* ── INFO TAB ── */}
      {tab === 'info' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 18 }}>
          <Card style={{ padding: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#3d6b52', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 18 }}>Personal Info</div>
            {editing ? (
              <>
                <Input label="Full Name" icon="👤" placeholder="Your full name" value={draft.name} onChange={e => setDraft(d => ({...d, name: e.target.value}))} />
                <div style={{ marginBottom: 16 }}>
                  <label style={lbl}>Country</label>
                  <select value={draft.country} onChange={e => setDraft(d => ({...d, country: e.target.value}))} style={sel}>
                    <option value="">Select country</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={lbl}>Diet Type</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {DIETS.map(d => (
                      <button key={d} type="button" onClick={() => setDraft(dr => ({...dr, diet: d}))}
                        style={{ background: draft.diet===d ? 'rgba(34,197,94,0.15)':'rgba(255,255,255,0.02)', border: `1px solid ${draft.diet===d ? 'rgba(74,222,128,0.5)':'rgba(74,222,128,0.08)'}`, borderRadius: 8, padding: '9px', color: draft.diet===d ? '#4ade80':'#3d6b52', fontSize: 12, fontWeight: draft.diet===d ? 700:500, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {d.charAt(0) + d.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <Input label="Bio" value={draft.bio} onChange={e => setDraft(d => ({...d, bio: e.target.value}))} />
              </>
            ) : (
              [
                ['👤 Name',    profile?.name    || 'Not set'],
                ['✉️ Email',   profile?.email   || user?.email || ''],
                ['🌍 Country', profile?.country || 'Not set'],
                ['🥗 Diet',    profile?.diet    ? profile.diet.charAt(0) + profile.diet.slice(1).toLowerCase() : 'Not set'],
                ['📝 Bio',     profile?.bio     || 'Not set'],
              ].map(([label, value], i) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: i < 4 ? '1px solid rgba(74,222,128,0.05)':'none', gap: 12 }}>
                  <span style={{ fontSize: 13, color: '#3d6b52', flexShrink: 0 }}>{label}</span>
                  <span style={{ fontSize: 13, color: '#8ab89a', fontWeight: 500, textAlign: 'right', wordBreak: 'break-word' }}>{value}</span>
                </div>
              ))
            )}
          </Card>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card style={{ padding: 22 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#3d6b52', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>Account</div>
              {[
                ['Member Since', joinDate],
                ['Plan',         'Free Tier'],
                ['Streak',       `${dashData?.currentStreakDays || 0} days 🔥`],
                ['Total CO2',    `${Number(dashData?.allTimeCo2eKg || 0).toFixed(1)} kg`],
              ].map(([l, v], i) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '9px 0', borderBottom: i < 3 ? '1px solid rgba(74,222,128,0.05)':'none' }}>
                  <span style={{ color: '#3d6b52' }}>{l}</span>
                  <span style={{ color: '#8ab89a', fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}

      {/* ── STATS TAB ── */}
      {tab === 'stats' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Card style={{ padding: '22px 24px' }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 18, color: '#8ab89a' }}>
              Weekly CO2 Trend <span style={{ fontSize: 12, color: '#3d6b52', fontWeight: 400 }}>(kg CO2e)</span>
            </div>
            {monthlyTrend.length === 0 ? (
              <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3d6b52' }}>No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={monthlyTrend} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(74,222,128,0.05)" />
                  <XAxis dataKey="m" stroke="#2a4a38" tick={{ fontSize: 12, fill: '#3d6b52' }} />
                  <YAxis              stroke="#2a4a38" tick={{ fontSize: 12, fill: '#3d6b52' }} />
                  <Tooltip contentStyle={{ background: '#0a1912', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 8, color: '#d1fae5' }} formatter={v => [`${v} kg`, 'CO2e']} />
                  <Bar dataKey="v" radius={[6,6,0,0]} fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card style={{ padding: '22px 24px' }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 18, color: '#8ab89a' }}>How You Compare</div>
            {compareData.map((r, i) => (
              <div key={i} style={{ marginBottom: i < compareData.length - 1 ? 16 : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span style={{ color: '#8ab89a' }}>{r.label}</span>
                  <span style={{ color: r.color, fontWeight: 700 }}>{r.value} kg</span>
                </div>
                <div style={{ height: 7, background: 'rgba(74,222,128,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min((r.value / 150) * 100, 100)}%`, height: '100%', background: r.color, borderRadius: 99 }} />
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* ── BADGES TAB ── */}
      {/* {tab === 'badges' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 16 }}>
            {BADGES.map((b, i) => (
              <Card key={i} className="hover-lift"
                style={{ padding: '24px 16px', textAlign: 'center', opacity: b.earned ? 1 : 0.45, border: `1px solid ${b.earned ? 'rgba(74,222,128,0.15)':'rgba(74,222,128,0.04)'}` }}>
                <div style={{ width: 54, height: 54, borderRadius: 16, background: b.earned ? 'rgba(34,197,94,0.1)':'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 12px', filter: b.earned ? 'none':'grayscale(1)' }}>
                  {b.icon}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: b.earned ? '#d1fae5':'#3d6b52', marginBottom: 4 }}>{b.label}</div>
                <div style={{ fontSize: 11, color: '#3d6b52', marginBottom: 10, lineHeight: 1.4 }}>{b.desc}</div>
                <Badge color={b.earned ? '#4ade80':'#2a4a38'}>{b.earned ? '✓ Earned':'🔒 Locked'}</Badge>
              </Card>
            ))}
          </div>
          <Card style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#d1fae5' }}>3 of 6 badges earned</div>
              <div style={{ fontSize: 12, color: '#3d6b52', marginTop: 3 }}>Keep logging to unlock more</div>
            </div>
            <div style={{ display: 'flex' }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ width: 14, height: 14, borderRadius: '50%', background: i < 3 ? '#4ade80':'rgba(74,222,128,0.1)', border: '2px solid #050d0a', marginLeft: i > 0 ? -4:0 }} />
              ))}
            </div>
          </Card>
        </div>
      )} */}
      {/* import BadgesTab from '../BadgesTab' */}

{/* // Inside the tab content: */}
      {tab === 'badges' && <BadgesTab />}

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  )
}
