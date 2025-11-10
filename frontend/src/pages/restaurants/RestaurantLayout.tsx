import { Outlet, NavLink } from 'react-router-dom'
import AppHeader from '../../components/shell/AppHeader'
import MobileTabs from '../../components/shell/MobileTabs'

export default function RestaurantLayout() {
  return (
    <div className="app-shell">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-6 grid gap-6">
        <nav className="hidden md:flex gap-2">
          <NavLink to="/restaurante/pedidos" className={({isActive})=>`btn ${isActive?'bg-brand-600':'btn-ghost'}`}>Pedidos</NavLink>
          <NavLink to="/restaurante/itens" className={({isActive})=>`btn ${isActive?'bg-brand-600':'btn-ghost'}`}>Itens</NavLink>
          <NavLink to="/restaurante/categorias" className={({isActive})=>`btn ${isActive?'bg-brand-600':'btn-ghost'}`}>Categorias</NavLink>
          <NavLink to="/restaurante/enderecos" className={({isActive})=>`btn ${isActive?'bg-brand-600':'btn-ghost'}`}>Endereços</NavLink>
          <NavLink to="/restaurante/avaliacoes" className={({isActive})=>`btn ${isActive?'bg-brand-600':'btn-ghost'}`}>Avaliações</NavLink>
        </nav>
        <Outlet />
        <MobileTabs />
      </main>
    </div>
  )
}