'use client'

import Link from 'next/link'
import { MapPin, Home, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-8">
        <MapPin className="h-12 w-12 text-muted-foreground" />
      </div>
      <h1 className="text-4xl md:text-5xl font-bold mb-4">404</h1>
      <h2 className="text-xl font-semibold text-muted-foreground mb-2">Property not found</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        Looks like this hostel has checked out early. It may have moved or no longer be available.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/hostels">
          <Button size="lg" className="rounded-full px-8">
            <Search className="h-4 w-4 mr-2" />
            Browse All Hostels
          </Button>
        </Link>
        <Link href="/">
          <Button size="lg" variant="outline" className="rounded-full px-8">
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  )
}