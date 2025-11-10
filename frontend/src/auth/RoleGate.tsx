import { type ReactNode, useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'

type Role = 'ADMIN' | 'RESTAURANTE' | 'CLIENTE' | 'ENTREGADOR'
type Props = { allow: Role[]; children: ReactNode }

function homeByRole(role?: Role) {
  switch (role) {
    case 'RESTAURANTE': return '/restaurante/pedidos'
    case 'ENTREGADOR':  return '/entregador/pedidos'
    // ADMIN cai na lista pública por enquanto
    case 'ADMIN':
    case 'CLIENTE':
    default:            return '/restaurantes'
  }
}

export default function RoleGate({ allow, children }: Props) {
  const location = useLocation()
  const role = useAuthStore(s => s.role as Role | undefined)
  const fetchMe = useAuthStore(s => s.fetchMe)
  const [checked, setChecked] = useState(false)

  // Evita redireciono precoce: se a role ainda não foi carregada, busca do backend
  useEffect(() => {
    let mounted = true
    async function ensure() {
      if (role === undefined) {
        try { await fetchMe() } finally { if (mounted) setChecked(true) }
      } else {
        setChecked(true)
      }
    }
    void ensure()
    return () => { mounted = false }
  }, [role, fetchMe])

  // Enquanto checa, não renderiza nada (poderia ser um skeleton)
  if (!checked) return null

  // Se após checar ainda não temos role => não autenticado
  if (!role) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  // Autenticado mas sem permissão para a rota? Vai para a home da própria role
  if (!allow.includes(role)) {
    return <Navigate to={homeByRole(role)} replace />
  }

  return <>{children}</>
}
