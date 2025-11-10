import { Router } from 'express'
import { addAddress, listAddresses, removeAddress } from '../controllers/customers.controller'
import { requireAuth, requireRole } from '../middlewares/auth'

const r = Router()
r.get('/addresses', requireAuth, requireRole(['CLIENTE','ADMIN']), listAddresses)
r.post('/addresses', requireAuth, requireRole(['CLIENTE','ADMIN']), addAddress)
r.delete('/addresses/:id', requireAuth, requireRole(['CLIENTE','ADMIN']), removeAddress)

export default r
