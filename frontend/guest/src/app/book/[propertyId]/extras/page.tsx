'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Plus, Minus, Tag, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useProperty } from '@/hooks/useProperties'
import { useBookingStore } from '@/stores/booking.store'
import { useAuthStore } from '@/stores/auth.store'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import { EXTRAS, AO_CLUB_DISCOUNT } from '@/lib/constants'

export default function BookingStep2Page({ params }: { params: { propertyId: string } }) {
  const { propertyId } = params
  const router = useRouter()
  const { data: property, isLoading } = useProperty(propertyId)
  const { cart, addExtra, removeExtra, setPromoCode } = useBookingStore()
  const { guest } = useAuthStore()
  const [promoInput, setPromoInput] = useState('')
  const [promoError, setPromoError] = useState('')

  const selectedExtras = cart?.extras || []
  const isClubMember = !!guest?.aoClubMember

  useEffect(() => {
    if (!cart?.selectedRoomTypeId) {
      router.push(`/book/${propertyId}`)
    }
  }, [cart])

  const handleContinue = () => {
    router.push(`/book/${propertyId}/details`)
  }

  const handleExtraQuantity = (extraId: string, delta: number) => {
    const extra = EXTRAS.find(e => e.id === extraId)
    if (!extra) return

    const existing = selectedExtras.find(e => e.id === extraId)
    if (delta > 0) {
      addExtra({
        id: extra.id,
        name: extra.name,
        quantity: 1,
        price: extra.price,
        unit: extra.unit,
      })
    } else if (existing && existing.quantity > 1) {
      addExtra({
        id: extra.id,
        name: extra.name,
        quantity: -1,
        price: extra.price,
        unit: extra.unit,
      })
    } else {
      removeExtra(extraId)
    }
  }

  if (isLoading || !cart) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-96" />
      </div>
    )
  }

  const roomTotal = cart.roomPrice * cart.nights
  const extrasTotal = selectedExtras.reduce((sum, e) => sum + e.price * e.quantity, 0)
  const subtotal = roomTotal + extrasTotal
  const discount = isClubMember ? subtotal * AO_CLUB_DISCOUNT : 0
  const total = subtotal - discount

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/20 to-white">
      {/* Progress - Enhanced Stepper */}
      <div className="bg-primary text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 md:gap-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-bold bg-white/20 text-white/70">
                1
              </div>
              <span className="text-xs md:text-sm font-medium text-white/50">Room</span>
            </div>
            <div className="w-8 md:w-12 h-0.5 bg-white/20 mx-1" />
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-bold bg-white text-primary scale-110 shadow-lg">
                2
              </div>
              <span className="text-xs md:text-sm font-medium text-white">Extras</span>
            </div>
            <div className="w-8 md:w-12 h-0.5 bg-white/20 mx-1" />
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-bold bg-white/20 text-white/70">
                3
              </div>
              <span className="text-xs md:text-sm font-medium text-white/50">Details</span>
            </div>
            <div className="w-8 md:w-12 h-0.5 bg-white/20 mx-1" />
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-bold bg-white/20 text-white/70">
                4
              </div>
              <span className="text-xs md:text-sm font-medium text-white/50">Payment</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Extras Selection - Enhanced */}
            <Card className="rounded-2xl border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Plus className="h-5 w-5 text-primary" />
                  </div>
                  Add Extras
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {EXTRAS.map((extra) => {
                  const selected = selectedExtras.find(e => e.id === extra.id)
                  const quantity = selected?.quantity || 0

                  return (
                    <div key={extra.id} className={`flex items-center justify-between p-5 border rounded-xl transition-all duration-300 ${
                      quantity > 0 ? 'bg-primary/5 border-primary/30 shadow-sm' : 'hover:border-primary/30 hover:bg-muted/30'
                    }`}>
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                          quantity > 0 ? 'bg-primary/20' : 'bg-primary/10'
                        }`}>
                          <span className="text-2xl">{extra.icon === 'towel' ? '🛁' : extra.icon === 'breakfast' ? '🍳' : extra.icon === 'late_checkout' ? '🕐' : '✨'}</span>
                        </div>
                        <div>
                          <h4 className="font-bold">{extra.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{extra.description}</p>
                          <p className="text-sm text-primary font-bold mt-2">
                            {formatCurrency(extra.price)} / {extra.unit}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleExtraQuantity(extra.id, -1)}
                          disabled={quantity === 0}
                          className="rounded-xl h-10 w-10 hover:bg-primary/10 hover:border-primary/50 transition-all"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className={`w-8 text-center font-bold text-lg ${quantity > 0 ? 'text-primary' : ''}`}>{quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleExtraQuantity(extra.id, 1)}
                          className="rounded-xl h-10 w-10 hover:bg-primary/10 hover:border-primary/50 transition-all"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Promo Code - Enhanced */}
            {!isClubMember && (
              <Card className="rounded-2xl border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Tag className="h-4 w-4 text-primary" />
                    </div>
                    Promo Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Input
                      placeholder="Enter promo code"
                      value={promoInput}
                      onChange={(e) => { setPromoInput(e.target.value); setPromoError('') }}
                      className="flex-1 rounded-xl border-muted-foreground/20"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (!promoInput.trim()) return
                        // For now accept any code starting with AO for demo; replace with real API call.
                        if (promoInput.toUpperCase().startsWith('AO')) {
                          setPromoCode(promoInput.toUpperCase(), 0.1)
                          setPromoError('')
                        } else {
                          setPromoError('Invalid promo code.')
                        }
                      }}
                      className="rounded-xl px-6 hover:bg-primary/10"
                    >
                      Apply
                    </Button>
                  </div>
                  {promoError && <p className="text-sm text-destructive mt-2">{promoError}</p>}
                  {cart?.promoCode && (
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Code &quot;{cart.promoCode}&quot; applied — 10% off
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Summary Sidebar - Enhanced */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 rounded-2xl border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <CardHeader className="bg-primary/5 border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="p-1.5 bg-primary/10 rounded-lg">
                    <Tag className="h-4 w-4 text-primary" />
                  </div>
                  Price Summary
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
                    <span className="text-muted-foreground">Room ({formatCurrency(cart.roomPrice)} x {cart.nights})</span>
                    <span className="font-medium">{formatCurrency(roomTotal)}</span>
                  </div>
                  {extrasTotal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Extras</span>
                      <span className="font-medium">{formatCurrency(extrasTotal)}</span>
                    </div>
                  )}
                  {isClubMember && (
                    <div className="flex justify-between text-green-600">
                      <span>A&O Club Discount (25%)</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-5">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(total)}</span>
                  </div>
                </div>

                <Button className="w-full h-12 rounded-xl text-base font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300" size="lg" onClick={handleContinue}>
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
