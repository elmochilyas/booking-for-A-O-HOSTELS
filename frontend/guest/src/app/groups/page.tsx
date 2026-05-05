'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Users, Building2, Clock, CheckCircle2, Tent, GraduationCap, Trophy, ChevronRight, MapPin, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { groupBookingSchema } from '@/lib/validations'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { z } from 'zod'
import { useProperties } from '@/hooks/useProperties'
import Image from 'next/image'

type GroupFormData = z.infer<typeof groupBookingSchema>

const groupFeatures = [
  { icon: Users, title: 'Group Rates', description: 'Special discounted rates for groups of 10+', color: 'bg-blue-100 text-blue-600' },
  { icon: Building2, title: 'Dedicated Account Manager', description: 'Personal contact for all your group needs', color: 'bg-green-100 text-green-600' },
  { icon: Clock, title: 'Flexible Payment', description: 'Pay deposit now, balance later', color: 'bg-orange-100 text-orange-600' },
  { icon: Tent, title: 'Group Facilities', description: 'Seminar rooms, meeting spaces, team activities', color: 'bg-purple-100 text-purple-600' },
]

const facilities = [
  { name: 'Seminar Rooms', capacity: '20-100 people', features: 'Projector, whiteboard, WiFi', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400' },
  { name: 'Conference Hall', capacity: '100-300 people', features: 'Stage, sound system, catering', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400' },
  { name: 'Meeting Rooms', capacity: '4-20 people', features: 'TV screen, video conferencing', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400' },
  { name: 'Team Lounge', capacity: '30-50 people', features: 'Relaxed space for informal meetings', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400' },
]

const pricingTiers = [
  { size: '10-19', discount: 10, color: 'bg-blue-500' },
  { size: '20-49', discount: 15, color: 'bg-green-500' },
  { size: '50+', discount: 20, color: 'bg-orange-500' },
]

const sampleItineraries = [
  { type: 'School Trip', description: 'Educational tours with nearby attractions', icon: GraduationCap },
  { type: 'Sports Team', description: 'Team building and tournament packages', icon: Trophy },
  { type: 'Corporate', description: 'Business retreats and training sessions', icon: Building2 },
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
      <section className="relative bg-secondary text-secondary-foreground py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920"
            alt="Group event"
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/95 to-secondary/80" />
        <div className="container mx-auto px-4 text-center relative">
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/30">Groups Welcome</Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Travelling with 10+ People?
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            We&apos;ve got you covered. Special group rates, dedicated support, and flexible options.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="rounded-full" onClick={() => document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth' })}>
              Request a Quote
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full bg-white/10 border-white/20">
              <a href="#facilities">View Facilities</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose A&O for Groups?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Everything you need for a successful group stay</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {groupFeatures.map((feature) => (
            <Card key={feature.title} className="text-center p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 shadow-md">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${feature.color} mb-4`}>
                <feature.icon className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Visualization */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Group Discounts</h2>
            <p className="text-muted-foreground">The larger your group, the more you save</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg overflow-hidden">
              <CardContent className="p-8">
                <div className="space-y-6">
                  {pricingTiers.map((tier) => (
                    <div key={tier.size}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-muted-foreground" />
                          <span className="font-semibold">{tier.size} guests</span>
                        </div>
                        <Badge className={`${tier.color} text-white border-0`}>{tier.discount}% OFF</Badge>
                      </div>
                      <Progress value={tier.discount * 5} className="h-3" />
                    </div>
                  ))}
                </div>
                <div className="mt-8 p-4 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <p className="text-green-700 font-medium">Free accommodation for group leaders (1 per 20 guests)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Sample Itineraries */}
      <section className="py-16 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Popular Group Types</h2>
          <p className="text-muted-foreground">We cater to all kinds of group travel</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {sampleItineraries.map((item) => (
            <Card key={item.type} className="p-6 text-center hover:shadow-lg transition-shadow border-0 shadow-md">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <item.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{item.type}</h3>
              <p className="text-muted-foreground">{item.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Facilities */}
      <section id="facilities" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Group Facilities</h2>
            <p className="text-muted-foreground">Perfect spaces for teams, schools, and organizations</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {facilities.map((facility) => (
              <Card key={facility.name} className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={facility.image}
                    alt={facility.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{facility.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-primary" />
                    <p className="text-primary font-medium">Capacity: {facility.capacity}</p>
                  </div>
                  <p className="text-muted-foreground">{facility.features}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Form */}
      <section id="quote-form" className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {submitted ? (
              <Card className="border-0 shadow-xl">
                <CardContent className="py-16 flex flex-col items-center text-center gap-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 animate-scale-in">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <h2 className="text-2xl font-bold">Request Sent!</h2>
                  <p className="text-muted-foreground max-w-sm">
                    Thank you for your inquiry. Our group bookings team will review your request and contact you within 24 hours.
                  </p>
                  <Button variant="outline" onClick={() => setSubmitted(false)} className="mt-2 rounded-full">
                    Submit Another Request
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl">Request a Group Quote</CardTitle>
                  <p className="text-muted-foreground">Fill out the form and we&apos;ll contact you within 24 hours</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="property">Property *</Label>
                        <Select>
                          <SelectTrigger id="property" className="mt-1.5">
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
                        <Label htmlFor="groupSize">Group Size *</Label>
                        <Input id="groupSize" type="number" {...register('groupSize', { valueAsNumber: true })} min={10} className="mt-1.5" />
                        {errors.groupSize && <p className="text-sm text-destructive mt-1">{errors.groupSize.message}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="checkIn">Check-in *</Label>
                        <Input id="checkIn" type="date" {...register('checkIn')} className="mt-1.5" />
                        {errors.checkIn && <p className="text-sm text-destructive mt-1">{errors.checkIn.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor="checkOut">Check-out *</Label>
                        <Input id="checkOut" type="date" {...register('checkOut')} className="mt-1.5" />
                        {errors.checkOut && <p className="text-sm text-destructive mt-1">{errors.checkOut.message}</p>}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="roomPreferences">Room Preferences</Label>
                      <Textarea id="roomPreferences" {...register('roomPreferences')} placeholder="e.g., 5 doubles, 3 triples..." className="mt-1.5" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="name">Name *</Label>
                        <Input id="name" {...register('name')} className="mt-1.5" />
                        {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input id="email" type="email" {...register('email')} className="mt-1.5" />
                        {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone *</Label>
                        <Input id="phone" {...register('phone')} className="mt-1.5" />
                        {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea id="notes" {...register('notes')} placeholder="Any special requirements..." className="mt-1.5" />
                    </div>

                    <Button type="submit" size="lg" className="w-full rounded-full" disabled={isSubmitting}>
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