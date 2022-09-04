import config from '@/config/config'
import { addCdnDomain } from '@/utils/staticAssets'
import { Schema, Document, model, Model } from 'mongoose'
import { SchemaNames } from './schemaNames'

const COLLECTION_NAME = 'audio'

/* interface */
export interface IAudioDoc extends Document {
    key: string
    title: string
    transcription: string
}

export type IAudioModel = Model<IAudioDoc>

/* schema */
const audioSchema = new Schema<IAudioDoc>(
    {
        key: { type: String, required: true },
        title: { type: String, required: true },
        transcription: { type: String },
    },
    { collection: COLLECTION_NAME },
)

audioSchema.set('toJSON', {
    transform: function (doc: IAudioDoc, ret) {
        ret.id = ret._id.toString()
        ret.key = addCdnDomain(config.cdnDomain, doc.key)

        delete ret.__v
        delete ret._id
    },
})

/* schema */
export const Audio = model<IAudioDoc, IAudioModel>(
    SchemaNames.Audio,
    audioSchema,
)

export default Audio
