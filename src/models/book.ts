import { Schema, Document, model, Model } from 'mongoose'

const COLLECTION_NAME = 'book'

export interface IChildCategory {
    metaType: string
    keys: string[]
}

const bookChildCategorySchema = new Schema(
    {
        metaType: { type: String, required: true },
        keys: { type: [String] },
    },
    { _id: false }
)

// toJSON method
bookChildCategorySchema.set('toJSON', {
    transform: function (doc, ret) {
        ret[`${doc.metaType}`] = doc.keys
        delete ret.metaType
        delete ret.keys
    },
})

export interface IBookCatgory extends Document {
    topKey: string
    children: IChildCategory[]
}

const bookCategorySchema = new Schema<IBookCatgory>(
    {
        topKey: { type: String },
        children: [bookChildCategorySchema],
    },
    { _id: false }
)

// toJSON method
bookCategorySchema.set('toJSON', {
    transform: function (doc: IBookCatgory, ret) {
        const childrenObj = {}
        for (const child of doc.children) {
            Object.assign(childrenObj, {
                [`${child.metaType}`]: child.keys,
            })
        }
        ret.children = childrenObj
    },
})

export interface IBook extends Document {
    title: string
    categories: IBookCatgory[]
}

const bookSchema = new Schema<IBook>(
    {
        title: { type: String, required: true },
        categories: [bookCategorySchema],
    },
    { collection: COLLECTION_NAME }
)

// toJSON method
bookSchema.set('toJSON', {
    transform: function (doc: IBook, ret) {
        ret.id = ret._id.toString()
        ret.topCategories = doc.categories.map((el) => el.topKey)

        const childCategoriesObj = {}
        for (const category of ret.categories) {
            Object.assign(childCategoriesObj, {
                [`${category.topKey}`]: category.children,
            })
        }

        ret.childCategories = childCategoriesObj
        delete ret.categories
        delete ret.__v
        delete ret._id
    },
})

export type BookModelType = Model<IBook>

export const Book = model<IBook, BookModelType>('Book', bookSchema)

export default Book
