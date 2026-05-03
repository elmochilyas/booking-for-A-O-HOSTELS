import { create } from 'zustand'
import type { BookingCart, CartExtra, GuestDetails } from '@/types/booking.types'
import { calculateNights } from '@/lib/utils'

interface BookingStore {
  cart: BookingCart | null
  setProperty: (propertyId: string, propertyName: string, propertyImage: string) => void
  setDates: (checkIn: string, checkOut: string) => void
  setGuests: (guests: number) => void
  setRoom: (roomTypeId: string, roomTypeName: string, pricePerNight: number) => void
  addExtra: (extra: CartExtra) => void
  removeExtra: (extraId: string) => void
  setPromoCode: (code: string, discount: number) => void
  setGuestDetails: (details: GuestDetails) => void
  setPaymentMethod: (method: 'full' | 'deposit') => void
  calculateTotals: () => void
  clearBooking: () => void
}

const initialCart: BookingCart = {
  propertyId: '',
  propertyName: '',
  propertyImage: '',
  checkIn: '',
  checkOut: '',
  guests: 1,
  nights: 0,
  selectedRoomTypeId: '',
  selectedRoomTypeName: '',
  roomPrice: 0,
  extras: [],
  promoCode: undefined,
  discount: 0,
  totalPrice: 0,
  depositAmount: 0,
  paymentMethod: 'full',
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  cart: null,

  setProperty: (propertyId, propertyName, propertyImage) => {
    set((state) => ({
      cart: state.cart
        ? { ...state.cart, propertyId, propertyName, propertyImage }
        : { ...initialCart, propertyId, propertyName, propertyImage },
    }))
  },

  setDates: (checkIn, checkOut) => {
    const nights = calculateNights(checkIn, checkOut)
    set((state) => ({
      cart: state.cart ? { ...state.cart, checkIn, checkOut, nights } : null,
    }))
    get().calculateTotals()
  },

  setGuests: (guests) => {
    set((state) => ({
      cart: state.cart ? { ...state.cart, guests } : null,
    }))
  },

  setRoom: (roomTypeId, roomTypeName, pricePerNight) => {
    set((state) => ({
      cart: state.cart ? { ...state.cart, selectedRoomTypeId: roomTypeId, selectedRoomTypeName: roomTypeName, roomPrice: pricePerNight } : null,
    }))
    get().calculateTotals()
  },

  addExtra: (extra) => {
    set((state) => {
      if (!state.cart) return state
      const existing = state.cart.extras.find((e) => e.id === extra.id)
      const extras = existing
        ? state.cart.extras.map((e) => (e.id === extra.id ? { ...e, quantity: e.quantity + extra.quantity } : e))
        : [...state.cart.extras, extra]
      return { cart: { ...state.cart, extras } }
    })
    get().calculateTotals()
  },

  removeExtra: (extraId) => {
    set((state) => ({
      cart: state.cart
        ? { ...state.cart, extras: state.cart.extras.filter((e) => e.id !== extraId) }
        : null,
    }))
    get().calculateTotals()
  },

  setPromoCode: (code, discount) => {
    set((state) => ({
      cart: state.cart ? { ...state.cart, promoCode: code, discount } : null,
    }))
    get().calculateTotals()
  },

  setGuestDetails: (details) => {
    set((state) => ({
      cart: state.cart ? { ...state.cart, guestDetails: details } : null,
    }))
  },

  setPaymentMethod: (method) => {
    set((state) => ({
      cart: state.cart ? { ...state.cart, paymentMethod: method } : null,
    }))
  },

  calculateTotals: () => {
    const { cart } = get()
    if (!cart || !cart.checkIn || !cart.checkOut) return

    const roomTotal = cart.roomPrice * cart.nights
    const extrasTotal = cart.extras.reduce((sum, extra) => sum + extra.price * extra.quantity, 0)
    const subtotal = roomTotal + extrasTotal
    const discountAmount = cart.discount > 0 ? subtotal * cart.discount : 0
    const totalPrice = subtotal - discountAmount
    const depositAmount = Math.round(totalPrice * 0.3)

    set((state) => ({
      cart: state.cart
        ? { ...state.cart, totalPrice, depositAmount }
        : null,
    }))
  },

  clearBooking: () => {
    set({ cart: null })
  },
}))