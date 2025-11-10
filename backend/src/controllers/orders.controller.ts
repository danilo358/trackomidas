import { Request, Response } from 'express'
import { z } from 'zod'
import Order from '../models/Order'
import Restaurant from '../models/Restaurant'
import { getIO } from '../realtime/io'

type Id = string

async function getRestaurantIdByOwner(ownerId: Id) {
  const rest = await Restaurant.findOne({ owner: ownerId }).select('_id')
  return rest?._id ?? null
}

// ——— restaurante: listar seus pedidos
export async function listMine(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' })
  const restId = await getRestaurantIdByOwner(req.user.id)
  if (!restId) return res.status(404).json({ error: 'Restaurante não encontrado' })
  const docs = await Order.find({ restaurant: restId, archivedAt: null }).sort({ createdAt: -1 })
  return res.json(docs)
}

// ——— cliente: criar pedido
const createSchema = z.object({
  restaurantId: z.string(),
  itens: z.array(z.object({ nome: z.string(), qtd: z.number().positive(), preco: z.number().nonnegative() })),
  total: z.number().nonnegative()
})
export async function create(req: Request, res: Response) {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const { restaurantId, itens, total } = parsed.data
  const order = await Order.create({
    restaurant: restaurantId,
    cliente: req.user?.id,
    itens, total, status: 'AGUARDANDO'
  })
  getIO().emit('order:new', order) // realtime
  return res.status(201).json(order)
}

// ——— restaurante: avançar status
export async function nextStatus(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' })
  const restId = await getRestaurantIdByOwner(req.user.id)
  if (!restId) return res.status(404).json({ error: 'Restaurante não encontrado' })
  const o = await Order.findOne({ _id: req.params.id, restaurant: restId })
  if (!o) return res.status(404).json({ error: 'Pedido não encontrado' })
  const ordem = ['AGUARDANDO','EM_PREPARO','PRONTO','EM_ROTA','FECHADO'] as const
  const idx = ordem.indexOf(o.status as typeof ordem[number])
  o.status = ordem[Math.min(idx + 1, ordem.length - 1)]
  await o.save()
  return res.json(o)
}

// ——— restaurante: definir entregador (por nome e/ou por usuário ENTREGADOR)
const assignSchema = z.object({
  entregador: z.string().min(1).optional(),
  driverUserId: z.string().optional()
})
export async function setDriver(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' })
  const restId = await getRestaurantIdByOwner(req.user.id)
  if (!restId) return res.status(404).json({ error: 'Restaurante não encontrado' })

  const parsed = assignSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const update: Record<string, unknown> = {}
  if (parsed.data.entregador) update.entregador = parsed.data.entregador
  if (parsed.data.driverUserId) update.driverUserId = parsed.data.driverUserId
  update.status = 'EM_ROTA'

  const o = await Order.findOneAndUpdate(
    { _id: req.params.id, restaurant: restId },
    update,
    { new: true }
  )
  if (!o) return res.status(404).json({ error: 'Pedido não encontrado' })
  return res.json(o)
}

// ——— entregador: listar pedidos atribuídos a ele
export async function listForDriver(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' })
  const docs = await Order.find({ driverUserId: req.user.id, status: { $in: ['EM_ROTA','PRONTO'] } })
  return res.json(docs)
}

// ——— entregador: atualizar localização
const locSchema = z.object({ lng: z.number(), lat: z.number() })
export async function updateDriverLoc(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' })
  const parsed = locSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const o = await Order.findOneAndUpdate(
    { _id: req.params.id, driverUserId: req.user.id },
    { driverLoc: { ...parsed.data, ts: new Date() } },
    { new: true }
  )
  if (!o) return res.status(404).json({ error: 'Pedido não encontrado ou não atribuído' })

  getIO().emit('driver:loc', { orderId: o.id, loc: o.driverLoc }) // realtime
  return res.json(o)
}

export async function listHistory(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' })
  const restId = await getRestaurantIdByOwner(req.user.id)
  if (!restId) return res.status(404).json({ error: 'Restaurante não encontrado' })
  const docs = await Order.find({ restaurant: restId, archivedAt: { $ne: null } }).sort({ archivedAt: -1 })
  return res.json(docs)
}

export async function archive(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' })
  const restId = await getRestaurantIdByOwner(req.user.id)
  if (!restId) return res.status(404).json({ error: 'Restaurante não encontrado' })
  const o = await Order.findOneAndUpdate(
    { _id: req.params.id, restaurant: restId },
    { archivedAt: new Date() },
    { new: true }
  )
  if (!o) return res.status(404).json({ error: 'Pedido não encontrado' })
  return res.json(o)
}