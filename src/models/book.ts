import config from '@/config/config'
import { addCdnDomain } from '@/utils/staticAssets'
import { Schema, Document, model, Model, Types } from 'mongoose'
import { SchemaNames } from './schemaNames'

import './section' // 引入 section, 否则不会有 section schema 的创建，因为我还没有在其他地方使用 section

const COLLECTION_NAME = 'book'

/* bookCategory - interface */
interface IBookCategoryDoc extends Document {
    key: string
    description?: string // 用于辅助理解
    child?: IBookCategoryDoc
}

/* bookCategory - schema */
const bookCategorySchema = new Schema<IBookCategoryDoc>(
    {
        key: { type: String, required: true },
        description: { type: String },
    },
    { _id: false },
)

bookCategorySchema.add({
    child: bookCategorySchema,
})

/* book - interface */
export interface IBookDoc extends Document {
    title: string
    desc: string
    cover: string
    weight: number
    hidden: boolean
    category: IBookCategoryDoc
    sections: [Types.ObjectId]
}

export type IBookModel = Model<IBookDoc>

const bookSchema = new Schema<IBookDoc>(
    {
        title: { type: String, required: true },
        desc: { type: String, default: '' },
        cover: { type: String, required: true },
        weight: { type: Number, default: 0 },
        hidden: { type: Boolean, default: false },
        category: { type: bookCategorySchema, required: true },
        sections: {
            type: [{ type: Schema.Types.ObjectId, ref: SchemaNames.Section }],
            required: true,
        },
    },
    { collection: COLLECTION_NAME },
)

bookSchema.set('toJSON', {
    transform: function (doc: IBookDoc, ret) {
        ret.id = ret._id.toString()
        ret.cover = addCdnDomain(config.cdnDomain, doc.cover) // 将 cover 的域名补充完整

        delete ret.__v
        delete ret._id
    },
})

export const Book = model<IBookDoc, IBookModel>(SchemaNames.Book, bookSchema)

export default Book
