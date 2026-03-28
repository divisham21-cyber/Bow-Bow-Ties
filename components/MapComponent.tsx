import dynamic from 'next/dynamic'
import { useMemo, useState } from 'react'

export interface ProductLocation {
  name: string
  address: string
  lat: number
  lng: number
}

interface MapComponentProps {
  locations: ProductLocation[]
}

const LeafletMap = dynamic(() => import('./MapLeafletInner'), { ssr: false })

export default function MapComponent({ locations }: MapComponentProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const center = useMemo(() => {
    if (locations.length === 0) {
      return { lat: 47.8049,  lng: -122.1632 }
    }

    const selected = locations[selectedIndex]
    return { lat: selected.lat, lng: selected.lng }
  }, [locations, selectedIndex])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-4 bg-white rounded-lg shadow-md p-5 h-fit">
        <h4 className="text-xl font-semibold text-gray-900 mb-4">Seattle Area Locations</h4>
        <ul className="space-y-3">
          {locations.map((location, index) => (
            <li key={`${location.name}-${index}`}>
              <button
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`w-full text-left rounded-lg border px-4 py-3 transition-colors ${
                  selectedIndex === index
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                }`}
              >
                <p className="font-semibold text-gray-900">{location.name}</p>
                <p className="text-sm text-gray-600">{location.address}</p>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="lg:col-span-8">
        <LeafletMap locations={locations} center={center} />
      </div>
    </div>
  )
}
