import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '../config/environment';

const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('token');
  } catch {
    return null;
  }
};

const setToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('token', token);
  } catch {}
};

const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('token');
  } catch {}
};

const getGuest = async (): Promise<any | null> => {
  try {
    const guestStr = await AsyncStorage.getItem('guest');
    return guestStr ? JSON.parse(guestStr) : null;
  } catch {
    return null;
  }
};

const setGuest = async (guest: any): Promise<void> => {
  try {
    await AsyncStorage.setItem('guest', JSON.stringify(guest));
  } catch {}
};

const removeGuest = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('guest');
  } catch {}
};

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await removeToken();
      await removeGuest();
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: async (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    country?: string;
  }) => {
    const response = await api.post('/auth/register', data);
    if (response.data.access_token) {
      await setToken(response.data.access_token);
      await setGuest(response.data.guest);
    }
    return response;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.access_token) {
      await setToken(response.data.access_token);
      await setGuest(response.data.guest);
    }
    return response;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    await removeToken();
    await removeGuest();
  },

  verifyEmail: async (token: string) => {
    return api.post('/auth/verify-email', { token });
  },

  forgotPassword: async (email: string) => {
    return api.post('/auth/forgot-password', { email });
  },
};

export const propertiesApi = {
  getAll: (params?: { location?: string; checkIn?: string; checkOut?: string; guests?: number }) => 
    api.get('/properties', { params }),
  getById: (id: string) => api.get(`/properties/${id}`),
  getRoomTypes: (id: string) => api.get(`/properties/${id}/room-types`),
  getAvailability: (id: string, checkIn: string, checkOut: string, guests?: number) =>
    api.get(`/properties/${id}/availability`, { params: { check_in: checkIn, check_out: checkOut, guests } }),
  getDestinations: () => api.get('/properties/destinations'),
};

export const bookingsApi = {
  searchAvailability: (propertyId: string, checkIn: string, checkOut: string, guests?: number) =>
    api.get('/bookings/availability', { params: { property_id: propertyId, check_in: checkIn, check_out: checkOut, guests } }),
  create: (data: {
    property_id: string;
    room_type_id: string;
    guest_id: string;
    check_in_date: string;
    check_out_date: string;
    guest_count: number;
    special_requests?: string;
    extras?: Array<{ id: string; quantity: number }>;
  }) => api.post('/bookings', data),
  getById: (id: string) => api.get(`/bookings/${id}`),
  getMyBookings: () => api.get('/guest/bookings'),
  confirm: (id: string) => api.post(`/bookings/${id}/confirm`),
  cancel: (id: string, reason?: string) => api.delete(`/bookings/${id}`, { data: { reason } }),
  checkIn: (id: string, roomId?: string) => api.post(`/bookings/${id}/check-in`, { room_id: roomId }),
  checkOut: (id: string) => api.post(`/bookings/${id}/check-out`),
};

export const paymentsApi = {
  createPaymentIntent: (bookingId: string, amount: number, depositPercentage?: number) =>
    api.post('/payments/create-intent', {
      booking_id: bookingId,
      amount,
      deposit_percentage: depositPercentage,
    }),
  confirmPayment: (paymentId: string, paymentIntentId: string) =>
    api.post('/payments/confirm', { payment_id: paymentId, payment_intent_id: paymentIntentId }),
  getPaymentDetails: (bookingId: string) =>
    api.get(`/payments/booking/${bookingId}`),
  refund: (bookingId: string, amount?: number, reason?: string) =>
    api.post('/payments/refund', { booking_id: bookingId, amount, reason }),
};

export const guestApi = {
  getProfile: () => api.get('/guest/profile'),
  updateProfile: (data: any) => api.put('/guest/profile', data),
  getLoyalty: () => api.get('/guest/loyalty'),
  joinLoyalty: () => api.post('/guest/loyalty/join'),
};

export const staffApi = {
  login: (email: string, password: string) => api.post('/staff/login', { email, password }),
  getDashboard: () => api.get('/staff/dashboard'),
  getTodayCheckIns: () => api.get('/staff/check-ins'),
  getTodayCheckOuts: () => api.get('/staff/check-outs'),
  getGuestDetails: (bookingId: string) => api.get(`/staff/guest/${bookingId}`),
};

export const adminApi = {
  getAnalytics: (propertyId?: string, startDate?: string, endDate?: string) =>
    api.get('/admin/analytics', { params: { property_id: propertyId, start_date: startDate, end_date: endDate } }),
  getReports: (propertyId?: string, type?: string, startDate?: string, endDate?: string) =>
    api.get('/admin/reports', { params: { property_id: propertyId, type, start_date: startDate, end_date: endDate } }),
  getStaff: (propertyId?: string) => api.get('/admin/staff', { params: { property_id: propertyId } }),
  createStaff: (data: any) => api.post('/admin/staff', data),
  updateStaff: (id: string, data: any) => api.put(`/admin/staff/${id}`, data),
  deleteStaff: (id: string) => api.delete(`/admin/staff/${id}`),
};

export default api;