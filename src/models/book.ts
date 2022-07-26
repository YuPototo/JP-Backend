import { Schema, Document, model, Model, Types } from 'mongoose'

const COLLECTION_NAME = 'book'

interface SubKey {
    metaType: string
    key: Types.ObjectId
}

interface BookCategory {
    top: Types.ObjectId
    children: SubKey[]
}

export interface IBookCatgory extends Document {
    top: Types.ObjectId
    children: SubKey[]
}

const bookCategorySchema = new Schema<IBookCatgory>(
    {
        top: { type: Schema.Types.ObjectId, ref: 'TopCategory' },
        children: [
            {
                metaType: String,
                categories: [
                    {
                        type: Schema.Types.ObjectId,
                        ref: 'SubCategory',
                    },
                ],
            },
        ],
    },
    { _id: false }
)

export interface IBook extends Document {
    name: string
    category: BookCategory[]
}

const bookSchema = new Schema<IBook>(
    {
        name: { type: String, required: true, unique: true },
        category: [bookCategorySchema],
    },
    { collection: COLLECTION_NAME }
)

// toJSON method
bookSchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id.toString()
        delete ret.__v
        delete ret._id
    },
})

export type BookModelType = Model<IBook>

export const Book = model<IBook, BookModelType>('Book', bookSchema)

export default Book
