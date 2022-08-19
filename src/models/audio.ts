import config from '@/config/config'
import { addCdnDomain } from '@/utils/staticAssets'
import { Schema, Document, model, Model } from 'mongoose'

const COLLECTION_NAME = 'audio'

// Book
export interface IAudio extends Document {
    key: string
    transcription: string
}

const audioSchema = new Schema<IAudio>(
    {
        key: { type: String, required: true },
        transcription: { type: String },
    },
    { collection: COLLECTION_NAME }
)

audioSchema.set('toJSON', {
    transform: function (doc: IAudio, ret) {
        ret.id = ret._id.toString()
        ret.key = addCdnDomain(config.cdnDomain, doc.key)

        delete ret.__v
        delete ret._id
    },
})

export type AudioModelType = Model<IAudio>

export const Audio = model<IAudio, AudioModelType>('Audio', audioSchema)

export default Audio
