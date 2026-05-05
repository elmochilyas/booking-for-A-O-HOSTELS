'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { User, Lock, Check, ArrowRight, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useBookingStore } from '@/stores/booking.store'
import { guestDetailsSchema } from '@/lib/validations'
import { formatCurrency } from '@/lib/utils'
import type { z } from 'zod'

type GuestFormData = z.infer<typeof guestDetailsSchema>

export default function BookingStep3Page({ params }: { params: { propertyId: string } }) {
  const { propertyId } = params
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
                  step === 3 ? 'bg-white text-primary scale-110 shadow-lg' : 'bg-white/20 text-white/70'
                }`}>
                  {step}
                </div>
                <span className={`text-xs md:text-sm font-medium ${step === 3 ? 'text-white' : 'text-white/50'}`}>
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
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <Card className="rounded-2xl border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    Guest Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="firstName" className="text-sm font-semibold">First Name *</Label>
                      <div className="mt-2">
                        <Input id="firstName" {...register('firstName')} className="rounded-xl border-muted-foreground/20" />
                      </div>
                      {errors.firstName && (
                        <p className="text-sm text-destructive mt-1">{errors.firstName.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-sm font-semibold">Last Name *</Label>
                      <div className="mt-2">
                        <Input id="lastName" {...register('lastName')} className="rounded-xl border-muted-foreground/20" />
                      </div>
                      {errors.lastName && (
                        <p className="text-sm text-destructive mt-1">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="email" className="text-sm font-semibold">Email *</Label>
                      <div className="mt-2">
                        <Input id="email" type="email" {...register('email')} className="rounded-xl border-muted-foreground/20" />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-sm font-semibold">Phone *</Label>
                      <div className="mt-2">
                        <Input id="phone" {...register('phone')} className="rounded-xl border-muted-foreground/20" />
                      </div>
                      {errors.phone && (
                        <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="country" className="text-sm font-semibold">Country *</Label>
                    <div className="mt-2">
                      <Input id="country" {...register('country')} className="rounded-xl border-muted-foreground/20" />
                    </div>
                    {errors.country && (
                      <p className="text-sm text-destructive mt-1">{errors.country.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="specialRequests" className="text-sm font-semibold">Special Requests</Label>
                    <div className="mt-2">
                      <Input
                        id="specialRequests"
                        placeholder="Any special requirements..."
                        {...register('specialRequests')}
                        className="rounded-xl border-muted-foreground/20"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Lock className="h-5 w-5 text-primary" />
                    </div>
                    Create Account (Optional)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-5">
                    <Checkbox
                      id="createAccount"
                      checked={createAccount}
                      onCheckedChange={(checked) => setCreateAccount(checked === true)}
                      className="rounded-md"
                    />
                    <Label htmlFor="createAccount" className="font-normal cursor-pointer text-sm">
                      Create an account to manage bookings and earn loyalty points
                    </Label>
                  </div>

                  {createAccount && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                        <div className="mt-2">
                          <Input id="password" type="password" {...register('password')} className="rounded-xl border-muted-foreground/20" />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    Cancellation Policy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Free cancellation until 24 hours before check-in. After that, the first night is non-refundable.
                  </p>
                </CardContent>
              </Card>

              <Button type="submit" size="lg" className="w-full h-12 rounded-xl text-base font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                Continue to Payment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
          </div>

          {/* Summary Sidebar - Enhanced */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 rounded-2xl border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <CardHeader className="bg-primary/5 border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="p-1.5 bg-primary/10 rounded-lg">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  Booking Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="flex gap-4">
                  <div className="relative w-20 h-16 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={cart.propertyImage}
                      alt={cart.propertyName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{cart.propertyName}</h4>
                    <p className="text-sm text-muted-foreground mt-0.5">{cart.nights} nights</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Room</span>
                    <span className="font-medium">{cart.selectedRoomTypeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-in</span>
                    <span className="font-medium">{cart.checkIn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-out</span>
                    <span className="font-medium">{cart.checkOut}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Guests</span>
                    <span className="font-medium">{cart.guests}</span>
                  </div>
                </div>

                {cart.extras.length > 0 && (
                  <div className="border-t pt-5">
                    <p className="text-sm font-medium mb-3">Extras:</p>
                    <div className="space-y-2">
                      {cart.extras.map((extra) => (
                        <div key={extra.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{extra.name} x{extra.quantity}</span>
                          <span className="font-medium">{formatCurrency(extra.price * extra.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t pt-5">
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