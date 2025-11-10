import { Router } from 'express'
import authRoutes from './auth.routes'
import restaurantRoutes from './restaurants.routes'
import itemRoutes from './items.routes'
import orderRoutes from './orders.routes'
import customerRoutes from './costumers.routes'
import usersRoutes from './users.routes'

const r = Router()

r.use('/auth', authRoutes)
r.use('/restaurants', restaurantRoutes)
r.use('/items', itemRoutes)
r.use('/orders', orderRoutes)
r.use('/customers', customerRoutes)
r.use('/users', usersRoutes)

export default r
