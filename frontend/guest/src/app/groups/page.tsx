'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Users, Building2, Clock, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { groupBookingSchema } from '@/lib/validations'
import type { z } from 'zod'
import { useProperties } from '@/hooks/useProperties'

type GroupFormData = z.infer<typeof groupBookingSchema>

const groupFeatures = [
  { icon: Users, title: 'Group Rates', description: 'Special discounted rates for groups of 10+' },
  { icon: Building2, title: 'Dedicated Account Manager', description: 'Personal contact for all your group needs' },
  { icon: Clock, title: 'Flexible Payment', description: 'Pay deposit now, balance later' },
  { icon: Users, title: 'Group Facilities', description: 'Seminar rooms, meeting spaces, team activities' },
]

const facilities = [
  { name: 'Seminar Rooms', capacity: '20-100 people', features: 'Projector, whiteboard, WiFi' },
  { name: 'Conference Hall', capacity: '100-300 people', features: 'Stage, sound system, catering' },
  { name: 'Meeting Rooms', capacity: '4-20 people', features: 'TV screen, video conferencing' },
  { name: 'Team Lounge', capacity: '30-50 people', features: 'Relaxed space for informal meetings' },
]

export default function GroupsPage() {
  const { data: properties } = useProperties()
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GroupFormData>({
    resolver: zodResolver(groupBookingSchema),
  })

  const onSubmit = async (_data: GroupFormData) => {
    await new Promise((r) => setTimeout(r, 600))
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-secondary text-secondary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Travelling with 10+ People?
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            We&apos;ve got you covered. Special group rates, dedicated support, and flexible options.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {groupFeatures.map((feature) => (
            <Card key={feature.title} className="text-center p-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-4">
                <feature.icon className="h-7 w-7" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Facilities */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Group Facilities</h2>
            <p className="text-muted-foreground">Perfect spaces for teams, schools, and organizations</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {facilities.map((facility) => (
              <Card key={facility.name}>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{facility.name}</h3>
                  <p className="text-primary font-medium mb-1">Capacity: {facility.capacity}</p>
                  <p className="text-muted-foreground">{facility.features}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Info */}
      <section className="py-16 container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Group Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-primary rounded-full" />
                  <span>10% discount for groups of 10-19 guests</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-primary rounded-full" />
                  <span>15% discount for groups of 20-49 guests</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-primary rounded-full" />
                  <span>20% discount for groups of 50+ guests</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-primary rounded-full" />
                  <span>Free accommodation for group leaders (1 per 20 guests)</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quote Form */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {submitted ? (
              <Card>
                <CardContent className="py-16 flex flex-col items-center text-center gap-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <h2 className="text-2xl font-bold">Request Sent!</h2>
                  <p className="text-muted-foreground max-w-sm">
                    Thank you for your inquiry. Our group bookings team will review your request and contact you within 24 hours.
                  </p>
                  <Button variant="outline" onClick={() => setSubmitted(false)} className="mt-2">
                    Submit Another Request
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Request a Group Quote</CardTitle>
                  <p className="text-muted-foreground">Fill out the form and we&apos;ll contact you within 24 hours</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Property *</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property" />
                          </SelectTrigger>
                          <SelectContent>
                            {properties?.map((p) => (
                              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Group Size *</Label>
                        <Input type="number" {...register('groupSize', { valueAsNumber: true })} min={10} />
                        {errors.groupSize && <p className="text-sm text-destructive mt-1">{errors.groupSize.message}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Check-in *</Label>
                        <Input type="date" {...register('checkIn')} />
                        {errors.checkIn && <p className="text-sm text-destructive mt-1">{errors.checkIn.message}</p>}
                      </div>
                      <div>
                        <Label>Check-out *</Label>
                        <Input type="date" {...register('checkOut')} />
                        {errors.checkOut && <p className="text-sm text-destructive mt-1">{errors.checkOut.message}</p>}
                      </div>
                    </div>

                    <div>
                      <Label>Room Preferences</Label>
                      <Textarea {...register('roomPreferences')} placeholder="e.g., 5 doubles, 3 triples..." />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Name *</Label>
                        <Input {...register('name')} />
                        {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                      </div>
                      <div>
                        <Label>Email *</Label>
                        <Input type="email" {...register('email')} />
                        {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                      </div>
                      <div>
                        <Label>Phone *</Label>
                        <Input {...register('phone')} />
                        {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>}
                      </div>
                    </div>

                    <div>
                      <Label>Additional Notes</Label>
                      <Textarea {...register('notes')} placeholder="Any special requirements..." />
                    </div>

                    <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? 'Sending...' : 'Request Quote'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}