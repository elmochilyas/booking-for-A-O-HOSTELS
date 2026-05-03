'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { CITIES } from '@/lib/constants'

export default function ExperiencesPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-secondary text-secondary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Explore Europe with A&O</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Discover our cities through local eyes. Get the best tips, hidden gems and travel inspiration.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {CITIES.map((city) => (
            <Link key={city.slug} href={`/experiences/${city.slug}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-all group h-full">
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={city.image}
                    alt={city.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white">
                    <h3 className="font-bold text-lg">{city.name}</h3>
                    <p className="text-white/80 text-sm">{city.country}</p>
                  </div>
                </div>
                <CardContent className="p-4">
                  <p className="text-sm text-primary font-medium">{city.hostelCount} A&O {city.hostelCount === 1 ? 'property' : 'properties'}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
