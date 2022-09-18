import { Schema, Types, model } from 'mongoose'
import { SchemaNames } from './schemaNames'

const COLLECTION_NAME = 'chapter'

/* interface */
export interface IChapter {
    title: string
    desc?: string
    questionSets: [Types.ObjectId]
}

/* schema */
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

export const Chapter = model<IChapter>(SchemaNames.Chapter, chapterSchema)

export default Chapter
