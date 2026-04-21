
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'


delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <circle cx="16" cy="16" r="14" fill="#2563eb" stroke="#fff" stroke-width="3"/>
      <circle cx="16" cy="16" r="5" fill="#fff"/>
    </svg>`),
  iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -18],
})

const providerIcon = (serviceType) => {
  const emojis = { mechanic: '🔧', fuel: '⛽', towing: '🚛', battery: '🔋', tyre: '🔄' }
  const em = emojis[serviceType] ?? '📍'
  return new L.DivIcon({
    html: `<div style="background:#1e293b;border:2px solid #3b82f6;border-radius:10px;padding:4px 6px;font-size:18px;box-shadow:0 4px 12px rgba(0,0,0,.4)">${em}</div>`,
    iconSize: [40, 36], iconAnchor: [20, 36], popupAnchor: [0, -38], className: '',
  })
}


function RecenterMap({ lat, lng }) {
  const map = useMap()
  map.setView([lat, lng], map.getZoom())
  return null
}

export default function MapView({ userLocation, providers = [], onProviderSelect }) {
  if (!userLocation) return (
    <div className="h-full flex items-center justify-center text-slate-500 text-sm">
      <span className="text-center">📍 Enable location to see the map</span>
    </div>
  )

  return (
    <MapContainer
      center={[userLocation.lat, userLocation.lng]}
      zoom={13}
      className="h-full w-full rounded-xl z-0"
      zoomControl={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
      />
      <RecenterMap lat={userLocation.lat} lng={userLocation.lng} />

      {}
      <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
        <Popup>
          <div className="text-center">
            <strong className="text-brand-400">You are here</strong>
          </div>
        </Popup>
      </Marker>
      <Circle
        center={[userLocation.lat, userLocation.lng]}
        radius={50000}
        pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.04, weight: 1 }}
      />

      {}
      {providers.map((p) => (
        <Marker
          key={p.id}
          position={[parseFloat(p.latitude), parseFloat(p.longitude)]}
          icon={providerIcon(p.service_type)}
          eventHandlers={{ click: () => onProviderSelect?.(p) }}
        >
          <Popup>
            <div className="min-w-[160px]">
              <p className="font-semibold text-white mb-1">{p.full_name}</p>
              <p className="text-xs text-slate-400 capitalize">{p.service_type_display}</p>
              <p className="text-xs text-brand-400 mt-1">📍 {p.distance_km} km away</p>
              <p className="text-xs text-yellow-400">⭐ {p.rating} ({p.total_jobs} jobs)</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
