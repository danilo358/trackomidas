import { Request, Response } from 'express'
import { z } from 'zod'
import Restaurant from '../models/Restaurant'

function serializeRestaurant(doc: any) {
  const json = typeof doc.toJSON === 'function' ? doc.toJSON() : doc
  const ratingsCount = Number(json.ratingsCount ?? 0)
  const ratingsSum   = Number(json.ratingsSum   ?? 0)
  const ordersCount  = Number(json.ordersCount  ?? 0)
  const ratingAvg    = ratingsCount ? (ratingsSum / ratingsCount) : 0
  
  return { 
    ...json, 
    ratingAvg: Number(ratingAvg.toFixed(1)),
    ratingCount: ratingsCount, 
    ordersCount 
  }
}

export async function listPublic(_req: Request, res: Response) {
  try {
    // CORREÇÃO: Remova o .select() para trazer TODOS os campos
    // ou adicione explicitamente +ratingsSum +ratingsCount
    const docs = await Restaurant.find({})
      .select('+ratingsSum +ratingsCount +ordersCount')
      .lean()
    const serialized = docs.map(serializeRestaurant)
    return res.json(serialized)
  } catch (error) {
    console.error('Erro ao listar restaurantes:', error)
    return res.status(500).json({ error: 'Erro ao listar restaurantes' })
  }
}

export async function getOne(req: Request, res: Response) {
  try {
    const doc = await Restaurant.findById(req.params.id)
      .select('+ratingsSum +ratingsCount +ordersCount')
    
    if (!doc) return res.status(404).json({ error: 'Não encontrado' })
    
    return res.json(serializeRestaurant(doc))
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar restaurante' })
  }
}

const upsertSchema = z.object({
  nome: z.string().min(2),
  descricao: z.string().optional(),
})

export async function getMine(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' })
  
  try {
    let doc = await Restaurant.findOne({ owner: req.user.id })
      .select('+ratingsSum +ratingsCount +ordersCount')
    
    if (!doc && req.user.role === 'RESTAURANTE') {
      doc = await Restaurant.create({
        owner: req.user.id,
        nome: `Restaurante ${req.user.nome?.split(' ')[0] ?? ''}`.trim() || 'Meu Restaurante'
      })
    }
    
    if (!doc) return res.status(404).json({ error: 'Restaurante não encontrado para este usuário' })
    
    return res.json(serializeRestaurant(doc))
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar restaurante' })
  }
}

export async function upsertMine(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' })
  
  const parse = upsertSchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })
  
  try {
    const base = { owner: req.user.id, ...parse.data }
    const existing = await Restaurant.findOne({ owner: req.user.id })
    const doc = existing 
      ? await Restaurant.findByIdAndUpdate(existing.id, base, { new: true })
      : await Restaurant.create(base)
    
    return res.json(doc)
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao salvar restaurante' })
  }
}

/** ENDEREÇOS */
const addrSchema = z.object({
  apelido: z.string().min(1),
  cep: z.string().optional(),
  rua: z.string().optional(),
  numero: z.string().optional(),
  cidade: z.string().optional(),
  uf: z.string().optional(),
  freteFixo: z.number().nonnegative().default(0),
  freteKm: z.number().nonnegative().default(0),
  logoId: z.string().optional()
})

export async function addAddress(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' })
  
  const parse = addrSchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })
  
  try {
    const doc = await Restaurant.findOneAndUpdate(
      { owner: req.user.id },
      { $push: { enderecos: parse.data } },
      { new: true }
    )
    
    if (!doc) return res.status(404).json({ error: 'Restaurante não encontrado para este usuário' })
    
    return res.json(doc.enderecos)
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao adicionar endereço' })
  }
}

export async function updateAddress(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' })
  
  const { id } = req.params
  const parse = addrSchema.partial().safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })
  
  try {
    const updateFields: any = {}
    if (parse.data.apelido !== undefined) updateFields['enderecos.$.apelido'] = parse.data.apelido
    if (parse.data.cep !== undefined) updateFields['enderecos.$.cep'] = parse.data.cep
    if (parse.data.rua !== undefined) updateFields['enderecos.$.rua'] = parse.data.rua
    if (parse.data.numero !== undefined) updateFields['enderecos.$.numero'] = parse.data.numero
    if (parse.data.cidade !== undefined) updateFields['enderecos.$.cidade'] = parse.data.cidade
    if (parse.data.uf !== undefined) updateFields['enderecos.$.uf'] = parse.data.uf
    if (parse.data.freteFixo !== undefined) updateFields['enderecos.$.freteFixo'] = parse.data.freteFixo
    if (parse.data.freteKm !== undefined) updateFields['enderecos.$.freteKm'] = parse.data.freteKm
    if (parse.data.logoId !== undefined) updateFields['enderecos.$.logoId'] = parse.data.logoId
    
    const doc = await Restaurant.findOneAndUpdate(
      { owner: req.user.id, 'enderecos._id': id },
      { $set: updateFields },
      { new: true }
    )
    
    if (!doc) return res.status(404).json({ error: 'Endereço não encontrado' })
    
    return res.json(doc.enderecos)
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar endereço' })
  }
}

export async function removeAddress(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' })
  
  const { id } = req.params
  
  try {
    const doc = await Restaurant.findOneAndUpdate(
      { owner: req.user.id },
      { $pull: { enderecos: { _id: id } } },
      { new: true }
    )
    
    if (!doc) return res.status(404).json({ error: 'Endereço não encontrado' })
    
    return res.json(doc.enderecos)
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao remover endereço' })
  }
}

/** CATEGORIAS */
const catSchema = z.object({ nome: z.string().min(1) })

export async function addCategory(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' })
  
  const parse = catSchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })
  
  try {
    const doc = await Restaurant.findOneAndUpdate(
      { owner: req.user.id },
      { $push: { categorias: { nome: parse.data.nome } } },
      { new: true }
    )
    
    if (!doc) return res.status(404).json({ error: 'Restaurante não encontrado' })
    
    return res.json(doc.categorias)
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao adicionar categoria' })
  }
}

export async function renameCategory(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' })
  
  const { id } = req.params
  const parse = catSchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })
  
  try {
    const doc = await Restaurant.findOneAndUpdate(
      { owner: req.user.id, 'categorias._id': id },
      { $set: { 'categorias.$.nome': parse.data.nome } },
      { new: true }
    )
    
    if (!doc) return res.status(404).json({ error: 'Categoria não encontrada' })
    
    return res.json(doc.categorias)
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao renomear categoria' })
  }
}

export async function removeCategory(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' })
  
  const { id } = req.params
  
  try {
    const doc = await Restaurant.findOneAndUpdate(
      { owner: req.user.id },
      { $pull: { categorias: { _id: id } } },
      { new: true }
    )
    
    if (!doc) return res.status(404).json({ error: 'Categoria não encontrada' })
    
    return res.json(doc.categorias)
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao remover categoria' })
  }
}