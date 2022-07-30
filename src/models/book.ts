import { Schema, Document, model, Model } from 'mongoose'

const COLLECTION_NAME = 'book'

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
    { _id: false }
)

bookCategorySchema.add({
    child: bookCategorySchema,
})

export interface IBook extends Document {
    title: string
    category: IBookCategory
}

const bookSchema = new Schema<IBook>(
    {
        title: { type: String, required: true },
        category: { type: bookCategorySchema, required: true },
    },
    { collection: COLLECTION_NAME }
)

// toJSON method
bookSchema.set('toJSON', {
    transform: function (doc: IBook, ret) {
        ret.id = ret._id.toString()

        delete ret.__v
        delete ret._id
    },
})

export type BookModelType = Model<IBook>

export const Book = model<IBook, BookModelType>('Book', bookSchema)

export default Book
