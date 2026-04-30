// src/stores/authStore.js
import { create } from 'zustand'
import { authAPI, tokenStore } from '../services/api'

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const { data } = await authAPI.login({ email, password })
      tokenStore.set(data.token)
      set({ user: data.user, token: data.token, loading: false })
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur de connexion'
      set({ error: msg, loading: false })
      return { success: false, error: msg }
    }
  },

  register: async (username, email, password) => {
    set({ loading: true, error: null })
    try {
      const { data } = await authAPI.register({ username, email, password })
      tokenStore.set(data.token)
      set({ user: data.user, token: data.token, loading: false })
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur inscription'
      set({ error: msg, loading: false })
      return { success: false, error: msg }
    }
  },

  logout: async () => {
    try {
      await authAPI.logout()
    } catch {}
    tokenStore.clear()
    set({ user: null, token: null })
  },

  clearError: () => set({ error: null }),

  // Helpers de vérification
  isAuthenticated: () => !!get().user,

  isPremium: () => get().user?.isPremium === true,

  isAdmin: () => get().user?.role === 'admin',

  isProvider: () => get().user?.role === 'provider',

  canAccessProvider: () => {
    const role = get().user?.role
    return role === 'provider' || role === 'admin'
  },
}))