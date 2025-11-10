import { Router } from 'express'
import { addAddress, addCategory, getMine, getOne, listPublic, removeAddress, removeCategory, renameCategory, updateAddress, upsertMine } from '../controllers/restaurants.controller'
import { requireAuth, requireRole } from '../middlewares/auth'

const r = Router()

// público
r.get('/', listPublic)

// próprio restaurante (RESTAURANTE/ADMIN) — coloque ANTES de '/:id'
r.get('/me', requireAuth, requireRole(['RESTAURANTE', 'ADMIN']), getMine)
r.put('/me', requireAuth, requireRole(['RESTAURANTE', 'ADMIN']), upsertMine)

// endereços
r.post('/me/addresses', requireAuth, requireRole(['RESTAURANTE', 'ADMIN']), addAddress)
r.patch('/me/addresses/:id', requireAuth, requireRole(['RESTAURANTE', 'ADMIN']), updateAddress)
r.delete('/me/addresses/:id', requireAuth, requireRole(['RESTAURANTE', 'ADMIN']), removeAddress)

// categorias
r.post('/me/categories', requireAuth, requireRole(['RESTAURANTE', 'ADMIN']), addCategory)
r.patch('/me/categories/:id', requireAuth, requireRole(['RESTAURANTE', 'ADMIN']), renameCategory)
r.delete('/me/categories/:id', requireAuth, requireRole(['RESTAURANTE', 'ADMIN']), removeCategory)

// detalhe público deve vir por último
r.get('/:id', getOne)

export default r
