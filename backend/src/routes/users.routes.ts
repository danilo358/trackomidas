import { Router } from 'express'
import { requireAuth, requireRole } from '../middlewares/auth'
import { listUsers, updateUserRole } from '../controllers/users.controller'

const r = Router()

r.get('/search',
  requireAuth, requireRole(['RESTAURANTE','ADMIN']),
  listUsers
)

// administração (somente ADMIN)
r.get('/admin/users',
  requireAuth, requireRole(['ADMIN']),
  listUsers
)

r.patch('/admin/users/:id/role',
  requireAuth, requireRole(['ADMIN']),
  updateUserRole
)
export default r