import { useEffect, useState } from 'react'
import api from '../../lib/api'
import GLMap from '../../components/maps/GLMap'
import { io as socketIO } from 'socket.io-client'
import { Star } from 'lucide-react'

type Pedido = {
  _id: string
  total: number
  status: 'AGUARDANDO'|'EM_PREPARO'|'PRONTO'|'EM_ROTA'|'FECHADO'
  entregador?: string
  driverLoc?: { lng:number; lat:number; ts:string }
  dest?: { lng:number; lat:number; label?:string }
  ratedAt?: string | null
  rating?: { nota: number; comentario?: string }
}

export default function ClientOrdersPage(){
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [viewOrderId, setViewOrderId] = useState<string | null>(null)
  const [rateFor, setRateFor] = useState<string | null>(null)
  const [nota, setNota] = useState<number>(0)
  const [texto, setTexto] = useState<string>('')

  useEffect(() => {
    api.get('/orders/my').then(r => setPedidos(r.data as Pedido[]))
    const s = socketIO(import.meta.env.VITE_API_URL || 'http://localhost:3333', { withCredentials:true })
    s.on('driver:loc', ({ orderId, loc }:{ orderId:string; loc:{lng:number; lat:number; ts:string} }) => {
      setPedidos(prev => prev.map(p => p._id===orderId ? { ...p, driverLoc: loc } : p))
    })
    return () => { s.close() }
  }, [])

  
  return (
    <section className="grid gap-4">
      <h2 className="text-xl font-semibold">Meus Pedidos</h2>
      <div className="grid gap-3">
        {pedidos.map(p => (
          <article key={p._id} className="card grid gap-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Pedido #{p._id}</h3>
              <span className="text-sm opacity-70">R$ {p.total.toFixed(2)}</span>
            </div>
            <p className="text-sm opacity-80">Status: {p.status} {p.entregador && `• Entregador: ${p.entregador}`}</p>
            <div className="flex items-center gap-2">
              {p.status==='EM_ROTA' && !p.ratedAt && (
              <button
                className="btn-ghost text-sm"
                disabled={!p.dest}
                onClick={()=>setViewOrderId(p._id)}
              >
                Ver mapa em tempo real
              </button>
              )}
              {p.status==='FECHADO' && !p.ratedAt && (
                <button
                  className="btn-ghost text-sm"
                  onClick={()=>{ setRateFor(p._id); setNota(0); setTexto('') }}
                >
                  Avaliar pedido
                </button>
              )}
            </div>
          </article>
        ))}
        {pedidos.length===0 && <p className="text-sm opacity-60">Você ainda não fez pedidos.</p>}
      </div>
      {viewOrderId && (() => {
        const p = pedidos.find(x => x._id === viewOrderId)
        if (!p || !p.dest) return null
        const hasDriver = Boolean(p.driverLoc)
        return (
            <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center">
            <div className="card w-[min(90vw,900px)]">
                <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Rota do Pedido #{p._id}</h3>
                <button className="btn-ghost" onClick={()=>setViewOrderId(null)}>Fechar</button>
                </div>
                <div className="h-[60vh] rounded-xl overflow-hidden border border-white/10 grid place-items-center">
                  {hasDriver && p.status === 'EM_ROTA' ? (
                    <GLMap
                      from={[p.driverLoc!.lng, p.driverLoc!.lat]}
                      to={[p.dest.lng, p.dest.lat]}
                      followFrom
                    />
                  ) : (
                    <p className="text-sm opacity-80">Aguardando localização do entregador…</p>
                  )}
                </div>
            </div>
            </div>
        )
        })()}
        {rateFor && (() => {
          const pr = pedidos.find(x => x._id === rateFor)
          if (!pr) return null
          return (
            <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center">
              <div className="card w-[min(90vw,520px)]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Avaliar pedido #{pr._id}</h3>
                  <button className="btn-ghost" onClick={()=>setRateFor(null)}>Fechar</button>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({length:5}).map((_,i)=>(
                    <button key={i} onClick={()=>setNota(i+1)} aria-label={`${i+1} estrelas`}>
                      <Star className={`size-6 ${i<nota ? 'text-amber-300 fill-amber-300' : 'opacity-40'}`} />
                    </button>
                  ))}
                </div>
                <textarea
                  className="input min-h-24"
                  placeholder="Comentário (opcional)"
                  value={texto}
                  onChange={e=>setTexto(e.target.value)}
                />
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    className="btn-primary"
                    disabled={!nota}
                    onClick={async ()=>{
                      const r = await api.patch(`/orders/my/${pr._id}/rate`, { nota, comentario: texto })
                      setPedidos(prev => prev.map(x => x._id===pr._id ? r.data : x))
                      setRateFor(null)
                    }}
                  >
                    Enviar avaliação
                  </button>
                </div>
              </div>
            </div>
          )
        })()}

    </section>
  )
}
