import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, guestApi } from '../services/api';

interface Guest {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  country?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  guest: Guest | null;
  token: string | null;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; first_name: string; last_name: string; phone?: string; country?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateGuest: (guest: Guest) => void;
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isLoading: true,
  guest: null,
  token: null,

  initialize: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const guestStr = await AsyncStorage.getItem('guest');
      const guest = guestStr ? JSON.parse(guestStr) : null;
      set({
        isAuthenticated: !!token,
        isLoading: false,
        token,
        guest,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await authApi.login(email, password);
      const guest = response.data.guest;
      set({
        isAuthenticated: !!response.data.access_token,
        isLoading: false,
        guest,
        token: response.data.access_token,
      });
    } catch {
      set({ isLoading: false });
      throw new Error('Login failed');
    }
  },

  register: async (data: { email: string; password: string; first_name: string; last_name: string; phone?: string; country?: string }) => {
    set({ isLoading: true });
    try {
      const response = await authApi.register(data);
      const guest = response.data.guest;
      set({
        isAuthenticated: !!response.data.access_token,
        isLoading: false,
        guest,
        token: response.data.access_token,
      });
    } catch {
      set({ isLoading: false });
      throw new Error('Registration failed');
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {}
    set({
      isAuthenticated: false,
      guest: null,
      token: null,
    });
  },

  updateGuest: (guest: Guest) => {
    set({ guest });
  },

  fetchProfile: async () => {
    try {
      const response = await guestApi.getProfile();
      set({ guest: response.data.data });
    } catch {
      // Silently fail
    }
  },
}));