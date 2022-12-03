import config from '@/config/config'
import { addCdnDomain } from '@/utils/staticAssets'
import { Schema, model } from 'mongoose'
import { SchemaNames } from './schemaNames'

const COLLECTION_NAME = 'audio'

/* interface */
export interface IAudio {
    key: string
    title: string
    transcription: string
}

/* schema */
const audioSchema = new Schema<IAudio>(
    {
        key: { type: String, required: true, unique: true },
        title: { type: String, required: true },
        transcription: { type: String },
    },
    { collection: COLLECTION_NAME },
)

audioSchema.set('toJSON', {
    transform: function (doc: IAudio, ret) {
        ret.id = ret._id.toString()
        ret.key = addCdnDomain(config.cdnDomain, doc.key)

        delete ret.__v
        delete ret._id
    },
})

/* schema */
export const Audio = model<IAudio>(SchemaNames.Audio, audioSchema)

export default Audio
