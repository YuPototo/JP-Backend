import { Schema, Document, model, Model } from 'mongoose'

const COLLECTION_NAME = 'dummy'

export interface IDummy extends Document {
    name: string
}

const dummySchema = new Schema<IDummy>(
    {
        name: { type: String, required: true },
    },
    { collection: COLLECTION_NAME }
)

// toJSON method
dummySchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id.toString()
        delete ret.__v
        delete ret._id
    },
})

export type DummyModel = Model<IDummy>

export const Dummy = model<IDummy, DummyModel>('Dummy', dummySchema)

export default Dummy
