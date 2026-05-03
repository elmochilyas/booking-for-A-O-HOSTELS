'use client'

import { use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Check, MapPin, Clock, Calendar, Download, User, Wifi } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useBooking } from '@/hooks/useBooking'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatDate } from '@/lib/utils'
import { paymentsService } from '@/services/payments.service'

function generateICS(booking: {
  id: string
  propertyName: string
  propertyCity: string
  checkIn: string
  checkOut: string
  roomTypeName: string
}): string {
  const dtStart = booking.checkIn.replace(/-/g, '') + 'T150000'
  const dtEnd = booking.checkOut.replace(/-/g, '') + 'T100000'
  const now = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z'

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//A&O Hostels//Booking//EN',
    'BEGIN:VEVENT',
    `UID:booking-${booking.id}@ao-hostels.com`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:A&O ${booking.propertyCity} — ${booking.roomTypeName}`,
    `DESCRIPTION:Booking ID: ${booking.id}\\nProperty: ${booking.propertyName}`,
    `LOCATION:${booking.propertyName}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

function downloadICS(booking: Parameters<typeof generateICS>[0]) {
  const ics = generateICS(booking)
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ao-booking-${booking.id}.ics`
  a.click()
  URL.revokeObjectURL(url)
}

async function downloadInvoice(bookingId: string) {
  try {
    const blob = await paymentsService.getInvoice(bookingId)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ao-invoice-${bookingId}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  } catch {
    alert('Invoice is being generated. Please try again in a moment.')
  }
}

export default function ConfirmationPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = use(params)
  const { data: booking, isLoading } = useBooking(bookingId)

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Booking not found</p>
        <Link href="/account/bookings" className="mt-4 inline-block">
          <Button>View My Bookings</Button>
        </Link>
      </div>
    )
  }

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(booking.propertyName + ', ' + booking.propertyCity)}`

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Success Banner */}
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
            <p className="text-muted-foreground">
              Your reservation is confirmed. A confirmation email has been sent to{' '}
              <span className="font-medium">{booking.guestEmail}</span>.
            </p>
          </CardContent>
        </Card>

        {/* Booking Details */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="relative w-full md:w-48 h-40 rounded-lg overflow-hidden shrink-0">
                <Image
                  src={booking.propertyImage || 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400'}
                  alt={booking.propertyName}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-1">{booking.propertyName}</h2>
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4" />
                  {booking.propertyCity}
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground block">Booking ID</span>
                    <p className="font-semibold font-mono">{booking.id}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Room Type</span>
                    <p className="font-semibold">{booking.roomTypeName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Check-in</span>
                    <p className="font-semibold">{formatDate(booking.checkIn)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Check-out</span>
                    <p className="font-semibold">{formatDate(booking.checkOut)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Guests</span>
                    <p className="font-semibold">{booking.guests}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Status</span>
                    <p className="font-semibold capitalize text-green-600">{booking.status}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Check-in Instructions */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4">Check-in Instructions</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Check-in Time</p>
                  <p className="text-sm text-muted-foreground">From 3:00 PM (15:00). Early check-in available if pre-booked.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">What to Bring</p>
                  <p className="text-sm text-muted-foreground">Valid photo ID (passport or national ID card) and a credit card for incidentals deposit.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Wifi className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Free WiFi</p>
                  <p className="text-sm text-muted-foreground">Available throughout the property. Network details provided at reception.</p>
                </div>
              </div>
            </div>

            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="block mt-6">
              <Button variant="outline" className="w-full sm:w-auto">
                <MapPin className="h-4 w-4 mr-2" />
                Get Directions
              </Button>
            </a>
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Price</span>
                <span className="font-semibold">{formatCurrency(booking.totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paid Now</span>
                <span className="font-semibold text-green-600">{formatCurrency(booking.depositAmount || booking.totalPrice)}</span>
              </div>
              {booking.totalPrice - (booking.depositAmount || booking.totalPrice) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due at Hotel</span>
                  <span className="font-semibold">{formatCurrency(booking.totalPrice - booking.depositAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Status</span>
                <span className="font-semibold capitalize">{booking.paymentStatus}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => downloadInvoice(booking.id)}
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => downloadICS({
              id: booking.id,
              propertyName: booking.propertyName,
              propertyCity: booking.propertyCity,
              checkIn: booking.checkIn,
              checkOut: booking.checkOut,
              roomTypeName: booking.roomTypeName,
            })}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Add to Calendar
          </Button>
        </div>

        <div className="mt-8 text-center">
          <Link href={`/account/bookings/${booking.id}`}>
            <Button>Manage This Booking</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
