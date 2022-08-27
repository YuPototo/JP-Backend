import { Schema, Document, model, Model, Types } from 'mongoose'

export interface ISection extends Document {
    title: string
    chapters: [Types.ObjectId]
}

const sectionSchema = new Schema<ISection>(
    {
        title: { type: String, required: true },
        chapters: {
            type: [{ type: Schema.Types.ObjectId, ref: 'Chapter' }],
        },
    },
    { collection: 'section' },
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
    'Section',
    sectionSchema,
)

export default Section
