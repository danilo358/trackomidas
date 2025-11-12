import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { attachUser } from './middlewares/auth'
import { ENV } from './config/env'
import mongoose from 'mongoose'
import routes from './routes'
import { initIO } from './realtime/io'
import { createServer } from 'http'
import type { Request, Response } from 'express'

const app = express()

const allow = (ENV.CORS_ORIGIN || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)

app.set('trust proxy', 1) // se estiver atrás de proxy/Load Balancer

app.use(cors({
  origin: (origin, cb) => {
    // permite chamadas de ferramentas locais sem 'origin' e checa lista allow
    if (!origin || allow.includes(origin)) return cb(null, true)
    return cb(new Error('CORS: origem não permitida'))
  },
  credentials: true, // <— ESSENCIAL pro cookie viajar
}))

app.use(express.json())
app.use(cookieParser())   // <— precisa vir ANTES do attachUser
app.use(attachUser)       // <— popula req.user a partir do cookie

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

app.get('/health', (_req: Request, res: Response) => {
  return res.json({ ok: true, service: 'TrackoMidas API' })
})
app.use(routes)

const httpServer = createServer(app)

mongoose.connect(ENV.MONGO).then(() => {
  initIO(httpServer, ENV.CORS_ORIGIN)
  httpServer.listen(ENV.PORT, () => console.log(`API on :${ENV.PORT}`))
}).catch(err => {
  console.error('MongoDB error:', err)
  process.exit(1)
})
