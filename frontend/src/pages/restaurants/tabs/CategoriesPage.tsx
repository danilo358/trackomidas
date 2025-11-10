import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight, Plus, Pencil, Trash2 } from 'lucide-react'
import api from '../../../lib/api'

type Categoria = { _id: string; nome: string }

export default function CategoriesPage(){
  const [cats, setCats] = useState<Categoria[]>([])
  const [open, setOpen] = useState<Record<string, boolean>>({})

  useEffect(() => {
    api.get('/restaurants/me').then(r => {
      const categorias = (r.data?.categorias || []) as Categoria[]
      setCats(categorias)
    }).catch(()=>setCats([]))
  }, [])

  function toggle(id:string){
    setOpen(prev => ({ ...prev, [id]: !prev[id] }))
  }

  async function novaCategoria() {
    const r = await api.post('/restaurants/me/categories', { nome: 'Nova categoria' })
    setCats(r.data as Categoria[])
  }

  async function renomear(id: string) {
    const nome = prompt('Novo nome da categoria?')
    if (!nome) return
    const r = await api.patch(`/restaurants/me/categories/${id}`, { nome })
    setCats(r.data as Categoria[])
  }

  async function remover(id: string) {
    const ok = confirm('Remover categoria?')
    if (!ok) return
    const r = await api.delete(`/restaurants/me/categories/${id}`)
    setCats(r.data as Categoria[])
  }

  return (
    <section className="grid gap-4">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Categorias</h2>
        <button className="btn-primary" onClick={novaCategoria}><Plus className="size-4"/>Nova categoria</button>
      </header>
      <div className="grid gap-2">
        {cats.map(c => (
          <article key={c._id} className="card">
            <div className="flex items-center justify-between">
              <button className="flex items-center gap-2" onClick={()=>toggle(c._id)}>
                {open[c._id] ? <ChevronDown className="size-4"/> : <ChevronRight className="size-4"/>}
                <h3 className="font-semibold">{c.nome}</h3>
              </button>
              <div className="flex gap-2">
                <button className="btn-ghost text-sm" onClick={()=>renomear(c._id)}><Pencil className="size-4"/>Renomear</button>
                <button className="btn-ghost text-sm" onClick={()=>remover(c._id)}><Trash2 className="size-4"/>Remover</button>
              </div>
            </div>
            {open[c._id] && (
              <div className="mt-3 text-sm opacity-80">(Listagem de itens desta categoria aparecerá aqui.)</div>
            )}
          </article>
        ))}
        {cats.length===0 && <p className="text-sm opacity-60">Nenhuma categoria.</p>}
      </div>
    </section>
  )
}
