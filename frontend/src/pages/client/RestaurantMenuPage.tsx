import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../lib/api'
import GoogleDriveImage from '../../components/GoogleDriveImage'
import { useCart } from '../../stores/cart'

type ItemDoc = { _id:string; nome:string; preco:number; descricao?:string; driveId?:string }
type RestaurantPublic = { _id: string; nome: string }

export default function RestaurantMenuPage(){
  const { id } = useParams<{ id: string }>()
  const [items, setItems] = useState<ItemDoc[]>([])
  const [rest, setRest] = useState<RestaurantPublic | null>(null)
  const { setRestaurant, addItem, restaurantId } = useCart()

  useEffect(() => {
    if (!id) return
    api.get(`/items/by-restaurant/${id}`).then(r => setItems(r.data as ItemDoc[]))
    api.get(`/restaurants/${id}`).then(r => setRest(r.data as RestaurantPublic))
    setRestaurant(id)
  }, [id, setRestaurant])

  return (
    <section className="grid gap-4">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{rest?.nome ?? 'Cardápio'}</h2>
        <Link className="btn-primary" to="/cliente/carrinho">Ir ao carrinho</Link>
      </header>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(i => (
          <article key={i._id} className="card">
            {i.driveId ? <GoogleDriveImage id={i.driveId} title={i.nome}/> : <div className="aspect-square rounded-xl bg-white/5" />}
            <h3 className="mt-3 font-semibold">{i.nome}</h3>
            <p className="opacity-70 text-sm">{i.descricao}</p>
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
      </div>
    </section>
  )
}
