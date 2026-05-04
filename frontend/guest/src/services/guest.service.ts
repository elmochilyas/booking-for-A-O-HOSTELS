import api from './api'
import type { GuestProfile, LoyaltyInfo, NotificationPreferences } from '@/types/guest.types'

export type { LoyaltyInfo }

export const guestService = {
  async getProfile() {
    const response = await api.get('/guest/profile')
    return response.data as GuestProfile
  },

  async updateProfile(data: Partial<GuestProfile>) {
    const response = await api.put('/guest/profile', data)
    return response.data as GuestProfile
  },

  async updatePassword(currentPassword: string, newPassword: string) {
    const response = await api.post('/guest/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    })
    return response.data
  },

  async deleteAccount() {
    const response = await api.delete('/guest/account')
    return response.data
  },

  async updateNotificationPreferences(prefs: NotificationPreferences) {
    const response = await api.put('/guest/notifications', prefs)
    return response.data
  },

  async getLoyalty() {
    const response = await api.get('/guest/loyalty')
    return response.data as LoyaltyInfo
  },

  async redeemPoints(points: number, description: string) {
    const response = await api.post('/guest/loyalty/redeem', { points, description })
    return response.data
  },
}