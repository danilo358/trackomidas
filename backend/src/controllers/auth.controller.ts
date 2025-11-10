import { Request, Response } from 'express'
import { z } from 'zod'
import User, { ROLES } from '../models/User'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { ENV } from '../config/env'
import { signJwt } from '../utils/jwt'

const authSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(6)
})

export async function register(req: Request, res: Response) {
  const parse = authSchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })
  const { nome, email, senha } = parse.data
  const exists = await User.findOne({ email })
  if (exists) return res.status(409).json({ error: 'E-mail já cadastrado' })
  const user = await User.create({ nome, email, senhaHash: senha, role: 'CLIENTE' })
  const token = signJwt({ id: user.id, role: user.role, nome: user.nome })
  res.cookie(ENV.COOKIE_NAME, token, cookieOptions())
  return res.json({ id: user.id, nome: user.nome, role: user.role })
}

export async function login(req: Request, res: Response) {
  const parse = authSchema.pick({ email: true, senha: true, nome: false as any }).safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })
  const { email, senha } = parse.data
  const user = await User.findOne({ email })
  if (!user) return res.status(401).json({ error: 'Credenciais inválidas' })
  const ok = await bcrypt.compare(senha, user.senhaHash)
  if (!ok) return res.status(401).json({ error: 'Credenciais inválidas' })
  const token = signJwt({ id: user.id, role: user.role, nome: user.nome })
  res.cookie(ENV.COOKIE_NAME, token, cookieOptions())
  return res.json({ id: user.id, nome: user.nome, role: user.role })
}

export async function me(req: Request, res: Response) {
  if (!req.user) return res.status(200).json({ user: null })
  return res.json({ user: req.user })
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie(ENV.COOKIE_NAME)
  return res.json({ ok: true })
}

export async function setRole(req: Request, res: Response) {
  const { id } = req.params
  const body = z.object({ role: z.enum(ROLES) }).safeParse(req.body)
  if (!body.success) return res.status(400).json({ error: body.error.flatten() })
  const user = await User.findByIdAndUpdate(id, { role: body.data.role }, { new: true })
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })
  return res.json({ id: user.id, nome: user.nome, role: user.role })
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: false, // em produção, habilitar true com HTTPS
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}