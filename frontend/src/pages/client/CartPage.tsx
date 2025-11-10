import { useEffect, useMemo, useState } from 'react'
import api from '../../lib/api'
import { useCart } from '../../stores/cart'
import { Link } from 'react-router-dom'
import { geocodeAddress, drivingDistanceKm, type LngLat } from '../../lib/maps'
import GLMap from '../../components/maps/GLMap'

type Address = {
  _id: string
  apelido: string
  cep?: string
  rua?: string
  numero?: string
  bairro?: string
  cidade?: string
  uf?: string
  complemento?: string
}
type Restaurant = {
  _id: string
  enderecos?: Array<{
    apelido: string
    cep?: string
    rua?: string
    numero?: string
    cidade?: string
    uf?: string
    freteFixo: number
    freteKm: number
  }>
}

export default function CartPage(){
  const { restaurantId, items, distanceKm, setDistance, removeItem, clear } = useCart()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddr, setSelectedAddr] = useState<string>('')

  const [freteFixo, setFreteFixo] = useState<number>(0)
  const [freteKm, setFreteKm] = useState<number>(0)
  const [restCoord, setRestCoord] = useState<LngLat | null>(null)
  const [addrCoord, setAddrCoord] = useState<LngLat | null>(null)
  const [loadingDist, setLoadingDist] = useState<boolean>(false)

  useEffect(() => {
    api.get('/customers/addresses').then(r => setAddresses(r.data as Address[]))
  }, [])

  useEffect(() => {
    if (!restaurantId) return
    api.get(`/restaurants/${restaurantId}`).then(async r => {
        const rest = r.data as Restaurant
        const e0 = rest.enderecos?.[0]
        setFreteFixo(e0?.freteFixo ?? 0)
        setFreteKm(e0?.freteKm ?? 0)

        const addr = [e0?.rua, e0?.numero, e0?.cidade && `${e0.cidade}/${e0.uf}`].filter(Boolean).join(', ')
        if (addr) {
        const c = await geocodeAddress(addr)
        setRestCoord(c)
        }
    })
    }, [restaurantId])

  const subtotal = useMemo(() => items.reduce((acc, i)=>acc + i.preco*i.qtd, 0), [items])
  const frete = useMemo(() => freteFixo + freteKm * (distanceKm || 0), [freteFixo, freteKm, distanceKm])
  const total = useMemo(() => subtotal + frete, [subtotal, frete])

  async function checkout(){
    if (!restaurantId) { alert('Selecione um restaurante'); return }
    if (items.length===0) { alert('Carrinho vazio'); return }
    await api.post('/orders', {
      restaurantId,
      itens: items.map(i => ({ nome: i.nome, qtd: i.qtd, preco: i.preco })),
      total
    })
    clear()
    alert('Pedido criado!')
  }

  return (
    <section className="grid gap-4">
      <h2 className="text-xl font-semibold">Carrinho</h2>

      <div className="card">
        <h3 className="font-semibold mb-2">Itens</h3>
        {items.length === 0 && <p className="text-sm opacity-70">Vazio. <Link to="/">Escolher restaurante</Link></p>}
        <ul className="grid gap-2">
          {items.map(i=>(
            <li key={i.itemId} className="flex items-center justify-between">
              <span>{i.qtd}× {i.nome}</span>
              <div className="flex items-center gap-2">
                <span>R$ {(i.preco*i.qtd).toFixed(2)}</span>
                <button className="btn-ghost text-sm" onClick={()=>removeItem(i.itemId)}>Remover</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

        <div className="card grid gap-3">
            <h3 className="font-semibold">Entrega</h3>

            <div className="flex flex-wrap items-center gap-2">
                <label className="label">Endereço:</label>
                <select className="input max-w-xs" value={selectedAddr} onChange={async e=>{
                const id = e.target.value
                setSelectedAddr(id)
                const a = addresses.find(x=>x._id===id)
                const str = [a?.rua, a?.numero, a?.bairro, a?.cidade && `${a.cidade}/${a.uf}`].filter(Boolean).join(', ')
                if (str) {
                    const c = await geocodeAddress(str)
                    setAddrCoord(c)
                }
                }}>
                <option value="">Selecione…</option>
                {addresses.map(a => <option key={a._id} value={a._id}>{a.apelido}</option>)}
                </select>
                <Link to="/cliente/enderecos" className="btn-ghost text-sm">Gerenciar endereços</Link>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <label className="label">Distância (km):</label>
                <input className="input w-32" type="number" min={0} step={0.1} value={distanceKm} readOnly />
                <button
                className="btn-ghost text-sm"
                disabled={!restCoord || !addrCoord || loadingDist}
                onClick={async ()=>{
                    if (!restCoord || !addrCoord) return
                    setLoadingDist(true)
                    try {
                    const km = await drivingDistanceKm(restCoord, addrCoord)
                    setDistance(Number(km.toFixed(2)))
                    } finally { setLoadingDist(false) }
                }}
                >
                {loadingDist ? 'Calculando…' : 'Calcular distância'}
                </button>
                <span className="text-sm opacity-70">R$ {freteFixo.toFixed(2)} + R$ {freteKm.toFixed(2)} × km</span>
            </div>

            {/* Mapa interativo (abaixo adicionaremos o componente GLMap) */}
            {restCoord && addrCoord && (
                <div className="h-64 rounded-xl overflow-hidden border border-white/10">
                <GLMap from={restCoord} to={addrCoord} />
                </div>
            )}
        </div>


      <div className="card flex items-center justify-between">
        <div className="text-sm opacity-80">Subtotal: R$ {subtotal.toFixed(2)} • Frete: R$ {frete.toFixed(2)}</div>
        <div className="flex items-center gap-3">
          <strong>Total: R$ {total.toFixed(2)}</strong>
          <button className="btn-primary" onClick={checkout}>Finalizar pedido</button>
        </div>
      </div>
    </section>
  )
}
