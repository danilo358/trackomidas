import { Outlet, NavLink } from 'react-router-dom'
import AppHeader from '../../components/shell/AppHeader'

export default function DriverLayout(){
  return (
    <div className="app-shell">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-6 grid gap-6">
        <nav className="hidden md:flex gap-2">
          <NavLink to="/entregador/pedidos" className={({isActive})=>`btn ${isActive?'bg-brand-600':'btn-ghost'}`}>Meus Pedidos</NavLink>
        </nav>
        <Outlet />
      </main>
    </div>
  )
}
