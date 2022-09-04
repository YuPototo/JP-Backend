import { Schema, Document, model, Model } from 'mongoose'
import { SchemaNames } from './schemaNames'

const COLLECTION_NAME = 'chapter'

/* interface */
export interface IChapterDoc extends Document {
    title: string
    desc?: string
    questionSets: [Schema.Types.ObjectId]
}

export type IChapterModel = Model<IChapterDoc>

/* schema */
const chapterSchema = new Schema<IChapterDoc>(
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
    transform: function (doc: IChapterDoc, ret) {
        ret.id = ret._id.toString()

        delete ret.__v
        delete ret._id
    },
})

export const ChapterModel = model<IChapterDoc, IChapterModel>(
    SchemaNames.Chapter,
    chapterSchema,
)

export default ChapterModel
