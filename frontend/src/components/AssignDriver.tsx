import { useEffect, useState } from 'react'
import api from '../lib/api'

type UserLite = { _id:string; nome:string; email:string; role:'ENTREGADOR'|'ADMIN'|'RESTAURANTE'|'CLIENTE' }

export default function AssignDriver({
  orderId,
  onAssigned
}:{ orderId:string; onAssigned:(pedidoAtualizado: unknown)=>void }) {
  const [q, setQ] = useState('')
  const [list, setList] = useState<UserLite[]>([])

  useEffect(() => {
    const t = setTimeout(() => {
      if (!q) { setList([]); return }
      api.get(`/users/search`, { params:{ q, role:'ENTREGADOR' } })
        .then(r => setList(r.data as UserLite[]))
        .catch(()=>setList([]))
    }, 250)
    return () => clearTimeout(t)
  }, [q])

  return (
    <div className="grid gap-2">
      <input
        className="input"
        placeholder="Buscar entregador por nome ou e-mail"
        value={q}
        onChange={e=>setQ(e.target.value)}
        autoFocus
      />
      <div className="grid">
        {list.map(u => (
          <button
            key={u._id}
            className="btn-ghost text-left"
            onClick={async ()=>{
              const r = await api.patch(`/orders/me/${orderId}/driver`, { entregador: u.nome, driverUserId: u._id })
              onAssigned(r.data) // devolve o pedido atualizado para a tela
            }}
          >
            {u.nome} <span className="opacity-70">• {u.email}</span>
          </button>
        ))}
        {q && list.length===0 && <p className="text-sm opacity-60">Nenhum resultado.</p>}
      </div>
    </div>
  )
}
