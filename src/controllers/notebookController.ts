import type { RequestHandler } from 'express'
import Notebook, { INotebookDoc } from '@/models/notebook'

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

export const updateNotebook: RequestHandler = async (req, res, next) => {
    const { title } = req.body
    const { notebookId } = req.params

    if (!title) {
        return res.status(400).json({ message: 'title is required' })
    }

    let notebook: INotebookDoc | null
    try {
        notebook = await Notebook.findById(notebookId)
        if (!notebook) {
            return res.status(404).json({ message: '找不到这个笔记本' })
        }
    } catch (err) {
        return next(err)
    }

    if (notebook.user.toString() !== req.user.id) {
        return res.status(401).json({ message: '你没有权限修改这个笔记本' })
    }

    if (notebook.isDefault) {
        return res.status(400).json({ message: '不能修改默认笔记本' })
    }

    try {
        notebook.title = title
        await notebook.save()
        return res.status(200).json({ notebook })
    } catch (err) {
        return next(err)
    }
}
