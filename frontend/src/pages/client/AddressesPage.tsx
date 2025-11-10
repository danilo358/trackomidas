import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import api from '../../lib/api'

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

  useEffect(() => {
    api.get('/customers/addresses').then(r => setEnderecos(r.data as Address[])).catch(()=>setEnderecos([]))
  }, [])

  async function novo(){
    const apelido = prompt('Apelido do endereço? (ex: Casa)') || 'Casa'
    const r = await api.post('/customers/addresses', { apelido })
    setEnderecos(r.data as Address[])
  }

  async function remover(id: string){
    const ok = confirm('Remover este endereço?')
    if (!ok) return
    const r = await api.delete(`/customers/addresses/${id}`)
    setEnderecos(r.data as Address[])
  }

  return (
    <section className="grid gap-4">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Meus Endereços</h2>
        <button className="btn-primary" onClick={novo}><Plus className="size-4"/>Novo</button>
      </header>
      <div className="grid gap-2">
        {enderecos.map(e => (
          <article key={e._id} className="card flex items-center justify-between">
            <div className="text-sm">
              <p className="font-semibold">{e.apelido}</p>
              <p className="opacity-70">{[e.rua, e.numero, e.bairro, e.cidade && `${e.cidade}/${e.uf}`].filter(Boolean).join(', ')}</p>
            </div>
            <button className="btn-ghost text-sm" onClick={()=>remover(e._id)}><Trash2 className="size-4"/>Remover</button>
          </article>
        ))}
        {enderecos.length===0 && <p className="text-sm opacity-60">Nenhum endereço cadastrado.</p>}
      </div>
    </section>
  )
}
