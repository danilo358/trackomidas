import mongoose, { Schema, InferSchemaType } from 'mongoose'

const DriverLocSchema = new Schema({
  lng: { type: Number, required: true },
  lat: { type: Number, required: true },
  ts:  { type: Date,   default: () => new Date() }
}, { _id: false })

const OrderSchema = new Schema({
  restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
  cliente:    { type: Schema.Types.ObjectId, ref: 'User', required: false },
  itens:      [{ nome: String, qtd: Number, preco: Number }],
  total:      { type: Number, required: true },
  status:     { type: String, enum: ['AGUARDANDO','EM_PREPARO','PRONTO','EM_ROTA','FECHADO'], default: 'AGUARDANDO' },
  entregador: { type: String },                 // nome exibido
  driverUserId: { type: Schema.Types.ObjectId, ref: 'User' }, // vínculo com o usuário ENTREGADOR
  driverLoc:  { type: DriverLocSchema, default: null },
    dest: {
    lng: { type: Number },
    lat: { type: Number },
    label: { type: String }
    },
    closedAt:  { type: Date, default: null },
    archivedAt:{ type: Date, default: null }
    }, { timestamps: true })

export type Order = InferSchemaType<typeof OrderSchema>
export default mongoose.model('Order', OrderSchema)
