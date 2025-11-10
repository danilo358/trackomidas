import { Request, Response, NextFunction } from 'express'
import { ENV } from '../config/env'
import { verifyJwt } from '../utils/jwt'
import type { Role } from '../models/User'

export function attachUser(req: Request, _res: Response, next: NextFunction) {
  const token = (req as import('express').Request & { cookies?: Record<string, string> })
    .cookies?.[ENV.COOKIE_NAME]
  if (!token) return next()
  try {
    const payload = verifyJwt(token)
    req.user = { id: payload.id, role: payload.role as Role, nome: payload.nome }
  } catch {
    // token inválido: segue sem user
  }
  next()
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' })
  next()
}

export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Não autenticado' })
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Sem permissão' })
    next()
  }
}