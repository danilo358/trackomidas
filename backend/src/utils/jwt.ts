import jwt from 'jsonwebtoken'
import { ENV } from '../config/env'

export type JWTPayload = { id: string; role: string; nome: string }

export function signJwt(payload: JWTPayload) {
  return jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: '7d' })
}

export function verifyJwt(token: string) {
  return jwt.verify(token, ENV.JWT_SECRET) as JWTPayload
}