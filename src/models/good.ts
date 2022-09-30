import { Schema, model } from 'mongoose'
import { SchemaNames } from './schemaNames'

const COLLECTION_NAME = 'good'

/* interface */
export interface IGood {
    name: string // 商品名称
    price: number // 商品价格
    memberDays: number // 会员天数
    isHidden: boolean // 是否隐藏商品
}

/* schema */
const goodSchema = new Schema<IGood>(
    {
        name: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        memberDays: {
            type: Number,
            required: true,
        },
        isHidden: {
            type: Boolean,
            default: false,
        },
    },
    { collection: COLLECTION_NAME },
)

goodSchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id.toString()

        delete ret.__v
        delete ret._id
    },
})

export const Good = model<IGood>(SchemaNames.Good, goodSchema)

export default Good
