import { useEffect, useRef } from 'react'
import mapboxgl, { Map, Marker, type LngLatLike, type LngLatBoundsLike, GeoJSONSource } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { drivingRoute } from '../../lib/maps'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string

type Props = {
  from: [number, number]
  to: [number, number]
  /** Se true, o mapa segue o marcador "from" quando ele muda (uso: motorista em tempo real) */
  followFrom?: boolean
}

export default function GLMap({ from, to, followFrom = false }: Props) {
  const ref = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<Map | null>(null)
  const fromMarker = useRef<Marker | null>(null)
  const toMarker = useRef<Marker | null>(null)

  // init
  useEffect(() => {
    if (!ref.current || mapRef.current) return
    const map = new mapboxgl.Map({
      container: ref.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: from as LngLatLike,
      zoom: 12
    })
    mapRef.current = map
    map.once('load', () => {
      // markers iniciais
      fromMarker.current = new mapboxgl.Marker({ color: '#285AFA' }).setLngLat(from).addTo(map)
      toMarker.current = new mapboxgl.Marker({ color: '#111' }).setLngLat(to).addTo(map)
      fitBounds(map, from, to)
      void updateRoute(map, from, to)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // updates (from/to)
  useEffect(() => {
    const map = mapRef.current; if (!map) return
    if (fromMarker.current) fromMarker.current.setLngLat(from)
    if (toMarker.current) toMarker.current.setLngLat(to)

    if (followFrom) {
      map.easeTo({ center: from as LngLatLike, duration: 500 })
    } else {
      fitBounds(map, from, to)
    }
    void updateRoute(map, from, to)
  }, [from, to, followFrom])

  return <div ref={ref} className="w-full h-full" />
}

function fitBounds(map: Map, a: [number, number], b: [number, number]) {
  const bounds: LngLatBoundsLike = [a, b]
  map.fitBounds(bounds, { padding: 40, duration: 300 })
}

async function updateRoute(map: Map, from: [number, number], to: [number, number]) {
  const data = await drivingRoute(from, to)
  const id = 'route'
  if (!map.getSource(id)) {
    if (!map.isStyleLoaded()) {
      map.once('load', () => {
        map.addSource(id, { type: 'geojson', data })
        map.addLayer({ id: 'route-line', type: 'line', source: id, paint: { 'line-width': 4 } })
      })
      return
    }
    map.addSource(id, { type: 'geojson', data })
    map.addLayer({ id: 'route-line', type: 'line', source: id, paint: { 'line-width': 4 } })
  } else {
    (map.getSource(id) as GeoJSONSource).setData(data)
  }
}
