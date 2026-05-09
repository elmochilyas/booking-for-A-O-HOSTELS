'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import type { LatLngExpression, LatLngBoundsExpression } from 'leaflet'
import L from 'leaflet'

import 'leaflet/dist/leaflet.css'

interface MapMarker {
  id: string
  name: string
  city: string
  country: string
  latitude: number
  longitude: number
  priceFrom: number
}

interface MapContentProps {
  markers: MapMarker[]
  center?: [number, number]
  zoom?: number
}

// Restrict the map to Europe so users can't pan or zoom out to other continents
const EUROPE_BOUNDS: LatLngBoundsExpression = [
  [34, -25],
  [72, 45],
]

function createCustomIcon() {
  return L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  })
}

export default function MapContent({ markers, center = [50.5, 10], zoom = 4 }: MapContentProps) {
  // Fix Leaflet's default icon paths (broken by webpack asset hashing)
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      .leaflet-tile {
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
      }
      .leaflet-tile-container {
        line-height: 0;
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  const customIcon = createCustomIcon()

  return (
    <MapContainer
      center={center as LatLngExpression}
      zoom={zoom}
      style={{ height: '500px', width: '100%', borderRadius: '1rem' }}
      scrollWheelZoom={true}
      maxBounds={EUROPE_BOUNDS}
      maxBoundsViscosity={1.0}
      minZoom={4}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers
        .filter(m => m.latitude && m.longitude)
        .map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.latitude, marker.longitude] as LatLngExpression}
            icon={customIcon}
          >
            <Popup>
              <div className="text-center min-w-[150px] p-1">
                <strong className="block text-sm font-semibold">{marker.name}</strong>
                <span className="text-xs text-muted-foreground">{marker.city}, {marker.country}</span>
                <div className="text-orange-600 font-bold text-sm mt-1">from €{Math.round(marker.priceFrom)}</div>
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  )
}
