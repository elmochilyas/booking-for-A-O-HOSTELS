'use client'

import { useState, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Star, MapPin, Wifi, Car, Coffee, WashingMachine, ArrowRight, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useProperties } from '@/hooks/useProperties'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import { FILTER_OPTIONS } from '@/lib/constants'

const amenityIcons: Record<string, typeof Wifi> = {
  wifi: Wifi,
  parking: Car,
  breakfast: Coffee,
  laundry: WashingMachine,
}

function HostelsContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const countryParam = searchParams.get('country') || 'all'
  const cityParam = searchParams.get('city') || 'all'
  
  const [filters, setFilters] = useState({ country: countryParam, city: cityParam, roomType: 'all' })
  const { data: properties, isLoading } = useProperties()

  const updateFilters = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    const params = new URLSearchParams()
    if (newFilters.country !== 'all') params.set('country', newFilters.country)
    if (newFilters.city !== 'all') params.set('city', newFilters.city)
    
    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
  }

  const filteredProperties = useMemo(() => {
    if (!properties) return []
    return properties.filter((property) => {
      if (filters.country !== 'all' && property.country !== filters.country) return false
      if (filters.city !== 'all' && property.city.toLowerCase() !== filters.city.toLowerCase()) return false
      return true
    })
  }, [properties, filters])

  const countries = Array.from(new Set((properties || []).map((p) => p.country)))
  const cities = Array.from(new Set((properties || []).map((p) => p.city)))

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative py-20 bg-secondary overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1920"
            alt=""
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/95 to-secondary/80" />
        <div className="relative z-10 container mx-auto px-4">
          <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30">30+ Destinations</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Hostels</h1>
          <p className="text-xl text-white/80 max-w-xl">Find your perfect stay in the heart of Europe's most exciting cities</p>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b bg-background sticky top-16 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center gap-4">
            <Select
              value={filters.country}
              onValueChange={(value) => updateFilters('country', value)}
            >
              <SelectTrigger className="w-48 h-11 rounded-xl border-input">
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.city}
              onValueChange={(value) => updateFilters('city', value)}
            >
              <SelectTrigger className="w-48 h-11 rounded-xl border-input">
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city.toLowerCase()}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.roomType}
              onValueChange={(value) => setFilters({ ...filters, roomType: value })}
            >
              <SelectTrigger className="w-48 h-11 rounded-xl border-input">
                <SelectValue placeholder="Room Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {FILTER_OPTIONS.roomTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="ml-auto text-sm text-muted-foreground">
              {filteredProperties.length} {filteredProperties.length === 1 ? 'hostel' : 'hostels'} found
            </div>
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-2xl" />
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg mb-4">No hostels found matching your criteria.</p>
            <Button
              variant="outline"
              className="rounded-full px-6"
              onClick={() => {
                setFilters({ country: 'all', city: 'all', roomType: 'all' })
                router.push(pathname, { scroll: false })
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => (
              <Link key={property.id} href={`/hostels/${property.slug}`} className="group">
                <Card className="overflow-hidden rounded-2xl border-0 shadow-md card-hover h-full">
                  <div className="relative h-60">
                    <Image
                      src={property.images?.[0]?.url || 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'}
                      alt={property.name}
                      fill
                      className="object-cover image-zoom-hover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {property.starRating >= 4 && (
                      <Badge className="absolute top-4 left-4 bg-primary text-white hover:bg-primary/90">
                        Top Rated
                      </Badge>
                    )}

                    <button
                      className="absolute top-4 right-4 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                      onClick={(e) => e.preventDefault()}
                    >
                      <Heart className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </button>

                    <div className="absolute bottom-4 left-4 right-4">
                      <Badge variant="secondary" className="bg-white/90 text-foreground backdrop-blur-sm">
                        {property.city}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-xl group-hover:text-primary transition-colors">{property.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                          <MapPin className="h-3 w-3" />
                          {property.city}, {property.country}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span className="font-bold text-sm">{property.starRating}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 my-4">
                      {property.amenities?.slice(0, 4).map((amenity) => {
                        const Icon = amenityIcons[amenity]
                        return Icon ? (
                          <div
                            key={amenity}
                            className="p-2.5 bg-muted rounded-xl"
                            title={amenity}
                          >
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        ) : null
                      })}
                      {property.amenities && property.amenities.length > 4 && (
                        <div className="p-2.5 bg-muted rounded-xl">
                          <span className="text-xs font-medium text-muted-foreground">+{property.amenities.length - 4}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <span className="text-sm text-muted-foreground">from</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-primary">{formatCurrency(property.priceFrom)}</span>
                          <span className="text-sm text-muted-foreground">/night</span>
                        </div>
                      </div>
                      <Button size="sm" className="rounded-full px-5">
                        Book Now
                        <ArrowRight className="ml-1.5 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default function HostelsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-20 text-center">Loading...</div>}>
      <HostelsContent />
    </Suspense>
  )
}