import { Schema, model, Types } from 'mongoose'
import { SchemaNames } from './schemaNames'

const COLLECTION_NAME = 'section'

export interface ISection {
    title: string
    chapters: [Types.ObjectId]
}

const sectionSchema = new Schema<ISection>(
    {
        title: { type: String, required: true },
        chapters: {
            type: [{ type: Schema.Types.ObjectId, ref: SchemaNames.Chapter }],
        },
    },
    { collection: COLLECTION_NAME },
)

sectionSchema.set('toJSON', {
    transform: function (doc: ISection, ret) {
        ret.id = ret._id.toString()

        delete ret.__v
        delete ret._id
    },
})

export const Section = model<ISection>(SchemaNames.Section, sectionSchema)

export default Section
