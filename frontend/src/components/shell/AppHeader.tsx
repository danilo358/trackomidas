import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth'

export default function AppHeader(){
  const role = useAuthStore(s => s.role)
  const logout = useAuthStore(s => s.logout)

  const link = (to:string, label:string) => (
    <NavLink
      to={to}
      className={({isActive}) => `px-3 py-2 rounded-xl text-sm ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}`}
    >
      {label}
    </NavLink>
  )

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-black/30 border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold">TrackoMidas</span>
        </div>
        <nav className="hidden md:flex items-center gap-1">
          {/* CLIENTE */}
          {(role === 'CLIENTE') && (
            <>
              {link('/restaurantes', 'Restaurantes')}
              {link('/cliente/pedidos', 'Meus pedidos')}
              {link('/cliente/enderecos', 'Meus endereços')}
              {link('/cliente/carrinho', 'Carrinho')}
            </>
          )}
          {/* RESTAURANTE */}
          {(role === 'RESTAURANTE') && (
            <>
              {link('/restaurante/pedidos', 'Pedidos')}
              {link('/restaurante/historico', 'Histórico')}
              {link('/restaurante/itens', 'Itens')}
              {link('/restaurante/categorias', 'Categorias')}
              {link('/restaurante/enderecos', 'Endereços')}
              {link('/restaurante/avaliacoes', 'Avaliações')}
            </>
          )}
          {/* ENTREGADOR */}
          {(role === 'ENTREGADOR') && (
            <>
              {link('/entregador/pedidos', 'Entregas')}
            </>
          )}
          {/* ADMIN */}
          {role === 'ADMIN' && (
            <>
              {link('/admin/usuarios', 'Usuários')}
            </>
          )}
        </nav>
        <div className="flex items-center gap-2">
          <button className="btn-ghost text-sm" onClick={()=>logout()}>Sair</button>
        </div>
      </div>
    </header>
  )
}
