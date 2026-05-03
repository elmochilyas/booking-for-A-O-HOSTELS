import api from './api'

export const authService = {
  async login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password })
    if (response.data.access_token) {
      localStorage.setItem('guest_token', response.data.access_token)
      localStorage.setItem('guest', JSON.stringify(response.data.user))
    }
    return response.data
  },

  async register(data: {
    first_name: string
    last_name: string
    email: string
    password: string
    password_confirmation: string
    date_of_birth?: string
    country?: string
    phone?: string
  }) {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  async logout() {
    try {
      await api.post('/auth/logout')
    } catch (e) {}
    localStorage.removeItem('guest_token')
    localStorage.removeItem('guest')
  },

  async verifyEmail(token: string) {
    const response = await api.post('/auth/verify-email', { token })
    return response.data
  },

  async forgotPassword(email: string) {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  },

  async resetPassword(token: string, password: string, passwordConfirmation: string) {
    const response = await api.post('/auth/reset-password', {
      token,
      password,
      password_confirmation: passwordConfirmation,
    })
    return response.data
  },

  async getCurrentUser() {
    const response = await api.get('/guest/profile')
    return response.data
  },
}