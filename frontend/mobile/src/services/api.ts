import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = globalThis.localStorage?.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: (data: any) => api.post('/auth/register', data),
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  staffLogin: (email: string, password: string, twoFactorCode?: string) => 
    api.post('/auth/staff/login', { email, password, two_factor_code: twoFactorCode }),
};

export const propertiesApi = {
  getAll: () => api.get('/properties'),
  getById: (id: string) => api.get(`/properties/${id}`),
  getRoomTypes: (id: string) => api.get(`/properties/${id}/room-types`),
};

export const bookingsApi = {
  searchAvailability: (propertyId: string, checkIn: string, checkOut: string, guests?: number) =>
    api.get('/bookings/availability', { params: { property_id: propertyId, check_in: checkIn, check_out: checkOut, guests } }),
  create: (data: any) => api.post('/bookings', data),
  getById: (id: string) => api.get(`/bookings/${id}`),
  confirm: (id: string) => api.post(`/bookings/${id}/confirm`),
  cancel: (id: string) => api.post(`/bookings/${id}/cancel`, {}),
  checkIn: (id: string, roomId?: string) => api.post(`/bookings/${id}/check-in`, { room_id: roomId }),
  checkOut: (id: string) => api.post(`/bookings/${id}/check-out`, {}),
};

export const paymentsApi = {
  createPaymentIntent: (bookingId: string, isDeposit: boolean = true) =>
    api.post('/payments/create-intent', { booking_id: bookingId, is_deposit: isDeposit }),
  confirmPayment: (paymentId: string) =>
    api.post('/payments/confirm', { payment_id: paymentId }),
  getPaymentBreakdown: (totalPrice: number) =>
    api.get('/payments/breakdown', { params: { total_price: totalPrice } }),
  getPaymentDetails: (bookingId: string) =>
    api.get(`/payments/booking/${bookingId}`),
};

export default api;