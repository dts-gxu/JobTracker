import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
}

export const applicationApi = {
  getAll: (params) => api.get('/applications', { params }),
  getById: (id) => api.get(`/applications/${id}`),
  create: (data) => api.post('/applications', data),
  update: (id, data) => api.put(`/applications/${id}`, data),
  delete: (id) => api.delete(`/applications/${id}`),
  toggleStar: (id) => api.post(`/applications/${id}/toggle-star`),
  getStats: () => api.get('/applications/stats'),
}

export const resumeApi = {
  getAll: () => api.get('/resumes'),
  upload: (formData) => api.post('/resumes', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/resumes/${id}`),
  setDefault: (id) => api.post(`/resumes/${id}/set-default`),
}

export const templateApi = {
  getAll: () => api.get('/templates'),
  create: (data) => api.post('/templates', data),
  delete: (id) => api.delete(`/templates/${id}`),
}

export const exportApi = {
  excel: () => api.get('/export/excel', { responseType: 'blob' }),
}

export default api
