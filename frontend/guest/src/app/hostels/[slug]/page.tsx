'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Star, MapPin, Phone, Clock, Wifi, Car, Coffee, Wine, Lock, Bike,
  PawPrint, Wind, Dumbbell, ChefHat, ChevronLeft, ChevronRight,
  Calendar, Map, BookOpen, Gamepad2, ArrowUpDown, Thermometer, Settings,
  Luggage, Shirt, Tv, Heart, Share2, Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useProperty, useRoomTypes } from '@/hooks/useProperties'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import { AMENITY_ICONS } from '@/lib/constants'
import { useQuery } from '@tanstack/react-query'
import { reviewsService } from '@/services/reviews.service'

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
      <div className="bg-muted h-80 rounded-2xl flex flex-col items-center justify-center gap-4 p-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <MapPin className="h-8 w-8 text-primary" />
        </div>
        <p className="text-muted-foreground text-center max-w-md">{address}</p>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" className="rounded-full">
            <MapPin className="h-4 w-4 mr-2" />
            View on Google Maps
          </Button>
        </a>
      </div>
    )
  }

  return (
    <iframe
      title="Property location"
      width="100%"
      height="320"
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

  if (isLoading) {
    return <Skeleton className="h-60" />
  }

  const summary = data?.summary
  const reviews = data?.reviews ?? []

  if (!summary || summary.totalReviews === 0) {
    return (
      <Card className="rounded-2xl border-0 shadow-md">
        <CardContent className="p-12 text-center text-muted-foreground">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium">No reviews yet</p>
          <p className="mt-2">Be the first to review {propertyName}!</p>
        </CardContent>
      </Card>
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
      <Card className="rounded-2xl border-0 shadow-md overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row gap-10 items-center">
            <div className="text-center">
              <div className="text-6xl font-bold text-primary">{summary.averageRating.toFixed(1)}</div>
              <div className="flex justify-center mt-3 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-6 w-6 ${i < Math.round(summary.averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                  />
                ))}
              </div>
              <p className="text-muted-foreground mt-2">{summary.totalReviews} reviews</p>
            </div>
            <div className="flex-1 space-y-4 w-full">
              {categories.map((cat) => (
                <div key={cat.label} className="flex items-center gap-4">
                  <span className="w-28 text-sm font-medium shrink-0">{cat.label}</span>
                  <div className="flex-1 bg-muted rounded-full h-2.5">
                    <div
                      className="bg-primary rounded-full h-2.5 transition-all"
                      style={{ width: `${(cat.value / 5) * 100}%` }}
                    />
                  </div>
                  <span className="w-10 text-right font-bold">{cat.value.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map((review) => (
          <Card key={review.id} className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center font-bold text-white text-lg">
                    {review.guestName?.[0]?.toUpperCase() ?? 'G'}
                  </div>
                  <div>
                    <p className="font-bold">{review.guestName}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
              {review.isVerified && (
                <div className="flex items-center gap-2 mt-4 text-sm text-green-600">
                  <Check className="h-4 w-4" />
                  Verified guest
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function PropertyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { data: property, isLoading } = useProperty(slug)
  const { data: roomTypes } = useRoomTypes(property?.id ?? '')
  const [galleryIndex, setGalleryIndex] = useState(0)

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-[60vh] rounded-2xl" />
        <Skeleton className="h-64 mt-8" />
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
        <Link href="/hostels">
          <Button size="lg" className="rounded-full px-8">
            Browse All Hostels
          </Button>
        </Link>
      </div>
    )
  }

  const images = property.images?.length > 0
    ? property.images.map((img) => img.url)
    : ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200']

  const nextImage = () => setGalleryIndex((prev) => (prev + 1) % images.length)
  const prevImage = () => setGalleryIndex((prev) => (prev - 1 + images.length) % images.length)

  const fullAddress = `${property.address}, ${property.city}, ${property.country}`

  return (
    <div className="min-h-screen">
      <section className="relative h-[55vh] min-h-[450px]">
        <Image
          src={images[galleryIndex]}
          alt={property.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="absolute top-4 right-4 flex gap-2">
          <button className="p-3 bg-white/90 rounded-full hover:bg-white transition-all shadow-lg hover:scale-105">
            <Heart className="h-5 w-5 text-muted-foreground" />
          </button>
          <button className="p-3 bg-white/90 rounded-full hover:bg-white transition-all shadow-lg hover:scale-105">
            <Share2 className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {images.length > 1 && (
          <>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setGalleryIndex(i)}
                  aria-label={`Photo ${i + 1}`}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${i === galleryIndex ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'}`}
                />
              ))}
            </div>
            <button
              onClick={prevImage}
              aria-label="Previous photo"
              className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-foreground p-3 rounded-full shadow-lg hover:scale-110 transition-all"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextImage}
              aria-label="Next photo"
              className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-foreground p-3 rounded-full shadow-lg hover:scale-110 transition-all"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </section>

      <section className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-primary text-white hover:bg-primary/90 px-4 py-1.5">{property.city}</Badge>
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-md">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="font-bold">{property.starRating}</span>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">{property.name}</h1>

            <div className="flex flex-wrap gap-6 text-muted-foreground mb-8 pb-8 border-b">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span>{property.city}, {property.country}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                <span>{property.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span>Check-in {property.checkInTime} / Check-out {property.checkOutTime}</span>
              </div>
            </div>

            <Tabs defaultValue="overview" className="mt-8">
              <TabsList className="bg-muted p-1 rounded-xl">
                <TabsTrigger value="overview" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-md">Overview</TabsTrigger>
                <TabsTrigger value="rooms" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-md">Rooms</TabsTrigger>
                <TabsTrigger value="amenities" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-md">Amenities</TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-md">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-8 space-y-8">
                <div className="bg-muted/50 rounded-2xl p-8">
                  <h2 className="text-xl font-bold mb-4">About This Hostel</h2>
                  <p className="text-muted-foreground leading-relaxed text-lg">{property.description}</p>
                </div>

                <div className="bg-muted/50 rounded-2xl p-8">
                  <h2 className="text-xl font-bold mb-6">Location & Getting There</h2>
                  <p className="text-muted-foreground mb-6">{fullAddress}</p>
                  <PropertyMap
                    lat={property.latitude}
                    lng={property.longitude}
                    address={fullAddress}
                  />
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="mt-6 rounded-full">
                      <MapPin className="h-4 w-4 mr-2" />
                      Get Directions
                    </Button>
                  </a>
                </div>

                <div className="bg-muted/50 rounded-2xl p-8">
                  <h2 className="text-xl font-bold mb-6">House Rules & Policies</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-white rounded-xl">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Check-in</p>
                        <p className="font-semibold">From {property.checkInTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-white rounded-xl">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Check-out</p>
                        <p className="font-semibold">By {property.checkOutTime}</p>
                      </div>
                    </div>
                  </div>
                  <ul className="mt-6 space-y-3 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      {property.petPolicy || 'Pets not allowed in dorms. Allowed in private rooms.'}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      {property.cancellationPolicy || 'Free cancellation up to 24h before check-in.'}
                    </li>
                    {property.groupPolicy && (
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        {property.groupPolicy}
                      </li>
                    )}
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Photo ID and credit card required at check-in
                    </li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="rooms" className="mt-8">
                <div className="space-y-6">
                  {!roomTypes?.length ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground text-lg">No rooms available at this time.</p>
                    </div>
                  ) : (
                    roomTypes.map((room) => (
                      <Card key={room.id} className="overflow-hidden rounded-2xl border-0 shadow-md hover:shadow-xl transition-shadow">
                        <div className="flex flex-col lg:flex-row">
                          <div className="relative w-full lg:w-64 h-56 shrink-0">
                            <Image
                              src={room.images?.[0]?.url || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'}
                              alt={room.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <CardContent className="flex-1 p-6">
                            <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                              <div className="flex-1">
                                <h3 className="font-bold text-xl mb-2">{room.name}</h3>
                                <p className="text-muted-foreground mb-4">{room.description}</p>
                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Star className="h-4 w-4" />
                                    Up to {room.capacity} guests
                                  </span>
                                  {room.bedType && <span>{room.bedType}</span>}
                                  {room.roomSize > 0 && <span>{room.roomSize}m²</span>}
                                </div>
                                <div className="flex flex-wrap gap-2 mt-4">
                                  {room.amenities?.slice(0, 5).map((amenity) => (
                                    <Badge key={amenity} variant="outline" className="rounded-full capitalize text-xs">
                                      {amenity.replace(/_/g, ' ')}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="text-left lg:text-right shrink-0 lg:ml-6">
                                <div className="flex items-baseline gap-1">
                                  <span className="text-3xl font-bold text-primary">{formatCurrency(room.pricePerNight)}</span>
                                  <span className="text-sm text-muted-foreground">/night</span>
                                </div>
                              </div>
                            </div>
                            <Link href={`/book/${property.id}`} className="mt-6 block">
                              <Button className="w-full rounded-full" size="lg">
                                <Calendar className="h-4 w-4 mr-2" />
                                Book This Room
                              </Button>
                            </Link>
                          </CardContent>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="amenities" className="mt-8">
                {!property.amenities?.length ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">Amenities information not available.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {property.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center gap-4 p-5 bg-muted/50 rounded-2xl hover:bg-muted transition-colors">
                        <div className="p-3 bg-primary/10 rounded-xl">
                          <AmenityIcon amenityKey={amenity} />
                        </div>
                        <span className="font-medium capitalize">{amenity.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="mt-8">
                <ReviewsTab propertyId={property.id} propertyName={property.name} />
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:w-96 shrink-0">
            <Card className="sticky top-24 rounded-2xl border-0 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-br from-primary to-orange-400 p-6 text-white">
                <h3 className="text-2xl font-bold">Book Your Stay</h3>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="text-center py-2">
                  <span className="text-muted-foreground">from </span>
                  <span className="text-4xl font-bold text-primary">{formatCurrency(property.priceFrom)}</span>
                  <span className="text-muted-foreground"> /night</span>
                </div>

                <Link href={`/book/${property.id}`} className="block">
                  <Button className="w-full h-14 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
                    <Calendar className="h-5 w-5 mr-2" />
                    Check Availability
                  </Button>
                </Link>

                <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
                  <Check className="h-4 w-4 text-green-500" />
                  {property.cancellationPolicy || 'Free cancellation'}
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-xl">
                    <span className="text-muted-foreground">Check-in</span>
                    <span className="font-bold">{property.checkInTime}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-xl">
                    <span className="text-muted-foreground">Check-out</span>
                    <span className="font-bold">{property.checkOutTime}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}