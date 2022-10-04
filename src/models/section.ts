import { Schema, model, Types, Model } from 'mongoose'
import { SchemaNames } from './schemaNames'
import Book from './book'

const COLLECTION_NAME = 'section'

export interface ISection {
    title: string
    books: [Types.ObjectId]
    chapters: [Types.ObjectId]
}

// static methods
interface SectionModel extends Model<ISection> {
    createSection({
        title,
        bookId,
    }: {
        title: string
        bookId: string
    }): ISection
}

const sectionSchema = new Schema<ISection>(
    {
        title: { type: String, required: true },
        books: {
            type: [{ type: Schema.Types.ObjectId, ref: SchemaNames.Book }],
        },
        chapters: {
            type: [{ type: Schema.Types.ObjectId, ref: SchemaNames.Chapter }],
        },
    },
    { collection: COLLECTION_NAME },
)

sectionSchema.static(
    'createSection',
    async function ({ title, bookId }: { title: string; bookId: string }) {
        const book = await Book.findById(bookId)
        if (!book) {
            throw new Error(`找不到 Book ${bookId}`)
        }

        // create section
        const section = new Section({ title, books: [bookId] })
        await section.save()

        // update book doc
        book.sections.push(section.id)
        await book.save()

        return section
    },
)

sectionSchema.set('toJSON', {
    transform: function (doc: ISection, ret) {
        ret.id = ret._id.toString()

        delete ret.__v
        delete ret._id
    },
})

export const Section = model<ISection, SectionModel>(
    SchemaNames.Section,
    sectionSchema,
)

export default Section
