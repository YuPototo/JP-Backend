import { Schema, Document, model, Model } from 'mongoose'
import { SchemaNames } from './schemaNames'
import Book from './book'

const COLLECTION_NAME = 'bookFav'

/* interface */
export interface IBookFavDoc extends Document {
    user: Schema.Types.ObjectId
    book: Schema.Types.ObjectId
}

export interface IBookFavModel extends Model<IBookFavDoc> {
    getBookIds: (userId: string) => Promise<string[]>
}

/* schema */
const bookFavSchema = new Schema<IBookFavDoc, IBookFavModel>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: SchemaNames.User,
            required: true,
            indexd: true,
        },
        book: {
            type: Schema.Types.ObjectId,
            ref: SchemaNames.Book,
            required: true,
        },
    },
    { collection: COLLECTION_NAME },
)

bookFavSchema.index({ user: 1, book: 1 }, { unique: true })

bookFavSchema.post('validate', async function () {
    const book = await Book.findById(this.book)
    if (!book) {
        throw Error(`找不到练习册 ${this.book}`)
    }
})

bookFavSchema.statics.getBookIds = async function (userId: string) {
    const bookFavs = await this.find({ user: userId })
    return bookFavs.map((bookFav) => bookFav.book.toString())
}

export const BookFav = model<IBookFavDoc, IBookFavModel>(
    SchemaNames.BookFav,
    bookFavSchema,
)

export default BookFav
