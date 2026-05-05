'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Star, Gift, Clock, Headphones, Check, ArrowRight, Calculator, TrendingUp, Users, Share2, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

const benefits = [
  { icon: Star, title: '25% Off Every Stay', description: 'Save on every booking, always. No blackout dates, no restrictions.', highlight: true },
  { icon: Gift, title: 'Earn Loyalty Points', description: 'Get 10 points for every euro spent. Redeem for free nights and discounts.' },
  { icon: Headphones, title: 'Priority Support', description: 'Skip the queue with dedicated member customer service.' },
  { icon: Gift, title: 'Secret Deals', description: 'Access exclusive offers and flash sales only for members.' },
]

const howItWorks = [
  { step: '1', title: 'Join Free', description: 'Sign up with your email. No credit card required.' },
  { step: '2', title: 'Book Your Stay', description: 'Use your member discount on any A&O property.' },
  { step: '3', title: 'Earn & Save', description: 'Earn points on every booking and unlock more rewards.' },
]

const testimonials = [
  { name: 'Emma K.', quote: 'Saved €45 on my Berlin trip thanks to A&O Club!', location: 'Berlin', rating: 5 },
  { name: 'Marco P.', quote: 'The points add up fast. Got a free night in Vienna after just 3 stays.', location: 'Vienna', rating: 5 },
  { name: 'Sofie L.', quote: 'Priority support is a game changer when traveling.', location: 'Amsterdam', rating: 5 },
]

const pointsTable = [
  { spend: '€10', points: '100 points' },
  { spend: '€50', points: '500 points + €10 bonus' },
  { spend: '€100', points: '1,000 points + €10 bonus' },
]

const comparisonData = [
  { feature: 'Room Rates', standard: 'Best Available', club: '25% Off' },
  { feature: 'Loyalty Points', standard: 'No', club: '10 pts/€1' },
  { feature: 'Priority Support', standard: 'No', club: 'Yes' },
  { feature: 'Exclusive Deals', standard: 'No', club: 'Yes' },
  { feature: 'Free Cancellation', standard: 'Standard', club: 'Extended' },
]

export default function ClubPage() {
  const [bookingAmount, setBookingAmount] = useState(100)
  const discount = bookingAmount * 0.25
  const pointsEarned = bookingAmount * 10

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-primary text-primary-foreground py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-orange-400 blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center relative">
          <Badge className="mb-6 bg-white/20 text-white border-white/30 text-base px-4 py-1.5">
            <Star className="h-4 w-4 mr-2 fill-yellow-300 text-yellow-300" />
            Join 50,000+ Members
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Save 25% on Every Stay. Always.
          </h1>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join A&O Club for free. No credit card, no subscription. Start saving immediately on your next booking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Join Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/hostels">
              <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 border-white/30 hover:bg-white/20">
                Browse Hostels
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Member Benefits</h2>
          <p className="text-muted-foreground">Everything you get with free A&O Club membership</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit) => (
            <Card key={benefit.title} className={`text-center p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${benefit.highlight ? 'border-primary shadow-lg' : 'border'}`}>
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${benefit.highlight ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                <benefit.icon className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
              <p className="text-muted-foreground">{benefit.description}</p>
              {benefit.highlight && (
                <Badge className="mt-3 bg-primary/10 text-primary">Most Popular</Badge>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* Calculator Widget */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
                <Calculator className="h-8 w-8 text-primary" />
                Savings Calculator
              </h2>
              <p className="text-muted-foreground">See how much you can save with A&O Club</p>
            </div>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="mb-6">
                  <label className="text-sm font-medium mb-2 block">Booking Amount (€)</label>
                  <Input
                    type="number"
                    value={bookingAmount}
                    onChange={(e) => setBookingAmount(Number(e.target.value))}
                    className="text-2xl font-bold h-14 text-center"
                    min={10}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-muted/50 rounded-xl">
                    <span className="text-muted-foreground">Booking Amount</span>
                    <span className="text-xl font-semibold">€{bookingAmount}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                    <span className="text-green-700">You Save (25%)</span>
                    <span className="text-xl font-bold text-green-600">-€{discount.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-primary/5 rounded-xl">
                    <span className="text-primary">Points Earned</span>
                    <span className="text-xl font-bold text-primary">{pointsEarned} pts</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center p-4 bg-primary/10 rounded-xl">
                    <span className="font-semibold">You Pay</span>
                    <span className="text-2xl font-bold text-primary">€{(bookingAmount - discount).toFixed(0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Club vs Standard</h2>
          <p className="text-muted-foreground">See the difference membership makes</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold">Feature</th>
                    <th className="text-center p-4 font-semibold">Standard</th>
                    <th className="text-center p-4 font-semibold bg-primary/5">A&O Club</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, index) => (
                    <tr key={row.feature} className={index % 2 === 0 ? 'bg-muted/30' : ''}>
                      <td className="p-4 font-medium">{row.feature}</td>
                      <td className="p-4 text-center text-muted-foreground">{row.standard}</td>
                      <td className="p-4 text-center text-primary font-semibold bg-primary/5">{row.club}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">Get started in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {howItWorks.map((step, index) => (
              <div key={step.step} className="text-center relative">
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-primary/20" />
                )}
                <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-primary to-primary/80 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                  {step.step}
                </div>
                <h3 className="font-semibold text-xl mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Points */}
      <section className="py-16 container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Earn Points</h2>
            <p className="text-muted-foreground">The more you stay, the more you save</p>
          </div>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-3 font-semibold">You Spend</th>
                    <th className="text-right pb-3 font-semibold">You Earn</th>
                  </tr>
                </thead>
                <tbody>
                  {pointsTable.map((row) => (
                    <tr key={row.spend} className="border-b last:border-0">
                      <td className="py-3">{row.spend}</td>
                      <td className="py-3 text-right text-primary font-semibold">{row.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Referral Program */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-orange-600 mb-6">
              <Share2 className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Refer Friends, Earn Rewards</h2>
            <p className="text-muted-foreground mb-8">Invite your friends to join A&O Club and both of you earn bonus points!</p>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/50 rounded-xl">
                    <p className="text-3xl font-bold text-primary">500</p>
                    <p className="text-sm text-muted-foreground">Points for you</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-xl">
                    <p className="text-3xl font-bold text-primary">500</p>
                    <p className="text-sm text-muted-foreground">Points for friend</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-xl">
                    <p className="text-3xl font-bold text-green-600">€50</p>
                    <p className="text-sm text-muted-foreground">Total value</p>
                  </div>
                </div>
                <Button className="w-full mt-6 rounded-full" size="lg">
                  <Share2 className="h-4 w-4 mr-2" />
                  Get Referral Link
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Members Say</h2>
          <p className="text-muted-foreground">Real reviews from A&O Club members</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-lg mb-4">&ldquo;{testimonial.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-gradient-to-br from-primary to-orange-400 rounded-full flex items-center justify-center font-bold text-white">
                  {testimonial.name[0]}
                </div>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Saving?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of travelers who are already saving with A&O Club.
          </p>
          <Link href="/auth/register">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Join Free Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}