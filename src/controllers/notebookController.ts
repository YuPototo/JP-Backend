import type { RequestHandler } from 'express'
import Notebook from '@/models/notebook'

export const getNotebooks: RequestHandler = async (req, res, next) => {
    try {
        const notebooks = await Notebook.find({
            user: req.user._id,
        }).sort({ _id: -1 }) // 新的册子在前面
        res.json({ notebooks })
    } catch (err) {
        next(err)
    }
}
