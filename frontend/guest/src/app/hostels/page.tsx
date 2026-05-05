'use client'

import { useState, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Star, MapPin, Wifi, Car, Coffee, WashingMachine, ArrowRight, Heart, Grid, List, X, Globe, ArrowUpDown, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useProperties } from '@/hooks/useProperties'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import { FILTER_OPTIONS } from '@/lib/constants'
import { cn } from '@/lib/utils'

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('best')
  const [searchQuery, setSearchQuery] = useState('')
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

  const clearFilters = () => {
    setFilters({ country: 'all', city: 'all', roomType: 'all' })
    setSearchQuery('')
    router.push(pathname, { scroll: false })
  }

  const filteredProperties = useMemo(() => {
    if (!properties) return []
    return properties.filter((property) => {
      if (filters.country !== 'all' && property.country !== filters.country) return false
      if (filters.city !== 'all' && property.city.toLowerCase() !== filters.city.toLowerCase()) return false
      if (searchQuery && !property.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
  }, [properties, filters, searchQuery])

  const sortedProperties = useMemo(() => {
    const arr = [...filteredProperties]
    switch (sortBy) {
      case 'price_asc': return arr.sort((a, b) => a.priceFrom - b.priceFrom)
      case 'price_desc': return arr.sort((a, b) => b.priceFrom - a.priceFrom)
      case 'rating': return arr.sort((a, b) => b.starRating - a.starRating)
      default: return arr
    }
  }, [filteredProperties, sortBy])

  const countries = Array.from(new Set((properties || []).map((p) => p.country)))
  const cities = Array.from(new Set((properties || []).map((p) => p.city)))

  const hasActiveFilters = filters.country !== 'all' || filters.city !== 'all' || filters.roomType !== 'all' || searchQuery

  return (
    <div className="min-h-screen">
      {/* Header - Enhanced with Gradient */}
      <section className="relative py-20 bg-gradient-to-br from-primary/10 via-primary/5 to-white border-b overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, primary 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        <div className="container mx-auto px-4 relative">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground font-medium">Hostels</span>
          </nav>
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Our Hostels</h1>
            <p className="text-xl text-muted-foreground">
              Find your perfect stay in the heart of Europe&apos;s most exciting cities
            </p>
            <div className="flex items-center gap-2 mt-6">
              <Badge variant="outline" className="px-4 py-1">
                <MapPin className="h-3 w-3 mr-1" />
                {sortedProperties.length} hostels across Europe
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Filters - Enhanced */}
      <section className="border-b bg-white sticky top-12 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search hostels by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-11 rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
              />
            </div>

            <Select value={filters.country} onValueChange={(value) => updateFilters('country', value)}>
              <SelectTrigger className="w-44 h-11 rounded-xl border-muted-foreground/20">
                <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.city} onValueChange={(value) => updateFilters('city', value)}>
              <SelectTrigger className="w-44 h-11 rounded-xl border-muted-foreground/20">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city.toLowerCase()}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-primary h-11 hover:bg-primary/10">
                <X className="h-4 w-4 mr-1" />
                Clear Filters
              </Button>
            )}

            <div className="ml-auto hidden md:flex items-center gap-1 bg-muted/50 rounded-xl p-1 border border-muted-foreground/10">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2.5 rounded-lg transition-all duration-200',
                  viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2.5 rounded-lg transition-all duration-200',
                  viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48 h-11 rounded-xl border-muted-foreground/20">
                <ArrowUpDown className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="best">Best Match</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Properties Section - Enhanced */}
      <section className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className={cn('grid gap-6', viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}>
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className={cn('rounded-2xl', viewMode === 'grid' ? 'h-96' : 'h-48')} />
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="h-12 w-12 text-primary/40" />
            </div>
            <h3 className="text-2xl font-bold mb-3">No hostels found</h3>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              Try adjusting your filters or search for a different destination
            </p>
            <Button variant="outline" className="rounded-full px-8 py-5 text-base" onClick={clearFilters}>
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className={cn('grid gap-6', viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}>
            {sortedProperties.map((property) => (
              <Link key={property.id} href={`/hostels/${property.slug}`} className="group">
                <div className={cn(
                  'overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300 h-full border border-gray-100 hover:border-primary/20',
                  viewMode === 'list' ? 'flex flex-row' : ''
                )}>
                  <div className={cn(
                    'relative overflow-hidden',
                    viewMode === 'grid' ? 'h-64' : 'w-56 h-56 shrink-0'
                  )}>
                    <Image
                      src={property.images?.[0]?.url || 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'}
                      alt={property.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    {property.starRating >= 4 && (
                      <Badge className="absolute top-4 left-4 bg-primary text-white text-xs font-medium shadow-lg">
                        Top Rated
                      </Badge>
                    )}

                    <button
                      className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:bg-white"
                      onClick={(e) => e.preventDefault()}
                    >
                      <Heart className="h-4 w-4 text-muted-foreground hover:text-red-500 transition-colors" />
                    </button>

                    <div className="absolute bottom-4 left-4">
                      <Badge variant="secondary" className="bg-white/90 text-foreground backdrop-blur-sm text-xs border-0">
                        <MapPin className="h-3 w-3 mr-1" />
                        {property.city}
                      </Badge>
                    </div>
                  </div>

                  <div className={viewMode === 'list' ? 'p-6 flex-1 flex flex-col justify-center' : 'p-6'}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-xl group-hover:text-primary transition-colors">{property.name}</h3>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-2">
                          <MapPin className="h-3.5 w-3.5" />
                          {property.city}, {property.country}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span className="font-bold text-sm">{property.starRating}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                      <span>({property.starRating ? Math.floor(property.starRating * 200) : 0} reviews)</span>
                    </div>

                    <div className="flex gap-2 my-4">
                      {property.amenities?.slice(0, 3).map((amenity) => {
                        const Icon = amenityIcons[amenity]
                        return Icon ? (
                          <div key={amenity} className="p-2 bg-muted/70 rounded-lg hover:bg-primary/10 transition-colors" title={amenity}>
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        ) : null
                      })}
                      {property.amenities && property.amenities.length > 3 && (
                        <div className="p-2 bg-muted/70 rounded-lg">
                          <span className="text-xs font-medium text-muted-foreground">+{property.amenities.length - 3}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t mt-auto">
                      <div>
                        <span className="text-sm text-muted-foreground">from</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-primary">{formatCurrency(property.priceFrom)}</span>
                          <span className="text-sm text-muted-foreground">/night</span>
                        </div>
                      </div>
                      <Button size="sm" className="rounded-full px-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                        Book Now
                        <ArrowRight className="ml-1.5 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
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