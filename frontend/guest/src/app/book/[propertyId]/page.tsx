'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Calendar as CalendarIcon, Users } from 'lucide-react'
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

export default function BookingStep1Page({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = use(params)
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
    <div className="min-h-screen bg-muted/30">
      {/* Progress */}
      <div className="bg-primary text-primary-foreground py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex gap-8 text-sm">
            <span className="font-semibold">1. Room</span>
            <span className="opacity-50">2. Extras</span>
            <span className="opacity-50">3. Details</span>
            <span className="opacity-50">4. Payment</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Date Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Dates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1">
                    <DayPicker
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                      disabled={{ before: new Date() }}
                      className="border rounded-lg p-4"
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>Check-in</Label>
                      <Input
                        value={checkIn}
                        readOnly
                        placeholder="Select date"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Check-out</Label>
                      <Input
                        value={checkOut}
                        readOnly
                        placeholder="Select date"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Guests</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setGuests(Math.max(1, guests - 1))}
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          value={guests}
                          onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                          min={1}
                          max={10}
                          className="w-16 text-center"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setGuests(Math.min(10, guests + 1))}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Room Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Available Rooms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!roomTypes?.length ? (
                  <p className="text-muted-foreground">No rooms available for selected dates</p>
                ) : (
                  roomTypes.map((room) => (
                    <div
                      key={room.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedRoomId === room.id
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedRoomId(room.id)}
                    >
                      <div className="flex gap-4">
                        <div className="relative w-32 h-24 rounded-md overflow-hidden shrink-0">
                          <Image
                            src={room.images?.[0]?.url || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=200'}
                            alt={room.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div>
                              <h4 className="font-semibold">{room.name}</h4>
                              <p className="text-sm text-muted-foreground">{room.description}</p>
                              <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                                <span>Up to {room.capacity} guests</span>
                                <span>{room.bedType}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-primary">
                                {formatCurrency(room.pricePerNight)}
                              </p>
                              <p className="text-sm text-muted-foreground">per night</p>
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

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="relative w-20 h-16 rounded-md overflow-hidden shrink-0">
                    <Image
                      src={property.images?.[0]?.url || ''}
                      alt={property.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{property.name}</h4>
                    <p className="text-sm text-muted-foreground">{property.city}</p>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dates</span>
                    <span>{nights} nights</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Guests</span>
                    <span>{guests}</span>
                  </div>
                  {selectedRoom && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Room</span>
                      <span>{selectedRoom.name}</span>
                    </div>
                  )}
                </div>

                {selectedRoom && nights > 0 && (
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-sm">
                      <span>{formatCurrency(selectedRoom.pricePerNight)} x {nights} nights</span>
                      <span>{formatCurrency(selectedRoom.pricePerNight * nights)}</span>
                    </div>
                    <div className="flex justify-between font-bold mt-2">
                      <span>Total</span>
                      <span className="text-primary">{formatCurrency(selectedRoom.pricePerNight * nights)}</span>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full"
                  size="lg"
                  disabled={!checkIn || !checkOut || !selectedRoomId}
                  onClick={handleContinue}
                >
                  Continue
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}