import api from './axiosInstance'

const badgeApi = {
  // GET /api/badges
  // Returns list of badges with earned status
  getAll: () => api.get('/badges').then(r => r.data),
}

export default badgeApi
