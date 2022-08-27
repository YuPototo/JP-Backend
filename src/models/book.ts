import config from '@/config/config'
import { addCdnDomain } from '@/utils/staticAssets'
import { Schema, Document, model, Model, Types } from 'mongoose'

import './section' // 引入 section, 否则不会 section schema 的创建，因为我还没有在其他地方使用 audio

const COLLECTION_NAME = 'book'

// BookCategory
interface IBookCategory extends Document {
    key: string
    description?: string // 用于辅助理解
    child?: IBookCategory
}

const bookCategorySchema = new Schema<IBookCategory>(
    {
        key: { type: String, required: true },
        description: { type: String },
    },
    { _id: false },
)

bookCategorySchema.add({
    child: bookCategorySchema,
})

// Book
export interface IBook extends Document {
    title: string
    desc: string
    cover: string
    weight: number
    hidden: boolean
    category: IBookCategory
    sections: [Types.ObjectId]
}

const bookSchema = new Schema<IBook>(
    {
        title: { type: String, required: true },
        desc: { type: String, default: '' },
        cover: { type: String, required: true },
        weight: { type: Number, default: 0 },
        hidden: { type: Boolean, default: false },
        category: { type: bookCategorySchema, required: true },
        sections: {
            type: [{ type: Schema.Types.ObjectId, ref: 'Section' }],
            required: true,
        },
    },
    { collection: COLLECTION_NAME },
)

bookSchema.set('toJSON', {
    transform: function (doc: IBook, ret) {
        ret.id = ret._id.toString()
        ret.cover = addCdnDomain(config.cdnDomain, doc.cover) // 将 cover 的域名补充完整

        delete ret.__v
        delete ret._id
    },
})

export type BookModelType = Model<IBook>

export const Book = model<IBook, BookModelType>('Book', bookSchema)

export default Book
