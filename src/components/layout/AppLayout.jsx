import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar  from './Navbar'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile,    setIsMobile]    = useState(window.innerWidth < 768)

  // Detect screen size on resize
  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) setSidebarOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Close sidebar when clicking outside on mobile
  function handleOverlayClick() {
    setSidebarOpen(false)
  }

  return (
    <div style={{
      display:    'flex',
      minHeight:  '100vh',
      background: 'var(--bg)',
      position:   'relative',
    }}>

      {/* ── Mobile overlay backdrop ── */}
      {isMobile && sidebarOpen && (
        <div
          onClick={handleOverlayClick}
          style={{
            position:   'fixed',
            inset:      0,
            background: 'rgba(0,0,0,0.6)',
            zIndex:     40,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* ── Sidebar ── */}
      <div style={{
        // Desktop: always visible
        // Mobile: slide in from left
        position:   isMobile ? 'fixed' : 'sticky',
        top:        0,
        left:       isMobile ? (sidebarOpen ? 0 : '-100%') : 0,
        height:     '100vh',
        zIndex:     50,
        transition: 'left 0.3s ease',
        flexShrink: 0,
      }}>
        <Sidebar onClose={() => setSidebarOpen(false)} isMobile={isMobile} />
      </div>

      {/* ── Main content ── */}
      <main style={{
        flex:     1,
        overflow: 'auto',
        // On mobile sidebar is fixed so no margin needed
        marginLeft: isMobile ? 0 : 0,
      }}>
        <div style={{
          maxWidth: 1100,
          padding:  isMobile ? '20px 16px' : '32px 36px',
          margin:   '0 auto',
        }}>
          <Navbar
            onMenuClick={() => setSidebarOpen(true)}
            isMobile={isMobile}
          />
          <div className="page-enter">
            <Outlet />
          </div>
        </div>
      </main>

    </div>
  )
}
