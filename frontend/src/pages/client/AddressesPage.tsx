import { useEffect, useState } from 'react'
import {  Trash2, Pencil, Search } from 'lucide-react'
import api from '../../lib/api'
import { fetchCep } from '../../lib/viacep'

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

export default function AddressesPage(){
  const [enderecos, setEnderecos] = useState<Address[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<Address,'_id'>>({
    apelido:'Casa', cep:'', rua:'', numero:'', bairro:'', cidade:'', uf:'', complemento:''
  })

  useEffect(() => {
    api.get('/customers/addresses').then(r => setEnderecos(r.data as Address[])).catch(()=>setEnderecos([]))
  }, [])

  function onChange<K extends keyof Omit<Address,'_id'>>(k: K, v: Omit<Address,'_id'>[K]){
    setForm(prev => ({ ...prev, [k]: v }))
  }

  async function viaCep(){
    if (!form.cep) return
    const j = await fetchCep(form.cep)
    if (j?.erro) return
    setForm(prev => ({
      ...prev,
      rua: j.logradouro ?? prev.rua,
      bairro: j.bairro ?? prev.bairro,
      cidade: j.localidade ?? prev.cidade,
      uf: j.uf ?? prev.uf
    }))
  }

  async function salvar(){
    if (editingId) {
      const r = await api.patch(`/customers/addresses/${editingId}`, form)
      setEnderecos(r.data as Address[])
      setEditingId(null)
    } else {
      const r = await api.post('/customers/addresses', form)
      setEnderecos(r.data as Address[])
    }
    setForm({ apelido:'Casa', cep:'', rua:'', numero:'', bairro:'', cidade:'', uf:'', complemento:'' })
  }

  function editar(id: string){
    const e = enderecos.find(x=>x._id===id)
    if (!e) return
    setEditingId(id)
    setForm({
      apelido: e.apelido, cep: e.cep ?? '', rua: e.rua ?? '', numero: e.numero ?? '',
      bairro: e.bairro ?? '', cidade: e.cidade ?? '', uf: e.uf ?? '', complemento: e.complemento ?? ''
    })
  }

  async function remover(id: string){
    const ok = confirm('Remover este endereço?'); if (!ok) return
    const r = await api.delete(`/customers/addresses/${id}`)
    setEnderecos(r.data as Address[])
    if (editingId === id) { setEditingId(null) }
  }

  return (
    <section className="grid gap-4">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Meus Endereços</h2>
      </header>

      <div className="card grid gap-3">
        <h3 className="font-semibold">{editingId ? 'Editar endereço' : 'Novo endereço'}</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <div><label className="label">Apelido</label><input className="input" value={form.apelido} onChange={e=>onChange('apelido', e.target.value)} /></div>
          <div>
            <label className="label">CEP</label>
            <div className="flex gap-2">
              <input className="input flex-1" value={form.cep} onChange={e=>onChange('cep', e.target.value)} />
              <button className="btn-ghost" type="button" onClick={viaCep} title="Buscar CEP"><Search className="size-4" /></button>
            </div>
          </div>
          <div><label className="label">UF</label><input className="input" value={form.uf} onChange={e=>onChange('uf', e.target.value)} /></div>
          <div className="sm:col-span-2"><label className="label">Cidade</label><input className="input" value={form.cidade} onChange={e=>onChange('cidade', e.target.value)} /></div>
          <div className="sm:col-span-2"><label className="label">Bairro</label><input className="input" value={form.bairro} onChange={e=>onChange('bairro', e.target.value)} /></div>
          <div className="sm:col-span-2"><label className="label">Rua</label><input className="input" value={form.rua} onChange={e=>onChange('rua', e.target.value)} /></div>
          <div><label className="label">Número</label><input className="input" value={form.numero} onChange={e=>onChange('numero', e.target.value)} /></div>
          <div className="sm:col-span-3"><label className="label">Complemento</label><input className="input" value={form.complemento} onChange={e=>onChange('complemento', e.target.value)} /></div>
        </div>
        <div className="flex gap-2">
          <button className="btn-primary" onClick={salvar}>{editingId ? 'Salvar alteração' : 'Adicionar'}</button>
          {editingId && <button className="btn-ghost" onClick={()=>{ setEditingId(null); setForm({ apelido:'Casa', cep:'', rua:'', numero:'', bairro:'', cidade:'', uf:'', complemento:'' }) }}>Cancelar</button>}
        </div>
      </div>

      <div className="grid gap-2">
        {enderecos.map(e => (
          <article key={e._id} className="card flex items-center justify-between">
            <div className="text-sm">
              <p className="font-semibold">{e.apelido}</p>
              <p className="opacity-70">{[e.rua, e.numero, e.bairro, e.cidade && `${e.cidade}/${e.uf}`].filter(Boolean).join(', ')}</p>
            </div>
            <div className="flex gap-2">
              <button className="btn-ghost text-sm" onClick={()=>editar(e._id)}><Pencil className="size-4"/>Editar</button>
              <button className="btn-ghost text-sm" onClick={()=>remover(e._id)}><Trash2 className="size-4"/>Remover</button>
            </div>
          </article>
        ))}
        {enderecos.length===0 && <p className="text-sm opacity-60">Nenhum endereço cadastrado.</p>}
      </div>
    </section>
  )
}
