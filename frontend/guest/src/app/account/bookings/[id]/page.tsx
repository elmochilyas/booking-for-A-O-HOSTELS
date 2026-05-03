'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Calendar, MapPin, User, CreditCard, Download, Star, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useBooking, useCancelBooking } from '@/hooks/useBooking'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, formatCurrency } from '@/lib/utils'
import { paymentsService } from '@/services/payments.service'
import { reviewsService } from '@/services/reviews.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  cleanliness: z.number().min(1).max(5),
  location: z.number().min(1).max(5),
  staff: z.number().min(1).max(5),
  value: z.number().min(1).max(5),
  comment: z.string().min(10, 'Please write at least 10 characters').max(500),
})

type ReviewFormData = z.infer<typeof reviewSchema>

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" onClick={() => onChange(star)}>
          <Star className={`h-6 w-6 transition-colors ${star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
        </button>
      ))}
    </div>
  )
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

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: booking, isLoading } = useBooking(id)
  const cancelBooking = useCancelBooking()
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, cleanliness: 0, location: 0, staff: 0, value: 0, comment: '' },
  })

  const submitReview = useMutation({
    mutationFn: (data: ReviewFormData) =>
      reviewsService.submit({ bookingId: id, ...data }),
    onSuccess: () => {
      setReviewSubmitted(true)
      setReviewOpen(false)
      queryClient.invalidateQueries({ queryKey: ['booking', id] })
    },
  })

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Booking not found</p>
        <Link href="/account/bookings"><Button>My Bookings</Button></Link>
      </div>
    )
  }

  const isUpcoming = booking.status === 'confirmed' || booking.status === 'pending'
  const isPast = booking.status === 'checked_out'

  const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    confirmed: 'default',
    pending: 'secondary',
    cancelled: 'destructive',
    checked_out: 'outline',
    checked_in: 'default',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Booking Details</h1>
          <p className="text-muted-foreground text-sm font-mono">ID: {booking.id}</p>
        </div>
        <Badge variant={statusVariants[booking.status] ?? 'secondary'} className="text-sm px-3 py-1 capitalize">
          {booking.status.replace('_', ' ')}
        </Badge>
      </div>

      {/* Property Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="relative w-full md:w-48 h-36 rounded-lg overflow-hidden shrink-0">
              <Image
                src={booking.propertyImage || 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400'}
                alt={booking.propertyName}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{booking.propertyName}</h2>
              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <MapPin className="h-4 w-4" />
                {booking.propertyCity}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                <div>
                  <span className="text-muted-foreground block">Check-in</span>
                  <p className="font-semibold">{formatDate(booking.checkIn)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground block">Check-out</span>
                  <p className="font-semibold">{formatDate(booking.checkOut)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground block">Room</span>
                  <p className="font-semibold">{booking.roomTypeName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground block">Guests</span>
                  <p className="font-semibold">{booking.guests}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guest & Payment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" /> Guest Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{booking.guestName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{booking.guestEmail}</span>
            </div>
            {booking.specialRequests && (
              <div className="mt-3 pt-3 border-t">
                <span className="text-muted-foreground block mb-1">Special Requests</span>
                <p>{booking.specialRequests}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4" /> Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold">{formatCurrency(booking.totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paid</span>
              <span className="font-semibold text-green-600">{formatCurrency(booking.depositAmount || booking.totalPrice)}</span>
            </div>
            {booking.totalPrice - (booking.depositAmount || booking.totalPrice) > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due at Hotel</span>
                <span className="font-semibold">{formatCurrency(booking.totalPrice - booking.depositAmount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={booking.paymentStatus === 'paid' ? 'default' : 'secondary'} className="capitalize">
                {booking.paymentStatus}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Extras */}
      {booking.extras?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Extras</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {booking.extras.map((extra) => (
                <div key={extra.id} className="flex justify-between">
                  <span className="text-muted-foreground">{extra.name} × {extra.quantity}</span>
                  <span>{formatCurrency(extra.price * extra.quantity)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => downloadInvoice(booking.id)}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Invoice
            </Button>

            {isUpcoming && (
              <Link href={`/book/${booking.propertyId}/extras`}>
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Modify / Add Extras
                </Button>
              </Link>
            )}

            {isPast && !reviewSubmitted && (
              <Button onClick={() => setReviewOpen(true)}>
                <Star className="h-4 w-4 mr-2" />
                Leave a Review
              </Button>
            )}

            {reviewSubmitted && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                ✓ Review submitted — thank you!
              </span>
            )}

            {isUpcoming && (
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
                    cancelBooking.mutate({ id: booking.id }, {
                      onSuccess: () => router.push('/account/bookings'),
                    })
                  }
                }}
                disabled={cancelBooking.isPending}
              >
                <X className="h-4 w-4 mr-2" />
                {cancelBooking.isPending ? 'Cancelling...' : 'Cancel Booking'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Review Modal */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Review Your Stay at {booking.propertyName}</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSubmit((data) => submitReview.mutate(data))}
            className="space-y-5 mt-2"
          >
            {[
              { field: 'rating' as const, label: 'Overall' },
              { field: 'cleanliness' as const, label: 'Cleanliness' },
              { field: 'location' as const, label: 'Location' },
              { field: 'staff' as const, label: 'Staff' },
              { field: 'value' as const, label: 'Value for Money' },
            ].map(({ field, label }) => (
              <div key={field} className="flex items-center justify-between">
                <Label className="w-32">{label}</Label>
                <StarPicker value={watch(field)} onChange={(v) => setValue(field, v)} />
              </div>
            ))}

            <div>
              <Label htmlFor="comment">Your Review</Label>
              <textarea
                id="comment"
                {...register('comment')}
                rows={4}
                placeholder="Tell us about your experience..."
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
              {errors.comment && (
                <p className="text-xs text-destructive mt-1">{errors.comment.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={submitReview.isPending}>
              {submitReview.isPending ? 'Submitting...' : 'Submit Review'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
