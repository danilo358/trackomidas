import 'dotenv/config'

export const ENV = {
  MONGO: process.env.MONGODB_URI || 'mongodb://localhost:27017/trackomidas',
  JWT_SECRET: process.env.JWT_SECRET || 'altere-este-segredo',
  PORT: Number(process.env.PORT || 3333),
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  COOKIE_NAME: 'tkm_token'
} as const