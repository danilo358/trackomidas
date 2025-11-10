import { Request, Response } from 'express'
import { z } from 'zod'
import Restaurant from '../models/Restaurant'

export async function listPublic(_req: Request, res: Response) {
  const docs = await Restaurant.find().select('nome ratingAvg ratingCount categorias enderecos')
  return res.json(docs)
}

export async function getOne(req: Request, res: Response) {
  const doc = await Restaurant.findById(req.params.id)
  if (!doc) return res.status(404).json({ error: 'Não encontrado' })
  return res.json(doc)
}

const upsertSchema = z.object({
  nome: z.string().min(2),
  descricao: z.string().optional(),
})

export async function upsertMine(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' })
  const parse = upsertSchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })
  const base = { owner: req.user.id, ...parse.data }
  const existing = await Restaurant.findOne({ owner: req.user.id })
  const doc = existing ? await Restaurant.findByIdAndUpdate(existing.id, base, { new: true }) : await Restaurant.create(base)
  return res.json(doc)
}

export async function getMine(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' })
  const doc = await Restaurant.findOne({ owner: req.user.id })
  if (!doc) return res.status(404).json({ error: 'Restaurante não encontrado para este usuário' })
  return res.json(doc)
}

const addrSchema = z.object({
  apelido: z.string().min(1),
  cep: z.string().optional(),
  rua: z.string().optional(),
  numero: z.string().optional(),
  cidade: z.string().optional(),
  uf: z.string().optional(),
  freteFixo: z.number().nonnegative().default(0),
  freteKm: z.number().nonnegative().default(0)
})

export async function addAddress(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' })
  const parse = addrSchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })
  const doc = await Restaurant.findOneAndUpdate(
    { owner: req.user.id },
    { $push: { enderecos: parse.data } },
    { new: true }
  )
  if (!doc) return res.status(404).json({ error: 'Restaurante não encontrado para este usuário' })
  return res.json(doc)
}

const catSchema = z.object({ nome: z.string().min(1) })

export async function addCategory(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' })
  const parse = catSchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })
  const doc = await Restaurant.findOneAndUpdate(
    { owner: req.user.id },
    { $push: { categorias: { nome: parse.data.nome } } },
    { new: true }
  )
  if (!doc) return res.status(404).json({ error: 'Restaurante não encontrado' })
  return res.json(doc.categorias)
}

export async function renameCategory(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' })
  const { id } = req.params
  const parse = catSchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })
  const doc = await Restaurant.findOneAndUpdate(
    { owner: req.user.id, 'categorias._id': id },
    { $set: { 'categorias.$.nome': parse.data.nome } },
    { new: true }
  )
  if (!doc) return res.status(404).json({ error: 'Categoria não encontrada' })
  return res.json(doc.categorias)
}

export async function removeCategory(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' })
  const { id } = req.params
  const doc = await Restaurant.findOneAndUpdate(
    { owner: req.user.id },
    { $pull: { categorias: { _id: id } } },
    { new: true }
  )
  if (!doc) return res.status(404).json({ error: 'Categoria não encontrada' })
  return res.json(doc.categorias)
}
