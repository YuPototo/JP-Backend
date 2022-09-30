import { RequestHandler } from 'express'

import Good from '@/models/good'

export const getGoodsHandler: RequestHandler = async (req, res, next) => {
    try {
        const goods = await Good.find({ isHidden: false })
        res.json({ goods })
        return
    } catch (err) {
        next(err)
    }
}
