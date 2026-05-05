'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Check, MapPin, Clock, Calendar, Download, User, Wifi, ArrowRight, Info, Settings, Bed, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

function Confetti() {
  const pieces = Array.from({ length: 40 }, (_, i) => i)
  const colors = ['#293a88', '#1E3A5F', '#4159a8', '#FFD700', '#4CAF50', '#2196F3']

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map((i) => (
        <div
          key={i}
          className="absolute w-2.5 h-2.5 opacity-0"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            backgroundColor: colors[i % colors.length],
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animation: `confetti-fall ${1.5 + Math.random() * 2}s ease-in ${Math.random() * 1.5}s forwards`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { opacity: 1; transform: translateY(0) rotate(0deg); }
          100% { opacity: 0; transform: translateY(100vh) rotate(${Math.random() * 720}deg); }
        }
      `}</style>
    </div>
  )
}

export default function ConfirmationPage({ params }: { params: { bookingId: string } }) {
  const { bookingId } = params
  const { data: booking, isLoading } = useBooking(bookingId)
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000)
    return () => clearTimeout(timer)
  }, [])

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
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-muted/20 py-12">
      {showConfetti && <Confetti />}

      <div className="container mx-auto px-4 max-w-3xl">
        {/* Success header */}
        <div className="text-center mb-12 animate-scale-in">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Check className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">You&apos;re all set!</h1>
          <p className="text-lg text-muted-foreground">
            Confirmation sent to <span className="font-semibold text-foreground">{booking.guestEmail}</span>
          </p>
        </div>

        {/* Boarding pass card - Enhanced */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-10 animate-slide-up border border-gray-100">
          {/* Top section */}
          <div className="bg-gradient-to-r from-primary via-primary to-primary/80 p-8 text-white">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <svg className="w-10 h-10" viewBox="0 0 32 32" fill="none">
                  <path d="M16 2L28 26H4L16 2Z" fill="white" />
                  <path d="M16 8L22 22H10L16 8Z" fill="#4159a8" />
                </svg>
                <span className="text-3xl font-bold">a&o</span>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-xs uppercase tracking-widest">Status</p>
                <span className="inline-block px-4 py-1.5 bg-green-500 text-white text-sm font-bold rounded-full shadow-lg">
                  ✓ CONFIRMED
                </span>
              </div>
            </div>
            <div>
              <p className="text-white/60 text-xs uppercase tracking-widest mb-2">Property</p>
              <h2 className="text-3xl font-bold">{booking.propertyName}</h2>
              <div className="flex items-center gap-3 text-white/80 mt-2">
                <div className="p-1.5 bg-white/10 rounded-lg">
                  <MapPin className="h-4 w-4" />
                </div>
                {booking.propertyCity}
              </div>
            </div>
          </div>

          {/* Dashed tear-off separator */}
          <div className="relative flex items-center my-2">
            <div className="absolute -left-6 w-12 h-12 bg-gradient-to-b from-muted/50 to-white rounded-full border-4 border-white" />
            <div className="flex-1 border-t-2 border-dashed border-gray-200 mx-6" />
            <div className="absolute -right-6 w-12 h-12 bg-gradient-to-b from-muted/50 to-white rounded-full border-4 border-white" />
          </div>

          {/* Details section */}
          <div className="p-8">
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-widest mb-2">Check-in</p>
                <p className="font-bold text-xl">{formatDate(booking.checkIn)}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Clock className="h-3.5 w-3.5" />
                  From 3:00 PM
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-widest mb-2">Check-out</p>
                <p className="font-bold text-xl">{formatDate(booking.checkOut)}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Clock className="h-3.5 w-3.5" />
                  By 11:00 AM
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-widest mb-2">Room Type</p>
                <p className="font-bold text-lg">{booking.roomTypeName}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-widest mb-2">Guests</p>
                <p className="font-bold text-lg">{booking.guests}</p>
              </div>
            </div>

          {/* Barcode-style divider */}
          <div className="relative flex items-center my-6">
            <div className="absolute -left-6 w-12 h-12 bg-white rounded-full" />
            <div className="flex-1 border-t-2 border-dashed border-gray-200" />
            <div className="absolute -right-6 w-12 h-12 bg-white rounded-full" />
          </div>

          {/* Booking ID as barcode look */}
          <div className="flex items-center justify-between px-4">
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-widest mb-2">Booking ID</p>
              <p className="font-mono font-bold text-lg tracking-widest">{booking.id}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-xs uppercase tracking-widest mb-2">Total Paid</p>
              <p className="font-bold text-2xl text-primary">{formatCurrency(booking.depositAmount || booking.totalPrice)}</p>
            </div>
          </div>

          {/* Barcode visual */}
          <div className="mt-6 flex gap-1 h-16 items-end justify-center opacity-20">
            {Array.from({ length: 50 }, (_, i) => (
              <div
                key={i}
                className="bg-foreground rounded-sm"
                style={{
                  width: `${Math.random() > 0.7 ? 2 : 1}px`,
                  height: `${40 + Math.sin(i * 0.8) * 30}%`,
                }}
              />
            ))}
          </div>
        </div>
        </div>

        {/* Instructions - Enhanced */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <h3 className="font-bold text-xl mb-6 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Info className="h-5 w-5 text-primary" />
            </div>
            What to Know Before You Go
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Required Documents</p>
                <p className="text-sm text-muted-foreground mt-1">Valid photo ID (passport or national ID) + credit card for incidentals</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Check-in Time</p>
                <p className="text-sm text-muted-foreground mt-1">From 3:00 PM. Early check-in available if pre-booked.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <Wifi className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Amenities</p>
                <p className="text-sm text-muted-foreground mt-1">Free WiFi throughout the property. Details at reception.</p>
              </div>
            </div>
          </div>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="block mt-6">
            <Button variant="outline" className="rounded-full px-6 py-5 text-base hover:bg-primary hover:text-white transition-all duration-300">
              <MapPin className="h-4 w-4 mr-2" />
              Get Directions
            </Button>
          </a>
        </div>

        {/* Actions - Enhanced */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Button variant="outline" className="rounded-xl h-14 text-base hover:bg-primary/10 transition-all duration-300" onClick={() => downloadInvoice(booking.id)}>
            <Download className="h-5 w-5 mr-2" />
            Download Invoice
          </Button>
          <Button
            variant="outline"
            className="rounded-xl h-14 text-base hover:bg-primary/10 transition-all duration-300"
            onClick={() => downloadICS({
              id: booking.id,
              propertyName: booking.propertyName,
              propertyCity: booking.propertyCity,
              checkIn: booking.checkIn,
              checkOut: booking.checkOut,
              roomTypeName: booking.roomTypeName,
            })}
          >
            <Calendar className="h-5 w-5 mr-2" />
            Add to Calendar
          </Button>
        </div>

        <div className="text-center space-y-6">
          <Link href={`/account/bookings/${booking.id}`}>
            <Button size="lg" className="rounded-full px-10 py-6 text-base font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
              <Settings className="h-5 w-5 mr-2" />
              Manage This Booking
            </Button>
          </Link>
          <div className="flex items-center justify-center gap-6 text-sm">
            <Link href="/hostels" className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 font-medium">
              <Bed className="h-4 w-4" />
              Book Another Hostel
            </Link>
            <span className="text-muted-foreground/30">|</span>
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 font-medium">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>

        <div className="text-center space-y-4">
          <Link href={`/account/bookings/${booking.id}`}>
            <Button size="lg" className="rounded-full px-8">
              Manage This Booking
            </Button>
          </Link>
          <div>
            <Link href="/hostels" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1">
              Book another hostel
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
