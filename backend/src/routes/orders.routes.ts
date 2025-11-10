import { Router } from 'express'
import { create, listForDriver, listMine, nextStatus, setDriver, updateDriverLoc, listHistory, archive, listForCustomer, rateMyOrder, listMyReviews } from '../controllers/orders.controller'
import { requireAuth, requireRole } from '../middlewares/auth'

const r = Router()

// cliente cria pedido
r.post('/', requireAuth, requireRole(['CLIENTE','ADMIN']), create)
r.get('/my', requireAuth, requireRole(['CLIENTE','ADMIN']), listForCustomer)

// restaurante
r.get('/me', requireAuth, requireRole(['RESTAURANTE','ADMIN']), listMine)
r.patch('/me/:id/next', requireAuth, requireRole(['RESTAURANTE','ADMIN']), nextStatus)
r.patch('/me/:id/driver', requireAuth, requireRole(['RESTAURANTE','ADMIN']), setDriver)
r.get('/me/history', requireAuth, requireRole(['RESTAURANTE','ADMIN']), listHistory)
r.patch('/me/:id/archive', requireAuth, requireRole(['RESTAURANTE','ADMIN']), archive)

//avaliações
r.patch('/my/:id/rate', requireAuth, requireRole(['CLIENTE','ADMIN']), rateMyOrder)
r.get('/me/reviews', requireAuth, requireRole(['RESTAURANTE','ADMIN']), listMyReviews)

// entregador
r.get('/driver', requireAuth, requireRole(['ENTREGADOR','ADMIN']), listForDriver)
r.patch('/driver/:id/loc', requireAuth, requireRole(['ENTREGADOR','ADMIN']), updateDriverLoc)

export default r
