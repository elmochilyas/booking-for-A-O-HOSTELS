import api from './api'
import type { Property, RoomType, PropertyAvailability, SearchFilters } from '@/types/property.types'

interface BackendAmenity {
  id: string
  name: string
  category: string
  icon: string
  is_free: boolean
}

interface BackendRoomType {
  id: string
  property_id: string
  name: string
  description: string
  capacity: number
  max_occupancy: number
  base_price: number | string
  amenities: string | string[]
  bed_type?: string
  room_size?: number
  available?: boolean
}

interface BackendProperty {
  id: string
  name: string
  location: string
  address: string
  latitude: number
  longitude: number
  check_in_time: string
  check_out_time: string
  total_rooms: number
  description: string
  phone: string
  email: string
  rating: number
  review_count: number
  images?: unknown
  room_types?: BackendRoomType[]
  amenities?: BackendAmenity[]
  created_at?: string
  updated_at?: string
}

function transformRoomType(rt: BackendRoomType): RoomType {
  let amenities: string[] = []
  if (typeof rt.amenities === 'string') {
    try { amenities = JSON.parse(rt.amenities) } catch { amenities = [] }
  } else if (Array.isArray(rt.amenities)) {
    amenities = rt.amenities
  }

  return {
    id: rt.id,
    propertyId: rt.property_id,
    name: rt.name,
    description: rt.description ?? '',
    capacity: rt.capacity ?? rt.max_occupancy ?? 1,
    maxAdults: rt.capacity ?? rt.max_occupancy ?? 1,
    maxChildren: 0,
    pricePerNight: typeof rt.base_price === 'string' ? parseFloat(rt.base_price) : (rt.base_price ?? 0),
    images: [],
    amenities,
    bedType: rt.bed_type ?? '',
    roomSize: rt.room_size ?? 0,
    available: rt.available ?? true,
  }
}

function transformProperty(p: BackendProperty): Property {
  const roomTypes = p.room_types ?? []
  const prices = roomTypes.map((rt) =>
    typeof rt.base_price === 'string' ? parseFloat(rt.base_price) : (rt.base_price ?? 0)
  )
  const priceFrom = prices.length > 0 ? Math.min(...prices) : 0

  const amenityIcons: string[] = (p.amenities ?? []).map((a) => a.icon).filter(Boolean)

  const addressParts = (p.address ?? '').split(',')
  const country = addressParts.length > 1 ? addressParts[addressParts.length - 1].trim() : 'Germany'

  // Extract image from the stored JSON images array
  let firstImageUrl = ''
  try {
    const imgs = typeof p.images === 'string' ? JSON.parse(p.images) : (p.images as { url: string }[] | null)
    firstImageUrl = Array.isArray(imgs) && imgs[0]?.url ? imgs[0].url : ''
  } catch { firstImageUrl = '' }

  // Generate slug from property name (e.g., "a&o Berlin Mitte" -> "ao-berlin-mitte")
  const slug = p.name
    .toLowerCase()
    .replace(/[^a-z0-9\s&]/g, '')
    .replace(/\s+/g, '-')
    .replace(/&/g, 'and')
    .replace(/-+/g, '-')
    .trim()

  return {
    id: p.id,
    name: p.name,
    slug,
    description: p.description ?? '',
    address: p.address ?? '',
    city: p.location ?? '',
    country,
    postalCode: '',
    phone: p.phone ?? '',
    email: p.email ?? '',
    latitude: p.latitude ?? 0,
    longitude: p.longitude ?? 0,
    starRating: p.rating ?? 0,
    priceFrom,
    images: firstImageUrl ? [{ id: '1', url: firstImageUrl, alt: p.name, isPrimary: true }] : [],
    amenities: amenityIcons,
    checkInTime: p.check_in_time ?? '15:00',
    checkOutTime: p.check_out_time ?? '10:00',
    petPolicy: '',
    cancellationPolicy: '',
    groupPolicy: '',
    createdAt: p.created_at ?? '',
    updatedAt: p.updated_at ?? '',
  }
}

export const propertiesService = {
  async getAll(filters?: SearchFilters) {
    const response = await api.get('/properties', { params: filters })
    const raw: BackendProperty[] = response.data?.properties ?? response.data ?? []
    return raw.map(transformProperty)
  },

  async getById(id: string) {
    const response = await api.get(`/properties/${id}`)
    const raw: BackendProperty = response.data?.property ?? response.data
    return transformProperty(raw)
  },

  async getBySlug(slug: string) {
    // Backend has no /properties/slug/{slug} — slug is the property ID
    return propertiesService.getById(slug)
  },

  async getRoomTypes(id: string) {
    const response = await api.get(`/properties/${id}/room-types`)
    const raw: BackendRoomType[] = response.data?.room_types ?? response.data ?? []
    return raw.map(transformRoomType)
  },

  async checkAvailability(id: string, checkIn: string, checkOut: string, guests?: number) {
    const response = await api.get(`/properties/${id}/availability`, {
      params: { check_in: checkIn, check_out: checkOut, guests },
    })
    return (response.data?.availability ?? response.data ?? []) as PropertyAvailability[]
  },

  async search(filters: SearchFilters) {
    const response = await api.get('/properties', { params: filters })
    const raw: BackendProperty[] = response.data?.properties ?? response.data ?? []
    return raw.map(transformProperty)
  },
}
