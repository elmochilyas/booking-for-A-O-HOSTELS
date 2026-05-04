import api from './api'
import type { Payment, CreatePaymentIntentData, PaymentIntent } from '@/types/payment.types'

export const paymentsService = {
  async createIntent(data: CreatePaymentIntentData) {
    const response = await api.post('/payments/create-intent', data)
    return response.data as PaymentIntent
  },

  async getBookingPayments(bookingId: string) {
    const response = await api.get(`/payments/booking/${bookingId}`)
    return response.data as Payment[]
  },

  async confirmPayment(paymentIntentId: string) {
    const response = await api.post(`/payments/${paymentIntentId}/confirm`)
    return response.data
  },

  async getInvoice(bookingId: string) {
    const response = await api.get(`/invoices/${bookingId}`, { responseType: 'blob' })
    return response.data
  },
}