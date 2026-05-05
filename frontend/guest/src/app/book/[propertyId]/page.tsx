'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Calendar as CalendarIcon, Users, Bed, Check, Maximize, ArrowRight } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { DayPicker, DateRange } from 'react-day-picker'
import 'react-day-picker/style.css'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useProperty, useRoomTypes, useAvailability } from '@/hooks/useProperties'
import { useBookingStore } from '@/stores/booking.store'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, calculateNights } from '@/lib/utils'

export default function BookingStep1Page({ params }: { params: { propertyId: string } }) {
  const { propertyId } = params
  const router = useRouter()
  const { data: property, isLoading: loadingProperty } = useProperty(propertyId)
  const { data: roomTypes, isLoading: loadingRooms } = useRoomTypes(propertyId)

  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [guests, setGuests] = useState(1)
  const [selectedRoomId, setSelectedRoomId] = useState('')

  const { setProperty, setDates, setGuests: setStoreGuests, setRoom, clearBooking } = useBookingStore()

  useEffect(() => {
    clearBooking()
    if (property) {
      setProperty(property.id, property.name, property.images?.[0]?.url || '')
    }
  }, [property])

  const checkIn = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : ''
  const checkOut = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : ''
  const nights = checkIn && checkOut ? calculateNights(checkIn, checkOut) : 0

  const selectedRoom = roomTypes?.find(r => r.id === selectedRoomId)

  const handleContinue = () => {
    if (!checkIn || !checkOut || !selectedRoomId) return

    setDates(checkIn, checkOut)
    setStoreGuests(guests)
    setRoom(selectedRoomId, selectedRoom!.name, selectedRoom!.pricePerNight)

    router.push(`/book/${propertyId}/extras`)
  }

  if (loadingProperty || loadingRooms) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p>Property not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/20 to-white">
      {/* Progress - Enhanced Stepper */}
      <div className="bg-primary text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 md:gap-4">
            {[
              { step: 1, label: 'Room' },
              { step: 2, label: 'Extras' },
              { step: 3, label: 'Details' },
              { step: 4, label: 'Payment' },
            ].map(({ step, label }, index) => (
              <div key={step} className="flex items-center gap-2 md:gap-3">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step === 1 ? 'bg-white text-primary scale-110 shadow-lg' : 'bg-white/20 text-white/70'
                }`}>
                  {step}
                </div>
                <span className={`text-xs md:text-sm font-medium ${step === 1 ? 'text-white' : 'text-white/50'}`}>
                  {label}
                </span>
                {index < 3 && <div className="w-8 md:w-12 h-0.5 bg-white/20 mx-1" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Date Selection - Enhanced */}
            <Card className="rounded-2xl border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                  </div>
                  Select Dates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1">
                    <div className="rounded-2xl border border-gray-100 p-4 bg-white">
                      <DayPicker
                        mode="range"
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                        disabled={{ before: new Date() }}
                        className=""
                      />
                    </div>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <Label className="text-sm font-semibold">Check-in</Label>
                      <div className="mt-2 p-3 bg-muted/50 rounded-xl text-sm font-medium">
                        {checkIn || 'Select date'}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Check-out</Label>
                      <div className="mt-2 p-3 bg-muted/50 rounded-xl text-sm font-medium">
                        {checkOut || 'Select date'}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Guests</Label>
                      <div className="flex items-center gap-3 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setGuests(Math.max(1, guests - 1))}
                          className="rounded-xl h-10 w-10 hover:bg-primary/10 hover:border-primary/50 transition-all"
                        >
                          -
                        </Button>
                        <div className="px-6 py-2 bg-muted/50 rounded-xl text-sm font-bold min-w-[60px] text-center">
                          {guests}
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setGuests(Math.min(10, guests + 1))}
                          className="rounded-xl h-10 w-10 hover:bg-primary/10 hover:border-primary/50 transition-all"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    {nights > 0 && (
                      <div className="p-4 bg-primary/5 rounded-xl">
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="text-2xl font-bold text-primary">{nights} nights</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Room Selection - Enhanced */}
            <Card className="rounded-2xl border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Bed className="h-5 w-5 text-primary" />
                  </div>
                  Available Rooms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!roomTypes?.length ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bed className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <p className="text-muted-foreground">No rooms available for selected dates</p>
                  </div>
                ) : (
                  roomTypes.map((room) => (
                    <div
                      key={room.id}
                      className={`border rounded-xl p-5 cursor-pointer transition-all duration-300 ${
                        selectedRoomId === room.id
                          ? 'border-primary bg-primary/5 shadow-md scale-[1.01]'
                          : 'border-gray-100 hover:border-primary/30 hover:shadow-md'
                      }`}
                      onClick={() => setSelectedRoomId(room.id)}
                    >
                      <div className="flex gap-5">
                        <div className="relative w-36 h-28 rounded-lg overflow-hidden shrink-0">
                          <Image
                            src={room.images?.[0]?.url || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=200'}
                            alt={room.name}
                            fill
                            className="object-cover"
                          />
                          {selectedRoomId === room.id && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                              <Check className="h-8 w-8 text-white drop-shadow-lg" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-lg">{room.name}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{room.description}</p>
                              <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                  <Users className="h-3.5 w-3.5" />
                                  Up to {room.capacity} guests
                                </span>
                                {room.bedType && (
                                  <span className="flex items-center gap-1.5">
                                    <Bed className="h-3.5 w-3.5" />
                                    {room.bedType}
                                  </span>
                                )}
                                {room.roomSize > 0 && (
                                  <span className="flex items-center gap-1.5">
                                    <Maximize className="h-3.5 w-3.5" />
                                    {room.roomSize}m²
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-2xl font-black text-primary">
                                {formatCurrency(room.pricePerNight)}
                              </p>
                              <p className="text-xs text-muted-foreground">per night</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar - Enhanced */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 rounded-2xl border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <CardHeader className="bg-primary/5 border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="p-1.5 bg-primary/10 rounded-lg">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                  </div>
                  Booking Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="flex gap-4">
                  <div className="relative w-20 h-16 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={property.images?.[0]?.url || ''}
                      alt={property.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{property.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{property.city}</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Dates</span>
                    <span className="font-medium">{nights} nights</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Guests</span>
                    <span className="font-medium">{guests}</span>
                  </div>
                  {selectedRoom && (
                    <div className="flex justify-between items-start">
                      <span className="text-muted-foreground">Room</span>
                      <span className="font-medium text-right">{selectedRoom.name}</span>
                    </div>
                  )}
                </div>

                {selectedRoom && nights > 0 && (
                  <div className="border-t pt-5 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{formatCurrency(selectedRoom.pricePerNight)} x {nights} nights</span>
                      <span>{formatCurrency(selectedRoom.pricePerNight * nights)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">{formatCurrency(selectedRoom.pricePerNight * nights)}</span>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full h-12 rounded-xl text-base font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                  disabled={!checkIn || !checkOut || !selectedRoomId}
                  onClick={handleContinue}
                >
                  Continue
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}