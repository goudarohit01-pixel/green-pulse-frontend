import api from './axiosInstance'

const goalApi = {

  // GET /api/goals
  getAll: () => api.get('/goals').then(r => r.data),

  // POST /api/goals
  create: (data) => api.post('/goals', data).then(r => r.data),

  // DELETE /api/goals/:id
  delete: (id) => api.delete(`/goals/${id}`).then(r => r.data),
}

export default goalApi