import type { RequestHandler } from 'express'
import { logger } from '@/utils/logger/winstonLogger'
import { addReqMetaData } from '@/utils/logger/winstonLogger'
import ChapterDone, { IChapterDone } from '../models/chapterDone'

export const addChapterDone: RequestHandler = async (req, res, next) => {
    const { bookId } = req.params as { bookId: string }
    const { chapterId } = req.body as {
        chapterId: string
    }

    if (!chapterId) {
        res.status(400).json({ message: '需要 chapterId' })
        logger.error('需要 chapterId', addReqMetaData(req))
        return
    }

    let record
    try {
        record = await ChapterDone.findOne({
            user: req.user._id,
            book: bookId,
        })
    } catch (err) {
        return next(err)
    }

    if (!record) {
        const newRecord = new ChapterDone({
            user: req.user._id,
            book: bookId,
            chapters: [chapterId],
        })

        try {
            await newRecord.save()
        } catch (err) {
            return next(err)
        }

        res.status(201).json({ message: '添加成功' })
        return
    } else {
        try {
            await record.addChapter(chapterId)
            res.status(201).json({ message: '添加成功' })
            return
        } catch (err) {
            return next(err)
        }
    }
}

export const getChapterDone: RequestHandler = async (req, res, next) => {
    const { bookId } = req.params as { bookId: string }

    let record: IChapterDone | null
    try {
        record = await ChapterDone.findOne({
            user: req.user._id,
            book: bookId,
        })
    } catch (err) {
        return next(err)
    }

    if (!record) {
        res.status(200).json({ chapters: [] })
        return
    }

    res.status(200).json({ chapters: record.chapters })
}

export const deleteChapterDone: RequestHandler = async (req, res, next) => {
    const { bookId } = req.params as { bookId: string }

    try {
        await ChapterDone.deleteOne({
            user: req.user._id,
            book: bookId,
        })
    } catch (err) {
        return next(err)
    }

    res.status(200).json({ message: '删除成功' })
}
