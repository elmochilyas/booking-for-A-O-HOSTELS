'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Bed, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMyBookings } from '@/hooks/useBooking'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, formatCurrency } from '@/lib/utils'

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState('upcoming')
  const { data: bookings, isLoading } = useMyBookings(activeTab)

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'secondary' | 'destructive' | 'warning'> = {
      confirmed: 'success',
      checked_in: 'success',
      checked_out: 'secondary',
      cancelled: 'destructive',
      pending: 'warning',
    }
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Bookings</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          ) : bookings && bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Link key={booking.id} href={`/account/bookings/${booking.id}`}>
                  <Card className="hover:shadow-lg transition-all cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative w-full md:w-40 h-32 rounded-md overflow-hidden shrink-0">
                          <Image
                            src={booking.propertyImage || 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=300'}
                            alt={booking.propertyName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg">{booking.propertyName}</h3>
                              <p className="text-sm text-muted-foreground">{booking.propertyCity}</p>
                            </div>
                            {getStatusBadge(booking.status)}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Check-in</span>
                              <p className="font-medium">{formatDate(booking.checkIn)}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Check-out</span>
                              <p className="font-medium">{formatDate(booking.checkOut)}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Room</span>
                              <p className="font-medium">{booking.roomTypeName}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Total</span>
                              <p className="font-medium text-primary">{formatCurrency(booking.totalPrice)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bed className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No {activeTab} bookings</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}