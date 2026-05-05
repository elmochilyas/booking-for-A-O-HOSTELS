import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MapPin } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="text-center px-4 max-w-md mx-auto">
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <MapPin className="h-16 w-16 text-primary" />
          </div>
        </div>
        <p className="text-8xl font-black text-primary mb-4">404</p>
        <h1 className="text-2xl font-bold mb-3">Looks like this page checked out early.</h1>
        <p className="text-muted-foreground mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/hostels">
            <Button size="lg" className="rounded-full px-8">
              Browse Hostels
            </Button>
          </Link>
          <Link href="/">
            <Button size="lg" variant="outline" className="rounded-full px-8">
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
