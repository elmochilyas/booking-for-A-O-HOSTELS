'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Plus, Minus, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useProperty } from '@/hooks/useProperties'
import { useBookingStore } from '@/stores/booking.store'
import { useAuthStore } from '@/stores/auth.store'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import { EXTRAS, AO_CLUB_DISCOUNT } from '@/lib/constants'

export default function BookingStep2Page({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = use(params)
  const router = useRouter()
  const { data: property, isLoading } = useProperty(propertyId)
  const { cart, addExtra, removeExtra, setPromoCode } = useBookingStore()
  const { guest } = useAuthStore()
  const [promoInput, setPromoInput] = useState('')
  const [promoError, setPromoError] = useState('')

  const selectedExtras = cart?.extras || []
  const isClubMember = !!(guest as any)?.isClubMember

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
    <div className="min-h-screen bg-muted/30">
      {/* Progress */}
      <div className="bg-primary text-primary-foreground py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex gap-8 text-sm">
            <span className="opacity-50">1. Room</span>
            <span className="font-semibold">2. Extras</span>
            <span className="opacity-50">3. Details</span>
            <span className="opacity-50">4. Payment</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Extras Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Add Extras</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {EXTRAS.map((extra) => {
                  const selected = selectedExtras.find(e => e.id === extra.id)
                  const quantity = selected?.quantity || 0

                  return (
                    <div key={extra.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <span className="text-xl">+</span>
                        </div>
                        <div>
                          <h4 className="font-semibold">{extra.name}</h4>
                          <p className="text-sm text-muted-foreground">{extra.description}</p>
                          <p className="text-sm text-primary font-semibold mt-1">
                                {formatCurrency(extra.price)} / {extra.unit}
                              </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleExtraQuantity(extra.id, -1)}
                          disabled={quantity === 0}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleExtraQuantity(extra.id, 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Promo Code */}
            {!isClubMember && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Promo Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter promo code"
                      value={promoInput}
                      onChange={(e) => { setPromoInput(e.target.value); setPromoError('') }}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (!promoInput.trim()) return
                        // For now accept any code starting with AO for demo; replace with real API call
                        if (promoInput.toUpperCase().startsWith('AO')) {
                          setPromoCode(promoInput.toUpperCase(), 0.1)
                          setPromoError('')
                        } else {
                          setPromoError('Invalid promo code.')
                        }
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                  {promoError && <p className="text-sm text-destructive mt-1">{promoError}</p>}
                  {cart?.promoCode && (
                    <p className="text-sm text-success mt-1">
                      ✓ Code &quot;{cart.promoCode}&quot; applied — 10% off
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Price Summary</CardTitle>
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
                    <span>Room ({formatCurrency(cart.roomPrice)} x {cart.nights})</span>
                    <span>{formatCurrency(roomTotal)}</span>
                  </div>
                  {extrasTotal > 0 && (
                    <div className="flex justify-between">
                      <span>Extras</span>
                      <span>{formatCurrency(extrasTotal)}</span>
                    </div>
                  )}
                  {isClubMember && (
                    <div className="flex justify-between text-success">
                      <span>A&O Club Discount (25%)</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(total)}</span>
                  </div>
                </div>

                <Button className="w-full" size="lg" onClick={handleContinue}>
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