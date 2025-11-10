import GoogleDriveImage from '../../../components/GoogleDriveImage'
import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import api from '../../../lib/api'

type ItemDoc = { _id:string; nome:string; preco:number; descricao?:string; driveId?:string; categoriaId?:string }

export default function ItemsPage(){
  const [itens, setItens] = useState<ItemDoc[]>([])

  useEffect(() => {
    api.get('/items/me').then(r => setItens(r.data as ItemDoc[])).catch(()=>setItens([]))
  }, [])

  async function novoItem() {
    const r = await api.post('/items/me', {
      nome: 'Novo item',
      descricao: 'Descrição do novo item',
      preco: 49.9,
      driveId: '' // coloque o ID do Drive quando tiver
    })
    setItens(prev => [r.data as ItemDoc, ...prev])
  }

  async function excluir(id: string) {
    await api.delete(`/items/me/${id}`)
    setItens(prev => prev.filter(i => i._id !== id))
  }

  return (
    <section className="grid gap-4">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Itens</h2>
        <button className="btn-primary" onClick={novoItem}><Plus className="size-4"/>Novo item</button>
      </header>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {itens.map(i => (
          <article key={i._id} className="card">
            {/* Quando o driveId estiver válido, o iframe exibirá a imagem */}
            {i.driveId ? (
              <GoogleDriveImage id={i.driveId} title={i.nome}/>
            ) : (
              <div className="aspect-square rounded-xl bg-white/5 grid place-items-center opacity-60">Sem imagem</div>
            )}
            <h3 className="mt-3 font-semibold">{i.nome}</h3>
            <p className="opacity-70 text-sm">{i.descricao}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-semibold">R$ {i.preco.toFixed(2)}</span>
              <div className="flex gap-1">
                <button className="btn-ghost text-sm"><Pencil className="size-4"/>Editar</button>
                <button className="btn-ghost text-sm" onClick={()=>excluir(i._id)}><Trash2 className="size-4"/>Excluir</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}