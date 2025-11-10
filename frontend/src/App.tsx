import { Route, Routes, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import RestaurantsPublicList from './pages/restaurants/RestaurantsPublicList'
import RestaurantLayout from './pages/restaurants/RestaurantLayout'
import OrdersPage from './pages/restaurants/tabs/OrdersPage'
import ItemsPage from './pages/restaurants/tabs/ItemsPage'
import CategoriesPage from './pages/restaurants/tabs/CategoriesPage'
import AddressesPage from './pages/restaurants/tabs/AddressesPage'
import ReviewsPage from './pages/restaurants/tabs/ReviewsPage'
import ClientLayout from './pages/client/ClientLayout'
import ClientAddresses from './pages/client/AddressesPage'
import ClientOrdersPage from './pages/client/ClientOrdersPage'
import CartPage from './pages/client/CartPage'
import RestaurantMenuPage from './pages/client/RestaurantMenuPage'
import DriverLayout from './pages/driver/DriverLayout'
import DriverOrdersPage from './pages/driver/DriverOrdersPage'
import RoleGate from './auth/RoleGate'
import { useAuthStore } from './stores/auth'
import HistoryPage from './pages/restaurants/HistoryPage'
import UsersPage from './pages/admin/UsersPage'


export default function App() {
  const role = useAuthStore(s => s.role)
  const fetchMe = useAuthStore(s => s.fetchMe)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchMe() }, [])

  return (
    <Routes>
      {/* Público */}
      <Route path="/" element={<Navigate to="/restaurantes" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/restaurantes" element={<RestaurantsPublicList />} />

      {/* Área do Restaurante */}
      <Route
        path="/restaurante/*"
        element={
          <RoleGate allow={['RESTAURANTE','ADMIN']}>
            <RestaurantLayout />
          </RoleGate>
        }
      >
        <Route index element={<Navigate to="pedidos" replace />} />
        <Route path="pedidos" element={<RoleGate allow={['RESTAURANTE','ADMIN']}><OrdersPage/></RoleGate>} />
        <Route path="historico" element={<RoleGate allow={['RESTAURANTE','ADMIN']}><HistoryPage/></RoleGate>} />
        <Route path="itens" element={<RoleGate allow={['RESTAURANTE','ADMIN']}><ItemsPage/></RoleGate>} />
        <Route path="categorias" element={<RoleGate allow={['RESTAURANTE','ADMIN']}><CategoriesPage/></RoleGate>} />
        <Route path="enderecos" element={<RoleGate allow={['RESTAURANTE','ADMIN']}><AddressesPage/></RoleGate>} />
        <Route path="avaliacoes" element={<ReviewsPage />} />
      </Route>

      {/* Área do Cliente */}
      <Route
        path="/cliente/*"
        element={
          <RoleGate allow={["CLIENTE"]}>
            <ClientLayout />
          </RoleGate>
        }
      >
        <Route index element={<Navigate to="restaurantes" replace />} />
        <Route path="enderecos" element={<ClientAddresses />} />
        <Route path="pedidos" element={<ClientOrdersPage />} />
        <Route path="carrinho" element={<CartPage />} />
        <Route path="restaurante/:id" element={<RestaurantMenuPage />} />
      </Route>

      {/* Área do Entregador */}
      <Route
        path="/entregador/*"
        element={
          <RoleGate allow={["ENTREGADOR"]}>
            <DriverLayout />
          </RoleGate>
        }
      >
        <Route index element={<Navigate to="pedidos" replace />} />
        <Route path="pedidos" element={<DriverOrdersPage />} />
      </Route>

      <Route path="/admin/usuarios" element={<RoleGate allow={['ADMIN']}><UsersPage/></RoleGate>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to={role ? '/restaurante' : '/restaurantes'} replace />} />
    </Routes>
  )
}