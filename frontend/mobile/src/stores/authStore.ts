import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, guestApi, setAuthFailureCallback } from '../services/api';
import { resetToLogin } from '../services/navigationService';
import { zustandStorage } from './storage';

export interface Guest {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  country?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  guest: Guest | null;
  token: string | null;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    country?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateGuest: (guest: Guest) => void;
  fetchProfile: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      const logout = async (): Promise<void> => {
        try {
          await authApi.logout();
        } catch {
          // Ignore API errors during logout
        }
        set({
          isAuthenticated: false,
          guest: null,
          token: null,
          isLoading: false,
        });
      };

      // Register auth failure callback for 401 handling
      setAuthFailureCallback(() => {
        logout();
        resetToLogin();
      });

      return {
        isAuthenticated: false,
        isLoading: true,
        guest: null,
        token: null,
        error: null,

        login: async (email: string, password: string) => {
          set({ isLoading: true });
          try {
            const response = await authApi.login(email, password);
            const guest = response.data.guest as Guest;
            const token = response.data.access_token as string;
            set({
              isAuthenticated: !!token,
              isLoading: false,
              guest,
              token,
            });
          } catch (error: unknown) {
            set({ isLoading: false });
            const message = error instanceof Error ? error.message : 'Login failed';
            throw new Error(message);
          }
        },

        register: async (data: {
          email: string;
          password: string;
          first_name: string;
          last_name: string;
          phone?: string;
          country?: string;
        }) => {
          set({ isLoading: true });
          try {
            const response = await authApi.register(data);
            const guest = response.data.guest as Guest;
            const token = response.data.access_token as string;
            set({
              isAuthenticated: !!token,
              isLoading: false,
              guest,
              token,
            });
          } catch (error: unknown) {
            set({ isLoading: false });
            const message = error instanceof Error ? error.message : 'Registration failed';
            throw new Error(message);
          }
        },

        logout,

        updateGuest: (guest: Guest) => {
          set({ guest });
        },

        fetchProfile: async () => {
          set({ error: null });
          try {
            const response = await guestApi.getProfile();
            const guest = response.data.data as Guest;
            set({ guest, error: null });
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to fetch profile';
            set({ error: message });
            console.error('Failed to fetch profile:', error);
          }
        },

        clearError: () => {
          set({ error: null });
        },

        setLoading: (loading: boolean) => {
          set({ isLoading: loading });
        },
      };
    },
    {
      name: 'auth-storage',
      storage: {
        getItem: async (name: string) => {
          const value = await zustandStorage.getItem(name);
          return value;
        },
        setItem: async (name: string, value: string) => {
          await zustandStorage.setItem(name, value);
        },
        removeItem: async (name: string) => {
          await zustandStorage.removeItem(name);
        },
      },
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        guest: state.guest,
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoading = false;
        }
      },
    }
  )
);
