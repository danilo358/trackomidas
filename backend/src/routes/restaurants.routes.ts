import { Router } from 'express'
import { addAddress, addCategory, getMine, getOne, listPublic, removeCategory, renameCategory, upsertMine } from '../controllers/restaurants.controller'
import { requireAuth, requireRole } from '../middlewares/auth'

const r = Router()

// público
r.get('/', listPublic)
r.get('/:id', getOne)

// próprio restaurante (RESTAURANTE/ADMIN)
r.get('/me', requireAuth, requireRole(['RESTAURANTE', 'ADMIN']), getMine)
r.put('/me', requireAuth, requireRole(['RESTAURANTE', 'ADMIN']), upsertMine)
r.post('/me/addresses', requireAuth, requireRole(['RESTAURANTE', 'ADMIN']), addAddress)

// categorias
r.post('/me/categories', requireAuth, requireRole(['RESTAURANTE', 'ADMIN']), addCategory)
r.patch('/me/categories/:id', requireAuth, requireRole(['RESTAURANTE', 'ADMIN']), renameCategory)
r.delete('/me/categories/:id', requireAuth, requireRole(['RESTAURANTE', 'ADMIN']), removeCategory)

export default r
