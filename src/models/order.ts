import { nanoid } from '@/utils/nanoid'
import { Schema, model, Types } from 'mongoose'
import { SchemaNames } from './schemaNames'

const COLLECTION_NAME = 'order'

export enum OrderStatus {
    Created = 'created', // 已创建
    Prepayed = 'prepayed', // 已获取 prepay id
    Payed = 'payed', // 已支付
    Delivered = 'delivered', // 已发货（已修改会员到期时间）
}

/* interface */
export interface IOrder {
    user: Types.ObjectId
    good: Types.ObjectId
    payAmount: number
    status: OrderStatus
    tradeId: string
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
            default: OrderStatus.Created,
        },
        tradeId: {
            type: String,
            default: () => {
                return Date.now() + nanoid(4)
            },
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
