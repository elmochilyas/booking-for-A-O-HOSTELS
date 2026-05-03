'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Star, ArrowRight, Check, Clock, MapPinned, Users, Zap, Shield, Heart, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useProperties } from '@/hooks/useProperties'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import { CITIES } from '@/lib/constants'
import PropertiesMap from '@/components/Map'

const whyAO = [
  { icon: MapPinned, title: 'Central Locations', description: 'Right in the heart of the action', color: 'bg-orange-100 text-orange-600' },
  { icon: Users, title: 'Social Atmosphere', description: 'Meet travelers from around the world', color: 'bg-blue-100 text-blue-600' },
  { icon: Clock, title: '24/7 Reception', description: 'We\'re here whenever you need us', color: 'bg-green-100 text-green-600' },
  { icon: Shield, title: 'Best Price Guarantee', description: 'Book direct and save more', color: 'bg-purple-100 text-purple-600' },
]

const roomTypes = [
  { type: 'Dorm', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', price: 'from €15', description: 'Shared rooms for solo travelers' },
  { type: 'Private', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', price: 'from €45', description: 'Your own space, maximum comfort' },
  { type: 'Family', image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', price: 'from €80', description: 'Room for the whole family' },
  { type: 'Female Only', image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', price: 'from €18', description: 'Safe and comfortable' },
]

const featuredReviews = [
  { name: 'Maria S.', location: 'Berlin', rating: 5, comment: 'Perfect location, clean rooms, amazing staff!', avatar: 'M', color: 'bg-orange-100 text-orange-600' },
  { name: 'James K.', location: 'Vienna', rating: 5, comment: 'Best hostel experience in Europe. Will definitely come back!', avatar: 'J', color: 'bg-blue-100 text-blue-600' },
  { name: 'Sophie L.', location: 'Prague', rating: 5, comment: 'Great social vibe and super helpful reception team.', avatar: 'S', color: 'bg-green-100 text-green-600' },
]

interface CityData {
  name: string
  slug: string
  country: string
  hostelCount: number
  latitude: number
  longitude: number
  priceFrom: number
}

function getCityDataFromProperties(properties: any[] | undefined): CityData[] {
  if (!properties) return []
  
  const cityMap = new Map<string, CityData>()
  
  properties?.forEach((property) => {
    const city = property.city || property.location
    if (!cityMap.has(city)) {
      cityMap.set(city, {
        name: city,
        slug: city.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        country: property.country || 'Germany',
        hostelCount: 0,
        latitude: property.latitude || 0,
        longitude: property.longitude || 0,
        priceFrom: property.priceFrom || 999,
      })
    }
    const existing = cityMap.get(city)!
    existing.hostelCount++
    if (property.priceFrom && property.priceFrom < existing.priceFrom) {
      existing.priceFrom = property.priceFrom
    }
  })
  
  return Array.from(cityMap.values()).sort((a, b) => a.name.localeCompare(b.name))
}

function getPropertyMarkers(properties: any[] | undefined): any[] {
  if (!properties) return []
  
  return properties
    .filter(p => p.latitude && p.longitude)
    .map((property) => ({
      id: property.id,
      name: property.name,
      city: property.city || property.location || '',
      country: property.country || '',
      latitude: property.latitude,
      longitude: property.longitude,
      priceFrom: property.priceFrom || 0,
    }))
}

export default function Homepage() {
  const { data: properties, isLoading } = useProperties()
  const cities = getCityDataFromProperties(properties)
  const markers = getPropertyMarkers(properties)

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=2400"
            alt="A&O Hostel interior"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/95 via-secondary/80 to-primary/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm px-4 py-1">
              <Zap className="w-3 h-3 mr-1" />
              30+ Destinations Across Europe
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Stay Smart.
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-200">
                Travel More.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              Budget-friendly hostels in the heart of Europe. Central locations, social vibe, unbeatable prices.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-5xl mx-auto">
            <form action="/search" className="bg-white rounded-2xl p-3 shadow-2xl flex flex-col lg:flex-row gap-3">
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  name="location"
                  placeholder="Where do you want to go?"
                  className="pl-12 h-14 text-lg border-0 focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Input
                    name="check_in"
                    type="date"
                    className="h-14 w-full sm:w-44 pl-4 rounded-xl border-input"
                  />
                </div>
                <div className="relative">
                  <Input
                    name="check_out"
                    type="date"
                    className="h-14 w-full sm:w-44 pl-4 rounded-xl border-input"
                  />
                </div>
              </div>
              <div className="relative">
                <Input
                  name="guests"
                  type="number"
                  placeholder="Guests"
                  defaultValue={1}
                  min={1}
                  className="h-14 w-full sm:w-32 pl-4 rounded-xl border-input"
                />
              </div>
              <Button type="submit" size="lg" className="h-14 px-8 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
                Search
              </Button>
            </form>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-400" />
              <span>Free cancellation</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-400" />
              <span>Best price guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-400" />
              <span>No booking fees</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/50 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/70 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Destinations Section */}
      <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">Explore</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Destinations</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">From Berlin to Prague, find your perfect stay across Europe's most exciting cities</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(properties || []).slice(0, 8).map((property, index) => (
              <Link key={property.id} href={`/hostels/${property.slug}`} className="group">
                <Card className="overflow-hidden rounded-2xl card-hover border-0 shadow-md">
                  <div className="relative h-48">
                    <Image
                      src={property.images?.[0]?.url || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'}
                      alt={property.name}
                      fill
                      className="object-cover image-zoom-hover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <Badge className="absolute top-3 right-3 bg-white/90 text-foreground hover:bg-white backdrop-blur-sm">
                      {property.city}
                    </Badge>
                    {property.starRating >= 4 && (
                      <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-primary text-white px-2 py-1 rounded-full text-xs font-medium">
                        <Star className="h-3 w-3 fill-white" />
                        Top Rated
                      </div>
                    )}
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{property.name}</h3>
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold">{property.starRating}</span>
                      <span className="text-sm text-muted-foreground">/ 5</span>
                    </div>
                    <div className="flex items-baseline gap-1 mt-3">
                      <span className="text-2xl font-bold text-primary">{formatCurrency(property.priceFrom)}</span>
                      <span className="text-sm text-muted-foreground">/night</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/hostels">
            <Button size="lg" className="rounded-full px-8 hover:shadow-lg transition-all">
              View All Hostels
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Why A&O Section */}
      <section className="py-20 bg-gradient-to-b from-muted/30 to-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Why A&O</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Makes Us Different</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">We've been hosting travelers for over 25 years. Here's why millions choose A&O</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyAO.map((item, index) => (
              <div key={item.title} className="text-center group">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${item.color} mb-6 group-hover:scale-110 transition-transform`}>
                  <item.icon className="h-10 w-10" />
                </div>
                <h3 className="font-bold text-xl mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* A&O Club Banner */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=2400"
            alt="Hostel lobby"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-primary/80" />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Heart className="h-4 w-4 text-white" />
            <span className="text-white font-medium">Loyalty Program</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Join A&O Club — Save 25% on Every Stay!
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            It&apos;s free. No credit card required. Start saving immediately on your next booking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="rounded-full px-8 bg-white text-primary hover:bg-white/90 hover:shadow-xl transition-all">
                Join Free Now
              </Button>
            </Link>
            <Link href="/club">
              <Button size="lg" variant="outline" className="rounded-full px-8 border-white text-white hover:bg-white/10 transition-all">
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Room Types Showcase */}
      <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">Accommodation</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Room Types for Every Traveler</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">Choose the perfect accommodation for your trip, whether solo or with group</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roomTypes.map((room, index) => (
            <Card key={room.type} className="overflow-hidden group rounded-2xl border-0 shadow-md card-hover">
              <div className="relative h-56">
                <Image
                  src={room.image}
                  alt={room.type}
                  fill
                  className="object-cover image-zoom-hover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="font-bold text-xl text-white">{room.type}</h3>
                  <p className="text-white/80 text-sm">{room.description}</p>
                </div>
              </div>
              <CardContent className="p-5">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-primary">{room.price}</span>
                  <span className="text-sm text-muted-foreground">/night</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Guest Reviews */}
      <section className="py-20 bg-gradient-to-b from-muted/30 to-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">What Our Guests Say</h2>
            <div className="flex items-center justify-center gap-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-2xl font-bold">4.7</span>
              <span className="text-muted-foreground">based on 15,000+ reviews</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredReviews.map((review, index) => (
              <Card key={review.name} className="p-8 rounded-2xl border-0 shadow-md hover:shadow-xl transition-all">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`h-14 w-14 rounded-full ${review.color} flex items-center justify-center font-bold text-xl`}>
                    {review.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-lg">{review.name}</p>
                    <p className="text-muted-foreground">{review.location}</p>
                  </div>
                  <div className="ml-auto flex">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-muted-foreground text-lg leading-relaxed">&ldquo;{review.comment}&rdquo;</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

{/* City Experiences - Real Locations */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Discover</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore Our Cities</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              {isLoading ? 'Loading locations...' : `${cities.length} cities across Europe with ${properties?.length || 0} real A&O hostels`}
            </p>
          </div>

          {isLoading ? (
            <div className="w-full h-[500px] bg-muted animate-pulse rounded-2xl" />
          ) : (
            <PropertiesMap 
              markers={markers}
              center={[50.5, 10]}
              zoom={4}
            />
          )}

          <div className="text-center mt-12">
            <Link href="/hostels">
              <Button size="lg" variant="outline" className="rounded-full px-8">
                View All {cities.length} Cities
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary to-primary/80" />
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Get the Best Deals First</h2>
          <p className="text-lg text-white/80 mb-10 max-w-xl mx-auto">
            Subscribe to our newsletter and get exclusive offers, travel tips, and early access to new locations.
          </p>
          <form className="max-w-lg mx-auto flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="Enter your email"
              className="h-14 rounded-full bg-white text-foreground border-0 text-lg"
            />
            <Button type="submit" size="lg" className="h-14 rounded-full px-8 font-semibold">
              Subscribe
            </Button>
          </form>
          <p className="text-white/60 text-sm mt-4">No spam, ever. Unsubscribe anytime.</p>
        </div>
      </section>
    </div>
  )
}