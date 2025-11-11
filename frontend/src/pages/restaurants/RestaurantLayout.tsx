import { Outlet } from 'react-router-dom'
import AppHeader from '../../components/shell/AppHeader'
import MobileTabs from '../../components/shell/MobileTabs'

export default function RestaurantLayout() {
  return (
    <div className="app-shell">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-6 grid gap-6">
        <Outlet />
        <MobileTabs />
      </main>
    </div>
  )
}