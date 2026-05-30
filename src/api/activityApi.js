import api from './axiosInstance'

const activityApi = {

  // POST /api/activities
  // Log a new carbon activity
  log: (data) => api.post('/activities', data).then(r => r.data),

  // GET /api/activities?from=&to=&category=
  // Get all activities with optional filters
  getAll: (params = {}) => api.get('/activities', { params }).then(r => r.data),

  // DELETE /api/activities/:id
  delete: (id) => api.delete(`/activities/${id}`).then(r => r.data),
}

export default activityApi