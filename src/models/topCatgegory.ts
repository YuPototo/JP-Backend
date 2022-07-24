import { Schema, Document, model, Model } from 'mongoose'

const COLLECTION_NAME = 'top_category'

export interface ITopCategory extends Document {
    key: string
    displayName: string
    description: string
    weight: number
    childrenMetaTypes: string[]
}

const topCategorySchema = new Schema<ITopCategory>(
    {
        key: { type: String, required: true, unique: true },
        displayName: { type: String, required: true },
        description: { type: String, required: true },
        weight: { type: Number, default: 0 },
        childrenMetaTypes: [{ type: String, required: true }],
    },
    { collection: COLLECTION_NAME }
)

// toJSON method
topCategorySchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id.toString()
        delete ret.__v
        delete ret._id
    },
})

export type TopCategoryModel = Model<ITopCategory>

export const TopCategory = model<ITopCategory, TopCategoryModel>(
    'TopCategory',
    topCategorySchema
)

export default TopCategory
