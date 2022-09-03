import { Schema, Document, model, Model } from 'mongoose'
import { SchemaNames } from './schemaNames'

const COLLECTION_NAME = 'chapter'

export interface IChapter extends Document {
    title: string
    desc?: string
    questionSets: [Schema.Types.ObjectId]
}

const chapterSchema = new Schema<IChapter>(
    {
        title: { type: String, required: true },
        desc: { type: String },
        questionSets: [
            { type: Schema.Types.ObjectId, ref: SchemaNames.QuestionSet },
        ],
    },
    { collection: COLLECTION_NAME },
)

chapterSchema.set('toJSON', {
    transform: function (doc: IChapter, ret) {
        ret.id = ret._id.toString()

        delete ret.__v
        delete ret._id
    },
})

export type ChapterModelType = Model<IChapter>

export const Chapter = model<IChapter, ChapterModelType>(
    SchemaNames.Chapter,
    chapterSchema,
)

export default Chapter
