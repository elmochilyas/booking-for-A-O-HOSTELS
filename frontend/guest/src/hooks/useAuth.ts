'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth.store'
import { authService } from '@/services/auth.service'
import type { Guest } from '@/types/guest.types'

export function useAuth() {
  const { guest, isAuthenticated, isLoading, setAuth, clearAuth, setLoading } = useAuthStore()

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),
    onSuccess: (data) => {
      setAuth(data.user, data.access_token)
    },
  })

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      clearAuth()
    },
  })

  return {
    guest,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
  }
}

export function useCurrentUser() {
  const { isAuthenticated } = useAuthStore()

  return useQuery<Guest>({
    queryKey: ['currentUser'],
    queryFn: () => authService.getCurrentUser(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  })
}