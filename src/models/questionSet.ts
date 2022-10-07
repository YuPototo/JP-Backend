import { Schema, Types, model } from 'mongoose'

import './audio' // 引入 audio，否则不会运行 audio schema 的创建，因为我还没有在其他地方使用 audio
import { SchemaNames } from './schemaNames'

const COLLECTION_NAME = 'questionSet'

/* Question */
// 暂时使用 any 来表示 RichText，因为我不想花时间研究怎么写 schema
type RichText = any

interface IQuestion {
    body?: RichText
    explanation?: RichText
    options: RichText[]
    answer: number
}

const questionSchema = new Schema<IQuestion>(
    {
        body: { type: Schema.Types.Mixed },
        explanation: { type: Schema.Types.Mixed },
        options: {
            type: Schema.Types.Mixed, // 会是一个 array
            // todo: remove any
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            validate: (v: any) => Array.isArray(v) && v.length > 0,
        },
        answer: { type: Number, required: true },
    },
    { _id: false },
)

/* QuestionSet - interface */
export interface IQuestionSet {
    body?: RichText
    explanation?: RichText
    questions: IQuestion[]
    audio?: Types.ObjectId
    chapters: [Types.ObjectId]
}

/* QuestionSet - schema */
const questionSetSchema = new Schema<IQuestionSet>(
    {
        body: { type: Schema.Types.Mixed },
        explanation: { type: Schema.Types.Mixed },
        questions: {
            type: [questionSchema],
            // todo: remove any
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            validate: (v: any) => Array.isArray(v) && v.length > 0,
        },
        audio: {
            type: Schema.Types.ObjectId,
            ref: SchemaNames.Audio,
        },
        chapters: {
            type: [{ type: Schema.Types.ObjectId, ref: SchemaNames.Chapter }],
        },
    },
    { collection: COLLECTION_NAME },
)

questionSetSchema.set('toJSON', {
    transform: function (doc: IQuestionSet, ret) {
        ret.id = ret._id.toString()

        delete ret.__v
        delete ret._id
    },
})

export const QuestionSet = model<IQuestionSet>(
    SchemaNames.QuestionSet,
    questionSetSchema,
)

export default QuestionSet
