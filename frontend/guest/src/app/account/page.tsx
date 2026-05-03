'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Bed, Star, ArrowRight, Plus, Calendar, Heart, Settings, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useMyBookings } from '@/hooks/useBooking'
import { useAuthStore } from '@/stores/auth.store'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, formatCurrency } from '@/lib/utils'

export default function AccountDashboardPage() {
  const { guest } = useAuthStore()
  const { data: bookings, isLoading } = useMyBookings('upcoming')

  const quickActions = [
    { icon: Bed, label: 'Find a Hostel', href: '/hostels', color: 'bg-orange-100 text-orange-600' },
    { icon: Calendar, label: 'My Bookings', href: '/account/bookings', color: 'bg-blue-100 text-blue-600' },
    { icon: Heart, label: 'Wishlist', href: '/account/wishlist', color: 'bg-pink-100 text-pink-600' },
    { icon: Settings, label: 'Settings', href: '/account/profile', color: 'bg-gray-100 text-gray-600' },
  ]

  return (
    <div className="space-y-8">
      <Card className="relative overflow-hidden rounded-2xl border-0 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-orange-500 to-orange-400" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <CardContent className="relative p-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {guest?.firstName || 'Guest'}!</h1>
              <p className="text-white/80 text-lg">Manage your bookings and earn rewards</p>
            </div>
            {guest?.aoClubMember && (
              <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-2xl">
                <Star className="h-6 w-6 text-yellow-300 fill-yellow-300" />
                <div className="text-left">
                  <p className="text-white font-bold text-xl">{guest.loyaltyPoints}</p>
                  <p className="text-white/80 text-sm">Loyalty Points</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Card className="hover:shadow-lg card-hover rounded-2xl border-0 shadow-md cursor-pointer group">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className={`p-4 rounded-2xl ${action.color} mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <span className="font-semibold group-hover:text-primary transition-colors">{action.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="rounded-2xl border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-bold">Upcoming Bookings</CardTitle>
          <Link href="/account/bookings">
            <Button variant="ghost" size="sm" className="rounded-full">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
            </div>
          ) : bookings && bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.slice(0, 2).map((booking) => (
                <Link key={booking.id} href={`/account/bookings/${booking.id}`} className="block">
                  <div className="flex gap-5 p-4 border rounded-2xl hover:shadow-md transition-all group">
                    <div className="relative w-32 h-28 rounded-xl overflow-hidden shrink-0">
                      <Image
                        src={booking.propertyImage || 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400'}
                        alt={booking.propertyName}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{booking.propertyName}</h4>
                          <p className="text-muted-foreground">{booking.propertyCity}</p>
                        </div>
                        <Badge className={booking.status === 'confirmed' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'}>
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                        </span>
                        <span>{booking.roomTypeName}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-4">No upcoming bookings</p>
              <Link href="/hostels">
                <Button className="rounded-full px-6">
                  <Plus className="h-4 w-4 mr-2" />
                  Book Your Next Stay
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {guest?.aoClubMember && (
        <Card className="rounded-2xl border-0 shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-orange-400 p-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white text-xl">Your Loyalty Status</CardTitle>
                <p className="text-white/80 text-sm mt-1">Earn points on every stay</p>
              </div>
              <TrendingUp className="h-8 w-8 text-white/80" />
            </div>
          </div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-bold text-primary">{guest.loyaltyPoints}</p>
                <p className="text-muted-foreground">Loyalty Points</p>
              </div>
              <div className="text-right">
                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="font-semibold">1,000 points = €10</p>
                  <p className="text-sm text-muted-foreground">Towards free night</p>
                </div>
              </div>
            </div>
            <Link href="/account/loyalty">
              <Button className="w-full mt-6 rounded-full" variant="outline">
                View Details <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}