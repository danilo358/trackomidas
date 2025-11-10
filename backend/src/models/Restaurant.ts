import mongoose, { Schema, InferSchemaType, Types } from 'mongoose'

const AddressSchema = new Schema({
  apelido: { type: String, required: true },
  cep: String,
  rua: String,
  numero: String,
  cidade: String,
  uf: String,
  freteFixo: { type: Number, default: 0 },
  freteKm: { type: Number, default: 0 }
}, { _id: true })

const CategorySchema = new Schema({
  nome: { type: String, required: true }
}, { _id: true })

const RestaurantSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  nome: { type: String, required: true },
  descricao: String,
  ratingAvg: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  enderecos: [AddressSchema],
  categorias: [CategorySchema]
}, { timestamps: true })

export type Restaurant = InferSchemaType<typeof RestaurantSchema>
export type Address = InferSchemaType<typeof AddressSchema>
export default mongoose.model('Restaurant', RestaurantSchema)