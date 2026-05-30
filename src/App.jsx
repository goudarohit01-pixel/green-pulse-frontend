import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Spinner } from './components/ui/helpers'

import AppLayout          from './components/layout/AppLayout'
import LoginPage          from './pages/LoginPage'
import RegisterPage       from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import DashboardPage      from './pages/DashboardPage'
import LogActivityPage    from './pages/LogActivityPage'
import GoalsPage          from './pages/GoalsPage'
import HistoryPage        from './pages/HistoryPage'
import ProfilePage        from './pages/ProfilePage'

// ── Protected Route ───────────────────────────────────────────
// Redirects to /login if not authenticated
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight:      '100vh',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        background:     '#050d0a',
        gap:            16,
      }}>
        <Spinner size={40} />
        <p style={{ color: '#3d6b52', fontSize: 14, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Loading Green Pulse…
        </p>
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// ── Guest Route ───────────────────────────────────────────────
// Redirects to /dashboard if already authenticated
function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />
}

// ── App Routes ────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>

      {/* Public routes */}
      <Route path="/login"
        element={<GuestRoute><LoginPage /></GuestRoute>}
      />
      <Route path="/register"
        element={<GuestRoute><RegisterPage /></GuestRoute>}
      />
      <Route path="/forgot-password"
        element={<GuestRoute><ForgotPasswordPage /></GuestRoute>}
      />

      {/* Protected routes — all rendered inside AppLayout */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/log"       element={<LogActivityPage />} />
        <Route path="/goals"     element={<GoalsPage />} />
        <Route path="/history"   element={<HistoryPage />} />
        <Route path="/profile"   element={<ProfilePage />} />
      </Route>

      {/* Default redirect */}
      <Route path="/"  element={<Navigate to="/dashboard" replace />} />
      <Route path="*"  element={<Navigate to="/dashboard" replace />} />

    </Routes>
  )
}

// ── Root App ──────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
