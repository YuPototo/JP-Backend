import { Schema, Document, model, Model } from 'mongoose'
import { SchemaNames } from './schemaNames'

const COLLECTION_NAME = 'chapter'

/* interface */
export interface INotebookDoc extends Document {
    title: string
    isDefault: boolean
    user: Schema.Types.ObjectId
}

export type INotebookModel = Model<INotebookDoc>

/* schema */
const notebookSchema = new Schema<INotebookDoc>(
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
    },
})

export const Notebook: INotebookModel = model<INotebookDoc, INotebookModel>(
    'Notebook',
    notebookSchema,
)

export default Notebook
