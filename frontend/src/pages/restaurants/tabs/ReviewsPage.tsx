import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import api from '../../../lib/api'

type Review = {
  _id: string
  total: number
  ratedAt: string
  rating: { nota:number; comentario?:string }
  cliente?: { nome?:string; email?:string }
  itens: { nome:string; qtd:number }[]
}

export default function ReviewsPage(){
  const [rows, setRows] = useState<Review[]>([])
  useEffect(() => { api.get('/orders/me/reviews').then(r => setRows(r.data as Review[])) }, [])

  return (
    <section className="grid gap-4">
      <h2 className="text-xl font-semibold">Avaliações recebidas</h2>
      <div className="grid gap-3">
        {rows.map(rv => (
          <article key={rv._id} className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {Array.from({length:5}).map((_,i)=>(
                  <Star key={i} className={`size-4 ${i < rv.rating.nota ? 'text-amber-300 fill-amber-300' : 'opacity-30'}`} />
                ))}
                <span className="text-sm opacity-70">por {rv.cliente?.nome || rv.cliente?.email || 'Cliente'}</span>
              </div>
              <span className="text-sm opacity-70">R$ {rv.total.toFixed(2)}</span>
            </div>
            {rv.rating.comentario && <p className="mt-2 opacity-90">{rv.rating.comentario}</p>}
            <ul className="text-sm opacity-80 list-disc pl-5 mt-2">
              {rv.itens.map((i,idx)=>(<li key={idx}>{i.qtd}× {i.nome}</li>))}
            </ul>
          </article>
        ))}
        {rows.length===0 && <p className="text-sm opacity-60">Ainda não há avaliações.</p>}
      </div>
    </section>
  )
}
