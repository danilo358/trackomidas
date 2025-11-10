import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth'
import { LogOut } from 'lucide-react'

export default function AppHeader() {
  const logout = useAuthStore(s => s.logout)
  const role = useAuthStore(s => s.role)
  const loc = useLocation()

  return (
    <header className="sticky top-0 z-50 backdrop-blur supports-backdrop-filter:bg-black/30 border-b border-white/5">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link to={role === 'RESTAURANTE' ? '/restaurante' : '/restaurantes'} className="font-semibold text-white">
          TrackoMidas
        </Link>
        <div className="flex items-center gap-2">
          {role ? (
            <button className="btn btn-ghost" onClick={() => logout()} title="Sair">
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          ) : (
            loc.pathname !== '/login' && (
              <Link to="/login" className="btn btn-primary">Entrar</Link>
            )
          )}
        </div>
      </div>
    </header>
  )
}
