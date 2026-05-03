import api from './api'
import type { Booking, CreateBookingData } from '@/types/booking.types'

export const bookingsService = {
  async create(data: CreateBookingData) {
    const response = await api.post('/bookings', data)
    return response.data as { booking: Booking; bookingId: string }
  },

  async getById(id: string) {
    const response = await api.get(`/bookings/${id}`)
    return response.data as Booking
  },

  async update(id: string, data: Partial<CreateBookingData>) {
    const response = await api.put(`/bookings/${id}`, data)
    return response.data as Booking
  },

  async cancel(id: string, reason?: string) {
    const response = await api.delete(`/bookings/${id}`, { data: { reason } })
    return response.data
  },

  async getMyBookings(status?: string) {
    const response = await api.get('/guest/bookings', { params: { status } })
    return response.data as Booking[]
  },

  async getUpcomingBookings() {
    const response = await api.get('/guest/bookings', { params: { status: 'upcoming' } })
    return response.data as Booking[]
  },

  async getPastBookings() {
    const response = await api.get('/guest/bookings', { params: { status: 'past' } })
    return response.data as Booking[]
  },
}