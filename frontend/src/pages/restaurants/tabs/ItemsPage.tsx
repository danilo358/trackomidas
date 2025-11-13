import GoogleDriveImage from '../../../components/GoogleDriveImage'
import { extractDriveId } from '../../../lib/drive'
import { useEffect, useMemo, useState } from 'react'
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
  const [showForm, setShowForm] = useState(false)
  const previewId   = useMemo(() => extractDriveId(form.driveId || '') || '', [form.driveId])
  const editPreview = useMemo(() => extractDriveId(editForm.driveId || '') || '', [editForm.driveId])

  useEffect(() => {
    api.get('/items/me').then(r => setItens(r.data as ItemDoc[])).catch(()=>setItens([]))
    api.get('/restaurants/me').then(r => setCats((r.data?.categorias || []) as Categoria[]))
  }, [])

  function onChange<K extends keyof Omit<ItemDoc,'_id'>>(k: K, v: Omit<ItemDoc,'_id'>[K]) { setForm(prev => ({ ...prev, [k]: v })) }
  function onChangeEdit<K extends keyof Omit<ItemDoc,'_id'>>(k: K, v: Omit<ItemDoc,'_id'>[K]) { setEditForm(prev => ({ ...prev, [k]: v })) }

  async function criar(){
    const r = await api.post('/items/me', {
      nome: form.nome,
      preco: Number(form.preco || 0),
      categoriaId: form.categoriaId || undefined,
      descricao: form.descricao,
      driveId: extractDriveId(form.driveId || '') || ''
    })
    setItens(prev => [r.data as ItemDoc, ...prev])
    setForm({ nome:'', preco:0, descricao:'', driveId:'', categoriaId:'' })
    setShowForm(false)
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
    const r = await api.patch(`/items/me/${editId}`, {
      nome: editForm.nome,
      preco: Number(editForm.preco || 0),
      categoriaId: editForm.categoriaId || undefined,
      descricao: editForm.descricao,
      driveId: extractDriveId(editForm.driveId || '') || ''
    })
    const novo = r.data as ItemDoc
    setItens(prev => prev.map(x => x._id === novo._id ? novo : x))
    setEditId(null)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <section className="flex-1 grid gap-4 pb-20">
        <header className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Itens</h2>
        </header>

        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {itens.map(i => (
            <article key={i._id} className="card p-3 flex flex-col min-h-[340px] sm:h-[360px] lg:h-[380px]">
              <div
                className="relative w-full rounded-md overflow-hidden border border-white/10"
                style={{ paddingTop: '100%' }}
              >
                {i.driveId ? (
                  <GoogleDriveImage id={i.driveId} className="absolute inset-0 w-full h-full" />
                ) : (
                  <div className="absolute inset-0 w-full h-full grid place-items-center text-xs opacity-60 bg-white/5">
                    Sem imagem
                  </div>
                )}
              </div>
              <h4 className="mt-2 text-sm font-medium truncate" title={i.nome}>{i.nome}</h4>
              <div className="mt-auto pt-3 flex flex-col gap-2">
                <span className="font-semibold text-sm">R$ {i.preco.toFixed(2)}</span>
                  <button className="btn-ghost h-8 px-3" onClick={()=>abrirEditar(i)}><Pencil className="size-4"/>Editar</button>
                  <button className="btn-ghost h-8 px-3" onClick={()=>excluir(i._id)}><Trash2 className="size-4"/>Excluir</button>
              </div>
            </article>
          ))}
          {itens.length===0 && <p className="text-sm opacity-60">Nenhum item cadastrado.</p>}
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/90 grid place-items-center z-50 overflow-y-auto p-4">
            <div className="card w-full max-w-xl my-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Novo item</h3>
                <button className="btn-ghost" onClick={()=>setShowForm(false)}><X className="size-4" /></button>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><label className="label">Nome</label><input className="input" value={form.nome} onChange={e=>onChange('nome', e.target.value)} placeholder="Pizza Margherita" /></div>
                <div><label className="label">Preço (R$)</label><input className="input" type="number" min={0} step={0.01} value={form.preco} onChange={e=>onChange('preco', Number(e.target.value))} /></div>
                <div className="sm:col-span-2"><label className="label">Categoria</label>
                  <select className="input" value={form.categoriaId} onChange={e=>onChange('categoriaId', e.target.value)}>
                    <option value="">Sem categoria</option>
                    {cats.map(c => <option key={c._id} value={c._id}>{c.nome}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2"><label className="label">Descrição</label><input className="input" value={form.descricao} onChange={e=>onChange('descricao', e.target.value)} placeholder="Mussarela, tomate e manjericão." /></div>
                <div className="sm:col-span-2">
                  <label className="label">Link/ID do Google Drive (imagem)</label>
                  <div className="flex items-start gap-3">
                    <input
                      className="input flex-1"
                      value={form.driveId}
                      onChange={e=>onChange('driveId', e.target.value)}
                      placeholder="Cole o link completo ou o ID"
                    />
                    <div
                      className="relative shrink-0 rounded-md overflow-hidden border border-white/10"
                      style={{ width: '110px', height: '110px' }}
                    >
                      {previewId ? (
                        <GoogleDriveImage id={previewId} className="absolute inset-0 w-full h-full" />
                      ) : (
                        <div className="absolute inset-0 grid place-items-center text-[10px] opacity-60 bg-white/5">
                          Sem imagem
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2 justify-end">
                <button className="btn-ghost" onClick={()=>setShowForm(false)}>Cancelar</button>
                <button className="btn-primary" onClick={criar}>Adicionar item</button>
              </div>
            </div>
          </div>
        )}

        {editId && (
          <div className="fixed inset-0 bg-black/90 grid place-items-center z-50 overflow-y-auto p-4">
            <div className="card w-full max-w-xl my-8">
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
                <div className="sm:col-span-2">
                  <label className="label">Link/ID do Google Drive (imagem)</label>
                  <div className="flex items-start gap-3">
                    <input
                      className="input flex-1"
                      value={editForm.driveId}
                      onChange={e=>onChangeEdit('driveId', e.target.value)}
                      placeholder="Cole o link completo ou o ID"
                    />
                    <div
                      className="relative shrink-0 rounded-md overflow-hidden border border-white/10"
                      style={{ width: '110px', height: '110px' }}
                    >
                      {editPreview ? (
                        <GoogleDriveImage id={editPreview} className="absolute inset-0 w-full h-full" />
                      ) : (
                        <div className="absolute inset-0 grid place-items-center text-[10px] opacity-60 bg-white/5">
                          Sem imagem
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2 justify-end">
                <button className="btn-ghost" onClick={()=>setEditId(null)}>Cancelar</button>
                <button className="btn-primary" onClick={salvarEditar}>Salvar</button>
              </div>
            </div>
          </div>
        )}
      </section>

      <footer className="fixed bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm border-t border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex justify-center">
          <button className="btn-primary" onClick={()=>setShowForm(true)}>
            <Plus className="size-4"/>Adicionar item
          </button>
        </div>
      </footer>
    </div>
  )
}