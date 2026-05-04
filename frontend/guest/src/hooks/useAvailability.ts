'use client'

import { useQuery } from '@tanstack/react-query'
import { propertiesService } from '@/services/properties.service'
import type { PropertyAvailability } from '@/types/property.types'

export function useAvailabilityCheck(
  propertyId: string | null,
  checkIn: string | null,
  checkOut: string | null,
  guests = 1
) {
  return useQuery<PropertyAvailability[]>({
    queryKey: ['availability', propertyId, checkIn, checkOut, guests],
    queryFn: () => {
      if (!propertyId || !checkIn || !checkOut) return Promise.resolve([])
      return propertiesService.checkAvailability(propertyId, checkIn, checkOut, guests)
    },
    enabled: !!propertyId && !!checkIn && !!checkOut,
    staleTime: 1000 * 60 * 1,
  })
}