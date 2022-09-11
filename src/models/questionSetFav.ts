import { Schema, Document, model, Model } from 'mongoose'
import { SchemaNames } from './schemaNames'
import QuestionSet from './questionSet'

const COLLECTION_NAME = 'questionSetFav'

/* interface */
export interface IQuestionSetFavDoc extends Document {
    user: Schema.Types.ObjectId
    notebook: Schema.Types.ObjectId
    questionSet: Schema.Types.ObjectId
}

export type IQuestionSetFavModel = Model<IQuestionSetFavDoc>

/* schema */
const questionSetFavSchema = new Schema<
    IQuestionSetFavDoc,
    IQuestionSetFavModel
>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: SchemaNames.User,
            required: true,
        },
        notebook: {
            type: Schema.Types.ObjectId,
            ref: SchemaNames.Notebook,
            required: true,
        },
        questionSet: {
            type: Schema.Types.ObjectId,
            ref: SchemaNames.QuestionSet,
            required: true,
        },
    },
    { collection: COLLECTION_NAME },
)

questionSetFavSchema.index({ user: 1, notebook: 1 })

questionSetFavSchema.index({ user: 1, questionSet: 1 }, { unique: true })

questionSetFavSchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id.toString()

        delete ret.__v
        delete ret._id
        delete ret.user
    },
})

questionSetFavSchema.post('validate', async function () {
    const questionSet = await QuestionSet.findById(this.questionSet)
    if (!questionSet) {
        throw Error(`找不到习题 ${this.questionSet}`)
    }
})

export const QuestionSetFav: IQuestionSetFavModel = model<
    IQuestionSetFavDoc,
    IQuestionSetFavModel
>(SchemaNames.QuestionSetFav, questionSetFavSchema)

export default QuestionSetFav
