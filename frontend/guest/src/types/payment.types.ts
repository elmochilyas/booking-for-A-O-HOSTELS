export interface PaymentIntent {
  id: string
  bookingId: string
  amount: number
  currency: string
  status: PaymentIntentStatus
  clientSecret: string
  createdAt: string
}

export type PaymentIntentStatus = 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled'

export interface Payment {
  id: string
  bookingId: string
  amount: number
  currency: string
  method: PaymentMethod
  status: PaymentStatus
  transactionId?: string
  createdAt: string
}

export type PaymentMethod = 'card' | 'paypal' | 'apple_pay' | 'google_pay'
export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded'

export interface CreatePaymentIntentData {
  bookingId: string
  amount: number
  depositPercentage?: number
}

export interface PaymentResult {
  success: boolean
  paymentId?: string
  error?: string
}