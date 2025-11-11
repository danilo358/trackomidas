import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Bell, Clock, CheckCheck, Bike, ChefHat } from 'lucide-react'
import GLMap from '../../../components/maps/GLMap'
import api from '../../../lib/api'
import { io as socketIO } from 'socket.io-client'
import AssignDriver from '../../../components/AssignDriver'
import { drivingDistanceKm } from '../../../lib/maps'

type Status = 'AGUARDANDO' | 'EM_PREPARO' | 'PRONTO' | 'EM_ROTA' | 'FECHADO'

type Pedido = {
  _id: string
  itens: { nome: string; qtd: number; preco?: number }[]
  total: number
  status: Status
  entregador?: string
  driverLoc?: { lng: number; lat: number; ts: string }
  archivedAt?: string | null
  closedAt?: string | null
  dest?: { lng:number; lat:number; label?:string }
}

const inicial: Pedido[] = []

// helper compartilhado para countdown (em ms)
function msLeft(p: Pedido, nowValue: number) {
  if (p.status !== 'FECHADO' || p.archivedAt) return 0
  const base = p.closedAt ? new Date(p.closedAt).getTime() : Date.now()
  const elapsed = nowValue - base
  return Math.max(0, 60_000 - elapsed)
}

export default function OrdersPage() {
  
  const [pedidos, setPedidos] = useState<Pedido[]>(inicial)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const scheduled = useRef<Set<string>>(new Set())
  const [now, setNow] = useState<number>(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
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

  useEffect(() => {
    pedidos.forEach(p => {
      if (p.status === 'FECHADO' && !p.archivedAt && !scheduled.current.has(p._id)) {
        const remainingMs = msLeft(p, now) || 60_000
        scheduled.current.add(p._id)
        setTimeout(async () => {
          try {
            await api.patch(`/orders/me/${p._id}/archive`)
            setPedidos(prev => prev.filter(x => x._id !== p._id))
          } finally {
            scheduled.current.delete(p._id)
          }
        }, remainingMs)
      }
    })
  }, [pedidos, now])

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
      <Col title="Aguardando" icon={<Bell className="size-4" />} cards={grupos.AGUARDANDO} onNext={avancarStatus} onReplace={replacePedido} now={now} />
      <Col title="Em Preparo" icon={<ChefHat className="size-4" />} cards={grupos.EM_PREPARO} onNext={avancarStatus} onReplace={replacePedido} now={now} />
      <Col title="Pronto" icon={<CheckCheck className="size-4" />} cards={grupos.PRONTO} onNext={avancarStatus} onReplace={replacePedido} now={now} />
      <Col title="Em Rota" icon={<Bike className="size-4" />} cards={grupos.EM_ROTA} onNext={avancarStatus} onReplace={replacePedido} now={now} />
      <Col title="Fechado" icon={<Clock className="size-4" />} cards={grupos.FECHADO} onNext={avancarStatus} onReplace={replacePedido} now={now} />
    </div>
  )
}

function Col({ title, icon, cards, onNext, onReplace, now }:{ title:string; icon:ReactNode; cards:Pedido[]; onNext:(p:Pedido)=>void; onReplace:(p:Pedido)=>void; now:number }){
  const [assignFor, setAssignFor] = useState<string | null>(null)
  return (
    <section className="card">
      <header className="flex items-center gap-2 mb-3"><span>{icon}</span><h3 className="font-semibold">{title}</h3></header>
      <div className="grid gap-3">
        {cards.map(c => (
          <article key={c._id} className="rounded-xl p-3 bg-white/5">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Pedido #{c._id}</h4>
              <div className="flex items-center gap-2">
                {c.status === 'FECHADO' && !c.archivedAt && (
                  <span className="px-2 py-0.5 text-xs rounded-full border border-brand-600/40 bg-brand-600/20 text-brand-200">
                    {Math.ceil(msLeft(c, now)/1000)}s
                  </span>
                )}
                <span className="text-sm opacity-70">R$ {c.total.toFixed(2)}</span>
              </div>
            </div>
            <div className="grid gap-2">
              <p className="text-sm opacity-80">{c.entregador ? `Entregador: ${c.entregador}` : '—'}</p>
              {c.status==='EM_ROTA' && c.driverLoc && c.dest && (
                <div className="grid gap-2">
                  <div className="h-52 rounded-xl overflow-hidden border border-white/10">
                    <GLMap
                      from={[c.driverLoc.lng, c.driverLoc.lat]}
                      to={[c.dest.lng, c.dest.lat]}
                      followFrom
                    />
                  </div>
                  <Remaining from={[c.driverLoc.lng, c.driverLoc.lat]} to={[c.dest.lng, c.dest.lat]} />
                </div>
              )}
            </div>
            <ul className="text-sm opacity-80 list-disc pl-5">
              {c.itens.map((i,idx)=>(<li key={idx}>{i.qtd}× {i.nome}</li>))}
            </ul>
           <div className="mt-2 flex items-center justify-between">
            <span className="font-semibold">R$ {c.total.toFixed(2)}</span>
            <div className="flex gap-2">
              {c.status !== 'FECHADO' && c.status !== 'PRONTO' && (
                <button className="btn-primary" onClick={()=>onNext(c)}>Avançar status</button>
              )}
              {c.status === 'PRONTO' &&
              <button className="btn-ghost text-sm" onClick={()=>setAssignFor(c._id)}>Atribuir entregador</button>
              }
            </div>
          </div>
          {assignFor && c.status=="PRONTO" &&(
            <div className="fixed inset-0 bg-black/60 grid place-items-center z-50">
              <div className="card w-full max-w-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Atribuir entregador</h3>
                  <button className="btn-ghost" onClick={()=>setAssignFor(null)}>Fechar</button>
                </div>
                <AssignDriver
                  orderId={assignFor}
                  onAssigned={(novo)=>{ onReplace(novo as Pedido); setAssignFor(null) }}
                />
              </div>
            </div>
          )}
          </article>
        ))}
        {cards.length===0 && <p className="text-sm opacity-60">Sem pedidos neste estágio.</p>}
      </div>
    </section>
  )
}

function Remaining({ from, to }:{ from:[number,number]; to:[number,number] }) {
  const [km, setKm] = useState<number | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const d = await drivingDistanceKm(from, to)
      if (alive) setKm(Number(d.toFixed(1)))
    })()
    return () => { alive = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from[0], from[1], to[0], to[1]])

  return (
    <span className="text-xs opacity-70">
      {km === null ? 'Calculando rota…' : `Falta ${km} km`}
    </span>
  )
}