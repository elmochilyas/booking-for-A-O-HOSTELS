export interface Guest {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  country?: string
  dateOfBirth?: string
  address?: string
  avatar?: string
  isEmailVerified: boolean
  aoClubMember: boolean
  loyaltyPoints: number
  memberSince: string
  createdAt: string
  updatedAt: string
}

export interface GuestProfile extends Guest {
  notifications: NotificationPreferences
}

export interface NotificationPreferences {
  bookingConfirmations: boolean
  promotionalEmails: boolean
  newsletter: boolean
  smsNotifications: boolean
}

export interface LoyaltyInfo {
  points: number
  tier: LoyaltyTier
  tierName: string
  pointsToNextTier: number
  lifetimePoints: number
  memberSince: string
  benefits: LoyaltyBenefit[]
  history: LoyaltyTransaction[]
}

export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum'

export interface LoyaltyBenefit {
  id: string
  name: string
  description: string
  requiredTier: LoyaltyTier
  discount?: number
  active: boolean
}

export interface LoyaltyTransaction {
  id: string
  type: 'earned' | 'redeemed' | 'expired' | 'bonus'
  points: number
  description: string
  bookingId?: string
  createdAt: string
}

export interface AuthState {
  guest: Guest | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
}