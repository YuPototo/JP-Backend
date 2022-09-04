import { Schema, Document, model, Model, Types } from 'mongoose'
import { SchemaNames } from './schemaNames'

const COLLECTION_NAME = 'section'

export interface ISectionDoc extends Document {
    title: string
    chapters: [Types.ObjectId]
}

export type ISectionModel = Model<ISectionDoc>

const sectionSchema = new Schema<ISectionDoc>(
    {
        title: { type: String, required: true },
        chapters: {
            type: [{ type: Schema.Types.ObjectId, ref: SchemaNames.Chapter }],
        },
    },
    { collection: COLLECTION_NAME },
)

sectionSchema.set('toJSON', {
    transform: function (doc: ISectionDoc, ret) {
        ret.id = ret._id.toString()

        delete ret.__v
        delete ret._id
    },
})

export const Section = model<ISectionDoc, ISectionModel>(
    SchemaNames.Section,
    sectionSchema,
)

export default Section
