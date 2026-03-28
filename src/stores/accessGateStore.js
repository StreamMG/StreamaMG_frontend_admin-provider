// src/stores/accessGateStore.js
import { create } from 'zustand'

export const useAccessGateStore = create((set) => ({
  visible: false,
  reason: null,   // 'subscription_required' | 'purchase_required' | 'login_required'
  price: null,
  contentId: null,

  show: ({ reason, price = null, contentId = null }) =>
    set({ visible: true, reason, price, contentId }),

  hide: () => set({ visible: false, reason: null, price: null, contentId: null }),
}))
