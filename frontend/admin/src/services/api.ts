import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {}
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('staff');
      } catch (e) {}
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/staff/login', { email, password });
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('staff', JSON.stringify(response.data.staff));
    }
    return response;
  },

  logout: async () => {
    try {
      await api.post('/staff/logout');
    } catch (e) {}
    localStorage.removeItem('token');
    localStorage.removeItem('staff');
  },
};

export const propertiesApi = {
  getAll: () => api.get('/properties'),
  getById: (id: string) => api.get(`/properties/${id}`),
  getRoomTypes: (id: string) => api.get(`/properties/${id}/room-types`),
  getAvailability: (id: string, checkIn: string, checkOut: string, guests?: number) =>
    api.get(`/properties/${id}/availability`, { params: { check_in: checkIn, check_out: checkOut, guests } }),
};

export const bookingsApi = {
  getAll: (status?: string) => api.get('/bookings', { params: { status } }),
  getById: (id: string) => api.get(`/bookings/${id}`),
  create: (data: any) => api.post('/bookings', data),
  update: (id: string, data: any) => api.put(`/bookings/${id}`, data),
  cancel: (id: string, reason?: string) => api.delete(`/bookings/${id}`, { data: { reason } }),
  checkIn: (id: string) => api.post(`/bookings/${id}/check-in`),
  checkOut: (id: string) => api.post(`/bookings/${id}/check-out`),
  getMyBookings: () => api.get('/staff/bookings'),
};

export const paymentsApi = {
  createPaymentIntent: (bookingId: string, amount: number, depositPercentage?: number) =>
    api.post('/payments/create-intent', { booking_id: bookingId, amount, deposit_percentage: depositPercentage }),
  getPaymentDetails: (bookingId: string) =>
    api.get(`/payments/booking/${bookingId}`),
  refund: (bookingId: string, amount?: number, reason?: string) =>
    api.post('/payments/refund', { booking_id: bookingId, amount, reason }),
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
  getAllStaff: (params?: Record<string, string>) => api.get('/admin/staff', { params }),
  createStaff: (data: any) => api.post('/admin/staff', data),
  updateStaff: (id: string, data: any) => api.put(`/admin/staff/${id}`, data),
  deleteStaff: (id: string) => api.delete(`/admin/staff/${id}`),
  
  getAdmins: (filters?: { search?: string; page?: number }) => 
    api.get('/admin/staff', { params: filters }),
  updateAdmin: (id: string, data: any) => 
    api.put(`/admin/staff/${id}`, data),
  forceLogout: (id: string) => 
    api.post(`/admin/staff/${id}/force-logout`),
  
  getRoles: () => api.get('/admin/roles'),
  getPermissions: () => api.get('/admin/permissions'),
  
  getRooms: (filters?: { search?: string; property?: string; status?: string; page?: number }) =>
    api.get('/admin/rooms', { params: filters }),
  createRoom: (data: any) => api.post('/admin/rooms', data),
  updateRoom: (id: string, data: any) => api.put(`/admin/rooms/${id}`, data),
  updateRoomStatus: (id: string, data: { status: string }) => 
    api.patch(`/admin/rooms/${id}/status`, data),
  
  getRoomTypes: (filters?: { property?: string }) =>
    api.get('/admin/room-types', { params: filters }),
  createRoomType: (data: any) => api.post('/admin/room-types', data),
  updateRoomType: (id: string, data: any) => api.put(`/admin/room-types/${id}`, data),
  
  getProperties: (filters?: { search?: string; page?: number }) =>
    api.get('/admin/properties', { params: filters }),
  createProperty: (data: any) => api.post('/admin/properties', data),
  updateProperty: (id: string, data: any) => api.put(`/admin/properties/${id}`, data),
  deleteProperty: (id: string) => api.delete(`/admin/properties/${id}`),
  getPropertyKpis: (id: string) => api.get(`/admin/properties/${id}/kpis`),
  
  getBookings: (filters?: { search?: string; property?: string; status?: string; date_from?: string; date_to?: string; page?: number }) =>
    api.get('/admin/bookings', { params: filters }),
  updateBooking: (id: string, data: any) => api.put(`/admin/bookings/${id}`, data),
  cancelBooking: (id: string, reason?: string) => 
    api.delete(`/admin/bookings/${id}`, { data: { reason } }),
  refundBooking: (id: string, data: { amount?: number; reason?: string }) => 
    api.post(`/admin/bookings/${id}/refund`, data),
  exportBookings: () => api.get('/admin/bookings/export', { responseType: 'blob' }),
  
  getGuests: (filters?: { search?: string; is_loyalty_member?: string; is_banned?: string; page?: number }) =>
    api.get('/admin/guests', { params: filters }),
  updateGuest: (id: string, data: any) => api.put(`/admin/guests/${id}`, data),
  banGuest: (id: string, reason?: string) => api.post(`/admin/guests/${id}/ban`, { reason }),
  unbanGuest: (id: string) => api.post(`/admin/guests/${id}/unban`),
  mergeGuests: (source_id: string, target_id: string) => 
    api.post('/admin/guests/merge', { source_id, target_id }),
  exportGuestData: (id: string) => api.get(`/admin/guests/${id}/export`),
  deleteGuestData: (id: string) => api.delete(`/admin/guests/${id}/data`),
  
  getPayments: (filters?: { property?: string; status?: string; date_from?: string; date_to?: string; page?: number }) =>
    api.get('/admin/payments', { params: filters }),
  getRevenueDashboard: (propertyId?: string, startDate?: string, endDate?: string) =>
    api.get('/admin/revenue', { params: { property_id: propertyId, start_date: startDate, end_date: endDate } }),
  
  getReviews: (filters?: { property?: string; status?: string; page?: number }) =>
    api.get('/admin/reviews', { params: filters }),
  moderateReview: (id: string, data: { status: string; reply?: string }) =>
    api.put(`/admin/reviews/${id}/moderate`, data),
  
  getPromotions: (filters?: { property?: string; page?: number }) =>
    api.get('/admin/promotions', { params: filters }),
  createPromotion: (data: any) => api.post('/admin/promotions', data),
  updatePromotion: (id: string, data: any) => api.put(`/admin/promotions/${id}`, data),
  deletePromotion: (id: string) => api.delete(`/admin/promotions/${id}`),
  
  getExtras: (filters?: { property?: string; page?: number }) =>
    api.get('/admin/extras', { params: filters }),
  createExtra: (data: any) => api.post('/admin/extras', data),
  updateExtra: (id: string, data: any) => api.put(`/admin/extras/${id}`, data),
  deleteExtra: (id: string) => api.delete(`/admin/extras/${id}`),
  
  getEmailTemplates: () => api.get('/admin/email-templates'),
  updateEmailTemplate: (id: string, data: any) => api.put(`/admin/email-templates/${id}`, data),
  sendAnnouncement: (data: { type: string; recipients: string; property_id?: string; subject?: string; message: string }) =>
    api.post('/admin/announcements', data),
  
  getSystemConfig: (category?: string) => api.get('/admin/config', { params: { category } }),
  updateSystemConfig: (data: { key: string; value: string; type?: string; category?: string; description?: string; is_encrypted?: boolean }) =>
    api.put('/admin/config', data),
  
  getAuditLogs: (filters?: { staff_id?: string; action?: string; entity_type?: string; date_from?: string; date_to?: string; page?: number }) =>
    api.get('/admin/audit-logs', { params: filters }),
};

export default api;