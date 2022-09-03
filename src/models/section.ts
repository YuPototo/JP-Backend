import { Schema, Document, model, Model, Types } from 'mongoose'
import { SchemaNames } from './schemaNames'

const COLLECTION_NAME = 'section'

export interface ISection extends Document {
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

export type SectionModel = Model<ISection>

export const Section: SectionModel = model<ISection, SectionModel>(
    SchemaNames.Section,
    sectionSchema,
)

export default Section
