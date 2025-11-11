import { Request, Response } from 'express'
import User from '../models/User'

export async function listUsers(req: Request, res: Response) {
  const { q, role } = req.query as {
    q?: string
    role?: 'ADMIN' | 'RESTAURANTE' | 'CLIENTE' | 'ENTREGADOR'
  }

  const filter: Record<string, unknown> = {}

  if (q && q.trim()) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    filter.$or = [{ nome: rx }, { email: rx }]
  }

  if (role) {
    filter.role = role
  }

  const users = await User.find(filter)
    .select('_id nome email role createdAt')
    .sort({ createdAt: -1 })

  res.json(users)
}

export async function updateUserRole(req: Request, res: Response) {
  const { id } = req.params
  const { role } = req.body as { role: 'ADMIN'|'RESTAURANTE'|'CLIENTE'|'ENTREGADOR' }
  const ok = ['ADMIN','RESTAURANTE','CLIENTE','ENTREGADOR'].includes(role)
  if (!ok) return res.status(400).json({ error: 'role inválida' })
  const u = await User.findByIdAndUpdate(id, { role }, { new: true }).select('_id nome email role')
  if (!u) return res.status(404).json({ error: 'Usuário não encontrado' })
  res.json(u)
}
