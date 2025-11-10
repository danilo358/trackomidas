import AppHeader from '../../components/shell/AppHeader'
import { Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { useAuthStore } from '../../stores/auth'

type RestaurantApi = {
  _id: string
  nome: string
  ratingAvg?: number
  ratingCount?: number
  ratingsSum?: number
  ratingsCount?: number
  ordersCount?: number
  categorias?: { nome: string }[]
  enderecos?: { apelido?: string; logoId?: string }[]
}

type RestaurantPublic = {
  _id: string
  nome: string
  ratingAvg: number
  ratingCount: number
  ordersCount: number
  categorias?: { nome: string }[]
  logoPreview?: string
}

export default function RestaurantsPublicList() {
  const [restaurants, setRestaurants] = useState<RestaurantPublic[]>([]); const role = useAuthStore(s=>s.role)
  useEffect(() => {
    api.get('/restaurants')
      .then(r => {
        const data = (r.data as RestaurantApi[]).map((rest): RestaurantPublic => {
          const apelido = (rest.enderecos?.[0]?.apelido || '').trim()
          const count = rest.ratingCount ?? rest.ratingsCount ?? 0
          const avg = typeof rest.ratingAvg === 'number'
            ? rest.ratingAvg
            : (count ? (rest.ratingsSum ?? 0) / count : 0)

          const logoId = rest.enderecos?.[0]?.logoId || ''
          const logoPreview = logoId
            ? `https://drive.google.com/file/d/${logoId}/preview`
            : undefined

          return {
            _id: rest._id,
            nome: apelido || rest.nome,
            ratingAvg: Number(avg.toFixed(1)),
            ratingCount: count,
            ordersCount: rest.ordersCount ?? 0,
            categorias: rest.categorias,
            logoPreview
          }
        })
        setRestaurants(data)
      })
      .catch(() => setRestaurants([]))
  }, [])
  return (
    <div className="app-shell">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">Restaurantes</h1>
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {restaurants.map(r => (
            <article key={r._id} className="card-p3">
              {r.logoPreview && (
                <div className="h-24 rounded-md overflow-hidden border border-white/10 mb-2">
                  <iframe
                    className="w-full h-full"
                    src={r.logoPreview}
                    loading="lazy"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              )}
              <header className="mt-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="mt-2 text-sm font-semibold flex items-center gap-2">
                    {r.nome}
                    <span className="text-xs opacity-70 flex items-center gap-1">
                      {Array.from({length:5}).map((_,i)=>(
                        <Star key={i} className={`size-3 ${i < Math.round(r.ratingAvg ?? 0) ? 'text-amber-300 fill-amber-300' : 'opacity-30'}`} />
                      ))}
                      <span>{(r.ratingAvg ?? 0).toFixed(1)} ({r.ordersCount ?? 0})</span>
                    </span>
                  </h3>
                  <p className="text-sm opacity-70">{(r.categorias?.map(c => c.nome) || []).join(' • ')}</p>
                </div>
              </header>
              <p className="text-sm opacity-70">
              {r.ratingCount} avaliação{r.ratingCount === 0 ? '' : 's'}
            </p>
              <div className="mt-4 flex items-center gap-2">
                {role==='CLIENTE'
                    ? <Link to={`/cliente/restaurante/${r._id}`} className="btn-primary">Ver cardápio</Link>
                    : <Link to="/login" className="btn-primary">Ver cardápio</Link>
                }
              <Link to="/login" className="btn-ghost">Entrar</Link>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  )
}