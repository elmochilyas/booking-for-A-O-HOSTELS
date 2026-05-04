export interface Property {
  id: string
  name: string
  slug: string
  description: string
  address: string
  city: string
  country: string
  postalCode: string
  phone: string
  email: string
  latitude: number
  longitude: number
  starRating: number
  priceFrom: number
  images: PropertyImage[]
  amenities: string[]
  checkInTime: string
  checkOutTime: string
  petPolicy: string
  cancellationPolicy: string
  groupPolicy: string
  createdAt: string
  updatedAt: string
}

export interface PropertyImage {
  id: string
  url: string
  alt: string
  isPrimary: boolean
}

export interface RoomType {
  id: string
  propertyId: string
  name: string
  description: string
  capacity: number
  maxAdults: number
  maxChildren: number
  pricePerNight: number
  images: PropertyImage[]
  amenities: string[]
  bedType: string
  roomSize: number
  available: boolean
}

export interface PropertyAvailability {
  roomTypeId: string
  available: boolean
  availableRooms: number
  pricePerNight: number
  blockedDates?: string[]
}

export interface SearchFilters {
  location?: string
  checkIn?: string
  checkOut?: string
  guests?: number
  roomType?: string
  amenities?: string[]
  minPrice?: number
  maxPrice?: number
  minRating?: number
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'name'
}