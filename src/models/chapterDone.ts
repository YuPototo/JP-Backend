import { Schema, model, Types, Model } from 'mongoose'
import { SchemaNames } from './schemaNames'

const COLLECTION_NAME = 'chapterDone'

/* interface */
export interface IChapterDone {
    user: Types.ObjectId
    book: Types.ObjectId
    chapters: [Types.ObjectId]
}

// Put all user instance methods in this interface:
interface IChapterDoneMethods {
    addChapter(chapterId: string): Promise<void>
}

type ChapterDoneModel = Model<
    IChapterDone,
    Record<string, never>,
    IChapterDoneMethods
>

/* schema */
const chapterDoneSchema = new Schema<
    IChapterDone,
    ChapterDoneModel,
    IChapterDoneMethods
>(
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

export const ChapterDone = model<IChapterDone, ChapterDoneModel>(
    SchemaNames.ChapterDone,
    chapterDoneSchema,
)

export default ChapterDone
