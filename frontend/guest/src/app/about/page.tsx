'use client'

import Image from 'next/image'
import { Leaf, Globe, Users, Heart, Award, Building2, Zap, ChevronRight, Star, MapPin, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const values = [
  { icon: Users, title: 'Social', description: 'We believe travel is about connections. Our hostels are designed for travelers to meet, share experiences, and create memories together.', color: 'bg-blue-100 text-blue-600' },
  { icon: Globe, title: 'Sustainable', description: 'We care about our planet. From energy-efficient buildings to locally sourced products, we strive to minimize our environmental footprint.', color: 'bg-green-100 text-green-600' },
  { icon: Leaf, title: 'Affordable', description: 'Everyone deserves to explore the world. We offer clean, comfortable accommodation at prices that won\'t break the bank.', color: 'bg-orange-100 text-orange-600' },
  { icon: Heart, title: 'Central', description: 'Location matters. All our hostels are in the heart of the action, walking distance from major attractions and transport.', color: 'bg-pink-100 text-pink-600' },
]

const timeline = [
  { year: '2005', event: 'First A&O hostel opens in Berlin', icon: Building2 },
  { year: '2010', event: 'Expansion to 10 cities across Europe', icon: MapPin },
  { year: '2015', event: 'Launch of A&O Club loyalty program', icon: Star },
  { year: '2020', event: '20 locations across 5 countries', icon: TrendingUp },
  { year: '2024', event: '30+ locations and counting', icon: Building2 },
]

const sustainability = [
  { icon: Zap, text: 'Solar panels on 80% of properties', color: 'text-yellow-600' },
  { icon: Globe, text: '100% renewable electricity', color: 'text-green-600' },
  { icon: Leaf, text: 'Plastic-free breakfast service', color: 'text-green-700' },
  { icon: Users, text: 'Local staff employment', color: 'text-blue-600' },
  { icon: Zap, text: 'Bike rental at all locations', color: 'text-orange-600' },
  { icon: Globe, text: 'Water-saving fixtures', color: 'text-blue-500' },
]

const awards = [
  { name: 'World Travel Awards', category: 'Europe\'s Leading Hostel Brand', year: '2023' },
  { name: 'TripAdvisor', category: 'Travelers\' Choice Award', year: '2023' },
  { name: 'Green Key', category: 'Eco-Certification', year: '2024' },
  { name: 'Hostelworld', category: 'Best Value Chain', year: '2023' },
]

const stats = [
  { number: '30+', label: 'Locations' },
  { number: '12K+', label: 'Rooms' },
  { number: '50K+', label: 'Guests/Year' },
  { number: '15+', label: 'Years Experience' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-secondary text-secondary-foreground py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1920"
            alt="A&O Hostel"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/95 to-secondary/80" />
        <div className="container mx-auto px-4 relative">
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/30">Since 2005</Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            About A&O
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Budget travel for everyone. Since 2005, we&apos;ve been providing clean, comfortable, and affordable accommodation across Europe.
          </p>
          <div className="flex gap-4 mt-8">
            <Button asChild size="lg" className="rounded-full">
              <Link href="/hostels">
                Explore Hostels
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full bg-white/10 border-white/20">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl md:text-5xl font-bold">{stat.number}</p>
                <p className="text-primary-foreground/80 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Our Story</h2>
          <div className="space-y-6 text-muted-foreground">
            <p>
              A&O Hostels was founded in Berlin in 2005 with a simple mission: to make travel accessible to everyone.
              What started as a single hostel near Hauptbahnhof has grown into one of Europe&apos;s largest hostel chains.
            </p>
            <p>
              We believe that travel should be about experiences, not expensive hotels. Our hostels are designed
              to be places where travelers from all over the world can connect, share stories, and explore new cities together.
            </p>
            <p>
              Today, we operate 30+ properties across Germany, Austria, Czech Republic, Netherlands, and more.
              But our mission remains the same: provide great accommodation at fair prices in central locations.
            </p>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Journey</h2>
            <p className="text-muted-foreground">Milestones that shaped our growth</p>
          </div>
          <div className="max-w-3xl mx-auto">
            {timeline.map((item, index) => (
              <div key={item.year} className="flex gap-6 pb-12 last:pb-0 relative">
                {/* Timeline line */}
                {index < timeline.length - 1 && (
                  <div className="absolute left-[2.25rem] top-12 bottom-0 w-0.5 bg-primary/20" />
                )}
                {/* Year & Icon */}
                <div className="shrink-0 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <item.icon className="h-7 w-7 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-primary">{item.year}</p>
                </div>
                {/* Content */}
                <div className="flex-1 pt-4">
                  <Card className="p-4 hover:shadow-lg transition-shadow">
                    <p className="font-medium text-lg">{item.event}</p>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Values</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">The principles that guide everything we do</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value) => (
            <Card key={value.title} className="p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 shadow-md">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${value.color} mb-6`}>
                <value.icon className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-xl mb-3">{value.title}</h3>
              <p className="text-muted-foreground">{value.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Sustainability */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Sustainability</h2>
              <p className="text-muted-foreground">
                We&apos;re committed to reducing our environmental impact and promoting sustainable travel.
              </p>
            </div>
            <Card className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sustainability.map((item) => (
                  <div key={item.text} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className={`p-2 rounded-lg bg-muted`}>
                      <item.icon className={`h-5 w-5 ${item.color}`} />
                    </div>
                    <span className="font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Awards */}
      <section className="py-16 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Awards & Recognition</h2>
          <p className="text-muted-foreground">We're proud of what we've achieved</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {awards.map((award) => (
            <Card key={award.name} className="p-6 text-center hover:shadow-lg transition-shadow border-0 shadow-md">
              <div className="w-16 h-16 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-1">{award.name}</h3>
              <p className="text-sm text-muted-foreground">{award.category}</p>
              <Badge variant="secondary" className="mt-3">{award.year}</Badge>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Experience A&O?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
            Join millions of travelers who choose A&O for their European adventures.
          </p>
          <Button asChild size="lg" variant="secondary" className="rounded-full text-lg px-8">
            <Link href="/hostels">
              Book Your Stay Now
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}