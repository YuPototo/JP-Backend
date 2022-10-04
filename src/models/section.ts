import { Schema, model, Types, Model } from 'mongoose'
import { SchemaNames } from './schemaNames'
import Book from './book'

const COLLECTION_NAME = 'section'

export interface ISection {
    title: string
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

        const section = new Section({ title })
        await section.save()

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
