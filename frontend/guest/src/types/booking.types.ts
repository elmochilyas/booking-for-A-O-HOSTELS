export interface Booking {
  id: string
  propertyId: string
  propertyName: string
  propertyCity: string
  propertyImage: string
  roomTypeId: string
  roomTypeName: string
  guestId: string
  guestName: string
  guestEmail: string
  checkIn: string
  checkOut: string
  guests: number
  totalPrice: number
  depositAmount: number
  status: BookingStatus
  paymentStatus: PaymentStatus
  specialRequests?: string
  extras: BookingExtra[]
  promoCode?: string
  discount?: number
  createdAt: string
  updatedAt: string
}

export type BookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled'
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded'

export interface BookingExtra {
  id: string
  name: string
  quantity: number
  price: number
  unit: string
}

export interface CreateBookingData {
  propertyId: string
  roomTypeId: string
  checkIn: string
  checkOut: string
  guests: number
  guestDetails: GuestDetails
  extras?: { id: string; quantity: number }[]
  promoCode?: string
  paymentMethod: 'full' | 'deposit'
}

export interface GuestDetails {
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  dateOfBirth?: string
  specialRequests?: string
}

export interface BookingCart {
  propertyId: string
  propertyName: string
  propertyImage: string
  checkIn: string
  checkOut: string
  guests: number
  nights: number
  selectedRoomTypeId: string
  selectedRoomTypeName: string
  roomPrice: number
  extras: CartExtra[]
  promoCode?: string
  discount: number
  guestDetails?: GuestDetails
  totalPrice: number
  depositAmount: number
  paymentMethod: 'full' | 'deposit'
}

export interface CartExtra {
  id: string
  name: string
  quantity: number
  price: number
  unit: string
}