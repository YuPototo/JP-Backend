import { Schema, Document, model, Model } from 'mongoose'
import { SchemaNames } from './schemaNames'

const COLLECTION_NAME = 'chapterDone'

/* interface */
export interface IChapterDoneDoc extends Document {
    user: Schema.Types.ObjectId
    book: Schema.Types.ObjectId
    chapters: [Schema.Types.ObjectId]

    addChapter: (chapterId: string) => Promise<void>
}

export type IChapterDoneModel = Model<IChapterDoneDoc>

/* schema */
const chapterDoneSchema = new Schema<IChapterDoneDoc>(
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
        chapters: [
            {
                type: Schema.Types.ObjectId,
                ref: SchemaNames.Chapter,
            },
        ],
    },
    { collection: COLLECTION_NAME },
)

chapterDoneSchema.index({ user: 1, book: 1 }, { unique: true })

chapterDoneSchema.methods.addChapter = async function (chapterId: string) {
    if (!this.chapters.includes(chapterId)) {
        this.chapters.push(chapterId)
        await this.save()
    }
}

export const ChapterDoneModel = model<IChapterDoneDoc, IChapterDoneModel>(
    SchemaNames.ChapterDone,
    chapterDoneSchema,
)

export default ChapterDoneModel
