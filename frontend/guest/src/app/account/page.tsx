'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Bed, Star, ArrowRight, Plus, Calendar, Heart, Settings, TrendingUp, Clock, MapPin, Sparkles, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useMyBookings } from '@/hooks/useBooking'
import { useAuthStore } from '@/stores/auth.store'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

export default function AccountDashboardPage() {
  const { guest } = useAuthStore()
  const { data: bookings, isLoading } = useMyBookings('upcoming')

  const quickActions = [
    { icon: Bed, label: 'Find a Hostel', href: '/hostels', color: 'bg-orange-100 text-orange-600', desc: 'Best rates guaranteed' },
    { icon: Calendar, label: 'My Bookings', href: '/account/bookings', color: 'bg-blue-100 text-blue-600', desc: 'Manage reservations' },
    { icon: Heart, label: 'Wishlist', href: '/account/wishlist', color: 'bg-pink-100 text-pink-600', desc: 'Saved properties' },
    { icon: Settings, label: 'Settings', href: '/account/profile', color: 'bg-gray-100 text-gray-600', desc: 'Account preferences' },
  ]

  // Mock recent activity - would come from API
  const recentActivity = [
    { id: 1, action: 'Booking confirmed', property: 'A&O Berlin Hauptbahnhof', date: '2024-03-15' },
    { id: 2, action: 'Points earned', points: 150, date: '2024-03-10' },
    { id: 3, action: 'Profile updated', date: '2024-03-05' },
  ]

  return (
    <div className="space-y-8">
      {/* Hero Card */}
      <Card className="relative overflow-hidden rounded-3xl border-0 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-orange-400" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        
        {/* Decorative elements */}
        <div className="absolute top-4 right-4 opacity-20">
          <Gift className="h-32 w-32 text-white" />
        </div>
        
        <CardContent className="relative p-8 md:p-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Welcome back, {guest?.firstName || 'Guest'}! 👋
              </h1>
              <p className="text-white/80 text-lg">Ready for your next adventure?</p>
            </div>
            {guest?.aoClubMember && (
              <div className="flex items-center gap-3 bg-white/20 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20">
                <div className="p-2 bg-yellow-400/20 rounded-xl">
                  <Star className="h-8 w-8 text-yellow-300 fill-yellow-300" />
                </div>
                <div className="text-left">
                  <p className="text-white/70 text-xs uppercase tracking-wide">Available Points</p>
                  <p className="text-white font-bold text-2xl">{guest.loyaltyPoints}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Card className="hover:shadow-xl hover:-translate-y-1 card-hover rounded-2xl border-0 shadow-md cursor-pointer group transition-all duration-300">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className={`p-4 rounded-2xl ${action.color} mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <span className="font-semibold group-hover:text-primary transition-colors">{action.label}</span>
                <span className="text-xs text-muted-foreground mt-1">{action.desc}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Bookings */}
        <div className="lg:col-span-2">
          <Card className="rounded-2xl border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold">Upcoming Bookings</CardTitle>
              </div>
              <Link href="/account/bookings">
                <Button variant="ghost" size="sm" className="rounded-full hover:bg-primary/10">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                </div>
              ) : bookings && bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.slice(0, 3).map((booking) => (
                    <Link key={booking.id} href={`/account/bookings/${booking.id}`} className="block">
                      <div className="flex gap-5 p-5 border rounded-2xl hover:shadow-lg hover:border-primary/20 transition-all group">
                        <div className="relative w-36 h-28 rounded-xl overflow-hidden shrink-0">
                          <Image
                            src={booking.propertyImage || 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400'}
                            alt={booking.propertyName}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute bottom-2 right-2">
                            <Badge className="bg-black/50 text-white border-0 backdrop-blur-sm">
                              <MapPin className="h-3 w-3 mr-1" />
                              {booking.propertyCity}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{booking.propertyName}</h4>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                              </p>
                            </div>
                            <Badge className={booking.status === 'confirmed' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'}>
                              {booking.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="px-3 py-1 bg-muted rounded-full">{booking.roomTypeName}</span>
                            <span className="font-semibold text-primary">{formatCurrency(booking.totalPrice)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-orange-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-10 w-10 text-primary/50" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">No upcoming bookings</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Start planning your next adventure with A&O Hostels across Europe.</p>
                  <Link href="/hostels">
                    <Button className="rounded-full px-8 shadow-lg hover:shadow-xl transition-all">
                      <Plus className="h-4 w-4 mr-2" />
                      Book Your Next Stay
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Sidebar */}
        <div className="space-y-6">
          {/* Loyalty Card */}
          {guest?.aoClubMember && (
            <Card className="rounded-2xl border-0 shadow-md overflow-hidden">
              <div className="bg-gradient-to-br from-primary to-orange-500 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white/70 text-xs uppercase tracking-wider">Loyalty Status</p>
                    <p className="text-white font-bold text-3xl">{guest.loyaltyPoints} <span className="text-lg">pts</span></p>
                  </div>
                  <Sparkles className="h-8 w-8 text-yellow-300" />
                </div>
                <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm">
                  <div className="flex justify-between text-white/90 text-sm mb-1">
                    <span>Progress to Gold</span>
                    <span>450/1000</span>
                  </div>
                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full" style={{ width: '45%' }} />
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <Link href="/account/loyalty">
                  <Button className="w-full rounded-xl" variant="outline">
                    View Rewards <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <Card className="rounded-2xl border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={activity.id}>
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 bg-primary rounded-full mt-2 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.action}</p>
                        {activity.property && (
                          <p className="text-xs text-muted-foreground truncate">{activity.property}</p>
                        )}
                        {activity.points && (
                          <p className="text-xs text-green-600 font-medium">+{activity.points} points</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">{formatDate(activity.date)}</p>
                      </div>
                    </div>
                    {index < recentActivity.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}