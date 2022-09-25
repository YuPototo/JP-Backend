import type { RequestHandler } from 'express'

import AdReward from '@/models/adReward'

export const createAdReward: RequestHandler = async (req, res, next) => {
    let adReward
    try {
        adReward = new AdReward({
            user: req.user._id,
        })
        await adReward.save()
    } catch (err) {
        return next(err)
    }

    try {
        const isLimit = await AdReward.isRateLimitedReached(req.user._id)
        if (isLimit) {
            return res.status(403).json({ message: '今天不再能获得广告奖励' })
        }
    } catch (err) {
        return next(err)
    }

    try {
        // 默认奖励5题
        req.user.quizChance += 5
        await req.user.save()
        adReward.isRewarded = true
        await adReward.save()
        return res.status(201).json({ message: 'success' })
    } catch (err) {
        return next(err)
    }
}
