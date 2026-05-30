import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

// Base axios instance pointing to Spring Boot backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gp_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto logout if token expires
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('gp_token')
      localStorage.removeItem('gp_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export { api }

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session from localStorage on page load
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('gp_token')
      const savedUser  = localStorage.getItem('gp_user')
      if (savedToken && savedUser) {
        setUser(JSON.parse(savedUser))
      }
    } catch {
      localStorage.removeItem('gp_token')
      localStorage.removeItem('gp_user')
    }
    setLoading(false)
  }, [])

  // ── Register — calls POST /api/auth/register ─────────────
  const register = useCallback(async (formData) => {
    const response = await api.post('/auth/register', {
      name:     formData.name,
      email:    formData.email,
      password: formData.password,
      country:  formData.country  || null,
      diet:     formData.diet     || null,
      vehicle:  formData.vehicle  || null,
    })

    const data = response.data
    // data = { token, userId, name, email }

    localStorage.setItem('gp_token', data.token)
    localStorage.setItem('gp_user', JSON.stringify({
      id:    data.userId,
      name:  data.name,
      email: data.email,
    }))

    setUser({ id: data.userId, name: data.name, email: data.email })
    return data
  }, [])

  // ── Login — calls POST /api/auth/login ───────────────────
  const login = useCallback(async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    const data = response.data

    localStorage.setItem('gp_token', data.token)
    localStorage.setItem('gp_user', JSON.stringify({
      id:    data.userId,
      name:  data.name,
      email: data.email,
    }))

    setUser({ id: data.userId, name: data.name, email: data.email })
    return data
  }, [])

  // ── Logout ───────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('gp_token')
    localStorage.removeItem('gp_user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      register,
      login,
      logout,
      api,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
