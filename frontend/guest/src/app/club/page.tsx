'use client'

import Link from 'next/link'
import { Star, Gift, Clock, Headphones, Check, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const benefits = [
  { icon: Star, title: '25% Off Every Stay', description: 'Save on every booking, always. No blackout dates, no restrictions.' },
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
  { name: 'Emma K.', quote: 'Saved €45 on my Berlin trip thanks to A&O Club!', location: 'Berlin' },
  { name: 'Marco P.', quote: 'The points add up fast. Got a free night in Vienna after just 3 stays.', location: 'Vienna' },
  { name: 'Sofie L.', quote: 'Priority support is a game changer when traveling.', location: 'Amsterdam' },
]

const pointsTable = [
  { spend: '€10', points: '100 points' },
  { spend: '€50', points: '500 points' },
  { spend: '€100', points: '1,000 points + €10 bonus' },
]

export default function ClubPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Save 25% on Every Stay. Always.
          </h1>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join A&O Club for free. No credit card, no subscription. Start saving immediately on your next booking.
          </p>
          <Link href="/auth/register">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Join Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
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
            <Card key={benefit.title} className="text-center p-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-4">
                <benefit.icon className="h-7 w-7" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
              <p className="text-muted-foreground">{benefit.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <div key={step.step} className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
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

          <Card>
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
                    <tr key={row.spend} className="border-b">
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

      {/* Testimonials */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Members Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="p-6">
                <p className="text-lg mb-4">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
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
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 container mx-auto px-4">
        <Card className="bg-secondary text-secondary-foreground">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Saving?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of travelers who are already saving with A&O Club.
            </p>
            <Link href="/auth/register">
              <Button size="lg" variant="default" className="text-lg px-8">
                Join Free Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}