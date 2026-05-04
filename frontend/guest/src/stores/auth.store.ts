import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Guest, AuthState } from '@/types/guest.types'
import { authService } from '@/services/auth.service'

interface AuthStore extends AuthState {
  setAuth: (guest: Guest, token: string) => void
  clearAuth: () => void
  setLoading: (loading: boolean) => void
  refreshGuest: () => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      guest: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      setAuth: (guest, token) => {
        localStorage.setItem('guest_token', token)
        localStorage.setItem('guest', JSON.stringify(guest))
        set({ guest, token, isAuthenticated: true, isLoading: false })
      },

      clearAuth: () => {
        localStorage.removeItem('guest_token')
        localStorage.removeItem('guest')
        set({ guest: null, token: null, isAuthenticated: false })
      },

      setLoading: (isLoading) => set({ isLoading }),

      refreshGuest: async () => {
        try {
          const user = await authService.getCurrentUser()
          set({ guest: user, isAuthenticated: true })
        } catch (error) {
          get().clearAuth()
        }
      },

      logout: () => {
        authService.logout()
        get().clearAuth()
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, guest: state.guest, isAuthenticated: state.isAuthenticated }),
    }
  )
)