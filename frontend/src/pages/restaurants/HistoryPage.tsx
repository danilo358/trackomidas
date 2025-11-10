import { useEffect, useMemo, useState } from 'react'
import api from '../../lib/api'
import { Calendar, Filter } from 'lucide-react'

type Pedido = {
  _id: string
  total: number
  archivedAt?: string | null
  closedAt?: string | null
  cliente?: { _id: string; nome?: string; email?: string }
  itens: { nome: string; qtd: number }[]
}

export default function HistoryPage() {
  const [list, setList] = useState<Pedido[]>([])
  const [q, setQ] = useState('')
  const [minTotal, setMinTotal] = useState<string>('')
  const [maxTotal, setMaxTotal] = useState<string>('')
  const [start, setStart] = useState<string>('')
  const [end, setEnd] = useState<string>('')

  async function load() {
    const params: Record<string, string> = {}
    if (q) params.q = q
    if (minTotal) params.minTotal = minTotal
    if (maxTotal) params.maxTotal = maxTotal
    if (start) params.start = start
    if (end) params.end = end
    const r = await api.get('/orders/me/history', { params })
    setList(r.data as Pedido[])
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void load() }, []) // inicial

  const totalFiltrado = useMemo(
    () => list.reduce((s, p) => s + p.total, 0),
    [list]
  )

  return (
    <section className="grid gap-4">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Histórico de Pedidos</h2>
      </header>

      <div className="card grid gap-3">
        <h3 className="font-semibold flex items-center gap-2"><Filter className="size-4" />Filtros</h3>
        <div className="grid md:grid-cols-5 gap-3">
          <div className="md:col-span-2">
            <label className="label">Cliente (nome ou e-mail)</label>
            <input className="input" value={q} onChange={e=>setQ(e.target.value)} placeholder="Ex.: João, joao@email..." />
          </div>
          <div>
            <label className="label">Valor mín. (R$)</label>
            <input className="input" type="number" min={0} step={0.01} value={minTotal} onChange={e=>setMinTotal(e.target.value)} />
          </div>
          <div>
            <label className="label">Valor máx. (R$)</label>
            <input className="input" type="number" min={0} step={0.01} value={maxTotal} onChange={e=>setMaxTotal(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="label flex items-center gap-2"><Calendar className="size-4" />Início</label>
            <input className="input" type="date" value={start} onChange={e=>setStart(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="label flex items-center gap-2"><Calendar className="size-4" />Fim</label>
            <input className="input" type="date" value={end} onChange={e=>setEnd(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn-primary" onClick={()=>void load()}>Aplicar</button>
          <button className="btn-ghost" onClick={()=>{
            setQ(''); setMinTotal(''); setMaxTotal(''); setStart(''); setEnd('')
            void load()
          }}>Limpar</button>
          <span className="ml-auto text-sm opacity-70">Total filtrado: <strong>R$ {totalFiltrado.toFixed(2)}</strong></span>
        </div>
      </div>

      <div className="grid gap-2">
        {list.map(p => (
          <article key={p._id} className="card p-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Pedido #{p._id}</div>
              <div className="text-sm opacity-70">R$ {p.total.toFixed(2)}</div>
            </div>
            <div className="text-sm opacity-80">
              {p.cliente?.nome || 'Cliente'}{p.cliente?.email ? ` • ${p.cliente.email}` : ''}
              {p.closedAt && <span className="ml-2">• Fechado: {new Date(p.closedAt).toLocaleString()}</span>}
            </div>
            <ul className="text-sm opacity-80 list-disc pl-5">
              {p.itens.map((i,idx)=>(<li key={idx}>{i.qtd}× {i.nome}</li>))}
            </ul>
          </article>
        ))}
        {list.length===0 && <p className="text-sm opacity-60">Nenhum resultado com os filtros atuais.</p>}
      </div>
    </section>
  )
}
