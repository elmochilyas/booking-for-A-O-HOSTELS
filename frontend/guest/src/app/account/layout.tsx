'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import { AccountSidebar } from '@/components/layout/AccountSidebar'

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <AccountSidebar />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}