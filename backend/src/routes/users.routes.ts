import { Router } from 'express'
import { searchUsers } from '../controllers/users.controller'
import { requireAuth, requireRole } from '../middlewares/auth'

const r = Router()
r.get('/search', requireAuth, requireRole(['RESTAURANTE','ADMIN']), searchUsers)
export default r
