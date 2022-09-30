import { Schema, model, Types } from 'mongoose'
import { SchemaNames } from './schemaNames'

const COLLECTION_NAME = 'order'

export enum OrderStatus {
    Prepayed = 'prepayed', // 已获取 prepay id
    Delivered = 'delivered', // 已发货（已修改会员到期时间）
}

/* interface */
export interface IOrder {
    user: Types.ObjectId
    good: Types.ObjectId
    payAmount: number
    status: OrderStatus
    createdAt: Date
    updatedAt: Date
}

/* schema */
const orderSchema = new Schema<IOrder>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: SchemaNames.User,
        },
        good: {
            type: Schema.Types.ObjectId,
            ref: SchemaNames.Good,
        },
        payAmount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            default: OrderStatus.Prepayed,
        },
    },
    { collection: COLLECTION_NAME, timestamps: true },
)

orderSchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id.toString()
        ret.user = doc.user.toString()
        ret.good = doc.good.toString()

        delete ret.__v
        delete ret._id
    },
})

export const Order = model<IOrder>(SchemaNames.Order, orderSchema)

export default Order
