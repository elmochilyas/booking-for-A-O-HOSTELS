'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { CreditCard, Lock, X, Shield, Loader2, Info } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useBookingStore } from '@/stores/booking.store'
import { useCreateBooking, usePaymentIntent } from '@/hooks/useBooking'
import { formatCurrency } from '@/lib/utils'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

function StripePaymentForm({ propertyId }: { propertyId: string }) {
  const router = useRouter()
  const stripe = useStripe()
  const elements = useElements()
  const { cart, setPaymentMethod } = useBookingStore()
  const createBooking = useCreateBooking()
  const createIntent = usePaymentIntent()
  const [isProcessing, setIsProcessing] = useState(false)
  const [cardError, setCardError] = useState<string | null>(null)
  const paymentMethod = cart?.paymentMethod ?? 'full'

  useEffect(() => {
    if (!cart?.selectedRoomTypeId || !cart?.guestDetails) {
      router.push(`/book/${propertyId}`)
    }
  }, [cart, propertyId, router])

  const amountToPay = paymentMethod === 'deposit' ? cart?.depositAmount ?? 0 : cart?.totalPrice ?? 0

  const handlePayment = async () => {
    if (!stripe || !elements || !cart) return
    const cardElement = elements.getElement(CardElement)
    if (!cardElement) return

    setIsProcessing(true)
    setCardError(null)

    try {
      // 1. Create the booking (pending status)
      const bookingResult = await createBooking.mutateAsync({
        propertyId: cart.propertyId,
        roomTypeId: cart.selectedRoomTypeId,
        checkIn: cart.checkIn,
        checkOut: cart.checkOut,
        guests: cart.guests,
        guestDetails: cart.guestDetails!,
        extras: cart.extras.map((e) => ({ id: e.id, quantity: e.quantity })),
        promoCode: cart.promoCode,
        paymentMethod,
      })

      // 2. Create Stripe payment intent
      const intent = await createIntent.mutateAsync({
        bookingId: bookingResult.bookingId,
        amount: amountToPay,
        depositPercentage: paymentMethod === 'deposit' ? 30 : undefined,
      })

      // 3. Confirm the card payment
      const { error } = await stripe.confirmCardPayment(intent.clientSecret, {
        payment_method: { card: cardElement },
      })

      if (error) {
        setCardError(error.message ?? 'Payment failed. Please try again.')
      } else {
        router.push(`/book/confirmation/${bookingResult.bookingId}`)
      }
    } catch {
      setCardError('Something went wrong. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!cart) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading...</p>
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
                  step === 4 ? 'bg-white text-primary scale-110 shadow-lg' : 'bg-white/20 text-white/70'
                }`}>
                  {step}
                </div>
                <span className={`text-xs md:text-sm font-medium ${step === 4 ? 'text-white' : 'text-white/50'}`}>
                  {label}
                </span>
                {index < 3 && <div className="w-8 md:w-12 h-0.5 bg-white/20 mx-1" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Payment Method Selection - Enhanced */}
            <Card className="rounded-2xl border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(v) => setPaymentMethod(v as 'full' | 'deposit')}
                  className="space-y-4"
                >
                  <div className={`flex items-center space-x-3 border rounded-xl p-5 cursor-pointer transition-all duration-300 ${
                    paymentMethod === 'full' ? 'border-primary bg-primary/5 shadow-sm' : 'hover:border-primary/30 hover:bg-muted/30'
                  }`}>
                    <RadioGroupItem value="full" id="full" className="mt-1" />
                    <Label htmlFor="full" className="flex-1 cursor-pointer">
                      <span className="font-bold text-lg">Pay Full Amount</span>
                      <span className="block text-sm text-muted-foreground mt-1">
                        Pay {formatCurrency(cart.totalPrice)} now and you&apos;re done
                      </span>
                    </Label>
                    <div className="text-right shrink-0">
                      <span className="text-2xl font-black text-primary">{formatCurrency(cart.totalPrice)}</span>
                    </div>
                  </div>
                  <div className={`flex items-center space-x-3 border rounded-xl p-5 cursor-pointer transition-all duration-300 ${
                    paymentMethod === 'deposit' ? 'border-primary bg-primary/5 shadow-sm' : 'hover:border-primary/30 hover:bg-muted/30'
                  }`}>
                    <RadioGroupItem value="deposit" id="deposit" className="mt-1" />
                    <Label htmlFor="deposit" className="flex-1 cursor-pointer">
                      <span className="font-bold text-lg">Pay Deposit (30%)</span>
                      <span className="block text-sm text-muted-foreground mt-1">
                        Pay {formatCurrency(cart.depositAmount)} now — remaining {formatCurrency(cart.totalPrice - cart.depositAmount)} due at hotel
                      </span>
                    </Label>
                    <div className="text-right shrink-0">
                      <span className="text-2xl font-bold text-primary">{formatCurrency(cart.depositAmount)}</span>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Stripe Card Element - Enhanced */}
            <Card className="rounded-2xl border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  Card Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="border border-gray-200 rounded-xl p-4 bg-white hover:border-primary/30 transition-colors">
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#1a1a2e',
                          fontFamily: 'Inter, sans-serif',
                          '::placeholder': { color: '#9ca3af' },
                        },
                        invalid: { color: '#ef4444' },
                      },
                    }}
                  />
                </div>

                {cardError && (
                  <p className="text-sm text-destructive flex items-center gap-2">
                    <X className="h-4 w-4" />
                    {cardError}
                  </p>
                )}

                <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/30 rounded-xl p-4">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Lock className="h-4 w-4 text-green-600" />
                  </div>
                  <span>Your card details are encrypted and never stored on our servers</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <div className="p-1.5 bg-green-50 rounded-md">
                  <Lock className="h-3 w-3 text-green-600" />
                </div>
                SSL Secured
              </span>
              <span className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 rounded-md">
                  <Shield className="h-3 w-3 text-blue-600" />
                </div>
                PCI-DSS Compliant
              </span>
              <span className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-md">
                  <CreditCard className="h-3 w-3 text-primary" />
                </div>
                Powered by Stripe
              </span>
            </div>

            <Button
              size="lg"
              className="w-full h-12 rounded-xl text-base font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
              onClick={handlePayment}
              disabled={isProcessing || !stripe}
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Pay {formatCurrency(amountToPay)} Securely
                </span>
              )}
            </Button>
          </div>

          {/* Summary Sidebar - Enhanced */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 rounded-2xl border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <CardHeader className="bg-primary/5 border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="p-1.5 bg-primary/10 rounded-lg">
                    <CreditCard className="h-4 w-4 text-primary" />
                  </div>
                  Booking Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="flex gap-4">
                  <div className="relative w-20 h-16 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={cart.propertyImage || 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=200'}
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
                    <span className="text-muted-foreground">Guest</span>
                    <span className="font-medium">{cart.guestDetails?.firstName} {cart.guestDetails?.lastName}</span>
                  </div>
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
                  {cart.extras.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Extras</span>
                      <span className="font-medium">{formatCurrency(cart.extras.reduce((s, e) => s + e.price * e.quantity, 0))}</span>
                    </div>
                  )}
                  {cart.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(cart.totalPrice * cart.discount)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-5">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(cart.totalPrice)}</span>
                  </div>
                  <div className="flex justify-between font-semibold mt-3 text-primary">
                    <span>To Pay Now</span>
                    <span>{formatCurrency(amountToPay)}</span>
                  </div>
                  {paymentMethod === 'deposit' && (
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Remaining {formatCurrency(cart.totalPrice - cart.depositAmount)} due at hotel
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BookingStep4Page({ params }: { params: { propertyId: string } }) {
  const { propertyId } = params

  return (
    <Elements stripe={stripePromise}>
      <StripePaymentForm propertyId={propertyId} />
    </Elements>
  )
}
