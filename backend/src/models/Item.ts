import mongoose, { Schema, InferSchemaType } from 'mongoose'

const ItemSchema = new Schema({
  restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', index: true, required: true },
  nome: { type: String, required: true },
  descricao: String,
  preco: { type: Number, required: true },
  driveId: String,
  categoriaId: { type: Schema.Types.ObjectId }
}, { timestamps: true })

export type Item = InferSchemaType<typeof ItemSchema>
export default mongoose.model('Item', ItemSchema)