import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import api from '../../lib/api'
import { useAuthStore } from '../../stores/auth'

type Role = 'ADMIN'|'RESTAURANTE'|'CLIENTE'|'ENTREGADOR'
type UserLite = { _id:string; nome:string; email:string; role:Role }

export default function UsersPage(){
  const [q, setQ] = useState('')
  const [rows, setRows] = useState<UserLite[]>([])
  const logout = useAuthStore(s => s.logout)
  const nav = useNavigate()

  async function load(){ 
    const r = await api.get('/users/admin/users', { params:{ q } })
    setRows(r.data as UserLite[]) 
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(()=>{ void load() }, [])

  async function changeRole(id:string, role:Role){
    const r = await api.patch(`/users/admin/users/${id}/role`, { role })
    setRows(prev => prev.map(u => u._id===id ? r.data as UserLite : u))
  }

  function handleLogout() {
    logout()
    nav('/login', { replace: true })
  }

  return (
    <section className="grid gap-4">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Usuários</h2>
        <div className="flex gap-2 items-center">
          <input className="input" placeholder="Buscar por nome/e-mail" value={q} onChange={e=>setQ(e.target.value)} />
          <button className="btn-primary" onClick={()=>void load()}>Buscar</button>
          <button className="btn-ghost" onClick={handleLogout}>
            <LogOut className="size-4"/>Sair
          </button>
        </div>
      </header>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="opacity-70">
            <tr><th className="text-left p-2">Nome</th><th className="text-left p-2">E-mail</th><th className="text-left p-2">Papel</th></tr>
          </thead>
          <tbody>
            {rows.map(u => (
              <tr key={u._id} className="border-t border-white/10">
                <td className="p-2">{u.nome}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">
                  <select className="input" value={u.role} onChange={e=>changeRole(u._id, e.target.value as Role)}>
                    <option value="CLIENTE">CLIENTE</option>
                    <option value="RESTAURANTE">RESTAURANTE</option>
                    <option value="ENTREGADOR">ENTREGADOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
              </tr>
            ))}
            {rows.length===0 && <tr><td className="p-3 opacity-60" colSpan={3}>Sem resultados.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  )
}