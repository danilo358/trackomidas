import { Request, Response } from 'express'
import { z } from 'zod'
import Order from '../models/Order'
import Restaurant from '../models/Restaurant'
import { getIO } from '../realtime/io'
import User from '../models/User'

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
  total: z.number().nonnegative(),
  dest: z.object({
    lng: z.number(),
    lat: z.number(),
    label: z.string().optional()
  }).optional()
})
export async function create(req: Request, res: Response) {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const { restaurantId, itens, total, dest } = parsed.data
  const order = await Order.create({
    restaurant: restaurantId,
    cliente: req.user?.id,
    itens, total, status: 'AGUARDANDO',
    dest: dest ? { ...dest } : undefined
  })
  getIO().emit('order:new', order)
  await Restaurant.findByIdAndUpdate(restaurantId, { $inc: { ordersCount: 1 } })
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
  const novoStatus = ordem[Math.min(idx + 1, ordem.length - 1)]
  o.status = novoStatus
  if (novoStatus === 'FECHADO' && !o.closedAt) o.closedAt = new Date()
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

  const { q, minTotal, maxTotal, start, end } = req.query as {
    q?: string; minTotal?: string; maxTotal?: string; start?: string; end?: string
  }

  const filter: Record<string, unknown> = {
    restaurant: restId,
    archivedAt: { $ne: null },
  }

  // faixa de valores (total)
  if (minTotal || maxTotal) {
    filter.total = {}
    if (minTotal) (filter.total as any).$gte = Number(minTotal)
    if (maxTotal) (filter.total as any).$lte = Number(maxTotal)
  }

  // faixa de datas (por closedAt; se não houver, usa createdAt)
  if (start || end) {
    const dt: Record<string, Date> = {}
    if (start) dt.$gte = new Date(start)
    if (end)   dt.$lte = new Date(end)
    filter.$or = [
      { closedAt: dt },
      { $and: [{ closedAt: { $exists: false } }, { createdAt: dt }] }
    ]
  }

  // filtro por cliente (nome/email) se q vier
  if (q && q.trim()) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    const users = await User.find({ $or: [{ nome: rx }, { email: rx }] }).select('_id')
    const ids = users.map(u => u._id)
    filter.cliente = { $in: ids.length ? ids : ['__no_match__'] }
  }

  const docs = await Order
    .find(filter)
    .sort({ archivedAt: -1 })
    .populate('cliente', 'nome email') // para exibir no front

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

export async function listForCustomer(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' })
  const docs = await Order.find({ cliente: req.user.id }).sort({ createdAt: -1 })
  return res.json(docs)
}

//cliente Avaliações
const rateSchema = z.object({ nota: z.number().min(1).max(5), comentario: z.string().max(1000).optional() })

export async function rateMyOrder(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' })
  const { id } = req.params
  const parsed = rateSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const o = await Order.findOne({ _id: id, cliente: req.user.id })
  if (!o) return res.status(404).json({ error: 'Pedido não encontrado' })
  if (o.status !== 'FECHADO') return res.status(400).json({ error: 'Só é possível avaliar pedidos FECHADOS' })
  if (o.ratedAt) return res.status(400).json({ error: 'Pedido já avaliado' })

  o.rating = { nota: parsed.data.nota, comentario: parsed.data.comentario ?? '' }
  o.ratedAt = new Date()
  await o.save()

  await Restaurant.findByIdAndUpdate(o.restaurant, {
    $inc: { ratingsCount: 1, ratingsSum: parsed.data.nota }
  })

  res.json(o)
}

export async function listMyReviews(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' })
  const restId = await getRestaurantIdByOwner(req.user.id)
  if (!restId) return res.status(404).json({ error: 'Restaurante não encontrado' })

  const docs = await Order.find({ restaurant: restId, ratedAt: { $ne: null } })
    .select('rating ratedAt cliente itens total')
    .populate('cliente', 'nome email')
    .sort({ ratedAt: -1 })

  res.json(docs)
}