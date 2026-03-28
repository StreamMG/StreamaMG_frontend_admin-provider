// src/services/api.js
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // pour les cookies httpOnly (refresh token)
})

// Token store simple (mémoire uniquement — pas de localStorage)
let _token = null
export const tokenStore = {
  get: () => _token,
  set: (t) => { _token = t },
  clear: () => { _token = null },
}

// Inject Bearer token
api.interceptors.request.use((config) => {
  const token = tokenStore.get()
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  return config
})

// Auto-refresh on 401
let isRefreshing = false
let pendingQueue = []

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject })
        }).then((token) => {
          original.headers['Authorization'] = `Bearer ${token}`
          return api(original)
        })
      }

      original._retry = true
      isRefreshing = true

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {}, {
          withCredentials: true,
        })
        tokenStore.set(data.token)
        pendingQueue.forEach((p) => p.resolve(data.token))
        pendingQueue = []
        original.headers['Authorization'] = `Bearer ${data.token}`
        return api(original)
      } catch {
        pendingQueue.forEach((p) => p.reject())
        pendingQueue = []
        tokenStore.clear()
        window.location.href = '/login'
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// ── Auth ──────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
}

// ── Contents ──────────────────────────────────────────────────────
export const contentsAPI = {
  list: (params) => api.get('/contents', { params }),
  featured: () => api.get('/contents/featured'),
  trending: () => api.get('/contents/trending'),
  get: (id) => api.get(`/contents/${id}`),
  view: (id) => api.post(`/contents/${id}/view`),
  lessons: (id) => api.get(`/contents/${id}/lessons`),
}

// ── HLS ───────────────────────────────────────────────────────────
export const hlsAPI = {
  getToken: (id) => api.get(`/hls/${id}/token`),
}

// ── History ───────────────────────────────────────────────────────
export const historyAPI = {
  save: (contentId, data) => api.post(`/history/${contentId}`, data),
  list: () => api.get('/history'),
}

// ── Tutorials ─────────────────────────────────────────────────────
export const tutorialAPI = {
  updateProgress: (contentId, data) => api.post(`/tutorial/progress/${contentId}`, data),
  getProgress: () => api.get('/tutorial/progress'),
}

// ── Payments ──────────────────────────────────────────────────────
export const paymentAPI = {
  subscribe: (plan) => api.post('/payment/subscribe', { plan }),
  purchase: (contentId) => api.post('/payment/purchase', { contentId }),
  purchases: () => api.get('/payment/purchases'),
  status: () => api.get('/payment/status'),
}

// ── Provider ──────────────────────────────────────────────────────
export const providerAPI = {
  upload: (formData) => api.post('/provider/contents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  list: () => api.get('/provider/contents'),
  update: (id, data) => api.put(`/provider/contents/${id}`, data),
  updateThumbnail: (id, formData) => api.put(`/provider/contents/${id}/thumbnail`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/provider/contents/${id}`),
}

// ── Admin ─────────────────────────────────────────────────────────
export const adminAPI = {
  stats: () => api.get('/admin/stats'),
  contents: () => api.get('/admin/contents'),
  users: () => api.get('/admin/users'),
  updateContent: (id, data) => api.put(`/admin/contents/${id}`, data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
}

export default api
