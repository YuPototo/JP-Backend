import { Schema, Types, model, Model } from 'mongoose'
import { SchemaNames } from './schemaNames'
import Section from './section'

const COLLECTION_NAME = 'chapter'

/* interface */
export interface IChapter {
    title: string
    desc?: string
    sections: [Types.ObjectId]
    questionSets: [Types.ObjectId]
}

// static methods
interface ChapterModel extends Model<IChapter> {
    createChapterInSection({
        title,
        sectionId,
        desc,
    }: {
        title: string
        sectionId: string
        desc?: string
    }): IChapter
}

/* schema */
const chapterSchema = new Schema<IChapter>(
    {
        title: { type: String, required: true },
        desc: { type: String },
        sections: [{ type: Schema.Types.ObjectId, ref: SchemaNames.Section }],
        questionSets: [
            { type: Schema.Types.ObjectId, ref: SchemaNames.QuestionSet },
        ],
    },
    { collection: COLLECTION_NAME },
)

// createChapterInSection
chapterSchema.static(
    'createChapterInSection',
    async function ({
        title,
        desc,
        sectionId,
    }: {
        title: string
        sectionId: string
        desc?: string
    }) {
        const section = await Section.findById(sectionId)
        if (!section) {
            throw new Error(`找不到 Section ${sectionId}`)
        }

        // create section
        const chapter = new Chapter({ title, sections: [sectionId], desc })
        await chapter.save()

        // update book doc
        section.chapters.push(chapter.id)
        await section.save()

        return chapter
    },
)

chapterSchema.set('toJSON', {
    transform: function (doc: IChapter, ret) {
        ret.id = ret._id.toString()

        delete ret.__v
        delete ret._id
        delete ret.sections
    },
})

export const Chapter = model<IChapter, ChapterModel>(
    SchemaNames.Chapter,
    chapterSchema,
)

export default Chapter
