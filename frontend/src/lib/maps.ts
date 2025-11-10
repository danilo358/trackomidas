export type LngLat = [number, number] // [lng, lat]

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string

function assertToken() {
  if (!MAPBOX_TOKEN) throw new Error('VITE_MAPBOX_TOKEN não definido')
}

/** Geocodifica um endereço textual → [lng, lat] */
export async function geocodeAddress(query: string): Promise<LngLat> {
  assertToken()
  const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`)
  url.searchParams.set('access_token', MAPBOX_TOKEN)
  url.searchParams.set('language', 'pt-BR')
  url.searchParams.set('limit', '1')

  const r = await fetch(url.toString())
  const j = await r.json() as {
    features?: { center: LngLat }[]
  }

  const center = j.features?.[0]?.center
  if (!center) throw new Error('Endereço não encontrado')
  return center
}

/** Distância de rota (driving) em km entre dois pontos */
export async function drivingDistanceKm(from: LngLat, to: LngLat): Promise<number> {
  assertToken()
  const coords = `${from[0]},${from[1]};${to[0]},${to[1]}`
  const url = new URL(`https://api.mapbox.com/directions/v5/mapbox/driving/${coords}`)
  url.searchParams.set('access_token', MAPBOX_TOKEN)
  url.searchParams.set('geometries', 'geojson')
  url.searchParams.set('overview', 'false')

  const r = await fetch(url.toString())
  const j = await r.json() as {
    routes?: { distance: number }[]
  }
  const meters = j.routes?.[0]?.distance ?? 0
  return meters / 1000
}
