import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
import { createServer } from 'http'
import { ENV } from './config/env'
import routes from './routes'
import { attachUser } from './middlewares/auth'
import { initIO } from './realtime/io'

const app = express()
app.use(cors({ origin: ['http://localhost:5173'], credentials: true }))
app.use(express.json())
app.use(cookieParser())
app.use(attachUser)

app.get('/health', (_req, res) => res.json({ ok: true, service: 'TrackoMidas API' }))
app.use(routes)

const httpServer = createServer(app)

mongoose.connect(ENV.MONGO).then(() => {
  initIO(httpServer, ENV.CORS_ORIGIN)
  httpServer.listen(ENV.PORT, () => console.log(`API on :${ENV.PORT}`))
}).catch(err => {
  console.error('MongoDB error:', err)
  process.exit(1)
})
