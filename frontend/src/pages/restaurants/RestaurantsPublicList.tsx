import AppHeader from '../../components/shell/AppHeader'
import { Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { useAuthStore } from '../../stores/auth'

type RestaurantPublic = {
  _id: string
  nome: string
  ratingAvg?: number
  ratingCount?: number
  categorias?: { nome: string }[]
}

export default function RestaurantsPublicList() {
  const [restaurants, setRestaurants] = useState<RestaurantPublic[]>([]); const role = useAuthStore(s=>s.role)
  useEffect(() => {
    api.get('/restaurants')
      .then(r => setRestaurants(r.data as RestaurantPublic[]))
      .catch(() => setRestaurants([]))
  }, [])
  return (
    <div className="app-shell">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">Restaurantes</h1>
        <p className="opacity-70 mb-6">Lista pública. Para fazer pedidos, entre como <span className="font-semibold">CLIENTE</span>.</p>
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {restaurants.map(r => (
            <article key={r._id} className="card-p3">
              {/* Substitua por <GoogleDriveImage id={r.capaId} /> assim que tiver os IDs reais */}
              <div className="aspect-video rounded-xl bg-white/5 grid place-items-center">
                <span className="opacity-50">Capa via Google Drive</span>
              </div>
              <header className="mt-3 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold" text-sm mt-2>{r.nome}</h2>
                  <p className="text-sm opacity-70">{(r.categorias?.map(c => c.nome) || []).join(' • ')}</p>
                </div>
                <div className="flex items-center gap-1 text-amber-300">
                  <Star className="size-4 fill-current" />
                  <span className="text-sm font-semibold">{(r.ratingAvg ?? 0).toFixed(1)}</span>
                </div>
              </header>
              <p className="opacity-70 text-sm mt-2">{(r.ratingCount ?? 0).toLocaleString()} avaliações</p>
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