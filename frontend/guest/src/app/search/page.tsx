'use client'

import { Suspense, useState, useMemo } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Star, SlidersHorizontal, MapPin, X, ArrowRight, Map, List, Wifi, Car, Coffee, Dumbbell, Waves } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { usePropertySearch } from '@/hooks/useProperties'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import { FILTER_OPTIONS } from '@/lib/constants'
import { cn } from '@/lib/utils'

const AMENITY_FILTER_MAP: Record<string, string[]> = {
  wifi: ['wifi'],
  breakfast: ['breakfast', 'coffee'],
  parking: ['parking', 'car'],
  bar: ['bar', 'wine'],
  kitchen: ['kitchen', 'utensils'],
  laundry: ['laundry', 'shirt'],
  bike_rental: ['bike_rental', 'bike'],
}

function SearchContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const location = searchParams.get('location') || ''
  const checkIn = searchParams.get('check_in') || ''
  const checkOut = searchParams.get('check_out') || ''
  const guests = searchParams.get('guests') || '1'
  const minPriceParam = searchParams.get('min_price') || ''
  const maxPriceParam = searchParams.get('max_price') || ''
  const amenitiesParam = searchParams.get('amenities') || ''
  const ratingParam = searchParams.get('rating') || ''

  const [minPrice, setMinPrice] = useState(minPriceParam)
  const [maxPrice, setMaxPrice] = useState(maxPriceParam)
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(amenitiesParam ? amenitiesParam.split(',') : [])
  const [minRating, setMinRating] = useState(ratingParam)

  const { data: properties, isLoading } = usePropertySearch({
    location,
    checkIn,
    checkOut,
    guests: parseInt(guests),
  })

  const filteredProperties = useMemo(() => {
    if (!properties) return []
    return properties.filter((p) => {
      if (minPrice && p.priceFrom < parseFloat(minPrice)) return false
      if (maxPrice && p.priceFrom > parseFloat(maxPrice)) return false
      if (minRating && p.starRating < parseFloat(minRating)) return false
      if (selectedAmenities.length > 0) {
        const hasAll = selectedAmenities.every((a) => {
          const icons = AMENITY_FILTER_MAP[a] ?? [a]
          return p.amenities?.some((pa) => icons.includes(pa.toLowerCase()))
        })
        if (!hasAll) return false
      }
      return true
    })
  }, [properties, minPrice, maxPrice, minRating, selectedAmenities])

  function toggleAmenity(value: string) {
    const newAmenities = selectedAmenities.includes(value) 
      ? selectedAmenities.filter((a) => a !== value)
      : [...selectedAmenities, value]
    setSelectedAmenities(newAmenities)
    updateFilterUrl(newAmenities, minPrice, maxPrice, minRating)
  }

  function updateFilterUrl(amenities: string[], min?: string, max?: string, rating?: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (min) params.set('min_price', min)
    else params.delete('min_price')
    if (max) params.set('max_price', max)
    else params.delete('max_price')
    if (amenities.length > 0) params.set('amenities', amenities.join(','))
    else params.delete('amenities')
    if (rating) params.set('rating', rating)
    else params.delete('rating')
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  function handlePriceChange(type: 'min' | 'max', value: string) {
    if (type === 'min') setMinPrice(value)
    else setMaxPrice(value)
    updateFilterUrl(selectedAmenities, type === 'min' ? value : minPrice, type === 'max' ? value : maxPrice, minRating)
  }

  function handleRatingChange(value: string) {
    setMinRating(value)
    updateFilterUrl(selectedAmenities, minPrice, maxPrice, value)
  }

  function clearFilters() {
    setMinPrice('')
    setMaxPrice('')
    setSelectedAmenities([])
    setMinRating('')
    
    const params = new URLSearchParams()
    if (location) params.set('location', location)
    if (checkIn) params.set('check_in', checkIn)
    if (checkOut) params.set('check_out', checkOut)
    if (guests) params.set('guests', guests)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const hasFilters = minPrice || maxPrice || selectedAmenities.length > 0 || minRating

  return (
    <div className="min-h-screen bg-muted/30">
      <section className="relative py-16 bg-secondary overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <Image
            src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1920"
            alt=""
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 via-secondary/70 to-secondary/90" />
        <div className="relative z-10 container mx-auto px-6">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Find Your Perfect Stay</h1>
            <p className="text-white/70 text-lg">Search hotels, hostels, and apartments across Germany</p>
          </div>
          <form 
            className="flex flex-wrap gap-4 items-end justify-center"
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const params = new URLSearchParams()
              if (formData.get('location')) params.set('location', formData.get('location') as string)
              if (formData.get('check_in')) params.set('check_in', formData.get('check_in') as string)
              if (formData.get('check_out')) params.set('check_out', formData.get('check_out') as string)
              if (formData.get('guests')) params.set('guests', formData.get('guests') as string)
              router.push(`${pathname}?${params.toString()}`, { scroll: false })
            }}
          >
            <div className="flex-1 min-w-[240px] max-w-xs">
              <Label className="text-white/80 text-sm mb-2 block">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                <Input
                  name="location"
                  defaultValue={location}
                  placeholder="City or destination"
                  className="bg-white pl-12 h-14 rounded-xl shadow-lg border-0"
                />
              </div>
            </div>
            <div>
              <Label className="text-white/80 text-sm mb-2 block">Check-in</Label>
              <Input
                name="check_in"
                type="date"
                defaultValue={checkIn}
                className="bg-white h-14 w-48 rounded-xl shadow-lg border-0"
              />
            </div>
            <div>
              <Label className="text-white/80 text-sm mb-2 block">Check-out</Label>
              <Input
                name="check_out"
                type="date"
                defaultValue={checkOut}
                className="bg-white h-14 w-48 rounded-xl shadow-lg border-0"
              />
            </div>
            <div>
              <Label className="text-white/80 text-sm mb-2 block">Guests</Label>
              <Input
                name="guests"
                type="number"
                defaultValue={guests}
                min={1}
                className="bg-white h-14 w-28 rounded-xl shadow-lg border-0"
              />
            </div>
            <Button type="submit" size="lg" className="h-14 rounded-xl px-10 font-semibold shadow-lg">
              <MapPin className="h-5 w-5 mr-2" />
              Search
            </Button>
          </form>
        </div>
      </section>

      <div className="container mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-72 shrink-0">
            <Card className="sticky top-24 rounded-2xl border-0 shadow-lg bg-white">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <SlidersHorizontal className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-bold text-base text-foreground">Filters</h3>
                  </div>
                  {hasFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-primary text-xs h-7 px-2">
                      Clear ({selectedAmenities.length + (minPrice || maxPrice ? 1 : 0) + (minRating ? 1 : 0)})
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="bg-muted/40 p-3 rounded-lg">
                    <h4 className="font-semibold mb-2 text-xs text-foreground uppercase tracking-wide">Price (per night)</h4>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">€</span>
                        <Input
                          placeholder="Min"
                          type="number"
                          value={minPrice}
                          onChange={(e) => handlePriceChange('min', e.target.value)}
                          className="h-9 rounded-md pl-6 bg-white text-sm"
                        />
                      </div>
                      <div className="relative flex-1">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">€</span>
                        <Input
                          placeholder="Max"
                          type="number"
                          value={maxPrice}
                          onChange={(e) => handlePriceChange('max', e.target.value)}
                          className="h-9 rounded-md pl-6 bg-white text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/40 p-3 rounded-lg">
                    <h4 className="font-semibold mb-2 text-xs text-foreground uppercase tracking-wide">Room Type</h4>
                    <div className="space-y-1.5">
                      {FILTER_OPTIONS.roomTypes.map((type) => (
                        <div key={type.value} className="flex items-center gap-2 py-1 px-1 rounded hover:bg-white/60 transition-colors">
                          <Checkbox id={`rt-${type.value}`} className="h-3.5 w-3.5 rounded" />
                          <Label htmlFor={`rt-${type.value}`} className="text-xs cursor-pointer text-foreground/70">
                            {type.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-muted/40 p-3 rounded-lg">
                    <h4 className="font-semibold mb-2 text-xs text-foreground uppercase tracking-wide">Amenities</h4>
                    <div className="space-y-1.5">
                      {FILTER_OPTIONS.amenities.map((amenity) => (
                        <div key={amenity.value} className="flex items-center gap-2 py-1 px-1 rounded hover:bg-white/60 transition-colors">
                          <Checkbox
                            id={`am-${amenity.value}`}
                            checked={selectedAmenities.includes(amenity.value)}
                            onCheckedChange={() => toggleAmenity(amenity.value)}
                            className="h-3.5 w-3.5 rounded"
                          />
                          <Label htmlFor={`am-${amenity.value}`} className="text-xs cursor-pointer text-foreground/70">
                            {amenity.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-muted/30 p-4 rounded-xl">
                    <h4 className="font-semibold mb-3 text-sm text-foreground">Rating</h4>
                    <div className="space-y-2.5">
                      {FILTER_OPTIONS.rating.map((rating) => (
                        <div key={rating.value} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors">
                          <Checkbox
                            id={`r-${rating.value}`}
                            checked={minRating === rating.value}
                            onCheckedChange={(checked) => handleRatingChange(checked ? rating.value : '')}
                            className="rounded-md border-input"
                          />
                          <Label htmlFor={`r-${rating.value}`} className="text-sm font-normal flex items-center gap-2 cursor-pointer">
                            <div className="flex">
                              {[...Array(parseInt(rating.value))].map((_, i) => (
                                <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                              ))}
                              {[...Array(5 - parseInt(rating.value))].map((_, i) => (
                                <Star key={i} className="h-3.5 w-3.5 text-muted-foreground/40" />
                              ))}
                            </div>
                            <span className="text-muted-foreground text-xs">{rating.label}</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 px-4 py-2 rounded-lg">
                  <p className="text-primary font-semibold text-sm">
                    {isLoading ? (
                      'Searching...'
                    ) : (
                      <>
                        {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'}
                      </>
                    )}
                  </p>
                </div>
                {location && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span className="text-sm font-medium">{location}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                  <List className="h-3.5 w-3.5 mr-1.5" />
                  List
                </Button>
                <Button variant="ghost" size="sm" className="h-8 px-3 text-xs">
                  <Map className="h-3.5 w-3.5 mr-1.5" />
                  Map
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="overflow-hidden rounded-xl border-0 shadow-sm">
                    <div className="flex flex-col sm:flex-row">
                      <div className="w-full sm:w-64 h-48 sm:h-52 shrink-0">
                        <Skeleton className="h-full w-full rounded-l-xl sm:rounded-none" />
                      </div>
                      <div className="flex-1 p-4 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-3 w-full" />
                        <div className="flex gap-2 pt-1">
                          <Skeleton className="h-4 w-12 rounded-full" />
                          <Skeleton className="h-4 w-12 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="space-y-4">
                {filteredProperties.map((property) => (
                  <Link key={property.id} href={`/hostels/${property.slug}`} className="group">
                    <Card className="overflow-hidden rounded-xl border-0 shadow-md card-hover hover:shadow-lg transition-all duration-200 bg-white">
                      <div className="flex flex-col sm:flex-row">
                        <div className="relative w-full sm:w-64 h-48 sm:h-52 shrink-0">
                          <Image
                            src={property.images?.[0]?.url || 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'}
                            alt={property.name}
                            fill
                            className="object-cover image-zoom-hover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                            {property.starRating >= 4 && (
                              <Badge className="bg-primary text-white text-[10px]">Top Rated</Badge>
                            )}
                            <div className="bg-white/95 backdrop-blur px-2 py-1 rounded-md flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold text-xs text-foreground">{property.starRating.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                        <CardContent className="flex-1 p-4">
                          <div className="flex justify-between items-start mb-1.5">
                            <div className="flex-1">
                              <div className="flex items-center gap-1.5 mb-1">
                                <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">{property.city}</Badge>
                                <Badge variant="outline" className="text-[10px] capitalize">{property.country}</Badge>
                              </div>
                              <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-1">{property.name}</h3>
                              <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5 text-primary" />
                                <span className="text-xs truncate">{property.address}</span>
                              </div>
                            </div>
                          </div>

                          <p className="text-muted-foreground mt-2 line-clamp-2 text-xs leading-relaxed">
                            {property.description}
                          </p>

                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {property.amenities?.slice(0, 3).map((amenity) => (
                              <div key={amenity} className="flex items-center gap-1 bg-muted/40 px-2 py-0.5 rounded text-[10px] text-muted-foreground">
                                {amenity.includes('wifi') && <Wifi className="h-2.5 w-2.5 text-green-500" />}
                                {amenity.includes('parking') && <Car className="h-2.5 w-2.5 text-blue-500" />}
                                {amenity.includes('breakfast') && <Coffee className="h-2.5 w-2.5 text-amber-500" />}
                                {amenity.includes('gym') && <Dumbbell className="h-2.5 w-2.5 text-purple-500" />}
                                {!['wifi', 'parking', 'breakfast', 'gym'].some(a => amenity.includes(a)) && <Waves className="h-2.5 w-2.5 text-cyan-500" />}
                                <span className="capitalize">{amenity.replace('_', ' ')}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                            <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              <span className="font-medium text-foreground">{property.starRating.toFixed(1)}</span>
                              <span>rating</span>
                            </div>
                            <div className="shrink-0 flex items-baseline gap-1 bg-primary/5 px-3 py-1.5 rounded-lg">
                              <span className="text-xs text-muted-foreground">from</span>
                              <span className="text-xl font-bold text-primary">
                                {formatCurrency(property.priceFrom)}
                              </span>
                              <span className="text-xs text-muted-foreground">/night</span>
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-20 text-center">Loading...</div>}>
      <SearchContent />
    </Suspense>
  )
}
