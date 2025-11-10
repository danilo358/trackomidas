import { useEffect, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import api from '../../../lib/api'

type Address = {
  _id: string
  apelido: string
  cep?: string
  rua?: string
  numero?: string
  cidade?: string
  uf?: string
  freteFixo: number
  freteKm: number
}

type RestaurantMine = {
  _id: string
  enderecos: Address[]
}

export default function AddressesPage(){
  const [enderecos, setEnderecos] = useState<Address[]>([])
  const [form, setForm] = useState<Omit<Address,'_id'>>({
    apelido: '',
    cep: '',
    rua: '',
    numero: '',
    cidade: '',
    uf: '',
    freteFixo: 0,
    freteKm: 0
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    api.get('/restaurants/me').then(r => {
      const me = r.data as RestaurantMine
      setEnderecos(me.enderecos || [])
    })
  }, [])

  function onChange<K extends keyof Omit<Address,'_id'>>(k: K, v: Omit<Address,'_id'>[K]){
    setForm(prev => ({ ...prev, [k]: v }))
  }

  async function salvar(){
    if (editingId) {
      const r = await api.patch(`/restaurants/me/addresses/${editingId}`, {
        ...form,
        freteFixo: Number(form.freteFixo ?? 0),
        freteKm: Number(form.freteKm ?? 0),
      })
      setEnderecos(r.data as Address[])
      setEditingId(null)
    } else {
      const r = await api.post('/restaurants/me/addresses', {
        ...form,
        freteFixo: Number(form.freteFixo ?? 0),
        freteKm: Number(form.freteKm ?? 0),
      })
      setEnderecos(r.data as Address[])
    }
    setForm({ apelido:'', cep:'', rua:'', numero:'', cidade:'', uf:'', freteFixo:0, freteKm:0 })
  }

  async function editar(id: string){
    const e = enderecos.find(x=>x._id===id)
    if (!e) return
    setEditingId(id)
    setForm({ apelido:e.apelido, cep:e.cep, rua:e.rua, numero:e.numero, cidade:e.cidade, uf:e.uf, freteFixo:e.freteFixo, freteKm:e.freteKm })
  }

  async function remover(id: string){
    const ok = confirm('Remover endereço?')
    if (!ok) return
    const r = await api.delete(`/restaurants/me/addresses/${id}`)
    setEnderecos(r.data as Address[])
    if (editingId === id) {
      setEditingId(null)
      setForm({ apelido:'', cep:'', rua:'', numero:'', cidade:'', uf:'', freteFixo:0, freteKm:0 })
    }
  }

  return (
    <section className="grid gap-4">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Endereços do Restaurante</h2>
      </header>

      <div className="card grid gap-3">
        <h3 className="font-semibold">{editingId ? 'Editar endereço' : 'Novo endereço'}</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="label">Apelido</label>
            <input className="input" value={form.apelido} onChange={e=>onChange('apelido', e.target.value)} placeholder="Matriz" />
          </div>
          <div>
            <label className="label">CEP</label>
            <input className="input" value={form.cep} onChange={e=>onChange('cep', e.target.value)} placeholder="79000-000" />
          </div>
          <div>
            <label className="label">UF</label>
            <input className="input" value={form.uf} onChange={e=>onChange('uf', e.target.value)} placeholder="MS" />
          </div>
          <div>
            <label className="label">Cidade</label>
            <input className="input" value={form.cidade} onChange={e=>onChange('cidade', e.target.value)} placeholder="Campo Grande" />
          </div>
          <div>
            <label className="label">Rua</label>
            <input className="input" value={form.rua} onChange={e=>onChange('rua', e.target.value)} placeholder="Rua A" />
          </div>
          <div>
            <label className="label">Número</label>
            <input className="input" value={form.numero} onChange={e=>onChange('numero', e.target.value)} placeholder="100" />
          </div>
          <div>
            <label className="label">Frete fixo (R$)</label>
            <input className="input" type="number" min={0} step={0.01} value={form.freteFixo} onChange={e=>onChange('freteFixo', Number(e.target.value))} />
          </div>
          <div>
            <label className="label">Valor por km (R$)</label>
            <input className="input" type="number" min={0} step={0.01} value={form.freteKm} onChange={e=>onChange('freteKm', Number(e.target.value))} />
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn-primary" onClick={salvar}>{editingId ? 'Salvar alteração' : 'Adicionar'}</button>
          {editingId && <button className="btn-ghost" onClick={()=>{ setEditingId(null); setForm({ apelido:'', cep:'', rua:'', numero:'', cidade:'', uf:'', freteFixo:0, freteKm:0 }) }}>Cancelar</button>}
        </div>
      </div>

      <div className="grid gap-2">
        {enderecos.map(e => (
          <article key={e._id} className="card flex items-center justify-between">
            <div className="text-sm">
              <p className="font-semibold">{e.apelido}</p>
              <p className="opacity-70">{[e.rua, e.numero, e.cidade && `${e.cidade}/${e.uf}`].filter(Boolean).join(', ')}</p>
              <p className="opacity-70">Frete: R$ {e.freteFixo.toFixed(2)} + R$ {e.freteKm.toFixed(2)} × km</p>
            </div>
            <div className="flex gap-2">
              <button className="btn-ghost text-sm" onClick={()=>editar(e._id)}><Pencil className="size-4" />Editar</button>
              <button className="btn-ghost text-sm" onClick={()=>remover(e._id)}><Trash2 className="size-4" />Remover</button>
            </div>
          </article>
        ))}
        {enderecos.length===0 && <p className="text-sm opacity-60">Nenhum endereço cadastrado.</p>}
      </div>
    </section>
  )
}
