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
const allow = (ENV.CORS_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean)

app.use(cors({
  credentials: true,
  origin(origin, cb) {
    // permite chamadas sem Origin (ex: health, curl)
    if (!origin) return cb(null, true)
    cb(null, allow.includes(origin))
  }
}))

// (opcional, mas ajuda em alguns clients e preflight)
app.options('*', cors({
  credentials: true,
  origin(origin, cb) {
    if (!origin) return cb(null, true)
    cb(null, allow.includes(origin))
  }
}))



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
