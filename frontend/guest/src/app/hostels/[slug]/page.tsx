'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Star, MapPin, Phone, Clock, Wifi, Car, Coffee, Wine, Lock, Bike,
  PawPrint, Wind, Dumbbell, ChefHat, ChevronLeft, ChevronRight,
  Calendar, Map, BookOpen, Gamepad2, ArrowUpDown, Thermometer,
  Luggage, Shirt, Tv, Heart, Share2, Check, X, Users, ArrowRight, Images,
  Bed, Maximize, Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useProperty, useRoomTypes } from '@/hooks/useProperties'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import { AMENITY_ICONS } from '@/lib/constants'
import { useQuery } from '@tanstack/react-query'
import { reviewsService } from '@/services/reviews.service'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const ICON_COMPONENTS: Record<string, React.ElementType> = {
  Wifi, Car, Coffee, Wine, Clock, Lock, Bike, PawPrint, Wind, Dumbbell,
  ChefHat, Map, BookOpen, Gamepad2, ArrowUpDown, Thermometer,
  Luggage, Shirt, Tv,
}

function AmenityIcon({ amenityKey }: { amenityKey: string }) {
  const iconName = AMENITY_ICONS[amenityKey.toLowerCase().replace(/\s+/g, '_')] ?? 'Settings'
  const Icon = ICON_COMPONENTS[iconName] ?? Settings
  return <Icon className="h-5 w-5" />
}

function PropertyMap({ lat, lng, address }: { lat: number; lng: number; address: string }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey || apiKey === 'placeholder') {
    return (
      <div className="bg-muted h-64 rounded-2xl flex flex-col items-center justify-center gap-3">
        <MapPin className="h-8 w-8 text-primary" />
        <p className="text-muted-foreground text-sm text-center max-w-xs">{address}</p>
        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="rounded-full">View on Google Maps</Button>
        </a>
      </div>
    )
  }
  return (
    <iframe
      title="Property location"
      width="100%"
      height="256"
      className="rounded-2xl border-0"
      src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(address)}&zoom=15`}
      allowFullScreen
    />
  )
}

function ReviewsTab({ propertyId, propertyName }: { propertyId: string; propertyName: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['propertyReviews', propertyId],
    queryFn: () => reviewsService.getForProperty(propertyId),
    enabled: !!propertyId,
    staleTime: 1000 * 60 * 5,
  })

  if (isLoading) return <Skeleton className="h-60" />

  const summary = data?.summary
  const reviews = data?.reviews ?? []

  if (!summary || summary.totalReviews === 0) {
    return (
      <div className="text-center py-16">
        <Star className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="font-semibold text-lg">No reviews yet</p>
        <p className="text-muted-foreground mt-1">Be the first to review {propertyName}!</p>
      </div>
    )
  }

  const categories = [
    { label: 'Cleanliness', value: summary.cleanliness },
    { label: 'Location', value: summary.location },
    { label: 'Staff', value: summary.staff },
    { label: 'Value', value: summary.value },
  ]

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-primary/5 to-orange-50 rounded-2xl p-8 flex items-center gap-6">
          <div className="text-center shrink-0">
            <div className="text-6xl font-black text-primary">{summary.averageRating.toFixed(1)}</div>
            <div className="flex justify-center mt-2 gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={cn('h-4 w-4', i < Math.round(summary.averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30')} />
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{summary.totalReviews} reviews</p>
          </div>
          <div className="flex-1 space-y-3">
            {categories.map((cat) => (
              <div key={cat.label} className="flex items-center gap-3">
                <span className="w-24 text-xs font-medium text-muted-foreground shrink-0">{cat.label}</span>
                <div className="flex-1 bg-white rounded-full h-2">
                  <div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${(cat.value / 5) * 100}%` }} />
                </div>
                <span className="w-8 text-right text-sm font-bold">{cat.value.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-muted/40 rounded-2xl p-6 flex flex-col justify-center gap-3">
          <p className="font-semibold">What guests love most</p>
          {['Great location', 'Friendly staff', 'Clean facilities', 'Good value'].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-green-500 shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white border border-border/50 rounded-2xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center font-bold text-white">
                  {review.guestName?.[0]?.toUpperCase() ?? 'G'}
                </div>
                <div>
                  <p className="font-semibold text-sm">{review.guestName}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={cn('h-3.5 w-3.5', i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30')} />
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
            {review.isVerified && (
              <div className="flex items-center gap-1.5 mt-3 text-xs text-green-600 font-medium">
                <Check className="h-3.5 w-3.5" />Verified stay
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PropertyDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const { data: property, isLoading } = useProperty(slug)
  const { data: roomTypes } = useRoomTypes(property?.id ?? '')
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  useEffect(() => {
    if (!isLightboxOpen) return
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false)
      if (e.key === 'ArrowRight') setLightboxIndex((p) => (p + 1) % images.length)
      if (e.key === 'ArrowLeft') setLightboxIndex((p) => (p - 1 + images.length) % images.length)
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [isLightboxOpen])

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Skeleton className="h-[50vh]" />
        <div className="container mx-auto px-4 py-8 space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <MapPin className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Property not found</h1>
        <p className="text-muted-foreground mb-8">The hostel you're looking for doesn't exist or has been removed.</p>
        <Link href="/hostels"><Button size="lg" className="rounded-full px-8">Browse All Hostels</Button></Link>
      </div>
    )
  }

  const images = property.images?.length > 0
    ? property.images.map((img) => img.url)
    : ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200']

  const fullAddress = `${property.address}, ${property.city}, ${property.country}`

  const openLightbox = (i: number) => { setLightboxIndex(i); setIsLightboxOpen(true) }
  return (
    <div className="min-h-screen bg-white">

      {/* ── Gallery ── Enhanced */}
      <section className="relative">

        {/* Desktop: masonry grid */}
        <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[500px] p-2 bg-gray-50">
          <div className="col-span-2 row-span-2 relative cursor-pointer group overflow-hidden rounded-2xl" onClick={() => openLightbox(0)}>
            <Image src={images[0]} alt={property.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="relative cursor-pointer group overflow-hidden rounded-xl" onClick={() => openLightbox(i % images.length)}>
              <Image src={images[i % images.length]} alt={`${property.name} ${i + 1}`} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            </div>
          ))}
        </div>

        {/* Mobile: single image with nav */}
        <div className="md:hidden relative h-[320px]">
          <Image src={images[galleryIndex]} alt={property.name} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          {images.length > 1 && (
            <>
              <button onClick={() => setGalleryIndex((p) => (p - 1 + images.length) % images.length)} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-white transition-all hover:scale-110">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={() => setGalleryIndex((p) => (p + 1) % images.length)} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-white transition-all hover:scale-110">
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-sm px-4 py-1.5 rounded-full">
                {galleryIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>

        {/* View all button */}
        <button
          onClick={() => openLightbox(0)}
          className="absolute bottom-6 right-6 bg-white text-foreground text-sm font-medium px-5 py-2.5 rounded-xl shadow-xl flex items-center gap-2 hover:shadow-2xl transition-all hover:scale-105 border border-white/20"
        >
          <Images className="h-4 w-4" />
          View all {images.length} photos
        </button>

        {/* Action buttons */}
        <div className="absolute top-6 right-6 flex gap-3">
          <button className="p-3 bg-white/95 backdrop-blur-md rounded-full shadow-lg hover:bg-white transition-all hover:scale-110 border border-white/20" aria-label="Save">
            <Heart className="h-5 w-5 text-muted-foreground hover:text-red-500 transition-colors" />
          </button>
          <button className="p-3 bg-white/95 backdrop-blur-md rounded-full shadow-lg hover:bg-white transition-all hover:scale-110 border border-white/20" aria-label="Share">
            <Share2 className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </section>

      {/* ── Lightbox - Enhanced */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-7xl w-full p-0 bg-black/95 border-0 rounded-2xl overflow-hidden">
          <div className="relative h-[85vh] flex items-center justify-center">
            <Image src={images[lightboxIndex]} alt={`${property.name} ${lightboxIndex + 1}`} fill className="object-contain" />
            <button onClick={() => setIsLightboxOpen(false)} className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-sm transition-all hover:scale-110">
              <X className="h-6 w-6" />
            </button>
            <button onClick={() => setLightboxIndex((p) => (p - 1 + images.length) % images.length)} className="absolute left-6 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full backdrop-blur-sm transition-all hover:scale-110">
              <ChevronLeft className="h-8 w-8" />
            </button>
            <button onClick={() => setLightboxIndex((p) => (p + 1) % images.length)} className="absolute right-6 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full backdrop-blur-sm transition-all hover:scale-110">
              <ChevronRight className="h-8 w-8" />
            </button>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm bg-black/60 backdrop-blur-sm px-5 py-2 rounded-full border border-white/10">
              {lightboxIndex + 1} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Main content ── Enhanced */}
      <div className="container mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link href="/hostels" className="hover:text-primary transition-colors">Hostels</Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate max-w-[200px]">{property.city}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-12">

          {/* ── Left column ── */}
          <div className="flex-1 min-w-0">

            {/* Title block */}
            <div className="mb-8">
              <div className="flex items-center gap-3 flex-wrap mb-4">
                <Badge className="bg-primary/10 text-primary border-0 hover:bg-primary/20 px-4 py-1.5 text-sm font-medium">
                  <MapPin className="h-3 w-3 mr-1" />
                  {property.city}, {property.country}
                </Badge>
                <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 rounded-full">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-sm">{property.starRating}</span>
                  <span className="text-muted-foreground text-sm">/ 5</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{property.name}</h1>
              <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <div className="p-1.5 bg-primary/10 rounded-lg">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                  </div>
                  {property.address}, {property.city}
                </span>
                {property.phone && (
                  <span className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                      <Phone className="h-3.5 w-3.5 text-primary" />
                    </div>
                    {property.phone}
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <div className="p-1.5 bg-primary/10 rounded-lg">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                  </div>
                  Check-in {property.checkInTime} · Check-out {property.checkOutTime}
                </span>
              </div>
            </div>

            {/* Quick amenities strip */}
            {property.amenities?.length > 0 && (
              <div className="flex flex-wrap gap-2.5 mb-10 pb-10 border-b">
                {property.amenities.slice(0, 6).map((a) => (
                  <span key={a} className="inline-flex items-center gap-2 text-sm bg-muted/70 px-4 py-2 rounded-full font-medium capitalize hover:bg-primary/10 transition-colors">
                    <AmenityIcon amenityKey={a} />
                    {a.replace(/_/g, ' ')}
                  </span>
                ))}
                {property.amenities.length > 6 && (
                  <span className="text-sm text-muted-foreground px-4 py-2">+{property.amenities.length - 6} more</span>
                )}
              </div>
            )}

            {/* Tabs - Enhanced */}
            <Tabs defaultValue="overview">
              <TabsList className="w-full justify-start bg-transparent border-b-2 border-gray-100 rounded-none h-auto p-0 gap-0 mb-10">
                {['overview', 'rooms', 'amenities', 'reviews'].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary pb-4 px-5 capitalize text-sm font-semibold text-muted-foreground hover:text-foreground transition-all"
                  >
                    {tab}
                    {tab === 'rooms' && roomTypes?.length ? ` (${roomTypes.length})` : ''}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Overview */}
              <TabsContent value="overview" className="space-y-10 mt-0">
                <div>
                  <h2 className="text-xl font-bold mb-4">About this hostel</h2>
                  <p className="text-muted-foreground leading-relaxed text-lg">{property.description || 'No description available.'}</p>
                </div>

                <div>
                  <h2 className="text-xl font-bold mb-6">Policies</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { icon: Clock, label: 'Check-in', value: `From ${property.checkInTime}` },
                      { icon: Clock, label: 'Check-out', value: `By ${property.checkOutTime}` },
                      { icon: Check, label: 'Cancellation', value: property.cancellationPolicy || 'Free cancellation up to 24h' },
                      { icon: Check, label: 'Pets', value: property.petPolicy || 'Pets not allowed in dorms' },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-start gap-4 p-5 bg-gradient-to-r from-muted/30 to-white rounded-xl border border-gray-100 hover:border-primary/20 transition-colors">
                        <div className="p-2.5 bg-primary/10 rounded-xl shrink-0">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{label}</p>
                          <p className="text-sm font-medium mt-1">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold mb-6">Location</h2>
                  <p className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    {fullAddress}
                  </p>
                  <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                    <PropertyMap lat={property.latitude} lng={property.longitude} address={fullAddress} />
                  </div>
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block">
                    <Button variant="outline" size="sm" className="rounded-full px-6 py-5 text-base gap-2 hover:bg-primary hover:text-white transition-all duration-300">
                      <MapPin className="h-4 w-4" />Get Directions
                    </Button>
                  </a>
                </div>
              </TabsContent>

              {/* Rooms */}
              <TabsContent value="rooms" className="mt-0 space-y-6">
                {!roomTypes?.length ? (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Bed className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <p className="text-muted-foreground text-lg">No rooms available at this time.</p>
                  </div>
                ) : roomTypes.map((room) => (
                  <div key={room.id} className="border border-gray-100 rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-xl transition-all duration-300 group">
                    <div className="flex flex-col sm:flex-row">
                      <div className="relative sm:w-56 h-48 sm:h-auto shrink-0 overflow-hidden">
                        <Image
                          src={room.images?.[0]?.url || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600'}
                          alt={room.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex-1 p-6 flex flex-col">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div>
                            <h3 className="font-bold text-xl">{room.name}</h3>
                            <p className="text-sm text-muted-foreground mt-2">{room.description}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-3xl font-black text-primary">{formatCurrency(room.pricePerNight)}</p>
                            <p className="text-xs text-muted-foreground">per night</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-5">
                          <span className="flex items-center gap-2">
                            <div className="p-1.5 bg-primary/10 rounded-lg">
                              <Users className="h-4 w-4 text-primary" />
                            </div>
                            Up to {room.capacity} guests
                          </span>
                          {room.bedType && (
                            <span className="flex items-center gap-2">
                              <div className="p-1.5 bg-primary/10 rounded-lg">
                                <Bed className="h-4 w-4 text-primary" />
                              </div>
                              {room.bedType}
                            </span>
                          )}
                          {room.roomSize > 0 && (
                            <span className="flex items-center gap-2">
                              <div className="p-1.5 bg-primary/10 rounded-lg">
                                <Maximize className="h-4 w-4 text-primary" />
                              </div>
                              {room.roomSize}m²
                            </span>
                          )}
                        </div>
                        {room.amenities?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-5">
                            {room.amenities.slice(0, 4).map((a) => (
                              <span key={a} className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full capitalize font-medium">
                                {a.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        )}
                        <Link href={`/book/${property.id}`} className="mt-auto">
                          <Button className="rounded-full w-full sm:w-auto px-8 py-5 text-base font-semibold gap-2 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                            <Calendar className="h-4 w-4" />Book from {formatCurrency(room.pricePerNight)}/night
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              {/* Amenities */}
              <TabsContent value="amenities" className="mt-0">
                {!property.amenities?.length ? (
                  <div className="text-center py-20">
                    <p className="text-muted-foreground">Amenities information not available.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {property.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center gap-4 p-5 bg-white rounded-xl hover:bg-primary/5 hover:border-primary/20 border border-gray-100 transition-all duration-300 group">
                        <div className="p-3 bg-primary/10 rounded-xl shrink-0 group-hover:bg-primary/20 transition-colors">
                          <AmenityIcon amenityKey={amenity} />
                        </div>
                        <span className="text-sm font-medium capitalize leading-tight">{amenity.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Reviews */}
              <TabsContent value="reviews" className="mt-0">
                <ReviewsTab propertyId={property.id} propertyName={property.name} />
              </TabsContent>
            </Tabs>
          </div>

          {/* ── Booking widget ── Enhanced */}
          <div className="lg:w-80 xl:w-96 shrink-0">
            <div className="sticky top-20 space-y-6">
              <Card className="rounded-2xl border border-gray-100 shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                <div className="p-8 pb-6">
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-black text-primary">{formatCurrency(property.priceFrom)}</span>
                    <span className="text-muted-foreground text-sm">/night</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm mb-6">
                    <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold">{property.starRating}</span>
                    </div>
                    <span className="text-muted-foreground">· Great location</span>
                  </div>

                  <Link href={`/book/${property.id}`}>
                    <Button className="w-full h-14 rounded-xl text-base font-semibold gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                      <Calendar className="h-5 w-5" />
                      Check Availability
                    </Button>
                  </Link>
                </div>

                <div className="border-t border-gray-100 px-8 py-5 space-y-3 bg-muted/20">
                  {[
                    { icon: Check, text: property.cancellationPolicy || 'Free cancellation' },
                    { icon: Clock, text: `Check-in from ${property.checkInTime}` },
                    { icon: Clock, text: `Check-out by ${property.checkOutTime}` },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="p-1.5 bg-green-50 rounded-lg">
                        <Icon className="h-4 w-4 text-green-500 shrink-0" />
                      </div>
                      {text}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Contact card */}
              {property.phone && (
                <Card className="rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
                  <p className="text-sm font-semibold mb-4">Need help?</p>
                  <a href={`tel:${property.phone}`} className="flex items-center gap-3 text-sm text-primary font-medium hover:underline group">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <Phone className="h-4 w-4" />
                    </div>
                    {property.phone}
                  </a>
                </Card>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
