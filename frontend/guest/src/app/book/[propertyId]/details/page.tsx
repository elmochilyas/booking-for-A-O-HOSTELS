'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useBookingStore } from '@/stores/booking.store'
import { guestDetailsSchema } from '@/lib/validations'
import { formatCurrency } from '@/lib/utils'
import type { z } from 'zod'

type GuestFormData = z.infer<typeof guestDetailsSchema>

export default function BookingStep3Page({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = use(params)
  const router = useRouter()
  const { cart, setGuestDetails } = useBookingStore()
  const [createAccount, setCreateAccount] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuestFormData>({
    resolver: zodResolver(guestDetailsSchema),
  })

  useEffect(() => {
    if (!cart?.selectedRoomTypeId) {
      router.push(`/book/${propertyId}`)
    }
  }, [cart])

  const onSubmit = (data: GuestFormData) => {
    setGuestDetails({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      country: data.country || '',
      specialRequests: data.specialRequests,
    })
    router.push(`/book/${propertyId}/payment`)
  }

  if (!cart) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading...</p>
      </div>
    )
  }

  const total = cart.totalPrice || (cart.roomPrice * cart.nights)

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Progress */}
      <div className="bg-primary text-primary-foreground py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex gap-8 text-sm">
            <span className="opacity-50">1. Room</span>
            <span className="opacity-50">2. Extras</span>
            <span className="font-semibold">3. Details</span>
            <span className="opacity-50">4. Payment</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Guest Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input id="firstName" {...register('firstName')} />
                      {errors.firstName && (
                        <p className="text-sm text-destructive mt-1">{errors.firstName.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input id="lastName" {...register('lastName')} />
                      {errors.lastName && (
                        <p className="text-sm text-destructive mt-1">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" {...register('email')} />
                      {errors.email && (
                        <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input id="phone" {...register('phone')} />
                      {errors.phone && (
                        <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Input id="country" {...register('country')} />
                    {errors.country && (
                      <p className="text-sm text-destructive mt-1">{errors.country.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="specialRequests">Special Requests</Label>
                    <Input
                      id="specialRequests"
                      placeholder="Any special requirements..."
                      {...register('specialRequests')}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Create Account (Optional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <Checkbox
                      id="createAccount"
                      checked={createAccount}
                      onCheckedChange={(checked) => setCreateAccount(checked === true)}
                    />
                    <Label htmlFor="createAccount" className="font-normal cursor-pointer">
                      Create an account to manage bookings and earn loyalty points
                    </Label>
                  </div>

                  {createAccount && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" {...register('password')} />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cancellation Policy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Free cancellation until 24 hours before check-in. After that, the first night is non-refundable.
                  </p>
                </CardContent>
              </Card>

              <Button type="submit" size="lg" className="w-full">
                Continue to Payment
              </Button>
            </form>
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
                      src={cart.propertyImage}
                      alt={cart.propertyName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{cart.propertyName}</h4>
                    <p className="text-sm text-muted-foreground">{cart.nights} nights</p>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Room</span>
                    <span>{cart.selectedRoomTypeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-in</span>
                    <span>{cart.checkIn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-out</span>
                    <span>{cart.checkOut}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Guests</span>
                    <span>{cart.guests}</span>
                  </div>
                </div>

                {cart.extras.length > 0 && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-2">Extras:</p>
                    {cart.extras.map((extra) => (
                      <div key={extra.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{extra.name} x{extra.quantity}</span>
                        <span>{formatCurrency(extra.price * extra.quantity)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}