import { Router } from 'express'
import { createItem, listByRestaurant, listMine, removeItem, updateItem } from '../controllers/items.controller'
import { requireAuth, requireRole } from '../middlewares/auth'

const r = Router()

// público
r.get('/by-restaurant/:id', listByRestaurant)

// restaurante
r.get('/me', requireAuth, requireRole(['RESTAURANTE', 'ADMIN']), listMine)
r.post('/me', requireAuth, requireRole(['RESTAURANTE', 'ADMIN']), createItem)
r.patch('/me/:id', requireAuth, requireRole(['RESTAURANTE', 'ADMIN']), updateItem)
r.delete('/me/:id', requireAuth, requireRole(['RESTAURANTE', 'ADMIN']), removeItem)

export default r
