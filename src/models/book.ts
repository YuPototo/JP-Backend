import config from '@/config/config'
import constants from '@/constants'
import { addCdnDomain } from '@/utils/staticAssets'
import { Schema, model, Types } from 'mongoose'
import { SchemaNames } from './schemaNames'

import './section' // 引入 section, 否则不会有 section schema 的创建，因为我还没有在其他地方使用 section

const COLLECTION_NAME = 'book'

/* bookCategory - interface */
interface IBookCategory {
    key: string
    description?: string // 用于辅助理解
    child?: IBookCategory
}

/* bookCategory - schema */
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

/* book - interface */
export interface IBook {
    title: string
    desc: string
    cover: string
    weight: number // 权重：确定排序，权重越高，排序越靠前
    hidden: boolean
    category: IBookCategory
    sections: [Types.ObjectId]
}

const bookSchema = new Schema<IBook>(
    {
        title: { type: String, required: true },
        cover: { type: String, default: constants.defaultBookCover },
        category: { type: bookCategorySchema },
        desc: { type: String, default: '' },
        weight: { type: Number, default: 0 },
        hidden: { type: Boolean, default: true },
        sections: {
            type: [{ type: Schema.Types.ObjectId, ref: SchemaNames.Section }],
            default: [],
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

export const Book = model<IBook>(SchemaNames.Book, bookSchema)

export default Book
