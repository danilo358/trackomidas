import { Request, Response } from 'express'
import User from '../models/User'

export async function searchUsers(req: Request, res: Response) {
  const q = String(req.query.q || '').trim()
  const role = String(req.query.role || '')
  const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
  const filter: Record<string, unknown> = { $or: [{ nome: rx }, { email: rx }] }
  if (role) filter.role = role
  const users = await User.find(filter).select('_id nome email role').limit(10)
  res.json(users)
}
