'use client'

import { useQuery } from '@tanstack/react-query'
import { propertiesService } from '@/services/properties.service'
import type { Property, RoomType, PropertyAvailability, SearchFilters } from '@/types/property.types'

export function useProperties(filters?: SearchFilters) {
  return useQuery<Property[]>({
    queryKey: ['properties', filters],
    queryFn: () => propertiesService.getAll(filters),
    staleTime: 1000 * 60 * 5,
  })
}

export function useProperty(idOrSlug: string) {
  return useQuery<Property>({
    queryKey: ['property', idOrSlug],
    queryFn: () => propertiesService.getBySlug(idOrSlug),
    enabled: !!idOrSlug,
    staleTime: 1000 * 60 * 10,
  })
}

export function useRoomTypes(propertyId: string) {
  return useQuery<RoomType[]>({
    queryKey: ['roomTypes', propertyId],
    queryFn: () => propertiesService.getRoomTypes(propertyId),
    enabled: !!propertyId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useAvailability(propertyId: string, checkIn: string, checkOut: string, guests?: number) {
  return useQuery<PropertyAvailability[]>({
    queryKey: ['availability', propertyId, checkIn, checkOut, guests],
    queryFn: () => propertiesService.checkAvailability(propertyId, checkIn, checkOut, guests),
    enabled: !!propertyId && !!checkIn && !!checkOut,
    staleTime: 1000 * 60 * 2,
  })
}

export function usePropertySearch(filters: SearchFilters) {
  return useQuery<Property[]>({
    queryKey: ['propertySearch', filters],
    queryFn: () => propertiesService.search(filters),
    enabled: !!filters.location || !!filters.checkIn,
    staleTime: 1000 * 60 * 2,
  })
}