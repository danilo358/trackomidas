import GoogleDriveImage from '../../../components/GoogleDriveImage'
import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import api from '../../../lib/api'

type ItemDoc = { _id:string; nome:string; preco:number; descricao?:string; driveId?:string; categoriaId?:string }
type Categoria = { _id: string; nome: string }

export default function ItemsPage(){
  const [itens, setItens] = useState<ItemDoc[]>([])
  const [cats, setCats] = useState<Categoria[]>([])
  const [form, setForm] = useState<Omit<ItemDoc,'_id'>>({ nome:'', preco:0, descricao:'', driveId:'', categoriaId:'' })
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Omit<ItemDoc,'_id'>>({ nome:'', preco:0, descricao:'', driveId:'', categoriaId:'' })

  useEffect(() => {
    api.get('/items/me').then(r => setItens(r.data as ItemDoc[])).catch(()=>setItens([]))
    api.get('/restaurants/me').then(r => setCats((r.data?.categorias || []) as Categoria[]))
  }, [])

  function onChange<K extends keyof Omit<ItemDoc,'_id'>>(k: K, v: Omit<ItemDoc,'_id'>[K]) { setForm(prev => ({ ...prev, [k]: v })) }
  function onChangeEdit<K extends keyof Omit<ItemDoc,'_id'>>(k: K, v: Omit<ItemDoc,'_id'>[K]) { setEditForm(prev => ({ ...prev, [k]: v })) }

  async function criar(){
    const r = await api.post('/items/me', { ...form, preco: Number(form.preco || 0), categoriaId: form.categoriaId || undefined })
    setItens(prev => [r.data as ItemDoc, ...prev])
    setForm({ nome:'', preco:0, descricao:'', driveId:'', categoriaId:'' })
  }

  async function excluir(id: string) {
    await api.delete(`/items/me/${id}`)
    setItens(prev => prev.filter(i => i._id !== id))
  }

  function abrirEditar(i: ItemDoc){
    setEditId(i._id)
    setEditForm({ nome: i.nome, preco: i.preco, descricao: i.descricao ?? '', driveId: i.driveId ?? '', categoriaId: i.categoriaId ?? '' })
  }

  async function salvarEditar(){
    if (!editId) return
    const r = await api.patch(`/items/me/${editId}`, { ...editForm, preco: Number(editForm.preco || 0), categoriaId: editForm.categoriaId || undefined })
    const novo = r.data as ItemDoc
    setItens(prev => prev.map(x => x._id === novo._id ? novo : x))
    setEditId(null)
  }

  return (
    <section className="grid gap-4">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Itens</h2>
      </header>

      <div className="card grid gap-3">
        <h3 className="font-semibold">Novo item</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <div><label className="label">Nome</label><input className="input" value={form.nome} onChange={e=>onChange('nome', e.target.value)} placeholder="Pizza Margherita" /></div>
          <div><label className="label">Preço (R$)</label><input className="input" type="number" min={0} step={0.01} value={form.preco} onChange={e=>onChange('preco', Number(e.target.value))} /></div>
          <div><label className="label">Categoria</label>
            <select className="input" value={form.categoriaId} onChange={e=>onChange('categoriaId', e.target.value)}>
              <option value="">Sem categoria</option>
              {cats.map(c => <option key={c._id} value={c._id}>{c.nome}</option>)}
            </select>
          </div>
          <div className="sm:col-span-3"><label className="label">Descrição</label><input className="input" value={form.descricao} onChange={e=>onChange('descricao', e.target.value)} placeholder="Mussarela, tomate e manjericão." /></div>
          <div className="sm:col-span-3"><label className="label">Google Drive ID (imagem)</label><input className="input" value={form.driveId} onChange={e=>onChange('driveId', e.target.value)} placeholder="1x2y3z..." /></div>
        </div>
        <button className="btn-primary" onClick={criar}><Plus className="size-4" />Adicionar item</button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {itens.map(i => (
          <article key={i._id} className="card">
            {i.driveId ? <GoogleDriveImage id={i.driveId} title={i.nome}/> : <div className="aspect-square rounded-xl bg-white/5" />}
            <h3 className="mt-3 font-semibold">{i.nome}</h3>
            {i.descricao && <p className="opacity-70 text-sm">{i.descricao}</p>}
            <div className="mt-2 flex items-center justify-between">
              <span className="font-semibold">R$ {i.preco.toFixed(2)}</span>
              <div className="flex gap-1">
                <button className="btn-ghost text-sm" onClick={()=>abrirEditar(i)}><Pencil className="size-4"/>Editar</button>
                <button className="btn-ghost text-sm" onClick={()=>excluir(i._id)}><Trash2 className="size-4"/>Excluir</button>
              </div>
            </div>
          </article>
        ))}
        {itens.length===0 && <p className="text-sm opacity-60">Nenhum item cadastrado.</p>}
      </div>

      {editId && (
        <div className="fixed inset-0 bg-black/60 grid place-items-center z-50">
          <div className="card w-full max-w-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Editar item</h3>
              <button className="btn-ghost" onClick={()=>setEditId(null)}><X className="size-4" /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><label className="label">Nome</label><input className="input" value={editForm.nome} onChange={e=>onChangeEdit('nome', e.target.value)} /></div>
              <div><label className="label">Preço (R$)</label><input className="input" type="number" min={0} step={0.01} value={editForm.preco} onChange={e=>onChangeEdit('preco', Number(e.target.value))} /></div>
              <div className="sm:col-span-2"><label className="label">Categoria</label>
                <select className="input" value={editForm.categoriaId} onChange={e=>onChangeEdit('categoriaId', e.target.value)}>
                  <option value="">Sem categoria</option>
                  {cats.map(c => <option key={c._id} value={c._id}>{c.nome}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2"><label className="label">Descrição</label><input className="input" value={editForm.descricao} onChange={e=>onChangeEdit('descricao', e.target.value)} /></div>
              <div className="sm:col-span-2"><label className="label">Google Drive ID (imagem)</label><input className="input" value={editForm.driveId} onChange={e=>onChangeEdit('driveId', e.target.value)} /></div>
            </div>
            <div className="mt-4 flex gap-2 justify-end">
              <button className="btn-ghost" onClick={()=>setEditId(null)}>Cancelar</button>
              <button className="btn-primary" onClick={salvarEditar}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
