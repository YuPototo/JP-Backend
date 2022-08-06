import { Schema, Document, model, Model } from 'mongoose'

export interface IChapter extends Document {
    title: string
}

const chapterSchema = new Schema<IChapter>(
    {
        title: { type: String, required: true },
    },
    { collection: 'chapter' }
)

chapterSchema.set('toJSON', {
    transform: function (doc: IChapter, ret) {
        ret.id = ret._id.toString()

        delete ret.__v
        delete ret._id
    },
})

export type ChapterModel = Model<IChapter>

export const Chapter: ChapterModel = model<IChapter, ChapterModel>(
    'Chapter',
    chapterSchema
)

export default Chapter
