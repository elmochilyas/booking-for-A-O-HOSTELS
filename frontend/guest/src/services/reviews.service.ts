import api from './api'

export interface Review {
  id: string
  propertyId: string
  bookingId: string
  guestName: string
  guestAvatar?: string
  rating: number
  cleanliness: number
  location: number
  staff: number
  value: number
  comment: string
  isVerified: boolean
  createdAt: string
}

export interface ReviewSummary {
  averageRating: number
  totalReviews: number
  cleanliness: number
  location: number
  staff: number
  value: number
  ratingDistribution: Record<number, number>
}

export const reviewsService = {
  async getForProperty(propertyId: string, page = 1, limit = 10) {
    const response = await api.get(`/properties/${propertyId}/reviews`, {
      params: { page, limit },
    })
    return {
      reviews: response.data.reviews as Review[],
      summary: response.data.summary as ReviewSummary,
      pagination: response.data.pagination,
    }
  },

  async submit(data: {
    bookingId: string
    rating: number
    cleanliness: number
    location: number
    staff: number
    value: number
    comment: string
  }) {
    const response = await api.post('/reviews', data)
    return response.data as Review
  },

  async getMyReview(bookingId: string) {
    const response = await api.get(`/reviews/booking/${bookingId}`)
    return response.data as Review | null
  },
}