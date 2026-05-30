import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/log':       'Log Activity',
  '/goals':     'Goals',
  '/history':   'History',
  '/profile':   'Profile',
}

export default function Navbar({ onMenuClick, isMobile }) {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const location         = useLocation()
  const title            = PAGE_TITLES[location.pathname] ?? 'Green Pulse'
  const isOnProfile      = location.pathname === '/profile'

  const [avatarHover,  setAvatarHover]  = useState(false)
  const [logoutHover,  setLogoutHover]  = useState(false)

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const initials = user?.name
    ?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? 'GP'

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header style={{
      display:        'flex',
      justifyContent: 'space-between',
      alignItems:     'center',
      marginBottom:   isMobile ? 20 : 32,
      gap:            10,
    }}>

      {/* Left — hamburger + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

        {/* Hamburger on mobile */}
        {isMobile && (
          <button onClick={onMenuClick}
            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: 10, width: 40, height: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, cursor: 'pointer', flexShrink: 0 }}>
            <div style={{ width: 18, height: 2, background: '#4ade80', borderRadius: 99 }} />
            <div style={{ width: 14, height: 2, background: '#4ade80', borderRadius: 99 }} />
            <div style={{ width: 18, height: 2, background: '#4ade80', borderRadius: 99 }} />
          </button>
        )}

        <div>
          <h1 style={{ fontFamily: "'Righteous', cursive", fontSize: isMobile ? 20 : 26, color: '#d1fae5', letterSpacing: '0.02em', margin: 0, lineHeight: 1.2 }}>
            {title}
          </h1>
          {!isMobile && (
            <p style={{ fontSize: 13, color: '#3d6b52', marginTop: 3, marginBottom: 0 }}>
              {today}
            </p>
          )}
        </div>
      </div>

      {/* Right — avatar + logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 10, flexShrink: 0 }}>

        {/* ── Clickable Avatar → Profile ── */}
        <div
          onClick={() => navigate('/profile')}
          onMouseEnter={() => setAvatarHover(true)}
          onMouseLeave={() => setAvatarHover(false)}
          style={{
            display:      'flex',
            alignItems:   'center',
            gap:          8,
            background:   avatarHover
              ? 'rgba(34,197,94,0.12)'
              : isOnProfile
              ? 'rgba(34,197,94,0.1)'
              : 'rgba(10,25,18,0.8)',
            border:       `1px solid ${avatarHover || isOnProfile
              ? 'rgba(74,222,128,0.35)'
              : 'rgba(74,222,128,0.1)'}`,
            borderRadius: 99,
            padding:      isMobile ? '6px 12px 6px 6px' : '7px 16px 7px 8px',
            cursor:       'pointer',
            transition:   'all 0.2s',
            // Subtle scale on hover
            transform:    avatarHover ? 'scale(1.03)' : 'scale(1)',
          }}
          title="Go to Profile"
        >
          {/* Avatar circle */}
          <div style={{
            width:          isMobile ? 28 : 34,
            height:         isMobile ? 28 : 34,
            borderRadius:   '50%',
            background:     'linear-gradient(135deg,#22c55e,#0ea5e9)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontSize:       isMobile ? 11 : 13,
            fontWeight:     800,
            color:          '#fff',
            flexShrink:     0,
            boxShadow:      avatarHover ? '0 0 12px rgba(34,197,94,0.4)' : 'none',
            transition:     'box-shadow 0.2s',
          }}>
            {initials}
          </div>

          {/* Name — hide on mobile */}
          {!isMobile && (
            <div>
              <div style={{ fontSize: 13, color: avatarHover ? '#4ade80' : '#8ab89a', fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.2, transition: 'color 0.2s' }}>
                {user?.name?.split(' ')[0] ?? 'User'}
              </div>
              {avatarHover && (
                <div style={{ fontSize: 10, color: '#3d6b52', marginTop: 1 }}>
                  View Profile →
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Logout button ── */}
        <button
          onClick={handleLogout}
          onMouseEnter={() => setLogoutHover(true)}
          onMouseLeave={() => setLogoutHover(false)}
          style={{
            display:      'flex',
            alignItems:   'center',
            gap:          isMobile ? 0 : 6,
            background:   logoutHover ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.08)',
            border:       `1px solid ${logoutHover ? 'rgba(239,68,68,0.4)' : 'rgba(239,68,68,0.2)'}`,
            borderRadius: 10,
            padding:      isMobile ? '8px 12px' : '9px 16px',
            color:        '#ef4444',
            fontSize:     13,
            fontWeight:   600,
            cursor:       'pointer',
            fontFamily:   "'Plus Jakarta Sans', sans-serif",
            transition:   'all 0.2s',
            transform:    logoutHover ? 'scale(1.03)' : 'scale(1)',
            whiteSpace:   'nowrap',
          }}
          title="Logout"
        >
          <span style={{ fontSize: 15 }}>→</span>
          {!isMobile && ' Logout'}
        </button>

      </div>
    </header>
  )
}
