'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Star, ArrowRight, Check, Clock, MapPinned, Users, Zap, Shield, Heart, ChevronRight, Building2, Globe, Award, Search, Mail } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useProperties } from '@/hooks/useProperties'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, cn } from '@/lib/utils'
import { CITIES } from '@/lib/constants'
import PropertiesMap from '@/components/Map'

const stats = [
  { value: '45+', label: 'Hostels', icon: Building2 },
  { value: '14', label: 'Countries', icon: Globe },
  { value: '25+', label: 'Years', icon: Award },
  { value: '15,000+', label: 'Happy guests', icon: Users },
]

const whyAO = [
  { num: '01', icon: MapPinned, title: 'Central Locations', description: 'Right in the heart of the action', color: 'bg-blue-100 text-blue-600' },
  { num: '02', icon: Users, title: 'Social Atmosphere', description: 'Meet travelers from around the world', color: 'bg-blue-100 text-blue-700' },
  { num: '03', icon: Clock, title: '24/7 Reception', description: "We're here whenever you need us", color: 'bg-blue-100 text-blue-800' },
  { num: '04', icon: Shield, title: 'Best Price Guarantee', description: 'Book direct and save more', color: 'bg-blue-100 text-blue-600' },
]

const roomTypes = [
  { type: 'Dorm', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', price: 'from €15', description: 'Shared rooms for solo travelers', amenities: ['Bunk beds', 'Shared bathroom', 'Lockers', 'Free WiFi'] },
  { type: 'Private', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', price: 'from €45', description: 'Your own space, maximum comfort', amenities: ['Double bed', 'En-suite', 'TV', 'Free WiFi'] },
  { type: 'Family', image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', price: 'from €80', description: 'Room for the whole family', amenities: ['Multiple beds', 'Extra space', 'Family-friendly', 'Free WiFi'] },
  { type: 'Female Only', image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', price: 'from €18', description: 'Safe and comfortable', amenities: ['Female only', 'Secure lockers', 'Privacy curtains', 'Free WiFi'] },
]

const featuredReviews = [
  { name: 'Maria S.', location: 'Berlin', rating: 5, comment: 'Perfect location, clean rooms, amazing staff!', avatar: 'M', color: 'bg-blue-100 text-blue-600' },
  { name: 'James K.', location: 'Vienna', rating: 5, comment: 'Best hostel experience in Europe. Will definitely come back!', avatar: 'J', color: 'bg-blue-100 text-blue-700' },
  { name: 'Sophie L.', location: 'Prague', rating: 5, comment: 'Great social vibe and super helpful reception team.', avatar: 'S', color: 'bg-blue-100 text-blue-800' },
]

function AnimatedCounter({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <span className="block text-4xl md:text-5xl font-bold text-primary">{value}</span>
      <span className="text-sm text-muted-foreground mt-1">{label}</span>
    </div>
  )
}

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
  const { data: properties, isLoading, error } = useProperties(undefined, { lightweight: true })
  
  const cities = getCityDataFromProperties(properties)
  const markers = getPropertyMarkers(properties)
  const [rotatingCity, setRotatingCity] = useState(0)
  const [activeRoomTab, setActiveRoomTab] = useState(0)

  const rotatingCities = ['Berlin', 'Vienna', 'Prague']

  useEffect(() => {
    const interval = setInterval(() => {
      setRotatingCity((prev) => (prev + 1) % rotatingCities.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col">
      {/* Hero Section - Enhanced */}
      <section className="relative h-[90vh] min-h-[700px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=2400"
            alt="A&O Hostel interior"
            fill
            className="object-cover scale-105 animate-subtle-zoom"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-primary/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          {/* Decorative pattern overlay */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }}
          />
        </div>

        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/15 text-white border-white/20 hover:bg-white/25 backdrop-blur-md px-5 py-1.5 text-sm font-medium">
              <Zap className="w-4 h-4 mr-2" />
              45+ Hostels Across Europe
            </Badge>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
              Stay Smart.
              <span className="block text-blue-200 mt-2">
                Travel More.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-6 max-w-2xl mx-auto leading-relaxed font-light">
              Right in the heart of{' '}
              <span className="text-blue-200 font-semibold">
                {rotatingCities[rotatingCity]}
              </span>
            </p>
          </div>

          {/* Search Bar - Enhanced Glass Effect */}
          <div className="max-w-5xl mx-auto mt-8">
            <form action="/search" className="bg-white/95 backdrop-blur-xl rounded-2xl p-3 shadow-2xl flex flex-col lg:flex-row gap-3 items-stretch lg:items-center border border-white/20">
              <div className="flex-1 relative min-w-[200px]">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/60" />
                <Input
                  name="location"
                  placeholder="Where are you going?"
                  className="pl-12 h-14 border-0 focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl text-base bg-transparent"
                />
              </div>
              <div className="h-px lg:h-8 w-full lg:w-px bg-border" />
              <div className="relative flex-1 min-w-[160px]">
                <Input
                  name="check_in"
                  type="date"
                  className="h-14 w-full pl-4 rounded-xl border-0 bg-transparent text-base"
                />
              </div>
              <div className="relative flex-1 min-w-[160px]">
                <Input
                  name="check_out"
                  type="date"
                  className="h-14 w-full pl-4 rounded-xl border-0 bg-transparent text-base"
                />
              </div>
              <div className="h-px lg:h-8 w-full lg:w-px bg-border" />
              <div className="relative w-full lg:w-24">
                <Input
                  name="guests"
                  type="number"
                  defaultValue={1}
                  min={1}
                  className="h-14 w-full text-center rounded-xl border-0 bg-transparent text-base"
                  aria-label="Number of guests"
                />
              </div>
              <Button type="submit" size="lg" className="h-14 px-10 rounded-xl text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300">
                <Search className="w-5 h-5 mr-2" />
                Search
              </Button>
            </form>
          </div>

          {/* Trust indicators - Enhanced */}
          <div className="flex flex-wrap justify-center gap-6 mt-10 text-white/90 text-sm">
            {[
              { icon: Check, text: 'Free cancellation', color: 'text-green-400' },
              { icon: Check, text: 'Best price guarantee', color: 'text-green-400' },
              { icon: Check, text: 'No booking fees', color: 'text-green-400' },
              { icon: Star, text: '4.7★ on Google', color: 'text-yellow-400' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <item.icon className={`h-4 w-4 ${item.color}`} />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 rounded-full border-2 border-white/40 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/70 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Stats Band - Enhanced */}
      <section className="py-16 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-y border-primary/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, index) => (
              <div key={stat.label} className="flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
                <AnimatedCounter value={stat.value} label={stat.label} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations Section - Enhanced City Cards */}
      <section className="py-24 container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 px-4 py-1">Explore Europe</Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Destinations</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From Berlin to Prague, find your perfect stay across Europe's most exciting cities
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {CITIES.slice(0, 8).map((city, index) => (
            <Link key={city.slug} href={`/hostels?city=${city.slug}`} className="group">
              <div className="relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 card-hover">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={city.image}
                    alt={city.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <Badge className="absolute top-3 left-3 bg-white/20 backdrop-blur-md text-white text-xs border-0">
                    {city.country}
                  </Badge>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-bold text-lg">{city.name}</h3>
                    <p className="text-white/70 text-sm mt-1">
                      {city.hostelCount} hostel{city.hostelCount > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-16">
          <Link href="/hostels">
            <Button size="lg" variant="outline" className="rounded-full px-10 py-6 text-base font-semibold hover:bg-primary hover:text-white transition-all duration-300">
              View all {CITIES.length} cities
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Why A&O Section - Enhanced */}
      <section className="py-24 bg-gradient-to-b from-white to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-1">Why A&O</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">What Makes Us Different</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We&apos;ve been hosting travelers for over 25 years. Here&apos;s why millions choose A&O
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyAO.map((item, index) => (
              <div key={item.num} className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary/20 overflow-hidden">
                {/* Decorative gradient circle */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
                <div className={`relative inline-flex items-center justify-center w-16 h-16 rounded-xl mb-6 ${item.color} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <item.icon className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-xl mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* A&O Club Banner - Enhanced */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=2400"
            alt="Hostel lobby"
            fill
            className="object-cover scale-105 animate-subtle-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/80" />
          {/* Decorative circles */}
          <div className="absolute top-10 right-10 w-64 h-64 bg-white/5 rounded-full" />
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-white/5 rounded-full" />
        </div>
        <div className="relative z-10 container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-5 py-2 rounded-full mb-8 border border-white/20">
                <Heart className="h-4 w-4 text-red-400" />
                <span className="text-white font-medium">Loyalty Program</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Join A&O Club —<br />
                <span className="text-blue-200">Save 25% on Every Stay!</span>
              </h2>
              <p className="text-xl text-white/90 mb-10 max-w-xl leading-relaxed">
                It&apos;s free. No credit card required. Start saving immediately on your next booking.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/auth/register">
                  <Button size="lg" className="rounded-full px-10 py-6 text-base font-semibold bg-white text-primary hover:bg-white/90 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                    <Heart className="mr-2 h-5 w-5" />
                    Join Free — No Card Required
                  </Button>
                </Link>
              </div>
              <p className="text-white/60 text-sm mt-6 flex items-center justify-center lg:justify-start gap-2">
                <Users className="h-4 w-4" />
                Join 500,000+ members worldwide
              </p>
            </div>
            <div className="hidden lg:flex justify-center">
              <div className="relative">
                {/* Decorative glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl blur-3xl opacity-30 animate-pulse" />
                <div className="relative w-80 bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
                  <div className="flex items-center justify-between mb-10">
                    <svg className="h-12 w-12" viewBox="0 0 32 32" fill="none">
                      <path d="M16 2L28 26H4L16 2Z" fill="white" />
                      <path d="M16 8L22 22H10L16 8Z" fill="#4159a8" />
                    </svg>
                    <Badge className="bg-white/20 text-white border-0">A&O Club</Badge>
                  </div>
                  <div className="text-white mb-8">
                    <p className="text-3xl font-bold">Member Card</p>
                    <p className="text-white/70 mt-1">Guest Member</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-current" />
                      ))}
                    </div>
                    <div className="text-right">
                      <p className="text-white/60 text-xs">Status</p>
                      <p className="text-white font-semibold">Active</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Room Types Showcase - Enhanced */}
      <section className="py-24 bg-gradient-to-b from-white to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-1">Accommodation</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Room Types for Every Traveler</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Choose the perfect accommodation for your trip, whether solo or with a group
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="flex border-b overflow-x-auto bg-gray-50/50">
              {roomTypes.map((room, index) => (
                <button
                  key={room.type}
                  onClick={() => setActiveRoomTab(index)}
                  className={cn(
                    'flex-1 min-w-[140px] px-6 py-5 text-sm font-semibold transition-all border-b-2 whitespace-nowrap',
                    activeRoomTab === index
                      ? 'text-primary border-primary bg-white shadow-sm'
                      : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-white/50'
                  )}
                >
                  {room.type}
                </button>
              ))}
            </div>

            {roomTypes.map((room, index) => (
              <div
                key={room.type}
                className={cn('transition-all duration-300', activeRoomTab === index ? 'block' : 'hidden')}
              >
                <div className="flex flex-col lg:flex-row">
                  <div className="relative lg:w-[55%] h-72 lg:h-auto min-h-[400px]">
                    <Image
                      src={room.image}
                      alt={room.type}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 lg:to-transparent" />
                  </div>
                  <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center">
                    <h3 className="text-3xl font-bold mb-4">{room.type}</h3>
                    <p className="text-muted-foreground text-lg mb-8">{room.description}</p>
                    <div className="flex flex-wrap gap-2 mb-10">
                      {room.amenities.map((a) => (
                        <span key={a} className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors">
                          <Check className="inline h-3 w-3 mr-1" />
                          {a}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-muted-foreground text-sm">from</span>
                        <p className="text-4xl font-bold text-primary">{room.price}</p>
                        <span className="text-muted-foreground text-sm">per night</span>
                      </div>
                      <Link href={`/hostels?roomType=${room.type.toLowerCase().replace(' ', '_')}`}>
                        <Button size="lg" className="rounded-full px-10 py-6 text-base font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                          Book This Room
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guest Reviews - Enhanced */}
      <section className="py-24 bg-gradient-to-b from-white to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-1">Testimonials</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">What Our Guests Say</h2>
            <div className="flex items-center justify-center gap-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-2xl font-bold text-primary">4.7</span>
              <span className="text-muted-foreground">based on 15,000+ reviews</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredReviews.map((review, index) => (
              <div key={review.name} className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary/20">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`h-14 w-14 rounded-full ${review.color} flex items-center justify-center font-bold text-xl shadow-lg`}>
                    {review.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-lg">{review.name}</p>
                    <p className="text-muted-foreground text-sm">🇩🇪 {review.location}</p>
                  </div>
                  <div className="ml-auto flex">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-muted-foreground text-lg leading-relaxed">&ldquo;{review.comment}&rdquo;</p>
                {/* Quote icon decoration */}
                <div className="mt-4 text-primary/10 group-hover:text-primary/20 transition-colors">
                  <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-10 flex items-center justify-center gap-2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            Reviews powered by Google
          </p>
        </div>
      </section>

      {/* City Map Section - Enhanced */}
      <section className="py-24 bg-gradient-to-b from-muted/30 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-1">Discover</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Explore Our Cities</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {error
                ? 'Error loading locations. Please try again.'
                : isLoading
                ? 'Loading locations...'
                : `${cities.length} cities across Europe with ${properties?.length || 0} real A&O hostels`}
            </p>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-100">
            <PropertiesMap markers={markers} center={[50.5, 10]} zoom={4} />
          </div>

          <div className="text-center mt-16">
            <Link href="/hostels">
              <Button size="lg" variant="outline" className="rounded-full px-10 py-6 text-base font-semibold hover:bg-primary hover:text-white transition-all duration-300">
                View All {cities.length} Cities
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter - Enhanced */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/5 rounded-full" />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <Mail className="h-12 w-12 text-white/60 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Get the Best Deals First
            </h2>
            <p className="text-xl text-white/80 mb-12 leading-relaxed">
              Subscribe to our newsletter and get exclusive offers, travel tips, and early access to new locations.
            </p>
            <form className="max-w-lg mx-auto flex flex-col sm:flex-row gap-3 bg-white/10 backdrop-blur-sm p-2 rounded-full border border-white/20">
              <Input
                type="email"
                placeholder="Enter your email address"
                className="h-14 rounded-full bg-white/95 text-foreground border-0 text-base flex-1"
              />
              <Button
                type="submit"
                size="lg"
                className="h-14 rounded-full px-10 font-semibold bg-white text-primary hover:bg-white/90 transition-all duration-300"
              >
                Subscribe
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
            <p className="text-white/50 text-sm mt-6 flex items-center justify-center gap-2">
              <Check className="h-4 w-4" />
              No spam, ever. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}