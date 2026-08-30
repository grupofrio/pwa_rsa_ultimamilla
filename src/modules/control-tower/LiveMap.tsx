import type { RouteSummary } from '@/services/api/types'
import { MapContainer, Polyline, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export default function LiveMap({ routes }: { routes: RouteSummary[] }) {
  const center: [number, number] = [20.6736, -103.344]
  return (
    <MapContainer center={center} zoom={12} className="h-[420px] w-full" scrollWheelZoom={false} aria-label="Mapa de unidades">
      <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {routes.map((route, index) => {
        const lat = center[0] + index * 0.008
        const lng = center[1] - index * 0.01
        return (
          <Marker key={route.id} position={[lat, lng]}>
            <Popup>
              {route.folio} · {route.vehicle.code} · {route.driver.name} · GPS {route.vehicle.gpsQuality}
            </Popup>
          </Marker>
        )
      })}
      {routes[3] ? (
        <>
          <Polyline positions={[[20.67, -103.35], [20.69, -103.36], [20.71, -103.34]]} pathOptions={{ color: '#081C2C', dashArray: '6 6' }} />
          <Polyline positions={[[20.67, -103.35], [20.685, -103.33]]} pathOptions={{ color: '#F5A623' }} />
        </>
      ) : null}
    </MapContainer>
  )
}
