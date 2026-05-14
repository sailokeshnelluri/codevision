import axios from 'axios'
import { useAuthStore } from '../hooks/useAuthStore'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
})

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(err)
  }
)

// ─── Auth ────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login',    data),
  me:       ()     => api.get('/auth/me'),
}

// ─── Code execution ──────────────────────────────────────
export const codeAPI = {
  run: (code, language) =>
    api.post('/run-code', { code, language }),

  visualize: (code, language) =>
    api.post('/visualize', { code, language }),

  explain: (code, language, line, context) =>
    api.post('/explain', { code, language, line, context }),
}

// ─── Projects ────────────────────────────────────────────
export const projectsAPI = {
  list:   ()         => api.get('/projects'),
  get:    (id)       => api.get(`/projects/${id}`),
  create: (data)     => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id)       => api.delete(`/projects/${id}`),
}

export default api
