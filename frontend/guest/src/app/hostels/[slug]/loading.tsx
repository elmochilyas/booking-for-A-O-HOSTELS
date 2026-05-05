'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export default function Loading() {
  return (
    <div className="min-h-screen">
      <Skeleton className="h-[55vh] min-h-[450px] rounded-none" />
      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1 space-y-6">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-14 w-2/3" />
            <Skeleton className="h-32 w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
          <div className="lg:w-96 shrink-0">
            <Card className="sticky top-24">
              <div className="p-8 space-y-4">
                <Skeleton className="h-16 w-32 mx-auto" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}