'use client'

import { Leaf, Globe, Users, Heart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const values = [
  { icon: Users, title: 'Social', description: 'We believe travel is about connections. Our hostels are designed for travelers to meet, share experiences, and create memories together.' },
  { icon: Globe, title: 'Sustainable', description: 'We care about our planet. From energy-efficient buildings to locally sourced products, we strive to minimize our environmental footprint.' },
  { icon: Leaf, title: 'Affordable', description: 'Everyone deserves to explore the world. We offer clean, comfortable accommodation at prices that won\'t break the bank.' },
  { icon: Heart, title: 'Central', description: 'Location matters. All our hostels are in the heart of the action, walking distance from major attractions and transport.' },
]

const timeline = [
  { year: '2005', event: 'First A&O hostel opens in Berlin' },
  { year: '2010', event: 'Expansion to 10 cities across Europe' },
  { year: '2015', event: 'Launch of A&O Club loyalty program' },
  { year: '2020', event: '20 locations across 5 countries' },
  { year: '2024', event: '30+ locations and counting' },
]

const sustainability = [
  'Solar panels on 80% of properties',
  '100% renewable electricity',
  'Plastic-free breakfast service',
  'Bike rental at all locations',
  'Local staff employment',
  'Water-saving fixtures',
]

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-secondary text-secondary-foreground py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About A&O</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Budget travel for everyone. Since 2005, we&apos;ve been providing clean, comfortable, and affordable accommodation across Europe.
          </p>
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
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Journey</h2>
          </div>
          <div className="max-w-2xl mx-auto">
            {timeline.map((item, index) => (
              <div key={item.year} className="flex gap-4 pb-8">
                <div className="w-20 shrink-0 text-primary font-bold">{item.year}</div>
                <div className="flex-1 border-l-2 border-primary/30 pl-4">
                  <p>{item.event}</p>
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
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value) => (
            <Card key={value.title} className="p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <value.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
              <p className="text-muted-foreground">{value.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Sustainability */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Sustainability</h2>
            <p className="text-muted-foreground mb-8">
              We&apos;re committed to reducing our environmental impact and promoting sustainable travel.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sustainability.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-success rounded-full" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}