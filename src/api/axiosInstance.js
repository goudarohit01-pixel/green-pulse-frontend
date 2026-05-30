import axios from 'axios'

// Single axios instance used across all API calls
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gp_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 - auto logout
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

export default api