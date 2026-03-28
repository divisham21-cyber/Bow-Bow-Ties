import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { ProductLocation } from './MapComponent'

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

function MapViewUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  map.setView([lat, lng], 11)
  return null
}

interface MapLeafletInnerProps {
  locations: ProductLocation[]
  center: {
    lat: number
    lng: number
  }
}

export default function MapLeafletInner({ locations, center }: MapLeafletInnerProps) {
  return (
    <div className="rounded-lg overflow-hidden border border-gray-200">
      <MapContainer center={[center.lat, center.lng]} zoom={11} style={{ width: '100%', height: '460px' }}>
        <MapViewUpdater lat={center.lat} lng={center.lng} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((location, index) => (
          <Marker key={`${location.name}-marker-${index}`} position={[location.lat, location.lng]}>
            <Popup>
              <strong>{location.name}</strong>
              <br />
              {location.address}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
