import AppHeader from '../../components/shell/AppHeader'
import { Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { useAuthStore } from '../../stores/auth'
import { toDrivePreview } from '../../lib/drive'

type RestaurantPublic = {
  _id: string
  nome: string
  ratingAvg: number
  ratingCount: number
  ordersCount: number
  categorias?: { nome: string }[]
  logoPreview?: string
}

type RestaurantApi = {
  _id: string
  nome: string
  ratingAvg?: number
  ratingCount?: number
  ratingsSum?: number
  ratingsCount?: number
  ordersCount?: number
  categorias?: { nome: string }[]
  enderecos?: { 
    apelido?: string
    logoId?: string 
  }[]
}

export default function RestaurantsPublicList() {
  const [restaurants, setRestaurants] = useState<RestaurantPublic[]>([])
  const [loading, setLoading] = useState(true)
  const role = useAuthStore(s => s.role)

  useEffect(() => {
    setLoading(true)
    api.get('/restaurants')
      .then(r => {
        const data = (r.data as RestaurantApi[]).map((rest): RestaurantPublic => {
          const addr = rest.enderecos?.[0]
          const apelido = (addr?.apelido || '').trim()
          
          // Cálculo correto das avaliações
          const count = rest.ratingsCount ?? rest.ratingCount ?? 0
          const sum = rest.ratingsSum ?? 0
          const avg = count > 0 ? sum / count : (rest.ratingAvg ?? 0)

          return {
            _id: rest._id,
            nome: apelido || rest.nome,
            ratingAvg: Number(avg.toFixed(1)),
            ratingCount: count,
            ordersCount: rest.ordersCount ?? 0, // ✅ CORREÇÃO: Captura ordersCount
            categorias: rest.categorias,
            logoPreview: addr?.logoId ? toDrivePreview(addr.logoId) : undefined
          }
        })
        // Ordena por avaliação (maior primeiro), depois por quantidade de pedidos
        data.sort((a, b) => {
          if (b.ratingAvg !== a.ratingAvg) return b.ratingAvg - a.ratingAvg
          return b.ordersCount - a.ordersCount
        })

        setRestaurants(data)
      })
      .catch(err => {
        console.error('Erro ao carregar restaurantes:', err)
        setRestaurants([])
      })
      .finally(() => setLoading(false))
  }, [])
  if (loading) {
    return (
      <div className="app-shell">
        <AppHeader />
        <main className="mx-auto max-w-6xl px-4 py-6">
          <div className="text-center py-12">Carregando restaurantes...</div>
        </main>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-semibold mb-6">Restaurantes</h1>
        
        {restaurants.length === 0 ? (
          <div className="text-center py-12 opacity-60">
            Nenhum restaurante encontrado
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {restaurants.map(r => (
              <article key={r._id} className="card-p3">
                {/* Logo do Restaurante */}
                <div
                  className="relative w-full rounded-md overflow-hidden border border-white/10 mb-3"
                  style={{ paddingTop: '100%' }}
                >
                  {r.logoPreview ? (
                    <iframe
                      className="absolute inset-0 w-full h-full object-cover sandbox-allow-popups-disabled"
                      sandbox="allow-scripts allow-same-origin"
                      style={{ pointerEvents: 'none' }}
                      src={r.logoPreview}
                      loading="lazy"
                      onError={(e) => {
                        // Se falhar ao carregar, mostra mensagem "Sem imagem"
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (parent && !parent.querySelector('.fallback-msg')) {
                          const fallback = document.createElement('div')
                          fallback.className = 'fallback-msg absolute inset-0 grid place-items-center text-xs opacity-60 bg-white/5'
                          fallback.textContent = 'Sem imagem'
                          parent.appendChild(fallback)
                        }
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-xs opacity-60 bg-white/5">
                      Sem imagem
                    </div>
                  )}
                </div>

                {/* Nome do Restaurante */}
                <header className="mb-2">
                  <h3 className="text-sm font-semibold">
                    {r.nome}
                  </h3>
                </header>

                {/* Avaliação com Estrelas */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`size-3 ${
                          i < Math.round(r.ratingAvg)
                            ? 'text-amber-300 fill-amber-300'
                            : 'opacity-30'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm opacity-75">
                    {r.ratingAvg.toFixed(1)} ({r.ordersCount})
                  </span>
                </div>

                {/* Categorias */}
                {r.categorias && r.categorias.length > 0 && (
                  <p className="text-sm opacity-70 mb-3">
                    {r.categorias.map(c => c.nome).join(' • ')}
                  </p>
                )}

                {/* Botão de ação */}
                <div className="mt-auto">
                  {role === 'CLIENTE' ? (
                    <Link
                      to={`/cliente/restaurante/${r._id}`}
                      className="btn-primary block text-center"
                    >
                      Ver cardápio
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      className="btn-primary block text-center"
                    >
                      Ver cardápio
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}