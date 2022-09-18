import { Schema, model, Types, Model } from 'mongoose'
import QuestionSetFav from './questionSetFav'
import { SchemaNames } from './schemaNames'

const COLLECTION_NAME = 'notebook'

/* interface */
export interface INotebook {
    title: string
    isDefault: boolean
    user: Types.ObjectId
}

export type NotebookModel = Model<INotebook, Record<string, never>>

/* schema */
const notebookSchema = new Schema<INotebook, NotebookModel>(
    {
        title: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
        user: {
            type: Schema.Types.ObjectId,
            ref: SchemaNames.User,
            required: true,
            indexd: true,
        },
    },
    { collection: COLLECTION_NAME },
)

notebookSchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id.toString()

        delete ret.__v
        delete ret._id
        delete ret.user
        delete ret.questionSets
    },
})

notebookSchema.pre('remove', async function () {
    await QuestionSetFav.deleteMany({ notebook: this._id })
})

export const Notebook: NotebookModel = model<INotebook, NotebookModel>(
    SchemaNames.Notebook,
    notebookSchema,
)

export default Notebook
