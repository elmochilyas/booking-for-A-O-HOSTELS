'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { CreditCard, Lock } from 'lucide-react'
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
    <div className="min-h-screen bg-muted/30">
      {/* Progress */}
      <div className="bg-primary text-primary-foreground py-4">
        <div className="container mx-auto px-4">
          <div className="flex gap-8 text-sm">
            <span className="opacity-50">1. Room</span>
            <span className="opacity-50">2. Extras</span>
            <span className="opacity-50">3. Details</span>
            <span className="font-semibold">4. Payment</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle>How Would You Like to Pay?</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(v) => setPaymentMethod(v as 'full' | 'deposit')}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="full" id="full" />
                    <Label htmlFor="full" className="flex-1 cursor-pointer">
                      <span className="font-semibold">Pay Full Amount</span>
                      <span className="block text-sm text-muted-foreground">
                        Pay {formatCurrency(cart.totalPrice)} now and you&apos;re done
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="deposit" id="deposit" />
                    <Label htmlFor="deposit" className="flex-1 cursor-pointer">
                      <span className="font-semibold">Pay Deposit (30%)</span>
                      <span className="block text-sm text-muted-foreground">
                        Pay {formatCurrency(cart.depositAmount)} now — remaining {formatCurrency(cart.totalPrice - cart.depositAmount)} due at hotel
                      </span>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Stripe Card Element */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Card Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-md p-3 bg-white">
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
                  <p className="text-sm text-destructive">{cardError}</p>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  <span>Your card details are encrypted and never stored on our servers</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-center gap-8 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> SSL Secured</span>
              <span>PCI-DSS Compliant</span>
              <span>Powered by Stripe</span>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={handlePayment}
              disabled={isProcessing || !stripe}
            >
              {isProcessing ? 'Processing...' : `Pay ${formatCurrency(amountToPay)} Securely`}
            </Button>
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
                      src={cart.propertyImage || 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=200'}
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
                    <span className="text-muted-foreground">Guest</span>
                    <span>{cart.guestDetails?.firstName} {cart.guestDetails?.lastName}</span>
                  </div>
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
                  {cart.extras.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Extras</span>
                      <span>{formatCurrency(cart.extras.reduce((s, e) => s + e.price * e.quantity, 0))}</span>
                    </div>
                  )}
                  {cart.discount > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Discount</span>
                      <span>-{formatCurrency(cart.totalPrice * cart.discount)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(cart.totalPrice)}</span>
                  </div>
                  <div className="flex justify-between font-semibold mt-2 text-primary">
                    <span>To Pay Now</span>
                    <span>{formatCurrency(amountToPay)}</span>
                  </div>
                  {paymentMethod === 'deposit' && (
                    <p className="text-xs text-muted-foreground mt-1">
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

export default function BookingStep4Page({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = use(params)

  return (
    <Elements stripe={stripePromise}>
      <StripePaymentForm propertyId={propertyId} />
    </Elements>
  )
}
