import type { RequestHandler } from 'express'
import QuestionSetFav from '@/models/questionSetFav'
import logger from '@/utils/logger/logger'
import { addReqMetaData } from '@/utils/logger/winstonLogger'
import { MongoError } from 'mongodb'
import Notebook, { INotebook } from '@/models/notebook'

export const addQuestionSetFav: RequestHandler = async (req, res, next) => {
    const { notebookId, questionSetId } = req.params

    if (!notebookId || !questionSetId) {
        return res
            .status(400)
            .json({ message: '缺少 notebookId 或 questionSetId' })
    }

    let notebook: INotebook | null
    try {
        notebook = await Notebook.findById(notebookId)
        if (!notebook) {
            res.status(400).json({
                message: '找不到笔记本',
            })
            return
        }
    } catch (err) {
        next(err)
        return
    }

    if (notebook.user.toString() !== req.user.id) {
        res.status(401).json({
            message: '你没有权限为这个笔记本添加题目',
        })
        return
    }

    try {
        const questionSetFav = new QuestionSetFav({
            user: req.user._id,
            notebook: notebookId,
            questionSet: questionSetId,
        })
        await questionSetFav.save()

        return res.status(201).json({ questionSetFav })
    } catch (err) {
        if (err instanceof MongoError && err.code === 11000) {
            logger.warn('已经有这条记录了', addReqMetaData(req))
            const questionSetFav = await QuestionSetFav.findOne({
                user: req.user._id,
                questionSet: questionSetId,
            })
            return res.status(201).json({ questionSetFav })
        } else {
            return next(err)
        }
    }
}

export const deleteQuestionSetFav: RequestHandler = async (req, res, next) => {
    const { questionSetId } = req.params

    try {
        await QuestionSetFav.deleteOne({
            user: req.user._id,
            questionSet: questionSetId,
        })
        return res.status(200).json({ message: '删除成功' })
    } catch (err) {
        return next(err)
    }
}
