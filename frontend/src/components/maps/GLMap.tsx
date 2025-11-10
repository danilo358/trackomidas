import { useEffect, useRef } from 'react'
import mapboxgl, { Map, Marker, type LngLatLike, GeoJSONSource } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { drivingRoute } from '../../lib/maps'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string

// Silencia a telemetria (evita POST para events.mapbox.com em dev)
try {
  if (mapboxgl.config) mapboxgl.config.EVENTS_URL = ''
} catch { /* empty */ }

type Props = {
  from: [number, number]
  to: [number, number]
  /** Se true, o mapa segue o marcador "from" quando ele muda (uso: motorista em tempo real) */
  followFrom?: boolean
}

export default function GLMap({ from, to, followFrom = false }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<Map | null>(null)
  const fromMarker = useRef<Marker | null>(null)
  const toMarker   = useRef<Marker | null>(null)

  // IDs únicos por instância
  const routeIdRef = useRef(`route-${Math.random().toString(36).slice(2)}`)
  const layerIdRef = useRef(`${routeIdRef.current}-line`)

  // Init
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: from as LngLatLike,
      zoom: 12
    })

    mapRef.current = map

    map.once('load', () => {
      // marcadores
      fromMarker.current = new mapboxgl.Marker({ color: '#285AFA' }).setLngLat(from).addTo(map)
      toMarker.current   = new mapboxgl.Marker({ color: '#111' }).setLngLat(to).addTo(map)

      // cria source/layer 1x
      ensureRouteSource(map, routeIdRef.current, layerIdRef.current)

      // primeira rota
      void updateRoute(map, routeIdRef.current, from, to)

      // enquadra
      map.fitBounds([from, to], { padding: 40, duration: 300 })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Atualizações from/to
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (fromMarker.current) fromMarker.current.setLngLat(from)
    if (toMarker.current)   toMarker.current.setLngLat(to)

    if (followFrom) {
      map.easeTo({ center: from as LngLatLike, duration: 500 })
    } else {
      map.fitBounds([from, to], { padding: 40, duration: 300 })
    }

    // garante source e atualiza a linha
    if (map.isStyleLoaded()) {
      ensureRouteSource(map, routeIdRef.current, layerIdRef.current)
      void updateRoute(map, routeIdRef.current, from, to)
    } else {
      map.once('load', () => {
        ensureRouteSource(map, routeIdRef.current, layerIdRef.current)
        void updateRoute(map, routeIdRef.current, from, to)
      })
    }
  }, [from, to, followFrom])

  return <div ref={containerRef} className="w-full h-full" />
}

function ensureRouteSource(map: Map, srcId: string, layerId: string) {
  if (!map.getSource(srcId)) {
    map.addSource(srcId, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
  }
  if (!map.getLayer(layerId)) {
    map.addLayer({ id: layerId, type: 'line', source: srcId, paint: { 'line-width': 4 } })
  }
}

async function updateRoute(map: Map, srcId: string, from: [number, number], to: [number, number]) {
  const data = await drivingRoute(from, to)
  const src = map.getSource(srcId) as GeoJSONSource | undefined
  if (src) src.setData(data)
}
