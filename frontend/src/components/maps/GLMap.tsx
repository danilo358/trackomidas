import { useEffect, useRef } from 'react'
import mapboxgl, { Map, type LngLatLike, type LngLatBoundsLike, GeoJSONSource } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { drivingRoute } from '../../lib/maps'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string

export default function GLMap({ from, to }: { from: [number, number]; to: [number, number] }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<Map | null>(null)

  useEffect(() => {
    if (!ref.current || mapRef.current) return
    mapRef.current = new mapboxgl.Map({
      container: ref.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: from as LngLatLike,
      zoom: 12
    })
  }, [from])

  useEffect(() => {
    const map = mapRef.current; if (!map) return

    const addOrUpdateRoute = async () => {
      const line = await drivingRoute(from, to)

      if (!map.getSource('route')) {
        if (!map.isStyleLoaded()) {
          map.once('load', () => {
            map.addSource('route', { type: 'geojson', data: line })
            map.addLayer({ id: 'route-line', type: 'line', source: 'route', paint: { 'line-width': 4 } })
          })
        } else {
          map.addSource('route', { type: 'geojson', data: line })
          map.addLayer({ id: 'route-line', type: 'line', source: 'route', paint: { 'line-width': 4 } })
        }
      } else {
        (map.getSource('route') as GeoJSONSource).setData(line)
      }
    }

    const a = new mapboxgl.Marker({ color: '#285AFA' }).setLngLat(from).addTo(map)
    const b = new mapboxgl.Marker({ color: '#111' }).setLngLat(to).addTo(map)

    const bounds: LngLatBoundsLike = [from, to]
    map.fitBounds(bounds, { padding: 40, duration: 300 })

    void addOrUpdateRoute()
    return () => { a.remove(); b.remove() }
  }, [from, to])

  return <div ref={ref} className="w-full h-full" />
}
