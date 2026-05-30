import api from './axiosInstance'

const userApi = {

  // GET /api/users/me
  getProfile: () => api.get('/users/me').then(r => r.data),

  // PUT /api/users/me
  updateProfile: (data) => api.put('/users/me', data).then(r => r.data),

  // DELETE /api/users/me
  deleteAccount: () => api.delete('/users/me').then(r => r.data),
}

export default userApi