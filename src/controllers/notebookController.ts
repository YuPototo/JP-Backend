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

export const createNotebook: RequestHandler = async (req, res, next) => {
    const title = req.body.title

    if (!title) {
        return res.status(400).json({ message: 'title is required' })
    }

    try {
        const notebook = await Notebook.create({
            title,
            user: req.user._id,
        })
        res.status(201).json({ notebook })
    } catch (err) {
        next(err)
    }
}
