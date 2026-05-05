'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Bed, Filter, Search, ArrowUpDown, RotateCcw, MapPin, Calendar, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useMyBookings } from '@/hooks/useBooking'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState('upcoming')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('date-desc')
  const { data: bookings, isLoading } = useMyBookings(activeTab)

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'secondary' | 'destructive' | 'warning'> = {
      confirmed: 'success',
      checked_in: 'success',
      checked_out: 'secondary',
      cancelled: 'destructive',
      pending: 'warning',
    }
    const labels: Record<string, string> = {
      confirmed: 'Confirmed',
      checked_in: 'Checked In',
      checked_out: 'Completed',
      cancelled: 'Cancelled',
      pending: 'Pending',
    }
    return (
      <Badge variant={variants[status] || 'secondary'} className="capitalize">
        {labels[status] || status}
      </Badge>
    )
  }

  const filteredAndSortedBookings = useMemo(() => {
    if (!bookings) return []
    
    let filtered = bookings.filter(b => 
      b.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.propertyCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.id.toLowerCase().includes(searchTerm.toLowerCase())
    )

    switch (sortBy) {
      case 'date-asc':
        filtered.sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime())
        break
      case 'date-desc':
        filtered.sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime())
        break
      case 'price-asc':
        filtered.sort((a, b) => a.totalPrice - b.totalPrice)
        break
      case 'price-desc':
        filtered.sort((a, b) => b.totalPrice - a.totalPrice)
        break
    }

    return filtered
  }, [bookings, searchTerm, sortBy])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Bookings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {bookings?.length || 0} total bookings
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/hostels">
            <Bed className="h-4 w-4 mr-2" />
            Book a Room
          </Link>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 rounded-full"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px] rounded-full">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="price-desc">Price: High-Low</SelectItem>
                <SelectItem value="price-asc">Price: Low-High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-36" />
              <Skeleton className="h-36" />
              <Skeleton className="h-36" />
            </div>
          ) : filteredAndSortedBookings.length > 0 ? (
            <div className="space-y-4">
              {filteredAndSortedBookings.map((booking) => (
                <Link key={booking.id} href={`/account/bookings/${booking.id}`}>
                  <Card className="hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer group">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative w-full md:w-48 h-36 md:h-32 rounded-xl overflow-hidden shrink-0">
                          <Image
                            src={booking.propertyImage || 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=300'}
                            alt={booking.propertyName}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-black/50 text-white border-0 backdrop-blur-sm">
                              <MapPin className="h-3 w-3 mr-1" />
                              {booking.propertyCity}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                {booking.propertyName}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-1">
                                Booking Ref: <span className="font-mono font-medium">{booking.id}</span>
                              </p>
                            </div>
                            {getStatusBadge(booking.status)}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                            <div className="bg-muted/50 rounded-lg p-2.5">
                              <span className="text-[10px] text-muted-foreground uppercase">Check-in</span>
                              <p className="font-medium text-sm flex items-center gap-1 mt-0.5">
                                <Calendar className="h-3 w-3" />
                                {formatDate(booking.checkIn)}
                              </p>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-2.5">
                              <span className="text-[10px] text-muted-foreground uppercase">Check-out</span>
                              <p className="font-medium text-sm flex items-center gap-1 mt-0.5">
                                <Calendar className="h-3 w-3" />
                                {formatDate(booking.checkOut)}
                              </p>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-2.5">
                              <span className="text-[10px] text-muted-foreground uppercase">Room</span>
                              <p className="font-medium text-sm flex items-center gap-1 mt-0.5">
                                <Users className="h-3 w-3" />
                                {booking.roomTypeName}
                              </p>
                            </div>
                            <div className="bg-primary/5 rounded-lg p-2.5">
                              <span className="text-[10px] text-muted-foreground uppercase">Total</span>
                              <p className="font-bold text-sm text-primary mt-0.5">
                                {formatCurrency(booking.totalPrice)}
                              </p>
                            </div>
                          </div>

                          {activeTab === 'past' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-3 rounded-full"
                              onClick={(e) => {
                                e.preventDefault()
                              }}
                            >
                              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                              Book Again
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Bed className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No {activeTab} bookings found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm ? 'Try adjusting your search' : 'Start exploring our hostels'}
              </p>
              {!searchTerm && (
                <Button asChild className="rounded-full">
                  <Link href="/hostels">Browse Hostels</Link>
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}