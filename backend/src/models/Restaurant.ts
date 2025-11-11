import mongoose, { Schema, InferSchemaType, Types } from 'mongoose'

const AddressSchema = new Schema({
  apelido: { type: String, required: true },
  cep: String,
  rua: String,
  numero: String,
  cidade: String,
  uf: String,
  freteFixo: { type: Number, default: 0 },
  freteKm: { type: Number, default: 0 },
  logoId: { type: String, default: '' }
}, { _id: true })

const CategorySchema = new Schema({
  nome: { type: String, required: true }
}, { _id: true })

const RestaurantSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  nome: { type: String, required: true },
  descricao: String,
  
  // ⚠️ CAMPOS DEPRECADOS - Mantidos por compatibilidade
  ratingAvg: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  
  // ✅ CAMPOS CORRETOS - IMPORTANTE: NÃO use select: false
  ratingsCount: { type: Number, default: 0 },  // Remova qualquer "select: false"
  ratingsSum:   { type: Number, default: 0 },  // Remova qualquer "select: false"
  ordersCount:  { type: Number, default: 0 },  // Remova qualquer "select: false"
  
  enderecos: [AddressSchema],
  categorias: [CategorySchema]
}, { 
  timestamps: true,
  // Garante que os campos sempre apareçam no JSON
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      // Calcula ratingAvg dinamicamente se necessário
      if (ret.ratingsCount > 0) {
        ret.ratingAvg = Number((ret.ratingsSum / ret.ratingsCount).toFixed(1))
        ret.ratingCount = ret.ratingsCount
      }
      return ret
    }
  }
})

// Índices para performance
RestaurantSchema.index({ owner: 1 })
RestaurantSchema.index({ ratingsCount: -1, ratingsSum: -1 }) // Para ordenação por rating

export type Restaurant = InferSchemaType<typeof RestaurantSchema>
export type Address = InferSchemaType<typeof AddressSchema>
export default mongoose.model('Restaurant', RestaurantSchema)