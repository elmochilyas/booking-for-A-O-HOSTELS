'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Bed, User, Star, LogOut, Heart, TrendingUp, Calendar, Mail, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth.store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const sidebarLinks = [
  { href: '/account', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/account/bookings', label: 'My Bookings', icon: Bed, badge: 2 },
  { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/account/profile', label: 'Profile', icon: User },
  { href: '/account/loyalty', label: 'A&O Club', icon: Star },
]

export function AccountSidebar() {
  const pathname = usePathname()
  const { guest, logout } = useAuthStore()

  // Mock stats - these would come from API
  const stats = {
    totalBookings: 5,
    nightsStayed: 12,
    pointsEarned: guest?.loyaltyPoints || 0,
  }

  // Calculate profile completion
  const profileFields = [
    guest?.firstName,
    guest?.lastName,
    guest?.email,
    guest?.phone,
    guest?.country,
  ]
  const completedFields = profileFields.filter(Boolean).length
  const profileCompletion = Math.round((completedFields / profileFields.length) * 100)

  return (
    <aside className="w-full md:w-64 shrink-0">
      <div className="sticky top-24 space-y-6">
        {/* User Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white font-bold text-xl">
                  {guest?.firstName?.[0] || 'G'}
                </div>
                {guest?.isEmailVerified && (
                  <CheckCircle className="absolute -bottom-0.5 -right-0.5 h-5 w-5 text-green-500 bg-white rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">
                  {guest?.firstName} {guest?.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">{guest?.email}</p>
              </div>
            </div>

            {/* Club Member Badge */}
            {guest?.aoClubMember && (
              <Badge className="w-full justify-center bg-gradient-to-r from-primary to-orange-400 text-white border-0 mb-3">
                <Star className="h-3 w-3 mr-1 fill-white" />
                A&O Club Member
              </Badge>
            )}

            {/* Profile Completion */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Profile completion</span>
                <span className="font-medium">{profileCompletion}%</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-green-400 rounded-full transition-all"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-bold text-primary">{stats.totalBookings}</p>
                <p className="text-[10px] text-muted-foreground">Bookings</p>
              </div>
              <div>
                <p className="text-lg font-bold text-primary">{stats.nightsStayed}</p>
                <p className="text-[10px] text-muted-foreground">Nights</p>
              </div>
              <div>
                <p className="text-lg font-bold text-primary">{stats.pointsEarned}</p>
                <p className="text-[10px] text-muted-foreground">Points</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <nav className="bg-card rounded-lg border overflow-hidden">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-6 py-3 text-sm transition-all relative group',
                  isActive 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r" />
                )}
                <link.icon className={cn('h-4 w-4', isActive && 'text-primary')} />
                <span className="flex-1">{link.label}</span>
                {link.badge && (
                  <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    {link.badge}
                  </span>
                )}
              </Link>
            )
          })}
          <div className="border-t p-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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