'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingsService } from '@/services/bookings.service'
import { paymentsService } from '@/services/payments.service'
import { useBookingStore } from '@/stores/booking.store'
import type { CreateBookingData, Booking } from '@/types/booking.types'

export function useBooking(id: string) {
  return useQuery<Booking>({
    queryKey: ['booking', id],
    queryFn: () => bookingsService.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  })
}

export function useMyBookings(status?: string) {
  return useQuery<Booking[]>({
    queryKey: ['myBookings', status],
    queryFn: () => bookingsService.getMyBookings(status),
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateBooking() {
  const queryClient = useQueryClient()
  const { clearBooking } = useBookingStore()

  return useMutation({
    mutationFn: (data: CreateBookingData) => bookingsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBookings'] })
      clearBooking()
    },
  })
}

export function useCancelBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => bookingsService.cancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBookings'] })
      queryClient.invalidateQueries({ queryKey: ['booking'] })
    },
  })
}

export function usePaymentIntent() {
  return useMutation({
    mutationFn: (data: { bookingId: string; amount: number; depositPercentage?: number }) =>
      paymentsService.createIntent(data),
  })
}