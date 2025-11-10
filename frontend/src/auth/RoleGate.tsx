import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'
import type { Role } from '../stores/auth'

export default function RoleGate({ allow, children }: { allow: Exclude<Role, null>[]; children: ReactNode }) {
  const role = useAuthStore(s => s.role)
  const loc = useLocation()
  if (!role || !allow.includes(role)) {
    return <Navigate to="/login" state={{ from: loc.pathname }} replace />
  }
  return <>{children}</>
}