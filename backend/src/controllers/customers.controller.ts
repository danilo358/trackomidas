import { Request, Response } from 'express'
import { z } from 'zod'
import User from '../models/User'

const addrSchema = z.object({
  apelido: z.string().min(1),
  cep: z.string().optional(),
  rua: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  uf: z.string().optional(),
  complemento: z.string().optional()
})

export async function listAddresses(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' })
  const u = await User.findById(req.user.id).select('enderecos')
  return res.json(u?.enderecos ?? [])
}

export async function addAddress(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' })
  const parse = addrSchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })
  const u = await User.findByIdAndUpdate(
    req.user.id,
    { $push: { enderecos: parse.data } },
    { new: true }
  ).select('enderecos')
  return res.json(u?.enderecos ?? [])
}

export async function removeAddress(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' })
  const id = req.params.id
  const u = await User.findByIdAndUpdate(
    req.user.id,
    { $pull: { enderecos: { _id: id } } },
    { new: true }
  ).select('enderecos')
  return res.json(u?.enderecos ?? [])
}

export async function updateAddress(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' })
  const id = req.params.id
  const parsed = addrSchema.partial().safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const u = await User.findOneAndUpdate(
    { _id: req.user.id, 'enderecos._id': id },
    {
      $set: {
        'enderecos.$.apelido': parsed.data.apelido,
        'enderecos.$.cep': parsed.data.cep,
        'enderecos.$.rua': parsed.data.rua,
        'enderecos.$.numero': parsed.data.numero,
        'enderecos.$.bairro': parsed.data.bairro,
        'enderecos.$.cidade': parsed.data.cidade,
        'enderecos.$.uf': parsed.data.uf,
        'enderecos.$.complemento': parsed.data.complemento
      }
    },
    { new: true }
  ).select('enderecos')

  return res.json(u?.enderecos ?? [])
}