import { Router } from 'express'
import { create, listForDriver, listMine, nextStatus, setDriver, updateDriverLoc } from '../controllers/orders.controller'
import { requireAuth, requireRole } from '../middlewares/auth'

const r = Router()

// cliente cria pedido
r.post('/', requireAuth, requireRole(['CLIENTE','ADMIN']), create)

// restaurante
r.get('/me', requireAuth, requireRole(['RESTAURANTE','ADMIN']), listMine)
r.patch('/me/:id/next', requireAuth, requireRole(['RESTAURANTE','ADMIN']), nextStatus)
r.patch('/me/:id/driver', requireAuth, requireRole(['RESTAURANTE','ADMIN']), setDriver)

// entregador
r.get('/driver', requireAuth, requireRole(['ENTREGADOR','ADMIN']), listForDriver)
r.patch('/driver/:id/loc', requireAuth, requireRole(['ENTREGADOR','ADMIN']), updateDriverLoc)

export default r
