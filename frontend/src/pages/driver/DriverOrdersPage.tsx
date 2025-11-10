import { useEffect, useRef, useState } from 'react'
import api from '../../lib/api'
import { io as socketIO } from 'socket.io-client'

type Pedido = {
  _id: string
  total: number
  status: 'AGUARDANDO'|'EM_PREPARO'|'PRONTO'|'EM_ROTA'|'FECHADO'
  entregador?: string
}

export default function DriverOrdersPage(){
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [tracking, setTracking] = useState<boolean>(false)
  const watchId = useRef<number | null>(null)

  useEffect(() => {
    api.get('/orders/driver').then(r => setPedidos(r.data as Pedido[]))
    const s = socketIO('http://localhost:3333', { withCredentials: true })
    s.on('order:new', () => { /* opcional: refresh */ })
    return () => { s.close() }
  }, [])

  async function sendLoc(coords: GeolocationCoordinates){
    await api.patch(`/orders/driver/${pedidos[0]?._id}/loc`, { lng: coords.longitude, lat: coords.latitude })
  }

  function start(){
    if (!navigator.geolocation) { alert('Geolocalização não suportada'); return }
    if (tracking) return
    setTracking(true)
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => { void sendLoc(pos.coords) },
      (err) => { console.error(err) },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
    )
  }

  function stop(){
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current)
    watchId.current = null
    setTracking(false)
  }

  return (
    <section className="grid gap-4">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Meus Pedidos</h2>
        <div className="flex gap-2">
          {!tracking
            ? <button className="btn-primary" onClick={start}>Iniciar compartilhamento</button>
            : <button className="btn-ghost" onClick={stop}>Parar compartilhamento</button>
          }
        </div>
      </header>
      <div className="grid gap-2">
        {pedidos.map(p => (
          <article key={p._id} className="card flex items-center justify-between">
            <div>
              <p className="font-semibold">Pedido #{p._id}</p>
              <p className="text-sm opacity-70">Status: {p.status} • Total: R$ {p.total.toFixed(2)}</p>
            </div>
          </article>
        ))}
        {pedidos.length===0 && <p className="text-sm opacity-60">Nenhum pedido atribuído.</p>}
      </div>
    </section>
  )
}
