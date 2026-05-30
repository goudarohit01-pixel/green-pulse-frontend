import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import GreenPulseLogo from '../GreenPulseLogo'
import goalApi        from '../../api/goalApi'
import dashboardApi   from '../../api/dashboardApi'

const NAV = [
  { to: '/dashboard', icon: '⬡', label: 'Dashboard'    },
  { to: '/log',       icon: '+', label: 'Log Activity'  },
  { to: '/goals',     icon: '◎', label: 'Goals'         },
  { to: '/history',   icon: '≡', label: 'History'       },
  { to: '/profile',   icon: '◑', label: 'Profile'       },
]

export default function Sidebar({ onClose, isMobile }) {
  const [weeklyUsed, setWeeklyUsed] = useState(0)
  const [weeklyGoal, setWeeklyGoal] = useState(null)
  const [goalTitle,  setGoalTitle]  = useState('Weekly Goal')
  const [loading,    setLoading]    = useState(true)

  useEffect(() => { loadGoalData() }, [])

  async function loadGoalData() {
    try {
      setLoading(true)
      const [goals, dashboard] = await Promise.all([
        goalApi.getAll(),
        dashboardApi.getSummary(),
      ])
      const wg = goals.find(g => g.period === 'WEEKLY')
      if (wg) {
        setWeeklyGoal(Number(wg.targetCo2eKg))
        setWeeklyUsed(Number(wg.usedCo2eKg))
        setGoalTitle(wg.title || 'Weekly Goal')
      } else if (dashboard) {
        setWeeklyUsed(Number(dashboard.weekCo2eKg || 0))
        setWeeklyGoal(100)
        setGoalTitle('This Week')
      }
    } catch {
      setWeeklyUsed(0)
      setWeeklyGoal(100)
    } finally {
      setLoading(false)
    }
  }

  const pct      = weeklyGoal > 0 ? Math.min((weeklyUsed / weeklyGoal) * 100, 100) : 0
  const near     = pct >= 85
  const barColor = near
    ? 'linear-gradient(90deg,#fb923c,#ef4444)'
    : pct >= 60
    ? 'linear-gradient(90deg,#fbbf24,#fb923c)'
    : 'linear-gradient(90deg,#22c55e,#4ade80)'

  return (
    <aside style={{
      width:        230,
      background:   'rgba(5,12,9,0.99)',
      borderRight:  '1px solid rgba(74,222,128,0.08)',
      display:      'flex',
      flexDirection:'column',
      height:       '100vh',
      overflowY:    'auto',
    }}>

      {/* Logo + close button on mobile */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(74,222,128,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <GreenPulseLogo size={34} textSize={15} />
        {isMobile && (
          <button onClick={onClose}
            style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4ade80', fontSize: 16, cursor: 'pointer' }}>
            ✕
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '14px 10px' }}>
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={isMobile ? onClose : undefined}
            style={({ isActive }) => ({
              display:        'flex',
              alignItems:     'center',
              gap:            10,
              padding:        '11px 12px',
              borderRadius:   10,
              marginBottom:   3,
              background:     isActive ? 'rgba(34,197,94,0.12)' : 'transparent',
              color:          isActive ? '#4ade80' : '#3d6b52',
              fontFamily:     "'Plus Jakarta Sans', sans-serif",
              fontSize:       14,
              fontWeight:     isActive ? 700 : 500,
              textDecoration: 'none',
              transition:     'all 0.15s',
              border:         isActive ? '1px solid rgba(74,222,128,0.15)' : '1px solid transparent',
            })}
          >
            {({ isActive }) => (
              <>
                <span style={{ fontSize: 17, width: 22, textAlign: 'center' }}>{item.icon}</span>
                {item.label}
                {isActive && (
                  <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80' }} />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Weekly goal widget */}
      <div style={{ padding: 12, borderTop: '1px solid rgba(74,222,128,0.08)' }}>
        <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(74,222,128,0.12)', borderRadius: 12, padding: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#3d6b52', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span>{goalTitle}</span>
            {near && <span style={{ color: '#fb923c' }}>⚠ Near limit</span>}
          </div>
          <div style={{ height: 6, background: 'rgba(74,222,128,0.08)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: 99, transition: 'width 0.6s' }} />
          </div>
          <div style={{ fontSize: 12, color: '#3d6b52', marginTop: 6 }}>
            {loading ? (
              <span style={{ color: '#2a4a38' }}>Loading...</span>
            ) : weeklyGoal ? (
              <>
                <span style={{ color: near ? '#fb923c' : '#4ade80', fontWeight: 700 }}>{weeklyUsed.toFixed(1)}</span>
                {' / '}{weeklyGoal.toFixed(0)} kg CO₂e
                <span style={{ float: 'right', color: near ? '#fb923c' : '#3d6b52' }}>{pct.toFixed(0)}%</span>
              </>
            ) : (
              <span style={{ color: '#2a4a38', fontSize: 11 }}>No weekly goal set</span>
            )}
          </div>
        </div>
      </div>

    </aside>
  )
}
