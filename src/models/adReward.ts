import { Schema, model, Types, Model, ObjectId } from 'mongoose'
import { SchemaNames } from './schemaNames'
import { subDays } from 'date-fns'

const COLLECTION_NAME = 'adReward'

/* interface */
export interface IAdReward {
    createdTime: Date
    isRewarded: boolean
    user: Types.ObjectId
}

interface AdRewardModel extends Model<IAdReward> {
    isRateLimitedReached(userId: ObjectId): boolean
}

/* schema */
const adRewardSchema = new Schema<IAdReward, AdRewardModel>(
    {
        createdTime: { type: Date, default: () => new Date() },
        isRewarded: { type: Boolean, default: false },
        user: {
            type: Schema.Types.ObjectId,
            ref: SchemaNames.User,
            required: true,
        },
    },
    { collection: COLLECTION_NAME },
)

adRewardSchema.static(
    'isRateLimitedReached',
    async function myStaticMethod(userId) {
        const dateYesterday = subDays(new Date(), 1)
        const countFromYesterday = await this.find({
            user: userId,
            createdTime: { $gte: dateYesterday },
        }).count()
        return countFromYesterday > 15
    },
)

/* schema */
export const AdReward = model<IAdReward, AdRewardModel>(
    SchemaNames.AdReward,
    adRewardSchema,
)

export default AdReward
