'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, MapPin, Star, Trash2, Share2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import { propertiesService } from '@/services/properties.service'
import type { Property } from '@/types/property.types'

interface WishlistItem {
  propertyId: string
  addedAt: string
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<string[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('wishlist')
    if (stored) {
      const items: WishlistItem[] = JSON.parse(stored)
      setWishlist(items.map(item => item.propertyId))
    }
  }, [])

  useEffect(() => {
    async function loadProperties() {
      if (wishlist.length === 0) {
        setIsLoading(false)
        return
      }

      try {
        const allProps = await propertiesService.getAll()
        const wishlistProps = allProps.filter(p => wishlist.includes(p.id))
        setProperties(wishlistProps)
      } catch (error) {
        console.error('Failed to load wishlist properties:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProperties()
  }, [wishlist])

  const removeFromWishlist = (propertyId: string) => {
    const stored = localStorage.getItem('wishlist')
    if (stored) {
      const items: WishlistItem[] = JSON.parse(stored)
      const filtered = items.filter(item => item.propertyId !== propertyId)
      localStorage.setItem('wishlist', JSON.stringify(filtered))
      setWishlist(filtered.map(item => item.propertyId))
      setProperties(prev => prev.filter(p => p.id !== propertyId))
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/hostels?wishlist=${wishlist.join(',')}`
    if (navigator.share) {
      await navigator.share({
        title: 'My A&O Wishlist',
        url,
      })
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="overflow-hidden rounded-xl">
            <div className="flex">
              <Skeleton className="w-64 h-48 rounded-l-xl" />
              <div className="flex-1 p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  const cities = Array.from(new Set(properties.map(p => p.city).filter(Boolean)))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Wishlist</h1>
          <p className="text-muted-foreground">{properties.length} saved hostels</p>
        </div>
        {properties.length > 0 && (
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        )}
      </div>

      {cities.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {cities.map(city => (
            <Badge key={city} variant="secondary" className="px-3 py-1">
              <MapPin className="h-3 w-3 mr-1" />
              {city}
            </Badge>
          ))}
        </div>
      )}

      {properties.length === 0 ? (
        <Card className="py-16">
          <CardContent className="text-center">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No saved hostels</h3>
            <p className="text-muted-foreground mb-6">
              Save hostels you love to build your wishlist
            </p>
            <Link href="/hostels">
              <Button>Browse Hostels</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {properties.map(property => (
            <Link key={property.id} href={`/hostels/${property.slug}`}>
              <Card className="overflow-hidden rounded-xl border-0 shadow-md card-hover hover:shadow-lg transition-all">
                <div className="flex flex-col sm:flex-row">
                  <div className="relative w-full sm:w-64 h-48 sm:h-52 shrink-0">
                    <Image
                      src={property.images?.[0]?.url || 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'}
                      alt={property.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-3 right-3 bg-white/90 backdrop-blur hover:bg-white hover:text-destructive"
                      onClick={(e) => {
                        e.preventDefault()
                        removeFromWishlist(property.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardContent className="flex-1 p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge variant="secondary" className="mb-1">{property.city}</Badge>
                        <h3 className="font-bold text-lg">{property.name}</h3>
                        <div className="flex items-center gap-1 mt-1 text-muted-foreground text-sm">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{property.starRating.toFixed(1)}</span>
                          <span className="text-muted-foreground/70">({property.starRating} reviews)</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-muted-foreground text-sm">
                          <MapPin className="h-4 w-4" />
                          <span>{property.address}</span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-sm text-muted-foreground">from</div>
                        <div className="text-2xl font-bold text-primary">
                          {formatCurrency(property.priceFrom)}
                        </div>
                        <div className="text-sm text-muted-foreground">/night</div>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}