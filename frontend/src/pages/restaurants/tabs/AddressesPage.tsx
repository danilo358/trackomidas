import { useEffect, useMemo, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import api from '../../../lib/api'
import { extractDriveId, toDrivePreview } from '../../../lib/drive'

type Address = {
  _id: string
  apelido: string
  cep?: string
  rua?: string
  numero?: string
  bairro?: string
  cidade?: string
  uf?: string
  freteFixo: number
  freteKm: number
  logoId?: string
}

type FormState = {
  apelido: string
  cep: string
  rua: string
  numero: string
  bairro: string
  cidade: string
  uf: string
  freteFixo: number
  freteKm: number
  logoInput: string
}

type RestaurantMine = {
  _id: string
  enderecos: Address[]
}

export default function AddressesPage(){
  const [enderecos, setEnderecos] = useState<Address[]>([])
  const [form, setForm] = useState<FormState>({
    apelido: 'Matriz',
    cep: '', rua: '', numero: '', bairro: '', cidade: '', uf: '',
    freteFixo: 0, freteKm: 0,
    logoInput: ''
  })
  const logoPreview = useMemo(() => toDrivePreview(form.logoInput), [form.logoInput])
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    api.get('/restaurants/me').then(r => {
      const me = r.data as RestaurantMine
      setEnderecos(me.enderecos || [])
    })
  }, [])

  function onChange<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  async function salvar(){
    if (editingId) {
      const r = await api.patch(`/restaurants/me/addresses/${editingId}`, {
        apelido: form.apelido,
        cep: form.cep, rua: form.rua, numero: form.numero, bairro: form.bairro,
        cidade: form.cidade, uf: form.uf,
        freteFixo: Number(form.freteFixo ?? 0),
        freteKm: Number(form.freteKm ?? 0),
        logoId: extractDriveId(form.logoInput)
      })
      setEnderecos(r.data as Address[])
      setEditingId(null)
    } else {
      const r = await api.post('/restaurants/me/addresses', {
        apelido: form.apelido,
        cep: form.cep, rua: form.rua, numero: form.numero, bairro: form.bairro,
        cidade: form.cidade, uf: form.uf, freteFixo: form.freteFixo, freteKm: form.freteKm,
        logoId: extractDriveId(form.logoInput)
      })
      setEnderecos(r.data as Address[])
    }
    setForm({ apelido:'Matriz', cep:'', rua:'', numero:'', bairro:'', cidade:'', uf:'', freteFixo:0, freteKm:0, logoInput:'' })
  }

  async function editar(id: string){
    const e = enderecos.find(x=>x._id===id)
    if (!e) return
    setEditingId(id)
    setForm({
      apelido: e.apelido,
      cep: e.cep ?? '',
      rua: e.rua ?? '',
      numero: e.numero ?? '',
      bairro: e.bairro ?? '',
      cidade: e.cidade ?? '',
      uf: e.uf ?? '',
      freteFixo: e.freteFixo,
      freteKm: e.freteKm,
      logoInput: e.logoId ?? ''
    })
  }

  async function remover(id: string){
    const ok = confirm('Remover endereço?')
    if (!ok) return
    const r = await api.delete(`/restaurants/me/addresses/${id}`)
    setEnderecos(r.data as Address[])
    if (editingId === id) {
      setEditingId(null)
      setForm({ apelido:'Matriz', cep:'', rua:'', numero:'', bairro:'', cidade:'', uf:'', freteFixo:0, freteKm:0, logoInput:'' })
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
          <label className="label">Logo (link ou ID do Google Drive)</label>
          <input
            className="input"
            placeholder="Cole o link do Google Drive ou o ID"
            value={form.logoInput}
            onChange={e => setForm(f => ({ ...f, logoInput: e.target.value }))}
          />

          <div className="mt-2 h-24 rounded-xl overflow-hidden border border-white/10">
            {logoPreview ? (
              <iframe
                className="w-full h-full"
                src={logoPreview}
                loading="lazy"
                sandbox="allow-scripts allow-same-origin"
              />
            ) : (
              <p className="text-xs opacity-60 p-2">A prévia da logo aparecerá aqui.</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn-primary" onClick={salvar}>{editingId ? 'Salvar alteração' : 'Adicionar'}</button>
          {editingId && <button className="btn-ghost" onClick={()=>{ setEditingId(null); setForm({ apelido:'Matriz', cep:'', rua:'', numero:'', bairro:'', cidade:'', uf:'', freteFixo:0, freteKm:0, logoInput:'' }) }}>Cancelar</button>}
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
