'use client'

import dynamic from 'next/dynamic'

interface MapMarker {
  id: string
  name: string
  city: string
  country: string
  latitude: number
  longitude: number
  priceFrom: number
}

interface MapProps {
  markers: MapMarker[]
  center?: [number, number]
  zoom?: number
}

const MapContent = dynamic(() => import('./MapContent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-muted animate-pulse rounded-2xl flex items-center justify-center">
      <span className="text-muted-foreground">Loading map...</span>
    </div>
  ),
})

export default function PropertiesMap({ markers, center, zoom }: MapProps) {
  return (
    <div className="w-full rounded-2xl overflow-hidden">
      <MapContent markers={markers} center={center} zoom={zoom} />
    </div>
  )
}