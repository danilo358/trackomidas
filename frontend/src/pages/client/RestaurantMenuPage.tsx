import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../lib/api'
import GoogleDriveImage from '../../components/GoogleDriveImage'
import { useCart } from '../../stores/cart'
import { ChevronDown, ChevronRight } from 'lucide-react'

type ItemDoc = { _id:string; nome:string; preco:number; descricao?:string; driveId?:string; categoriaId?:string }
type Categoria = { _id:string; nome:string }
type RestaurantPublic = { _id: string; nome: string; categorias?: Categoria[] }

export default function RestaurantMenuPage(){
  const { id } = useParams<{ id: string }>()
  const [items, setItems] = useState<ItemDoc[]>([])
  const [rest, setRest] = useState<RestaurantPublic | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const { setRestaurant, addItem, restaurantId } = useCart()
  const { items: cartItems } = useCart()
    const subtotal = useMemo(
    () => cartItems.reduce((s: number, i: { preco: number; qtd: number }) => s + i.preco * i.qtd, 0),
    [cartItems]
    )
  useEffect(() => {
    if (!id) return
    api.get(`/items/by-restaurant/${id}`).then(r => setItems(r.data as ItemDoc[]))
    api.get(`/restaurants/${id}`).then(r => {
      const doc = r.data as RestaurantPublic
      setRest(doc)
      const map: Record<string, boolean> = {}
      ;(doc.categorias ?? []).forEach(c => map[c._id] = true)
      setExpanded(map)
    })
    setRestaurant(id)
  }, [id, setRestaurant])

  const itemsByCat = useMemo(() => {
    const buckets: Record<string, ItemDoc[]> = {}
    items.forEach(i => {
      const key = i.categoriaId || '__sem'
      if (!buckets[key]) buckets[key] = []
      buckets[key].push(i)
    })
    return buckets
  }, [items])

  function toggleCat(catId: string){ setExpanded(prev => ({ ...prev, [catId]: !prev[catId] })) }

  return (
    <section className="grid gap-4">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{rest?.nome ?? 'Cardápio'}</h2>
        <Link className="btn-primary" to="/cliente/carrinho">Ir ao carrinho</Link>
      </header>

      {/* categorias */}
      {(rest?.categorias ?? []).map(c => (
        <div key={c._id} className="card">
          <button className="flex items-center gap-2 font-semibold" onClick={()=>toggleCat(c._id)}>
            {expanded[c._id] ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
            {c.nome}
          </button>
          {expanded[c._id] && (
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {(itemsByCat[c._id] ?? []).map(i => (
                <article key={i._id} className="rounded-xl p-3 bg-white/5">
                  {i.driveId ? <GoogleDriveImage id={i.driveId} title={i.nome}/> : <div className="aspect-square rounded-xl bg-white/5" />}
                  <h3 className="mt-3 font-semibold">{i.nome}</h3>
                  {i.descricao && <p className="opacity-70 text-sm">{i.descricao}</p>}
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-semibold">R$ {i.preco.toFixed(2)}</span>
                    <button
                      className="btn-ghost text-sm"
                      onClick={()=>addItem({ itemId: i._id, nome: i.nome, qtd: 1, preco: i.preco })}
                      disabled={!!restaurantId && restaurantId !== id}
                      title={restaurantId && restaurantId !== id ? 'Carrinho pertence a outro restaurante' : 'Adicionar'}
                    >
                      Adicionar
                    </button>
                  </div>
                </article>
              ))}
              {(itemsByCat[c._id] ?? []).length === 0 && <p className="text-sm opacity-60">Sem itens nessa categoria.</p>}
            </div>
          )}
        </div>
      ))}

      {/* itens sem categoria */}
      {(itemsByCat['__sem'] ?? []).length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 font-semibold"><ChevronDown className="size-4" />Sem categoria</div>
          <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {itemsByCat['__sem'].map(i => (
              <article key={i._id} className="rounded-xl p-3 bg-white/5">
                {i.driveId ? <GoogleDriveImage id={i.driveId} title={i.nome}/> : <div className="aspect-square rounded-xl bg-white/5" />}
                <h3 className="mt-3 font-semibold">{i.nome}</h3>
                {i.descricao && <p className="opacity-70 text-sm">{i.descricao}</p>}
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-semibold">R$ {i.preco.toFixed(2)}</span>
                  <button
                    className="btn-ghost text-sm"
                    onClick={()=>addItem({ itemId: i._id, nome: i.nome, qtd: 1, preco: i.preco })}
                    disabled={!!restaurantId && restaurantId !== id}
                  >
                    Adicionar
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
      <footer className="fixed bottom-0 inset-x-0 z-40 backdrop-blur bg-black/60 border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
            <div className="text-sm opacity-80">
            Subtotal do carrinho: <strong>R$ {subtotal.toFixed(2)}</strong>
            </div>
            <span className="text-xs opacity-60">Veja o frete no carrinho</span>
        </div>
      </footer>
    </section>
    
  )
}
