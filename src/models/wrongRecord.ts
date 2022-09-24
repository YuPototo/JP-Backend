import { Schema, model, Model, Types } from 'mongoose'
import { SchemaNames } from './schemaNames'

const COLLECTION_NAME = 'wrongRecord'

/* interface */
export interface IWrongRecord {
    user: Types.ObjectId
    questionSet: Types.ObjectId
    createdTime: Date
}

export interface IWrongRecordModel extends Model<IWrongRecord> {
    deleteOutdatedRecord(expiredInDays: number): string
}

/* schema */
const wrongRecordSchema = new Schema<IWrongRecord, IWrongRecordModel>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: SchemaNames.User,
            required: true,
        },
        questionSet: {
            type: Schema.Types.ObjectId,
            ref: SchemaNames.QuestionSet,
            required: true,
        },
        createdTime: {
            type: Date,
            default: Date.now,
        },
    },
    { collection: COLLECTION_NAME },
)

wrongRecordSchema.index({ user: 1 })

wrongRecordSchema.index({ user: 1, questionSet: 1 }, { unique: true })

wrongRecordSchema.set('toJSON', {
    transform: function (doc, ret) {
        delete ret.__v
        delete ret._id
        delete ret.user
    },
})

wrongRecordSchema.statics.deleteOutdatedRecord = async function (
    expiredInDays: number,
) {
    const threshold = new Date()
    threshold.setDate(threshold.getDate() - expiredInDays)
    await this.deleteMany({ createdTime: { $lt: threshold } })
}

export const WrongRecord = model<IWrongRecord, IWrongRecordModel>(
    SchemaNames.WrongRecord,
    wrongRecordSchema,
)

export default WrongRecord
