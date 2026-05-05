import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { config } from '../config/environment';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const retryRequest = async (config: any, retries: number = MAX_RETRIES): Promise<any> => {
  try {
    return await axios(config);
  } catch (error: any) {
    if (retries > 0 && error.code !== 'ECONNABORTED' && !error.response) {
      await delay(RETRY_DELAY * (MAX_RETRIES - retries + 1)); // Exponential backoff
      return retryRequest(config, retries - 1);
    }
    throw error;
  }
};

// Certificate pinning configuration
// For production, use a library like 'react-native-certificate-pinner' or configure at native level
// This is a placeholder for the certificate pinning implementation
const CERTIFICATE_PINS = [
  // Add your certificate pins here (SHA-256 hashes)
  // Example: 'sha256//abc123...'
];

const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  // Note: Full certificate pinning requires native module integration
  // See: https://github.com/approov/react-native-cert-pinner for implementation
});

// Auth failure callback for 401 handling
type AuthFailureCallback = () => void;
let authFailureCallback: AuthFailureCallback | null = null;

export const setAuthFailureCallback = (callback: AuthFailureCallback): void => {
  authFailureCallback = callback;
};

// Request interceptor - attach token from SecureStore
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

// Response interceptor - handle 401 and retry logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      authFailureCallback?.();
      return Promise.reject(error);
    }

    // Retry logic for network errors
    if (
      !error.response &&
      error.code !== 'ECONNABORTED' &&
      originalRequest._retryCount < MAX_RETRIES
    ) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      await delay(RETRY_DELAY * originalRequest._retryCount);
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: async (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    country?: string;
  }) => {
    return api.post('/auth/register', data);
  },

  login: async (email: string, password: string) => {
    return api.post('/auth/login', { email, password });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
  },

  verifyEmail: async (token: string) => {
    return api.post('/auth/verify-email', { token });
  },

  forgotPassword: async (email: string) => {
    return api.post('/auth/forgot-password', { email });
  },
};

// Properties API
export interface Property {
  id: string;
  name: string;
  description?: string;
  location: string;
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
  amenities?: string[];
  rating?: number;
  review_count?: number;
}

export interface RoomType {
  id: string;
  name: string;
  description?: string;
  capacity: number;
  price_per_night: number;
  amenities?: string[];
  images?: string[];
}

export const propertiesApi = {
  getAll: (params?: {
    location?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  }) => api.get<{ data: Property[] }>('/properties', { params }),
  getById: (id: string) => api.get<{ data: Property }>(`/properties/${id}`),
  getRoomTypes: (id: string) => api.get<{ data: RoomType[] }>(`/properties/${id}/room-types`),
  getAvailability: (id: string, checkIn: string, checkOut: string, guests?: number) =>
    api.get<{ data: RoomType[] }>(`/properties/${id}/availability`, {
      params: { check_in: checkIn, check_out: checkOut, guests },
    }),
  getDestinations: () => api.get<{ data: Array<{ id: string; name: string; country: string }> }>('/properties/destinations'),
};

// Bookings API
export interface Booking {
  id: string;
  property_id: string;
  guest_id: string;
  room_type_id: string;
  check_in_date: string;
  check_out_date: string;
  guest_count: number;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  total_amount: number;
  deposit_amount?: number;
  special_requests?: string;
  created_at: string;
  updated_at: string;
  property?: Property;
  room_type?: RoomType;
}

export const bookingsApi = {
  searchAvailability: (propertyId: string, checkIn: string, checkOut: string, guests?: number) =>
    api.get<{ data: RoomType[] }>('/bookings/availability', {
      params: { property_id: propertyId, check_in: checkIn, check_out: checkOut, guests },
    }),
  create: (data: {
    property_id: string;
    room_type_id: string;
    guest_id: string;
    check_in_date: string;
    check_out_date: string;
    guest_count: number;
    special_requests?: string;
    extras?: Array<{ id: string; quantity: number }>;
  }) => api.post<{ data: Booking }>('/bookings', data),
  getById: (id: string) => api.get<{ data: Booking }>(`/bookings/${id}`),
  getMyBookings: () => api.get<{ data: Booking[] }>('/guest/bookings'),
  confirm: (id: string) => api.post<{ data: Booking }>(`/bookings/${id}/confirm`),
  cancel: (id: string, reason?: string) => api.delete(`/bookings/${id}`, { data: { reason } }),
  checkIn: (id: string, roomId?: string) => api.post(`/bookings/${id}/check-in`, { room_id: roomId }),
  checkOut: (id: string) => api.post(`/bookings/${id}/check-out`),
};

// Payments API
export const paymentsApi = {
  createPaymentIntent: (bookingId: string, amount: number, depositPercentage?: number) =>
    api.post('/payments/create-intent', {
      booking_id: bookingId,
      amount,
      deposit_percentage: depositPercentage,
    }),
  confirmPayment: (paymentId: string, paymentIntentId: string) =>
    api.post('/payments/confirm', { payment_id: paymentId, payment_intent_id: paymentIntentId }),
  getPaymentDetails: (bookingId: string) => api.get(`/payments/booking/${bookingId}`),
  refund: (bookingId: string, amount?: number, reason?: string) =>
    api.post('/payments/refund', { booking_id: bookingId, amount, reason }),
};

// Guest API
export interface GuestProfile extends Guest {
  phone?: string;
  country?: string;
  date_of_birth?: string;
  passport_number?: string;
  loyalty_tier?: string;
  loyalty_points?: number;
}

export const guestApi = {
  getProfile: () => api.get<{ data: GuestProfile }>('/guest/profile'),
  updateProfile: (data: Partial<GuestProfile>) => api.put<{ data: GuestProfile }>('/guest/profile', data),
  getLoyalty: () => api.get('/guest/loyalty'),
  joinLoyalty: () => api.post('/guest/loyalty/join'),
};

// Staff API
export interface StaffMember {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  property_id?: string;
  phone?: string;
}

export const staffApi = {
  login: (email: string, password: string) => api.post('/staff/login', { email, password }),
  getDashboard: () => api.get('/staff/dashboard'),
  getTodayCheckIns: () => api.get('/staff/check-ins'),
  getTodayCheckOuts: () => api.get('/staff/check-outs'),
  getGuestDetails: (bookingId: string) => api.get(`/staff/guest/${bookingId}`),
};

// Admin API
export interface StaffCreateInput {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
  property_id?: string;
  phone?: string;
}

export interface StaffUpdateInput {
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  property_id?: string;
  phone?: string;
}

export const adminApi = {
  getAnalytics: (propertyId?: string, startDate?: string, endDate?: string) =>
    api.get('/admin/analytics', { params: { property_id: propertyId, start_date: startDate, end_date: endDate } }),
  getReports: (propertyId?: string, type?: string, startDate?: string, endDate?: string) =>
    api.get('/admin/reports', { params: { property_id: propertyId, type, start_date: startDate, end_date: endDate } }),
  getStaff: (propertyId?: string) => api.get<{ data: StaffMember[] }>('/admin/staff', { params: { property_id: propertyId } }),
  createStaff: (data: StaffCreateInput) => api.post<{ data: StaffMember }>('/admin/staff', data),
  updateStaff: (id: string, data: StaffUpdateInput) => api.put<{ data: StaffMember }>(`/admin/staff/${id}`, data),
  deleteStaff: (id: string) => api.delete(`/admin/staff/${id}`),
};

export default api;
