import api from './axiosInstance'

const dashboardApi = {

  // GET /api/dashboard/summary
  // Returns today CO2, weekly trend, category breakdown, streak etc
  getSummary: () => api.get('/dashboard/summary').then(r => r.data),
}

export default dashboardApi