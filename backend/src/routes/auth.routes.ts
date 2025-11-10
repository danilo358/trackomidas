import { Router } from 'express'
import { login, logout, me, register, setRole } from '../controllers/auth.controller'
import { requireAuth, requireRole } from '../middlewares/auth'

const r = Router()

r.post('/register', register)
r.post('/login', login)
r.post('/logout', logout)
r.get('/me', me)

// Apenas ADMIN pode alterar roles
r.patch('/users/:id/role', requireAuth, requireRole(['ADMIN']), setRole)

export default r