import mongoose, { Schema, InferSchemaType } from 'mongoose'
import bcrypt from 'bcrypt'

export const ROLES = ['ADMIN', 'RESTAURANTE', 'CLIENTE', 'ENTREGADOR'] as const
export type Role = typeof ROLES[number]

const CustomerAddressSchema = new Schema({
  apelido: { type: String, required: true },
  cep: String,
  rua: String,
  numero: String,
  bairro: String,
  cidade: String,
  uf: String,
  complemento: String
}, { _id: true })

const UserSchema = new Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  senhaHash: { type: String, required: true },
  role: { type: String, enum: ROLES, default: 'CLIENTE' as Role },
  enderecos: [CustomerAddressSchema]
}, { timestamps: true })

UserSchema.methods.comparePassword = function (plain: string) {
  return bcrypt.compare(plain, this.senhaHash)
}

UserSchema.pre('save', async function () {
  if (this.isModified('senhaHash') && this.senhaHash && !this.senhaHash.startsWith('$2')) {
    this.senhaHash = await bcrypt.hash(this.senhaHash, 10)
  }
})

export type User = InferSchemaType<typeof UserSchema>
export type CustomerAddress = InferSchemaType<typeof CustomerAddressSchema>
export default mongoose.model('User', UserSchema)
