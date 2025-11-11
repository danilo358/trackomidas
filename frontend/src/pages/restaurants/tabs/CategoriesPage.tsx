import { useEffect, useState } from 'react'
// ✅ 1. Importar o ícone 'X' para fechar o modal
import { ChevronDown, ChevronRight, Plus, Pencil, Trash2, X } from 'lucide-react'
import api from '../../../lib/api'

type Categoria = { _id: string; nome: string }

export default function CategoriesPage(){
  const [cats, setCats] = useState<Categoria[]>([])
  const [open, setOpen] = useState<Record<string, boolean>>({})

  // ✅ 2. Estados para controlar o modal de renomear
  const [renamingCatId, setRenamingCatId] = useState<string | null>(null)
  const [newName, setNewName] = useState<string>('')

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

  // ✅ 3. Função para ABRIR o modal
  function abrirRenomear(cat: Categoria) {
    setRenamingCatId(cat._id)
    setNewName(cat.nome) // Preenche o input com o nome atual
  }

  // ✅ 4. Função para FECHAR o modal
  function fecharRenomear() {
    setRenamingCatId(null)
    setNewName('')
  }

  // ✅ 5. Função para SALVAR (antiga 'renomear')
  async function salvarRenomear() {
    if (!renamingCatId || !newName.trim()) return

    const r = await api.patch(`/restaurants/me/categories/${renamingCatId}`, { nome: newName.trim() })
    setCats(r.data as Categoria[])
    fecharRenomear() // Fecha o modal após salvar
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
                {/* ✅ 6. Botão agora chama 'abrirRenomear' e passa o objeto 'c' */}
                <button className="btn-ghost text-sm" onClick={() => abrirRenomear(c)}>
                  <Pencil className="size-4"/>Renomear
                </button>
                <button className="btn-ghost text-sm" onClick={()=>remover(c._id)}>
                  <Trash2 className="size-4"/>Remover
                </button>
              </div>
            </div>
            {open[c._id] && (
              <div className="mt-3 text-sm opacity-80">(Listagem de itens desta categoria aparecerá aqui.)</div>
            )}
          </article>
        ))}
        {cats.length===0 && <p className="text-sm opacity-60">Nenhuma categoria.</p>}
      </div>

      {/* ✅ 7. JSX do Modal (copiado do ItemsPage e adaptado) */}
      {renamingCatId && (
        <div className="fixed inset-0 bg-black/80 grid place-items-center z-50">
          <div className="card w-full max-w-md">
            
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Renomear categoria</h3>
              <button className="btn-ghost" onClick={fecharRenomear}><X className="size-4" /></button>
            </div>
            
            <div className="grid gap-3">
              <div>
                <label className="label">Nome da categoria</label>
                <input
                  className="input"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Ex: Pizzas Doces"
                  autoFocus
                />
              </div>
            </div>
            
            <div className="mt-4 flex gap-2 justify-end">
              <button className="btn-ghost" onClick={fecharRenomear}>Cancelar</button>
              <button className="btn-primary" onClick={salvarRenomear}>Salvar</button>
            </div>

          </div>
        </div>
      )}
    </section>
  )
}