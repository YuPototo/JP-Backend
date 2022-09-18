import { Schema, Types, model, Model } from 'mongoose'
import { SchemaNames } from './schemaNames'
import Book from './book'

const COLLECTION_NAME = 'bookFav'

/* interface */
export interface IBookFav {
    user: Types.ObjectId
    book: Types.ObjectId
}

interface BookFavModel extends Model<IBookFav> {
    getUserFavBooks: (userId: string) => Promise<string[]>
}

/* schema */
const bookFavSchema = new Schema<IBookFav, BookFavModel>(
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

bookFavSchema.statics.getUserFavBooks = async function (userId: string) {
    const bookFavs = await this.find({ user: userId })
    return bookFavs.map((bookFav) => bookFav.book.toString())
}

export const BookFav = model<IBookFav, BookFavModel>(
    SchemaNames.BookFav,
    bookFavSchema,
)

export default BookFav
