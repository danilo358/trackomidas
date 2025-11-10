import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
import { createServer } from 'http'
import { ENV } from './config/env'
import authRoutes from './routes/auth.routes'
import restaurantRoutes from './routes/restaurants.routes'
import itemRoutes from './routes/items.routes'
import orderRoutes from './routes/orders.routes'
import customerRoutes from './routes/costumers.routes'
import { attachUser } from './middlewares/auth'
import { initIO } from './realtime/io'

const app = express()
app.use(cors({ origin: ENV.CORS_ORIGIN, credentials: true }))
app.use(express.json())
app.use(cookieParser())
app.use(attachUser)

app.get('/health', (_req, res) => res.json({ ok: true, service: 'TrackoMidas API' }))
app.use('/auth', authRoutes)
app.use('/restaurants', restaurantRoutes)
app.use('/items', itemRoutes)
app.use('/orders', orderRoutes)
app.use('/customers', customerRoutes)

const httpServer = createServer(app)

mongoose.connect(ENV.MONGO).then(() => {
  initIO(httpServer, ENV.CORS_ORIGIN)
  httpServer.listen(ENV.PORT, () => console.log(`API on :${ENV.PORT}`))
}).catch(err => {
  console.error('MongoDB error:', err)
  process.exit(1)
})
