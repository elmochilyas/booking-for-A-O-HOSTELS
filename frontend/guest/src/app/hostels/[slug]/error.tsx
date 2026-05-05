'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, Home, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Property page error:', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mb-8">
        <AlertTriangle className="h-12 w-12 text-destructive" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        We couldn't load this property. Please try again.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={reset} size="lg" className="rounded-full px-8">
          <RotateCcw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
        <Link href="/hostels">
          <Button size="lg" variant="outline" className="rounded-full px-8">
            <Home className="h-4 w-4 mr-2" />
            Browse Hostels
          </Button>
        </Link>
      </div>
    </div>
  )
}