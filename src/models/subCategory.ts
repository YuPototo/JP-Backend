import { Schema, Document, model, Model } from 'mongoose'

const COLLECTION_NAME = 'sub_category'

export interface ISubCategory extends Document {
    metaType: string
    key: string
    displayName: string
    description: string
}

const subCategorySchema = new Schema<ISubCategory>(
    {
        metaType: { type: String, required: true },
        key: { type: String, required: true, unique: true },
        displayName: { type: String, required: true },
        description: { type: String, required: true },
    },
    { collection: COLLECTION_NAME }
)

// toJSON method
subCategorySchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id.toString()
        delete ret.__v
        delete ret._id
    },
})

export type SubCategoryModel = Model<ISubCategory>

export const SubCategory = model<ISubCategory, SubCategoryModel>(
    'SubCategory',
    subCategorySchema
)

export default SubCategory
