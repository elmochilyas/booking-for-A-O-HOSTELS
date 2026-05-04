'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Bed, User, Star, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth.store'

const sidebarLinks = [
  { href: '/account', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/account/bookings', label: 'My Bookings', icon: Bed },
  { href: '/account/profile', label: 'Profile', icon: User },
  { href: '/account/loyalty', label: 'A&O Club', icon: Star },
]

export function AccountSidebar() {
  const pathname = usePathname()
  const { guest, logout } = useAuthStore()

  return (
    <aside className="w-full md:w-64 shrink-0">
      <div className="sticky top-24 space-y-6">
        <div className="bg-card rounded-lg p-6 border">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
              {guest?.firstName?.[0] || 'G'}
            </div>
            <div>
              <p className="font-semibold">
                {guest?.firstName} {guest?.lastName}
              </p>
              <p className="text-sm text-muted-foreground">{guest?.email}</p>
              {guest?.aoClubMember && (
                <span className="inline-block mt-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                  A&O Club Member
                </span>
              )}
            </div>
          </div>
        </div>

        <nav className="bg-card rounded-lg border overflow-hidden">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-6 py-3 text-sm transition-colors hover:bg-muted',
                  isActive ? 'bg-primary/10 text-primary border-l-2 border-primary' : 'text-muted-foreground'
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            )
          })}
          <div className="border-t p-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-destructive"
              onClick={() => logout()}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </nav>
      </div>
    </aside>
  )
}