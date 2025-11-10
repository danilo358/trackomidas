import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Bell, Clock, CheckCheck, Bike, ChefHat } from 'lucide-react'
import api from '../../../lib/api'
import { io as socketIO } from 'socket.io-client'

type Status = 'AGUARDANDO' | 'EM_PREPARO' | 'PRONTO' | 'EM_ROTA' | 'FECHADO'

type Pedido = {
  _id: string
  itens: { nome: string; qtd: number; preco?: number }[]
  total: number
  status: Status
  entregador?: string
  driverLoc?: { lng: number; lat: number; ts: string }
}

const inicial: Pedido[] = []

export default function OrdersPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>(inicial)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Notificação quando entrar pedido "AGUARDANDO"
  useEffect(() => {
    // carrega pedidos do backend
    api.get('/orders/me').then(r => setPedidos(r.data as Pedido[])).catch(()=>setPedidos([]))

    // socket realtime
    const socket = socketIO('http://localhost:3333', { withCredentials: true })
    socket.on('order:new', (o: Pedido) => {
      setPedidos(prev => [o, ...prev])
      if (audioRef.current) { audioRef.current.currentTime = 0; void audioRef.current.play().catch(()=>{}) }
    })
    socket.on('driver:loc', ({ orderId, loc }: { orderId: string; loc: { lng:number; lat:number; ts:string } }) => {
      setPedidos(prev => prev.map(x => x._id === orderId ? { ...x, driverLoc: loc } : x))
    })
    return () => { socket.close() }
  }, [])

  const grupos = useMemo(() => ({
    AGUARDANDO: pedidos.filter(p=>p.status==='AGUARDANDO'),
    EM_PREPARO: pedidos.filter(p=>p.status==='EM_PREPARO'),
    PRONTO: pedidos.filter(p=>p.status==='PRONTO'),
    EM_ROTA: pedidos.filter(p=>p.status==='EM_ROTA'),
    FECHADO: pedidos.filter(p=>p.status==='FECHADO'),
  }), [pedidos])

  async function avancarStatus(p: Pedido) {
    const r = await api.patch(`/orders/me/${p._id}/next`)
    const novo = r.data as Pedido
    setPedidos(prev => prev.map(x => x._id===novo._id ? novo : x))
  }

  function replacePedido(novo: Pedido) {
    setPedidos((prev: Pedido[]) => prev.map((x: Pedido) => (x._id === novo._id ? novo : x)))
  }
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <audio ref={audioRef} src="data:audio/mp3;base64,//uQZAAAAAAAAAAAAAAAAAAAA..." />
      <Col title="Aguardando" icon={<Bell className="size-4" />} cards={grupos.AGUARDANDO} onNext={avancarStatus} onReplace={replacePedido} />
      <Col title="Em Preparo" icon={<ChefHat className="size-4" />} cards={grupos.EM_PREPARO} onNext={avancarStatus} onReplace={replacePedido} />
      <Col title="Pronto" icon={<CheckCheck className="size-4" />} cards={grupos.PRONTO} onNext={avancarStatus} onReplace={replacePedido} />
      <Col title="Em Rota" icon={<Bike className="size-4" />} cards={grupos.EM_ROTA} onNext={avancarStatus} onReplace={replacePedido} />
      <Col title="Fechado" icon={<Clock className="size-4" />} cards={grupos.FECHADO} onNext={avancarStatus} onReplace={replacePedido} />
    </div>
  )
}

function Col({ title, icon, cards, onNext, onReplace }:{ title:string; icon:ReactNode; cards:Pedido[]; onNext:(p:Pedido)=>void; onReplace:(p:Pedido)=>void }){
  return (
    <section className="card">
      <header className="flex items-center gap-2 mb-3"><span>{icon}</span><h3 className="font-semibold">{title}</h3></header>
      <div className="grid gap-3">
        {cards.map(c => (
          <article key={c._id} className="rounded-xl p-3 bg-white/5">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Pedido #{c._id}</h4>
              <span className="text-sm opacity-70">R$ {c.total.toFixed(2)}</span>
            </div>
            <div className="grid gap-2">
              <p className="text-sm opacity-80">{c.entregador ? `Entregador: ${c.entregador}` : '—'}</p>
              {c.status==='EM_ROTA' && c.driverLoc && (
                <img
                  className="rounded-xl border border-white/10"
                  alt="Mapa"
                  src={`https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+285AFA(${c.driverLoc.lng},${c.driverLoc.lat})/${c.driverLoc.lng},${c.driverLoc.lat},14,0/400x200@2x?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`}
                />
              )}
            </div>
            <ul className="text-sm opacity-80 list-disc pl-5">
              {c.itens.map((i,idx)=>(<li key={idx}>{i.qtd}× {i.nome}</li>))}
            </ul>
            <div className="mt-2 flex gap-2">
              <button className="btn-primary" onClick={()=>onNext(c)}>Avançar status</button>
              <button
                className="btn-ghost"
                onClick={async ()=>{
                  const nome = prompt('Nome do entregador?')
                  if (!nome) return
                  const r = await api.patch(`/orders/me/${c._id}/driver`, { entregador: nome })
                  onReplace(r.data as Pedido)
                }}
              >
                Definir entregador
              </button>
            </div>
          </article>
        ))}
        {cards.length===0 && <p className="text-sm opacity-60">Sem pedidos neste estágio.</p>}
      </div>
    </section>
  )
}