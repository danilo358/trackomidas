import { Request, Response } from 'express'
import { z } from 'zod'
import Item from '../models/Item'
import Restaurant from '../models/Restaurant'

type Id = string

async function getRestaurantIdByOwner(ownerId: Id) {
  const rest = await Restaurant.findOne({ owner: ownerId }).select('_id')
  return rest?._id ?? null
}

const itemSchema = z.object({
  nome: z.string().min(1),
  descricao: z.string().optional(),
  preco: z.number().nonnegative(),
  driveId: z.string().optional(),
  categoriaId: z.string().optional()
})

export async function listByRestaurant(req: Request, res: Response) {
  const restId = req.params.id as Id
  const items = await Item.find({ restaurant: restId }).sort({ createdAt: -1 })
  return res.json(items)
}

export async function listMine(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' })
  const restId = await getRestaurantIdByOwner(req.user.id)
  if (!restId) return res.status(404).json({ error: 'Restaurante não encontrado' })
  const items = await Item.find({ restaurant: restId }).sort({ createdAt: -1 })
  return res.json(items)
}

export async function createItem(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' })
  const restId = await getRestaurantIdByOwner(req.user.id)
  if (!restId) return res.status(404).json({ error: 'Restaurante não encontrado' })
  const parse = itemSchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })
  const doc = await Item.create({ restaurant: restId, ...parse.data })
  return res.status(201).json(doc)
}

export async function updateItem(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' })
  const restId = await getRestaurantIdByOwner(req.user.id)
  if (!restId) return res.status(404).json({ error: 'Restaurante não encontrado' })
  const parse = itemSchema.partial().safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })
  const doc = await Item.findOneAndUpdate(
    { _id: req.params.id, restaurant: restId },
    parse.data,
    { new: true }
  )
  if (!doc) return res.status(404).json({ error: 'Item não encontrado' })
  return res.json(doc)
}

export async function removeItem(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' })
  const restId = await getRestaurantIdByOwner(req.user.id)
  if (!restId) return res.status(404).json({ error: 'Restaurante não encontrado' })
  const r = await Item.deleteOne({ _id: req.params.id, restaurant: restId })
  if (r.deletedCount === 0) return res.status(404).json({ error: 'Item não encontrado' })
  return res.json({ ok: true })
}
