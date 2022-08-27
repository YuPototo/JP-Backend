import { Schema, Document, model, Model } from 'mongoose'

import './audio' // 引入 audio，否则不会运行 audio schema 的创建，因为我还没有在其他地方使用 audio

interface IQuestion extends Document {
    body?: string
    explanation?: string
    options: string[]
    answer: number
}

const questionSchema = new Schema<IQuestion>(
    {
        body: { type: String },
        explanation: { type: String },
        options: {
            type: [String],
            // todo: remove any
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            validate: (v: any) => Array.isArray(v) && v.length > 0,
        },
        answer: { type: Number, required: true },
    },
    { _id: false }
)

export interface IQuestionSet extends Document {
    body?: string
    explanation?: string
    questions: IQuestion[]
    audio?: [Schema.Types.ObjectId]
}

const questionSetSchema = new Schema<IQuestionSet>(
    {
        body: { type: String },
        explanation: { type: String },
        questions: {
            type: [questionSchema],
            // todo: remove any
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            validate: (v: any) => Array.isArray(v) && v.length > 0,
        },
        audio: {
            type: Schema.Types.ObjectId,
            ref: 'Audio',
        },
    },
    { collection: 'questionSet' }
)

questionSetSchema.set('toJSON', {
    transform: function (doc: IQuestionSet, ret) {
        ret.id = ret._id.toString()

        delete ret.__v
        delete ret._id
    },
})

export type QuestionSetModel = Model<IQuestionSet>

export const QuestionSet: QuestionSetModel = model<
    IQuestionSet,
    QuestionSetModel
>('QuestionSet', questionSetSchema)

export default QuestionSet
