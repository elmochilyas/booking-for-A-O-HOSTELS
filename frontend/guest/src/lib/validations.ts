import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  dateOfBirth: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  gdprConsent: z.boolean().refine(val => val === true, {
    message: 'You must accept the GDPR policy',
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const guestDetailsSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Valid phone number is required'),
  country: z.string().min(1, 'Country is required'),
  dateOfBirth: z.string().optional(),
  specialRequests: z.string().optional(),
  createAccount: z.boolean().optional(),
  password: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.createAccount && !data.password) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Password is required when creating an account',
      path: ['password'],
    })
  }
  if (data.password && data.password.length < 6) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Password must be at least 6 characters',
      path: ['password'],
    })
  }
})

export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export const groupBookingSchema = z.object({
  propertyId: z.string().min(1, 'Please select a property'),
  checkIn: z.string().min(1, 'Check-in date is required'),
  checkOut: z.string().min(1, 'Check-out date is required'),
  groupSize: z.number().min(10, 'Group booking is for 10+ guests'),
  roomPreferences: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Valid phone number is required'),
  notes: z.string().optional(),
})

export const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  country: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const reviewSchema = z.object({
  rating: z.number().min(1, 'Rating is required').max(5),
  cleanliness: z.number().min(1).max(5),
  location: z.number().min(1).max(5),
  staff: z.number().min(1).max(5),
  value: z.number().min(1).max(5),
  comment: z.string().min(10, 'Review must be at least 10 characters'),
})